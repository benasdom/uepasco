// Several existing stylesheets (Dashboard.css, Leaderboard.css, Job.css,
// etc.) already define [data-theme='light'] / [data-theme='dark'] CSS
// variables — they were just never wired to an actual switch. This hook
// is that switch: it sets data-theme on <html> and persists the choice.
// Defaults to 'dark' so nothing changes visually for existing users.
import { useCallback, useEffect, useState } from 'react'

const STORAGE_KEY = 'uelearn:theme'

function getInitialTheme() {
  try {
    return localStorage.getItem(STORAGE_KEY) || 'dark'
  } catch {
    return 'dark'
  }
}

export function useTheme() {
  const [theme, setThemeState] = useState(getInitialTheme)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    try {
      localStorage.setItem(STORAGE_KEY, theme)
    } catch {
      // ignore — theme just won't persist across reloads
    }
  }, [theme])

  const toggleTheme = useCallback(() => {
    setThemeState((t) => (t === 'dark' ? 'light' : 'dark'))
  }, [])

  return { theme, toggleTheme, setTheme: setThemeState }
}