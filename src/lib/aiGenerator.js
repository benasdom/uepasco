// AI quiz/flashcard generator — talks to the same backend endpoint the
// ueLearn browser extension uses (`/api/v1/solutions/extension`), so the
// origin, auth model, and response shape all match what's already proven
// out there. See the extension's `src/content/ai-generator/openai-client.js`
// for the reference implementation this is adapted from.

import { domain, refreshTokens, getUserState, AuthError } from '../menu/authfetch'

const QUERIES_ENDPOINT = `${domain}/api/v1/solutions/extension`
const DEFAULT_MODEL = 'deepseek-chat'

const CHUNK_SIZE = 1500
const CHUNK_OVERLAP = 100

// ===== CHUNKING =====
// Splits long text into overlapping chunks so each request stays within
// the model's context limits — identical strategy to the extension.
function chunkText(text) {
  const chunks = []
  let start = 0

  while (start < text.length) {
    let end = start + CHUNK_SIZE

    if (end < text.length) {
      const boundary = text.lastIndexOf('.', end)
      if (boundary > start + CHUNK_SIZE / 2) {
        end = boundary + 1
      }
    }

    chunks.push(text.slice(start, end).trim())
    start = end - CHUNK_OVERLAP
  }

  return chunks.filter((c) => c.length > 30)
}

// ===== RESPONSE READING =====
// This endpoint has historically streamed SSE (`data: {"token":"..."}`
// lines terminated by `data: [DONE]`) but can also return a single plain
// JSON body with no SSE framing at all. Read the whole body first, then
// decide how to interpret it — same defensive approach as the extension,
// so a plain-JSON response doesn't silently assemble into an empty string.
async function readBody(response) {
  const rawText = await response.text()

  if (rawText.includes('data: ')) {
    let output = ''
    const lines = rawText.split('\n\n')

    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed.startsWith('data: ')) continue

      const raw = trimmed.slice('data: '.length).trim()
      if (raw === '[DONE]') continue

      try {
        const { token } = JSON.parse(raw)
        if (token) output += token
      } catch {
        output += raw
      }
    }

    if (output) return output
  }

  return rawText
}

// ===== AUTHENTICATED REQUEST =====
// Deliberately not routed through authfetch.js's fetchWithAuth: that
// helper always calls response.json() on the body, which breaks on this
// endpoint's SSE-or-plain-text responses. This mirrors fetchWithAuth's
// auth/refresh behavior but reads the body with readBody() above instead.
async function requestExercises(text, signal, _retryCount = 0) {
  const stored = getUserState()
  if (!stored?.accessToken) {
    throw new AuthError('No access token found — please sign in.')
  }

  const response = await fetch(QUERIES_ENDPOINT, {
    method: 'POST',
    signal,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${stored.accessToken}`,
    },
    body: JSON.stringify({
      content: text,
      selectedVal: DEFAULT_MODEL,
    }),
  })

  if (response.status === 401 && _retryCount === 0) {
    await refreshTokens()
    return requestExercises(text, signal, 1)
  }

  if (!response.ok) {
    let detail = response.statusText
    try {
      const errBody = await response.clone().json()
      detail = errBody?.message || detail
    } catch {
      // body wasn't JSON — fall back to statusText
    }
    throw new Error(`Request failed (${response.status}): ${detail}`)
  }

  const rawOutput = await readBody(response)
  if (!rawOutput) {
    throw new Error('The server returned an empty response. Please try again.')
  }

  let parsed
  try {
    parsed = JSON.parse(rawOutput)
  } catch {
    throw new Error('Received malformed data from the server. Please try again.')
  }

  // Backend wraps the payload as:
  // { status, message, data: { api_response: { data: { exercises: [...] } } }, remaining_credits }
  if (parsed?.status === false) {
    throw new Error(parsed.message || 'The server rejected the request.')
  }

  const exercises = parsed?.data?.api_response?.data?.exercises
  if (!Array.isArray(exercises)) {
    throw new Error('Unexpected response shape from server — no exercises field found.')
  }

  return { exercises, remainingCredits: parsed?.remaining_credits }
}

// ===== PUBLIC API =====

/**
 * Generates exercises from arbitrary text, chunking long input as needed.
 * @param {string} fullText
 * @param {{ onProgress?: (done: number, total: number) => void }} [opts]
 * @returns {Promise<{ exercises: object[], remainingCredits: number|undefined, partialErrors: string[] }>}
 */
export async function generateExercisesFromText(fullText, opts = {}) {
  const trimmed = (fullText || '').trim()
  if (trimmed.length < 10) {
    throw new Error('Please provide a bit more text to generate questions from.')
  }

  const chunks = chunkText(trimmed)
  const list = chunks.length ? chunks : [trimmed]
  const controller = new AbortController()
  const allExercises = []
  const errors = []
  let remainingCredits

  for (let i = 0; i < list.length; i++) {
    try {
      const { exercises, remainingCredits: rc } = await requestExercises(list[i], controller.signal)
      exercises.forEach((raw) => {
        const normalized = normalizeExercise(raw)
        if (normalized) allExercises.push(normalized)
      })
      if (rc !== undefined) remainingCredits = rc
      opts.onProgress?.(i + 1, list.length)
    } catch (err) {
      if (err.name === 'AbortError') break
      errors.push(err.message)
    }
  }

  if (allExercises.length === 0 && errors.length > 0 && errors.length === list.length) {
    throw new Error(errors[0])
  }

  return { exercises: allExercises, remainingCredits, partialErrors: errors }
}

// ===== NORMALIZATION =====
// Maps a raw backend exercise object into a shape the review UI and the
// Mock Test / Flashcards features can consume directly.

let idCounter = 0
function nextLocalId() {
  idCounter += 1
  return `aigen_${Date.now()}_${idCounter}`
}

function normalizeExercise(raw) {
  if (!raw || typeof raw !== 'object') return null

  switch (raw.type) {
    case 'mcq': {
      if (
        typeof raw.question !== 'string' ||
        !Array.isArray(raw.options) ||
        raw.options.length < 2 ||
        typeof raw.correctIndex !== 'number'
      ) return null
      return {
        _id: nextLocalId(),
        kind: 'mcq',
        q: raw.question,
        options: raw.options.map(String),
        correct: raw.correctIndex,
        explanation: raw.explanation || null,
      }
    }

    case 'fillIn': {
      if (typeof raw.question !== 'string' || typeof raw.correctAnswer !== 'string') return null
      return {
        _id: nextLocalId(),
        kind: 'fillIn',
        q: raw.question,
        correctAnswer: raw.correctAnswer,
        hints: Array.isArray(raw.hints) ? raw.hints : [],
        explanation: raw.explanation || null,
      }
    }

    case 'flashcard': {
      if (typeof raw.front !== 'string' || typeof raw.back !== 'string') return null
      return {
        _id: nextLocalId(),
        kind: 'flashcard',
        front: raw.front,
        back: raw.back,
        explanation: raw.explanation || null,
      }
    }

    default:
      return null
  }
}

export function normalizeExercises(rawExercises) {
  if (!Array.isArray(rawExercises)) return []
  return rawExercises.map(normalizeExercise).filter(Boolean)
}
