import React, { useEffect, useRef, useState } from 'react'
import {
  PhoneOutlined, MessageOutlined, CheckCircleOutlined,
  ClockCircleOutlined, InfoCircleFilled, CloseCircleOutlined,
} from '@ant-design/icons'
import { domain, fetchWithAuth } from './authfetch'
import { getFromLocalStorage, setToLocalStorage } from './fromlocal'

// ─── constants ────────────────────────────────────────────────────────────────

const OTP_RESEND_SECS = 60

// ─── helpers ──────────────────────────────────────────────────────────────────

const digitsOnly = (val) => val.replace(/\D/g, '')

/**
 * VerifyOTP
 *
 * Same send/verify flow as the OTP step in Register.jsx, but built to run
 * from inside an already-authenticated page (Dashboard) rather than mid
 * sign-up. The key difference: Register.jsx authenticates OTP calls with a
 * short-lived `temptoken` handed back from /auth/register. Here the user is
 * already fully logged in, so we read their real accessToken/refreshToken
 * out of localStorage (via getFromLocalStorage, same helper Dashboard.jsx
 * already uses) and let fetchWithAuth handle silent token refresh the same
 * way the rest of Dashboard.jsx's calls do.
 *
 * Props:
 *   onSuccess() — called once the code is verified. Caller is responsible
 *                 for flipping `isVerified` in local state/localStorage
 *                 (Dashboard.jsx already does this in its own onSuccess).
 *   onClose()   — called when the user dismisses the modal (X button or
 *                 backdrop click) without finishing verification.
 */
const VerifyOTP = ({ onSuccess, onClose }) => {
  const [msisdn,   setmsisdn]   = useState('')
  const [otp,      setotp]      = useState('')
  const [sent,     setsent]     = useState(false)
  const [sendLoading,   setsendLoading]   = useState(false)
  const [verifyLoading, setverifyLoading] = useState(false)
  const [counter,  setcounter]  = useState(0)
  const [toast,    settoast]    = useState({ message: '', visible: false, isSuccess: false })

  const countRef      = useRef(null)
  const toastTimerRef = useRef(null)

  useEffect(() => () => {
    clearInterval(countRef.current)
    clearTimeout(toastTimerRef.current)
  }, [])

  const showToast = (message, isSuccess = false) => {
    clearTimeout(toastTimerRef.current)
    settoast({ message, visible: true, isSuccess })
    toastTimerRef.current = setTimeout(
      () => settoast((t) => ({ ...t, visible: false })),
      5000
    )
  }

  const startCounter = (secs = OTP_RESEND_SECS) => {
    setcounter(secs)
    clearInterval(countRef.current)
    countRef.current = setInterval(() => {
      setcounter((c) => {
        if (c <= 1) { clearInterval(countRef.current); return 0 }
        return c - 1
      })
    }, 1000)
  }

  const getSessionTokens = () => {
    const stored = getFromLocalStorage('userInfo', {})
    if (!stored?.accessToken) {
      throw new Error('Missing session — please log in again.')
    }
    return { accessToken: stored.accessToken, refreshToken: stored.refreshToken }
  }

  // ── send / resend code ──
  const sendOtp = async () => {
    if (counter > 0) return
    if (digitsOnly(msisdn).length < 9) {
      showToast('Add a valid phone number including country code (e.g. +233…)')
      return
    }

    let accessToken, refreshToken
    try {
      ;({ accessToken, refreshToken } = getSessionTokens())
    } catch (e) {
      showToast(e.message)
      return
    }

    setsendLoading(true)
    try {
      await fetchWithAuth(
        `${domain}/api/v1/otp/send/sms`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
          body: JSON.stringify({ msisdn }),
        },
        refreshToken
      )
      showToast(sent ? 'New code sent!' : 'OTP sent successfully!', true)
      setsent(true)
      startCounter()
    } catch (err) {
      showToast(err?.message || 'Failed to send OTP — please try again.')
    } finally {
      setsendLoading(false)
    }
  }

  // ── verify entered code ──
  const verifyOtp = async () => {
    if (!otp || digitsOnly(otp).length !== 6) {
      showToast('Please enter the 6-digit OTP code.')
      return
    }

    let accessToken, refreshToken
    try {
      ;({ accessToken, refreshToken } = getSessionTokens())
    } catch (e) {
      showToast(e.message)
      return
    }

    setverifyLoading(true)
    try {
      await fetchWithAuth(
        `${domain}/api/v1/otp/verify`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
          body: JSON.stringify({ path: 'msisdn', otp }),
        },
        refreshToken
      )

      // Keep localStorage's userInfo in sync immediately, same pattern
      // Dashboard.jsx's own onSuccess handler follows.
      const updated = { ...getFromLocalStorage('userInfo', {}), isVerified: true }
      setToLocalStorage('userInfo', updated)

      showToast("Phone verified! You're all set.", true)
      setTimeout(() => onSuccess?.(), 700)
    } catch (err) {
      showToast(err?.message || 'Verification failed — check the code and try again.')
    } finally {
      setverifyLoading(false)
    }
  }

  return (
    <div className="vo-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose?.() }}>
      <style>{STYLES}</style>

      <div className="vo-modal">
        <button className="vo-close" onClick={onClose} title="Close">
          <CloseCircleOutlined />
        </button>

        <div className="vo-header">
          <span className="vo-header-icon"><PhoneOutlined /></span>
          <div className="vo-header-text">
            <h3>Verify your phone</h3>
            <p>We'll text you a 6-digit code to confirm it's really you.</p>
          </div>
        </div>

        {toast.visible && (
          <div className={`vo-toast ${toast.isSuccess ? 'vo-toast--success' : 'vo-toast--error'}`}>
            {toast.isSuccess ? `🟢 ${toast.message}` : `🔴 ${toast.message}`}
          </div>
        )}

        <div className="vo-field">
          <span className="vo-field-icon"><PhoneOutlined /></span>
          <input
            type="tel"
            className="vo-input"
            placeholder="PHONE (e.g. +233XXXXXXXXX)"
            value={msisdn}
            onChange={(e) => setmsisdn(e.target.value)}
            autoComplete="tel"
          />
        </div>

        <div className="vo-actions">
          <button
            className="vo-btn vo-btn--primary"
            onClick={sendOtp}
            disabled={sendLoading || counter > 0}
          >
            <CheckCircleOutlined />
            {sendLoading ? 'Sending…' : sent ? (counter > 0 ? `Resend in ${counter}s` : 'Resend code') : 'Send code'}
          </button>
          <div className="vo-cooldown">
            <ClockCircleOutlined />
            <span>{counter > 0 ? `Resend in ${counter}s` : 'Ready to send'}</span>
          </div>
        </div>

        <div className="vo-field">
          <span className="vo-field-icon"><MessageOutlined /></span>
          <input
            type="number"
            className="vo-input"
            placeholder="OTP CODE (6 DIGITS)"
            value={otp}
            onChange={(e) => setotp(e.target.value)}
            disabled={!sent}
          />
        </div>

        {!sent && (
          <div className="vo-hint">
            <InfoCircleFilled /> Enter your phone number and send a code first.
          </div>
        )}

        <button
          className="vo-btn vo-btn--confirm"
          onClick={verifyOtp}
          disabled={!sent || verifyLoading}
        >
          {verifyLoading ? 'Verifying…' : 'Verify & continue'}
        </button>
      </div>
    </div>
  )
}

