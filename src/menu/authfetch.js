export const LocalApiPath = import.meta.env.VITE_AI_API_BASE_URL
export const domain = import.meta.env.VITE_BACKEND_API_ENDPOINT
// ─── safe localStorage helpers ────────────────────────────────────────────────
// Never access localStorage at module scope — it can be unavailable (SSR, private
// browsing with storage blocked, browser extensions sandboxing, etc.)

function readUserInfo() {
  try {
    const raw = localStorage.getItem("userInfo");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeUserInfo(data) {
  try {
    localStorage.setItem("userInfo", JSON.stringify(data));
  } catch {
    // Storage quota exceeded or access denied — fail silently
  }
}

// Lazily-evaluated export so callers always get the current snapshot
export function getUserState() {
  return readUserInfo() ?? {};
}

// ─── session helpers ──────────────────────────────────────────────────────────

// A custom error class so callers can distinguish auth failures from other
// errors and react accordingly (e.g. show a "please sign in again" screen).
export class AuthError extends Error {
  constructor(message) {
    super(message);
    this.name = "AuthError";
  }
}

// A generic HTTP error for non-2xx responses that aren't auth failures.
// Carries the status code and parsed body so callers can inspect details
// instead of getting a silently "successful" response.
export class ApiError extends Error {
  constructor(message, status, body) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

// Broadcast that the session has died so any part of the app — a top-level
// layout, a router guard, a login modal — can react without authfetch.js
// needing to know about React. Components can do:
//
//   useEffect(() => {
//     const onExpired = (e) => showLoginModal(e.detail?.reason)
//     window.addEventListener('auth:session-expired', onExpired)
//     return () => window.removeEventListener('auth:session-expired', onExpired)
//   }, [])
//
function announceSessionExpired(reason) {
  try {
    window.dispatchEvent(
      new CustomEvent("auth:session-expired", { detail: { reason } })
    );
  } catch {
    // Non-browser environment (SSR, tests) — ignore.
  }
}

// Clears the session from storage. Does NOT reload the page and does NOT
// announce a session-expired event — this is the "quiet" clear used by
// intentional, user-initiated logout, where no "please sign back in" prompt
// should appear.
export function leave() {
  try {
    localStorage.removeItem("userInfo");
  } catch {
    // ignore
  }
}

// Clears the session AND tells the rest of the app the session died
// unexpectedly (refresh token invalid/expired, no token at all, etc.) so a
// login modal / redirect can be shown automatically instead of the user
// just seeing broken UI and console 401s.
function expireSession(reason) {
  leave();
  announceSessionExpired(reason);
}

// User-initiated logout (e.g. a "Log out" button). Unlike leave() on its
// own, this actively tells the backend to invalidate the refresh token —
// important because the user's session is otherwise still valid and could
// be reused (e.g. a stolen refresh token) until it naturally expires.
//
// Always clears local state in the end, even if the network call fails —
// from the user's point of view, clicking "Log out" must always work. This
// does not fire the session-expired event: it's an expected, deliberate
// exit, not a broken session.
export async function logout() {
  const stored = readUserInfo();

  try {
    if (stored?.refreshToken) {
      await fetchWithAuth(`${domain}/api/v1/auth/logout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken: stored.refreshToken }),
      });
    }
  } catch {
    // Already logged out, session already expired, network error, etc. —
    // doesn't matter. We still clear local state below regardless.
  } finally {
    leave();
  }
}

// ─── token refresh ────────────────────────────────────────────────────────────

// Multiple requests can 401 at nearly the same time (e.g. streak + wallet +
// profile all firing on mount). Without de-duping, each one independently
// calls refreshTokens(); if the backend rotates the refresh token on every
// call, the second request reads a refresh token that the first request
// already invalidated, and fails. This in-flight promise ensures only one
// refresh happens at a time — every concurrent caller awaits the same result.
let inFlightRefresh = null;

async function refreshTokensDeduped(refreshUrl) {
  if (!inFlightRefresh) {
    inFlightRefresh = doRefreshTokens(refreshUrl).finally(() => {
      inFlightRefresh = null;
    });
  }
  return inFlightRefresh;
}

async function doRefreshTokens(refreshUrl = `${domain}/api/v1/auth/refresh`) {
  const stored = readUserInfo();

  if (!stored?.refreshToken) {
    expireSession("No refresh token — session ended.");
    throw new AuthError("No refresh token — session ended.");
  }

  const response = await fetch(refreshUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken: stored.refreshToken }),
  });

  if (!response.ok) {
    if (response.status === 400 || response.status === 401) {
      // Refresh token invalid / expired — clear session and let the UI know
      expireSession("Session expired. Please sign in again.");
      throw new AuthError("Session expired. Please sign in again.");
    }
    // Non-auth failure (network hiccup, 5xx) — don't nuke the session for
    // this; just surface the error and let the caller decide whether to retry.
    throw new Error(`Token refresh failed (${response.status})`);
  }

  const data = await response.json();
  const newAccessToken = data?.data?.token;

  if (!newAccessToken) {
    throw new Error("Refresh response did not include a new token.");
  }

  // Persist the updated token. Re-read fresh in case something else in the
  // app wrote to storage while this refresh was in flight.
  const latest = readUserInfo();
  if (latest) {
    latest.accessToken = newAccessToken;
    writeUserInfo(latest);
  }

  return newAccessToken;
}

// Public entry point kept for backwards compatibility with any external
// caller — routes through the de-duped refresh internally.
export async function refreshTokens(refreshUrl) {
  return refreshTokensDeduped(refreshUrl);
}

// ─── authenticated fetch ──────────────────────────────────────────────────────
// Automatically retries once after a 401 by refreshing the access token.
// Always throws on failure (AuthError for dead sessions, ApiError for any
// other non-2xx response) so callers' try/catch blocks behave as expected —
// nothing here silently "succeeds" with an error body.

export async function fetchWithAuth(urlPath, option = {}, _retryCount = 0) {
  const stored = readUserInfo();

  if (!stored?.accessToken) {
    expireSession("No access token found — please sign in.");
    throw new AuthError("No access token found — please sign in.");
  }

  const opts = {
    ...option,
    headers: {
      ...option.headers,
      Authorization: `Bearer ${stored.accessToken}`,
    },
  };

  const response = await fetch(urlPath, opts);

  // Retry once on 401 with a fresh token
  if (response.status === 401 && _retryCount === 0) {
    try {
      await refreshTokensDeduped();
    } catch (err) {
      // refreshTokensDeduped already cleared the session and announced it
      // when this was an auth failure — just propagate.
      throw err;
    }
    return fetchWithAuth(urlPath, option, 1); // _retryCount = 1 prevents infinite loop
  }

  if (!response.ok) {
    // Still 401 after a fresh token, or any other non-2xx status — this is
    // a real failure. Parse the body for a useful message, but ALWAYS throw;
    // never resolve the promise with an error body.
    let serverMessage = `Request failed (${response.status})`;
    let body = null;
    try {
      body = await response.json();
      if (body?.message) serverMessage = body.message;
    } catch {
      // Body wasn't JSON — fall back to the generic message above.
    }

    if (response.status === 401) {
      expireSession("Session expired. Please sign in again.");
      throw new AuthError(serverMessage || "Session expired. Please sign in again.");
    }

    throw new ApiError(serverMessage, response.status, body);
  }

  const data = await response.json();
  return data?.data ?? data;
}