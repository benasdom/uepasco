import { useEffect, useRef, useState } from 'react'

// Wraps window.speechSynthesis so a component can read arbitrary text aloud
// with play / pause / resume / stop and an adjustable rate, without every
// caller having to juggle SpeechSynthesisUtterance lifecycle quirks
// (e.g. Chrome silently dropping utterances that aren't kept referenced,
// or pause()/resume() behaving oddly across browsers).
//
// Only one utterance plays at a time app-wide — starting a new one cancels
// whatever was playing before, since overlapping speech would be unusable.

export function isSpeechSupported() {
  return typeof window !== 'undefined' && 'speechSynthesis' in window
}

export function useTextToSpeech() {
  const [speakingId, setSpeakingId] = useState(null) // which caller's text is active
  const [paused, setPaused] = useState(false)
  const [rate, setRate] = useState(1)
  const utteranceRef = useRef(null)

  useEffect(() => {
    return () => {
      if (isSpeechSupported()) window.speechSynthesis.cancel()
    }
  }, [])

  const stop = () => {
    if (!isSpeechSupported()) return
    window.speechSynthesis.cancel()
    utteranceRef.current = null
    setSpeakingId(null)
    setPaused(false)
  }

  const speak = (id, text) => {
    if (!isSpeechSupported() || !text?.trim()) return

    // Starting fresh always cancels anything currently queued/speaking.
    window.speechSynthesis.cancel()

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = rate
    utterance.onend = () => {
      setSpeakingId((current) => (current === id ? null : current))
      setPaused(false)
    }
    utterance.onerror = () => {
      setSpeakingId((current) => (current === id ? null : current))
      setPaused(false)
    }

    utteranceRef.current = utterance
    setSpeakingId(id)
    setPaused(false)
    window.speechSynthesis.speak(utterance)
  }

  const pause = () => {
    if (!isSpeechSupported()) return
    window.speechSynthesis.pause()
    setPaused(true)
  }

  const resume = () => {
    if (!isSpeechSupported()) return
    window.speechSynthesis.resume()
    setPaused(false)
  }

  const changeRate = (next) => {
    setRate(next)
    // Rate changes only apply to the *next* utterance in most browsers —
    // restart the current one at the new rate so the change feels immediate.
    if (speakingId && utteranceRef.current) {
      const text = utteranceRef.current.text
      const id = speakingId
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = next
      utterance.onend = () => setSpeakingId((c) => (c === id ? null : c))
      utterance.onerror = () => setSpeakingId((c) => (c === id ? null : c))
      utteranceRef.current = utterance
      window.speechSynthesis.speak(utterance)
    }
  }

  return { speakingId, paused, rate, speak, pause, resume, stop, changeRate, supported: isSpeechSupported() }
}