export default VerifyOTP

// ─── Styles ───────────────────────────────────────────────────────────────────

const STYLES = `
  .vo-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,.7);
    backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2000;
    padding: 16px;
    box-sizing: border-box;
  }
  .vo-modal {
    width: 420px;
    max-width: 100%;
    background: #111115;
    border: 1px solid #1e1e28;
    border-radius: 16px;
    padding: 22px 22px 24px;
    position: relative;
    box-shadow: 0 24px 60px rgba(0,0,0,.6);
    animation: vo-fadein .2s ease;
    box-sizing: border-box;
  }
  .vo-close {
    position: absolute;
    top: 10px;
    right: 10px;
    background: rgba(255,255,255,.06);
    border: none;
    color: #aaa;
    font-size: 16px;
    width: 30px;
    height: 30px;
    border-radius: 50%;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .vo-close:hover { color: #fff; background: rgba(255,255,255,.12); }

  .vo-header {
    display: flex;
    gap: 12px;
    align-items: flex-start;
    margin-bottom: 16px;
  }
  .vo-header-icon {
    flex-shrink: 0;
    width: 38px;
    height: 38px;
    border-radius: 10px;
    background: linear-gradient(135deg, #3730a3, #6366f1);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    font-size: 16px;
  }
  .vo-header-text h3 { margin: 0 0 4px; font-size: 15px; font-weight: 700; color: #e8e8f0; }
  .vo-header-text p  { margin: 0; font-size: 12px; color: #9797a8; line-height: 1.5; }

  .vo-toast {
    font-size: 12px;
    padding: 8px 12px;
    border-radius: 8px;
    margin-bottom: 14px;
  }
  .vo-toast--error   { background: #2b0d0d; border: 1px solid #7f1d1d; color: #f87171; }
  .vo-toast--success { background: #0d2b1e; border: 1px solid #14532d; color: #4ade80; }

  .vo-field {
    display: flex;
    align-items: center;
    gap: 8px;
    background: #1a1a22;
    border: 1px solid #2a2a38;
    border-radius: 10px;
    padding: 9px 12px;
    margin-bottom: 10px;
    transition: border-color .15s;
  }
  .vo-field:focus-within { border-color: #6366f1; }
  .vo-field-icon { color: #666; font-size: 13px; flex-shrink: 0; }
  .vo-input {
    flex: 1;
    background: transparent;
    border: none;
    outline: none;
    color: #e0e0e8;
    font-size: 13px;
    min-width: 0;
  }
  .vo-input::placeholder { color: #55555f; }
  .vo-input:disabled { opacity: .45; cursor: not-allowed; }

  .vo-actions {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    margin-bottom: 14px;
  }
  .vo-cooldown {
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 11px;
    color: #666;
    white-space: nowrap;
  }

  .vo-hint {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 11px;
    color: #d4b84a;
    margin: -2px 0 14px;
  }

  .vo-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 7px;
    border-radius: 10px;
    border: none;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: background .15s, opacity .15s;
    padding: 10px 14px;
  }
  .vo-btn:disabled { opacity: .55; cursor: not-allowed; }

  .vo-btn--primary {
    background: #1e1b4b;
    border: 1px solid #4338ca;
    color: #a5b4fc;
    white-space: nowrap;
  }
  .vo-btn--primary:hover:not(:disabled) { background: #25224f; }

  .vo-btn--confirm {
    width: 100%;
    background: #4f46e5;
    color: #fff;
  }
  .vo-btn--confirm:hover:not(:disabled) { background: #4338ca; }

  @keyframes vo-fadein { from { opacity:0; transform: translateY(8px); } to { opacity:1; transform: translateY(0); } }
`