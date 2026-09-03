import {
  InfoCircleFilled, LockOutlined, MailOutlined, MessageOutlined,
  UserAddOutlined, PhoneOutlined, ClockCircleOutlined, CheckCircleOutlined,
  EyeOutlined, EyeInvisibleOutlined, GoogleOutlined, ArrowLeftOutlined,
  SafetyCertificateOutlined, LoadingOutlined,
} from "@ant-design/icons";
import {Link, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { domain } from "./authfetch";

import jess         from "../../public/imgs/jess.jpg";
import brown        from "../../public/imgs/brown.jpg";
import jude         from "../../public/imgs/jude.jpg";
import guylogs      from "../../public/imgs/guylogs.png";
import racoon_learn from "../../public/imgs/racoon_learn.jpg";
import logo         from "../../public/imgs/titled.jpg";
import { GoogleBtn } from "./Googlebtn";

// ─── constants ────────────────────────────────────────────────────────────────

const PANEL_IMGS = [jess, jude, guylogs, brown];
// Stable random pick per mount — stored outside component to avoid re-rolling on re-render
const PANEL_IMG = PANEL_IMGS[Math.floor(Math.random() * PANEL_IMGS.length)];

const VIEW = {
  LOGIN:      "login",
  SIGNUP:     "signup",
  OTP:        "otp",
  FORGOT:     "forgot",
  RESET_SENT: "reset_sent",
  POLICY:     "policy",
  TERMS:      "terms",
};

const OTP_RESEND_SECS = 60;

// Vite exposes env vars prefixed with VITE_ on import.meta.env
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const GSI_SCRIPT_SRC   = "https://accounts.google.com/gsi/client";
const GSI_SCRIPT_ID    = "google-identity-services";

// ─── helpers ──────────────────────────────────────────────────────────────────

const isValidEmail = (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());

function persistUserInfo(userData) {
  try { localStorage.setItem("userInfo", JSON.stringify(userData)); } catch { /* quota exceeded */ }
}

function syncWithExtension(userInfo) {
  try {
    const EXTENSION_ID = "jfphmdfhigoppbldgnclkpjikkbjmkmo";
    if (window.chrome?.runtime?.sendMessage) {
      window.chrome.runtime.sendMessage(
        EXTENSION_ID,
        { action: "syncAuth", userInfo },
        () => { void window.chrome.runtime.lastError; }
      );
    }
  } catch { /* extension not installed */ }
}

// ─── component ────────────────────────────────────────────────────────────────

export default function Register() {

  /* ── form fields ── */
  const [email,       setemail]       = useState("");
  const [firstName,   setfirstName]   = useState("");
  const [lastName,    setlastName]    = useState("");
  const [password,    setpassword]    = useState("");
  const [confirm,     setconfirm]     = useState("");
  const [msisdn,      setmsisdn]      = useState("");
  const [otp,         setotp]         = useState("");
  const [loginEmail,  setloginEmail]  = useState("");
  const [loginPwd,    setloginPwd]    = useState("");
  const [forgotEmail, setforgotEmail] = useState("");
  const [referalCode, setreferalCode] = useState("");
  const [hasref,      sethasref]      = useState(false);
  const [agreed,      setagreed]      = useState(false);
  /* ── ui state ── */
  const [view,        setview]        = useState(VIEW.LOGIN);
  const [legalReturn, setlegalReturn] = useState(VIEW.SIGNUP);
  const [showPwd,     setshowPwd]     = useState(false);
  const [showPwd2,    setshowPwd2]    = useState(false);
  const [loading,     setloading]     = useState(false);
  const [googleLoading, setgoogleLoading] = useState(false);

  const [otpLoading,  setotpLoading]  = useState(false);
  const [counter,     setcounter]     = useState(0);
  const [temptoken,   settemptoken]   = useState("");
  const [skipotp,     setskipotp]     = useState(false);

  /* ── current terms & privacy policy version (fetched on page load) ── */
  const [policyVersion, setpolicyVersion] = useState(null);

  /* ── toast ── */
  const [toast,      settoast]      = useState({ message: "", visible: false, isSuccess: false });
  const toastTimer = useRef(null);
  const countRef   = useRef(null);

  /* ── google identity services ── */
  const [gsiReady, setgsiReady] = useState(false); // true once google.accounts.id is initialized
  const googleContainerNode = useRef(null);        // the currently-mounted overlay node Google renders into
  const googleFlowView      = useRef(VIEW.LOGIN);  // which view's button was rendered/clicked (login vs signup vs forgot)

  // ── FIX: refs that always mirror the latest state, read inside handleGoogleCredential ──
  // google.accounts.id.initialize() is only ever called ONCE (see the mount-only effect
  // below), so the `callback` it's holding is a closure frozen at that first render — at
  // that point referalCode is "", agreed is false, and policyVersion is null. Without these
  // refs, handleGoogleCredential would keep reading those stale, permanently-empty values
  // forever, no matter what the user later types or checks. Refs sidestep that: their
  // `.current` is mutated in place, so the same function reads live data every time it
  // fires, without needing to re-run `initialize` (and re-render Google's button) on every
  // keystroke.
  const referalCodeRef   = useRef(referalCode);
  const agreedRef        = useRef(agreed);
  const policyVersionRef = useRef(policyVersion);

  useEffect(() => { referalCodeRef.current = referalCode; }, [referalCode]);
  useEffect(() => { agreedRef.current = agreed; }, [agreed]);
  useEffect(() => { policyVersionRef.current = policyVersion; }, [policyVersion]);

  const showToast = (message, isSuccess = false) => {
    clearTimeout(toastTimer.current);
    settoast({ message, visible: true, isSuccess });
    toastTimer.current = setTimeout(
      () => settoast((t) => ({ ...t, visible: false })),
      6000
    );
  };

  useEffect(() => () => {
    clearTimeout(toastTimer.current);
    clearInterval(countRef.current);
  }, []);

  /* ── fetch the currently active Terms of Service & Privacy Policy version on page load ── */
  useEffect(() => {
    fetch(`${domain}/api/v1/policies/current`)
      .then((res) => res.json())
      .then((result) => {
        if (result?.status && Array.isArray(result.data) && result.data.length > 0) {
          const active = result.data.find((p) => p.isActive) ?? result.data[0];
          if (active?.version) setpolicyVersion(active.version);
        }
      })
      .catch((err) => console.error("Failed to fetch active policy version:", err));
  }, []);

  /* ── otp countdown ── */
  const startCounter = (secs = OTP_RESEND_SECS) => {
    setcounter(secs);
    clearInterval(countRef.current);
    countRef.current = setInterval(() => {
      setcounter((c) => {
        if (c <= 1) { clearInterval(countRef.current); return 0; }
        return c - 1;
      });
    }, 1000);
  };

  /* ── session ── */
  const populate = (result) => {
    const userData = {
      ...result.data.userData,
      accessToken:  result.data.token,
      refreshToken: result.data.refreshToken,
    };
    settemptoken(result.data.token);
    persistUserInfo(userData);
    syncWithExtension(userData);
  };
  const navigate = useNavigate();

  const activateUser = () => {
    try {
      navigate('/');
    } catch (err) { showToast(String(err)); }
  };

  /* ── register ── */
  const authenticate = async () => {
    setloading(true);
    try {
      const payload = { email: email.trim(), firstName: firstName.trim(), lastName: lastName.trim(), password };
      if (referalCode.trim()) payload.referalCode = referalCode.trim();
      // Only stamp the policy version the user actually agreed to (checkbox checked at submit time)
      if (agreed && policyVersion) payload.agreedPolicyVersion = policyVersion;

      const res    = await fetch(`${domain}/api/v1/auth/register`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(payload),
      });
      const result = await res.json();

      if (result.status) {
        populate(result);
        setview(VIEW.OTP);
      } else {
        showToast(result.message + (result.details ?? ""));
      }
    } catch (err) {
      showToast("Network error — please check your connection and try again.");
    } finally {
      setloading(false);
    }
  };

  /* ── login ── */
  const authlogin = async () => {
    setloading(true);
    try {
      const res    = await fetch(`${domain}/api/v1/auth/login`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ email: loginEmail.trim(), password: loginPwd }),
      });
      const result = await res.json();

      if (result.status) {
        populate(result);
        showToast("Welcome back! Signing you in…", true);
        setTimeout(activateUser, 900);
      } else {
        showToast(result.message + (result.details ?? ""));
      }
    } catch (err) {
      showToast("Network error — please check your connection and try again.");
    } finally {
      setloading(false);
    }
  };

  /* ── google oauth (Google Identity Services, client-side) ── */

  // Exchanges the Google ID token with the backend for our own session.
  // Routes to a different endpoint depending on which view the button was
  // clicked from:
  //   - LOGIN / FORGOT  -> /api/v1/auth/login   (existing user only;
  //                        backend should NOT auto-create an account here)
  //   - SIGNUP          -> /api/v1/auth/google/register (find-or-create,
  //                        same contract as before)
  // A login-via-Google skips OTP entirely (returning, already-verified user),
  // same as authlogin(). A signup-via-Google still needs phone verification,
  // same as authenticate().
  //
  // NOTE: this function is registered with google.accounts.id.initialize()
  // exactly once, in the mount-only effect below. Because of that, it must
  // NOT read referalCode / agreed / policyVersion directly from component
  // state — those would be frozen at their mount-time values ("", false,
  // null) forever. Read from the *Ref versions instead, which always hold
  // the latest value regardless of when this closure was created.
  const handleGoogleCredential = async (response) => {
    if (!response?.credential) {
      showToast("Google sign-in didn't return a credential — please try again.");
      return;
    }

    const isLogin  = googleFlowView.current !== VIEW.SIGNUP;
    const endpoint = isLogin
      ? `${domain}/api/v1/auth/login`
      : `${domain}/api/v1/auth/google/register`;

    setgoogleLoading(true);
    try {
      const googlePayload = { id_token: response.credential };

      // Referral code only makes sense on signup (matches the SIGNUP-only agreedPolicyVersion
      // rule below) — read from the ref, not the raw `referalCode` state variable, since this
      // whole function is registered once with Google and would otherwise always see the
      // referral field's value from the very first render (i.e. "").
      if (!isLogin && referalCodeRef.current.trim()) {
        googlePayload.referalCode = referalCodeRef.current.trim();
      }

      // Google signup only fires from the SIGNUP view, which is blocked until `agreed` is
      // checked (see GoogleBtn's `blocked={!agreed}` prop), so agreedRef.current should be
      // true here — but we still guard on it defensively, same as the email/password
      // register flow. Same staleness reasoning as referalCodeRef above applies to both
      // agreedRef and policyVersionRef.
      if (!isLogin && agreedRef.current && policyVersionRef.current) {
        googlePayload.agreedPolicyVersion = `${policyVersionRef.current}`;
      }

      const res = await fetch(endpoint, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(googlePayload),
      });
      const result = await res.json();

      if (result.status) {
        populate(result);
        if (isLogin) {
          showToast("Welcome back! Signing you in…", true);
          setTimeout(activateUser, 900);
        } else {
          setview(VIEW.OTP);
        }
      } else {
        showToast(result.message + (result.details ?? ""));
      }
    } catch (err) {
      showToast("Network error — please check your connection and try again.");
    } finally {
      setgoogleLoading(false);
    }
  };

  // Loads the GSI script once and initializes it with our client ID.
  // Does NOT render the button here — Google's rendered button lives inside a
  // cross-origin iframe, so it must be rendered directly into the actual node
  // the person will click (you cannot query into it or forward a click to it
  // from outside — that's a browser security boundary, not a bug). Rendering
  // happens in the effect below, keyed to whichever view is currently mounted.
  //
  // handleGoogleCredential is captured here ONCE — this is intentional (we
  // don't want to re-run initialize/re-render Google's iframe on every
  // keystroke) but it means the function must rely on refs (see above) for
  // any value that changes after mount.
  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) {
      console.warn("VITE_GOOGLE_CLIENT_ID is not set — Google sign-in is disabled.");
      return;
    }

    const initGoogle = () => {
      if (!window.google?.accounts?.id) return;
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback:  handleGoogleCredential,
        ux_mode:   "popup",
      });
      setgsiReady(true);
    };

    const existing = document.getElementById(GSI_SCRIPT_ID);
    if (existing) {
      if (window.google?.accounts?.id) initGoogle();
      else existing.addEventListener("load", initGoogle);
      return;
    }

    const script  = document.createElement("script");
    script.src    = GSI_SCRIPT_SRC;
    script.id     = GSI_SCRIPT_ID;
    script.async  = true;
    script.defer  = true;
    script.onload = initGoogle;
    script.onerror = () => console.warn(
      "Google Identity script failed to load — likely blocked by an ad blocker " +
      "or browser extension (common on desktop, rarer on mobile)."
    );
    document.body.appendChild(script);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Renders Google's real button into the currently-mounted overlay container.
  // Re-runs whenever `view` changes, because the container is a fresh DOM node
  // each time the Login/Signup/Forgot section mounts. Also records which view
  // this particular button belongs to, so handleGoogleCredential knows whether
  // the click came from a login-intent or signup-intent screen.
  useEffect(() => {
    if (!gsiReady || !googleContainerNode.current || !window.google?.accounts?.id) return;
    googleFlowView.current = view;
    googleContainerNode.current.innerHTML = ""; // avoid stacking duplicate iframes on re-render
    window.google.accounts.id.renderButton(googleContainerNode.current, {
      type:  "standard",
      theme: "outline",
      size:  "large",
      width: 320,
    });
  }, [gsiReady, view]);

  /* ── otp: send ── */
  const sendOtp = async () => {
    if (counter > 0) return;
    setotpLoading(true);
    try {
      const res = await fetch(`${domain}/api/v1/otp/send/sms`, {
        method:  "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${temptoken}` },
        body:    JSON.stringify({ msisdn }),
      });
      if (res.ok) {
        showToast("OTP sent successfully!", true);
        setskipotp(true);
        startCounter();
      } else {
        showToast("Failed to send OTP — please try again.");
      }
    } catch {
      showToast("Network error — please retry.");
    } finally {
      setotpLoading(false);
    }
  };

  /* ── otp: verify ── */
  const verifyOtp = async () => {
    if (!otp || String(otp).length !== 6) {
      showToast("Please enter the 6-digit OTP code.");
      return;
    }
    setotpLoading(true);
    try {
      const res = await fetch(`${domain}/api/v1/otp/verify`, {
        method:  "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${temptoken}` },
        body:    JSON.stringify({ path: "msisdn", otp }),
      });
      if (res.ok) {
        showToast("Phone verified! You're all set.", true);
        setTimeout(activateUser, 900);
      } else {
        showToast("Verification failed — check the code and try again.");
      }
      setskipotp(true);
    } catch {
      showToast("Network error — please retry.");
    } finally {
      setotpLoading(false);
    }
  };

  /* ── forgot password ── */
  const sendPasswordReset = async () => {
    if (!isValidEmail(forgotEmail)) {
      showToast("Enter a valid email address.");
      return;
    }
    setloading(true);
    try {
      // Always show the "sent" screen regardless of response to prevent email enumeration
      await fetch(`${domain}/api/v1/auth/forgot-password`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ email: forgotEmail.trim() }),
      });
      setview(VIEW.RESET_SENT);
    } catch {
      showToast("Network error — please try again.");
    } finally {
      setloading(false);
    }
  };

  /* ── validation ── */
  const validateSignup = () => {
    if (!isValidEmail(email))           { showToast("Add a valid email e.g. you@example.com"); return; }
    if (firstName.trim().length < 2)    { showToast("First name must be at least 2 characters"); return; }
    if (lastName.trim().length < 2)     { showToast("Last name must be at least 2 characters"); return; }
    if (!password)                      { showToast("Please enter a password"); return; }
    if (/\s/.test(password))            { showToast("Password must not contain spaces"); return; }
    if (password.length < 5)            { showToast("Password must be at least 5 characters"); return; }
    if (confirm !== password)           { showToast("Passwords do not match"); return; }
    if (!agreed)                        { showToast("Please accept the Terms & Privacy Policy to continue"); return; }
    authenticate();
  };

  const validateLogin = () => {
    if (!isValidEmail(loginEmail))      { showToast("Add a valid email e.g. you@example.com"); return; }
    if (/\s/.test(loginEmail))          { showToast("Email must not contain spaces"); return; }
    if (!loginPwd)                      { showToast("Please enter your password"); return; }
    if (/\s/.test(loginPwd))            { showToast("Password must not contain spaces"); return; }
    if (loginPwd.length < 5)            { showToast("Password must be at least 5 characters"); return; }
    authlogin();
  };

  const validateOtpSend = () => {
    if (msisdn.replace(/\D/g, "").length < 9) {
      showToast("Add a valid phone number including country code (e.g. +233…)");
      return;
    }
    sendOtp();
  };

  /* ── shared mini-components ── */
  const OrDivider = () => (
    <div className="noted" style={{ justifyContent:"center", opacity:.5, gap:8 }}>
      <span style={{ flex:1, height:1, background:"rgba(255,255,255,.35)", display:"inline-block" }}/>
      <small>or</small>
      <span style={{ flex:1, height:1, background:"rgba(255,255,255,.35)", display:"inline-block" }}/>
    </div>
  );

  const LegalFooter = () => (
    <div className="noted" style={{ fontSize:".72rem", opacity:.55, justifyContent:"center", flexWrap:"wrap", gap:4 }}>
      By continuing you agree to our&nbsp;
      <Link target="_blank" rel="noopener noreferrer" to="/policy_and_terms" style={{ textDecoration:"underline", cursor:"pointer", color:"cyan" }}
        >Terms</Link>
      &nbsp;&amp;&nbsp;
      <Link target="_blank" rel="noopener noreferrer" to="/policy_and_terms" style={{ textDecoration:"underline", cursor:"pointer", color:"cyan" }}
        >Privacy Policy</Link>
    </div>
  );

  /* ── legal scroll box ── */
  const LegalBody = ({ children }) => (
    <div style={{
      background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.15)",
      borderRadius:10, padding:"1rem 1.2rem",
      maxHeight:320, overflowY:"auto",
      fontSize:".82rem", color:"rgba(255,255,255,0.82)", lineHeight:1.7,
    }}>
      {children}
    </div>
  );
  const lH3 = { margin:"1rem 0 .3rem", fontSize:".87rem", fontWeight:600, color:"#fff" };
  const lP  = { margin:"0 0 .25rem" };
  const lA  = { color:"#aad4ff" };

  /* ── legal shell ── */
  const LegalShell = ({ title, subtitle, children }) => (
    <div><div className="register">
      {toast.visible && (
        <div className="successmessage">
          {toast.isSuccess ? `🟢 ${toast.message} 🥳` : `🔴 ${toast.message}`}
        </div>
      )}
      <img className="regpic" src={PANEL_IMG} alt=""/>
      <div className="regbox">
        <div className="racoonbox">
          <img className="racoondp" src={racoon_learn} alt=""/>
          <div className="racoonintro">
            <div className="rbackdrop" style={{ zIndex:2 }}></div>
            <div className="wmessage">{title}</div>
            <div className="regnote">{subtitle}</div>
          </div>
        </div>
        <div className="half ">
          <div className="regform">
            <div className="mbox" style={{ display:"flex", flexDirection:"column", gap:".75rem" }}>
              {children}
              <div className="regbutton" onClick={() => setview(legalReturn)}>
                <ArrowLeftOutlined className="micon"/> Got it — go back
              </div>
            </div>
          </div>
        </div>
        <img className="tinylogo" style={{ zIndex:2 }} src={logo} alt=""/>
      </div>
    </div></div>
  );

  /* ══════════════════════════════════════════════════════════════════
     PRIVACY POLICY
  ══════════════════════════════════════════════════════════════════ */
  if (view === VIEW.POLICY) return (
    <LegalShell
      title="Privacy Policy"
      subtitle={"Last updated " + new Date().toLocaleDateString("en-GB", { year:"numeric", month:"long", day:"numeric" })}
    >
      <LegalBody>
        <h3 style={lH3}>1. Information We Collect</h3>
        <p style={lP}>We collect your name, email, phone number, and password when you register, plus usage data (pages visited, features used) to improve your experience.</p>
        <h3 style={lH3}>2. How We Use Your Data</h3>
        <p style={lP}>Your data operates and personalises UELearn, delivers OTP codes, and improves the platform. We do not sell your personal data to third parties.</p>
        <h3 style={lH3}>3. Data Sharing</h3>
        <p style={lP}>We share data only with providers who help us run UELearn (cloud infrastructure, SMS delivery). All are bound by data processing agreements. We may disclose data where required by law.</p>
        <h3 style={lH3}>4. Cookies & Storage</h3>
        <p style={lP}>We use session tokens stored in <code style={{ background:"rgba(255,255,255,.15)", padding:"0 4px", borderRadius:3 }}>localStorage</code> to keep you signed in. We do not use third-party advertising trackers.</p>
        <h3 style={lH3}>5. Data Retention</h3>
        <p style={lP}>Account data is kept while your account is active. You may request deletion at any time by emailing us.</p>
        <h3 style={lH3}>6. Your Rights</h3>
        <p style={lP}>You may access, correct, or delete your data. Contact <a href="mailto:privacy@uelearn.app" style={lA}>privacy@uelearn.app</a>.</p>
        <h3 style={lH3}>7. Security</h3>
        <p style={lP}>We use industry-standard encryption and access controls. Use a strong, unique password and keep it private.</p>
        <h3 style={lH3}>8. Changes</h3>
        <p style={lP}>Significant changes will be notified via email or in-app notice. Continued use constitutes acceptance of the updated policy.</p>
        <h3 style={lH3}>9. Contact</h3>
        <p style={lP}><a href="mailto:privacy@uelearn.app" style={lA}>privacy@uelearn.app</a></p>
      </LegalBody>
    </LegalShell>
  );

  /* ══════════════════════════════════════════════════════════════════
     TERMS OF SERVICE
  ══════════════════════════════════════════════════════════════════ */
  if (view === VIEW.TERMS) return (
    <LegalShell
      title="Terms of Service"
      subtitle={"Last updated " + new Date().toLocaleDateString("en-GB", { year:"numeric", month:"long", day:"numeric" })}
    >
      <LegalBody>
        <h3 style={lH3}>1. Acceptance</h3>
        <p style={lP}>By creating a UELearn account you agree to these Terms. If you disagree, do not use the platform.</p>
        <h3 style={lH3}>2. Eligibility</h3>
        <p style={lP}>You must be at least 13 years old. If under 18, you confirm you have parental or guardian consent.</p>
        <h3 style={lH3}>3. Account Responsibility</h3>
        <p style={lP}>You are responsible for keeping your credentials confidential and for all activity under your account. Notify us immediately of any unauthorised access.</p>
        <h3 style={lH3}>4. Acceptable Use</h3>
        <p style={lP}>You agree not to share content in ways that violate academic integrity, reverse-engineer the platform, impersonate others, or upload unlawful material.</p>
        <h3 style={lH3}>5. Intellectual Property</h3>
        <p style={lP}>All content, design, and software on UELearn is owned by or licensed to us. No reproduction or distribution without written permission.</p>
        <h3 style={lH3}>6. Subscriptions & Payments</h3>
        <p style={lP}>Paid features are billed in advance and are non-refundable except where required by law. Pricing changes come with 30 days' notice.</p>
        <h3 style={lH3}>7. Termination</h3>
        <p style={lP}>We may suspend or terminate accounts that violate these Terms. You may delete your account from settings at any time.</p>
        <h3 style={lH3}>8. Disclaimer</h3>
        <p style={lP}>UELearn is provided "as is." We do not guarantee specific academic outcomes. Results depend on individual effort.</p>
        <h3 style={lH3}>9. Limitation of Liability</h3>
        <p style={lP}>Our liability is limited to the amount you paid us in the 12 months preceding any claim, to the fullest extent permitted by law.</p>
        <h3 style={lH3}>10. Governing Law</h3>
        <p style={lP}>These Terms are governed by the laws of Ghana. Disputes shall be resolved in Accra, Ghana.</p>
        <h3 style={lH3}>11. Contact</h3>
        <p style={lP}><a href="mailto:legal@uelearn.app" style={lA}>legal@uelearn.app</a></p>
      </LegalBody>
    </LegalShell>
  );

  /* ══════════════════════════════════════════════════════════════════
     MAIN RENDER
  ══════════════════════════════════════════════════════════════════ */
  return (
    <div>
      <div className="register">
        {/* Toast — rendered once, driven by state (not a DOM-mutation side-effect) */}
        {toast.visible && (
          <div className="successmessage">
            {toast.isSuccess ? `🟢 ${toast.message} 🥳🥳🥳` : `🔴 ${toast.message}`}
          </div>
        )}

        {/* Single panel image — duplicate was a bug */}
        <img className="regpic" src={PANEL_IMG} alt=""/>

        <div className="regbox">
          <div className="racoonbox">
            <img className="racoondp" src={racoon_learn} alt=""/>
            <div className="racoonintro">
              <div className="rbackdrop" style={{ zIndex:2 }}></div>
              <div className="wmessage">Welcome to UELearn</div>
              <div className="regnote">study with aura !</div>
            </div>
          </div>

          <div className="half half2">
            <div className="picked">
              <img src={PANEL_IMG} className="brown" alt=""/>
              <img src={PANEL_IMG} className="brown mask" alt=""/>
            </div>
          </div>

          <div className="half">
            <div className="regform">

              {/* ══ FORGOT PASSWORD ══ */}
              {view === VIEW.FORGOT && (
                <div className="mbox" >
                  <div className="noted" style={{ cursor:"pointer" }} onClick={() => setview(VIEW.LOGIN)}>
                    <ArrowLeftOutlined className="micon"/> Back to sign in
                  </div>
                  <div className="noted" style={{ flexDirection:"column", alignItems:"flex-start", gap:4 }}>
                    <strong style={{ color:"#fff", fontSize:"1rem" }}>Reset your password</strong>
                    <span>Enter your registered email — we'll send a reset link right away.</span>
                  </div>
                  <GoogleBtn
                    googleLoading={googleLoading}
                    containerRef={googleContainerNode}
                  />
                  <OrDivider/>
                  <div className="inputform">
                    <MailOutlined className="micon"/>
                    <input
                      onChange={(e) => setforgotEmail(e.target.value)}
                      type="email" placeholder="EMAIL" autoComplete="email" className="impbox"
                    />
                  </div>
                  <br></br>
                  <div className="regbutton" onClick={sendPasswordReset}>
                    {loading ? "Sending…" : "Send reset link"}
                  </div>
                </div>
              )}

              {/* ══ RESET SENT ══ */}
              {view === VIEW.RESET_SENT && (
                <div className="mbox">
                  <div style={{ textAlign:"center", fontSize:"2.5rem", lineHeight:1 }}>✉️</div>
                  <div className="noted" style={{ flexDirection:"column",color:"cyan", alignItems:"center", gap:6, textAlign:"center" }}>
                    <strong style={{ color:"#fff", fontSize:"1rem" }}>Check your inbox</strong>
                    <span>
                      If <strong>{forgotEmail}</strong> is linked to an account, a reset link is on its way.
                      Also check your spam folder.
                    </span>
                  </div>
                  <div className="regbutton" onClick={() => setview(VIEW.LOGIN)}>
                    Back to sign in
                  </div>
                </div>
              )}

              {/* ══ LOGIN ══ */}
              {view === VIEW.LOGIN && (
                <div className="mbox">
                  <img className="tlogo" style={{ zIndex:2 }} src={logo} alt=""/>

                  <div className="title">UE LEARN</div>

                  <GoogleBtn
                    googleLoading={googleLoading}
                    containerRef={googleContainerNode}
                  />

                  <OrDivider/>

                  <div className="inputform">
                    <MailOutlined className="micon"/>
                    <input
                      onChange={(e) => setloginEmail(e.target.value)}
                      type="email" placeholder="EMAIL" autoComplete="email" className="impbox"
                    />
                  </div>
                  <div className="inputform">
                    {showPwd
                      ? <EyeInvisibleOutlined className="micon" style={{ cursor:"pointer" }} onClick={() => setshowPwd(false)}/>
                      : <EyeOutlined          className="micon" style={{ cursor:"pointer" }} onClick={() => setshowPwd(true)}/>}
                    <input
                      onChange={(e) => setloginPwd(e.target.value)}
                      type={showPwd ? "text" : "password"}
                      placeholder="PASSWORD" autoComplete="current-password" className="impbox"
                    />
                  </div>

                  <div className="noted" style={{ justifyContent:"flex-end" }}>
                    <span
                      style={{ cursor:"pointer", textDecoration:"underline", opacity:.75,color:"cyan", fontSize:".8rem" }}
                      onClick={() => setview(VIEW.FORGOT)}
                    >
                      Forgot password?
                    </span>
                  </div>

                  <div className="regbutton" onClick={validateLogin}>
                    {loading ? "Signing in…" : "Sign in"}
                  </div>
                  <div className="noted">
                    <InfoCircleFilled className="micon"/> Don't have an account?
                  </div>
                  <div className="regbutton" style={{ background:"black", color:"white" }}
                    onClick={() => setview(VIEW.SIGNUP)}>
                    Sign Up Instead?
                  </div>
                  <LegalFooter returnView={VIEW.LOGIN}/>
                </div>
              )}

              {/* ══ SIGN UP ══ */}
              {view === VIEW.SIGNUP && (
                <div className="mbox">
                  <img className="tlogo" style={{ zIndex:2 }} src={logo} alt=""/>

                  <div className="title">UE LEARN</div>

                  <GoogleBtn
                    googleLoading={googleLoading}
                    blocked={!agreed}
                    blockedMessage="Please accept the Terms & Privacy Policy to continue.👇"
                    onBlockedClick={showToast}
                    containerRef={googleContainerNode}
                  />
                  {/* referral */}
                  {hasref ? (
                    <>
                      <div className="regbutton" onClick={() => sethasref(false)}>
                        Remove referral section
                      </div>
                      <div className="inputform">
                        <SafetyCertificateOutlined className="micon"/>
                        <input className="impbox" type="text"
                          onChange={(e) => setreferalCode(e.target.value)} placeholder="REFERRAL CODE"/>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="noted">
                        <InfoCircleFilled className="micon"/> Optional: Add referral code
                      </div>
                      <div className="regbutton" onClick={() => sethasref(true)}>
                        Add referral code
                      </div>
                    </>
                  )}
                  <OrDivider/>

                  <div className="inputform">
                    <MailOutlined className="micon"/>
                    <input
                      onChange={(e) => setemail(e.target.value)}
                      type="email" placeholder="EMAIL" autoComplete="email" className="impbox"
                    />
                  </div>
                  <div className="inputform">
                    <UserAddOutlined className="micon"/>
                    <input
                      onChange={(e) => setfirstName(e.target.value)}
                      type="text" placeholder="FIRST NAME" autoComplete="given-name" className="impbox"
                    />
                  </div>
                  <div className="inputform">
                    <UserAddOutlined className="micon"/>
                    <input
                      onChange={(e) => setlastName(e.target.value)}
                      type="text" placeholder="LAST NAME" autoComplete="family-name" className="impbox"
                    />
                  </div>
                  <div className="inputform">
                    {showPwd
                      ? <EyeInvisibleOutlined className="micon" style={{ cursor:"pointer" }} onClick={() => setshowPwd(false)}/>
                      : <EyeOutlined          className="micon" style={{ cursor:"pointer" }} onClick={() => setshowPwd(true)}/>}
                    <input
                      onChange={(e) => setpassword(e.target.value)}
                      type={showPwd ? "text" : "password"}
                      placeholder="PASSWORD" autoComplete="new-password" className="impbox"
                    />
                  </div>
                  <div className="inputform">
                    {showPwd2
                      ? <EyeInvisibleOutlined className="micon" style={{ cursor:"pointer" }} onClick={() => setshowPwd2(false)}/>
                      : <EyeOutlined          className="micon" style={{ cursor:"pointer" }} onClick={() => setshowPwd2(true)}/>}
                    <input
                      onChange={(e) => setconfirm(e.target.value)}
                      type={showPwd2 ? "text" : "password"}
                      placeholder="CONFIRM PASSWORD" autoComplete="new-password" className="impbox"
                    />
                  </div>

                  {/* terms checkbox */}
                  <label className="noted" style={{ cursor:"pointer", userSelect:"none", gap:8, alignItems:"flex-start" }}>
                    <input
                      type="checkbox" checked={agreed}
                      onChange={(e) => setagreed(e.target.checked)}
                      style={{ marginTop:3, accentColor:"cyan", cursor:"pointer", flexShrink:0 }}
                    />
                    <span style={{ fontSize:".78rem", lineHeight:1.6 }}>
                      I agree to the&nbsp;
 <Link target="_blank" rel="noopener noreferrer" to="/policy_and_terms" style={{ textDecoration:"underline", cursor:"pointer", color:"cyan" }}
        >Terms</Link>
      &nbsp;&amp;&nbsp;
      <Link target="_blank" rel="noopener noreferrer" to="/policy_and_terms" style={{ textDecoration:"underline", cursor:"pointer", color:"cyan" }}
        >Privacy Policy</Link>                    </span>
                  </label>

                  <div className="otpverbox">
                    <div className="regbutton" onClick={validateSignup}>
                      {loading ? "Creating..." : "Sign Up"}
                    </div>
                    <div className="regbutton" style={{ background:"black", color:"white" }} onClick={() => setview(VIEW.LOGIN)}>
                      Login Instead?
                    </div>
                  </div>
                </div>
              )}

              {/* ══ OTP VERIFICATION ══ */}
              {view === VIEW.OTP && (
                <div className="tootp">
                  <div className="inputform">
                    <PhoneOutlined/>
                    <input
                      onChange={(e) => setmsisdn(e.target.value)}
                      type="tel" placeholder="PHONE (e.g. +233XXXXXXXXX)" autoComplete="tel" className="impbox"
                    />
                  </div>
                  <div className="noted">
                    <InfoCircleFilled  className="micon"/> Click Verify to receive your OTP code
                  </div>
                  <div className="otpverbox">
                    <div className="otpver" onClick={validateOtpSend}>
                      <CheckCircleOutlined className="micon" />
                      {otpLoading ? "Sending…" : "Verify"}
                    </div>
                    <div className="resend">
                      <ClockCircleOutlined className="micon"/>
                      <span className="count">
                        {counter > 0 ? `Resend in ${counter}s` : "Ready to resend"}
                      </span>
                    </div>
                  </div>
                  <div className="inputform">
                    <MessageOutlined/>
                    <input
                      onChange={(e) => setotp(e.target.value)}
                      type="number" placeholder="OTP CODE HERE (6 DIGIT)" className="impbox"
                    />
                  </div>
                  <div className="regbutton" onClick={verifyOtp}>
                    {otpLoading ? "Verifying…" : "Proceed"}
                  </div>
                  {skipotp && (
                    <>
                      <div className="noted">
                        <InfoCircleFilled className="micon"/> Didn't receive OTP? You can skip and verify later
                      </div>
                      <div className="skipbtn" onClick={activateUser}>
                        <i className="arrow-right"></i> {`Skip >`}
                      </div>
                    </>
                  )}
                </div>
              )}

            </div>
          </div>

          <img className="tinylogo" style={{ zIndex:2 }} src={logo} alt=""/>
        </div>
      </div>
    </div>
  );
}