// Generic, safe, per-user-namespaced localStorage helper used by the new
// learning-hub features (flashcards, mock tests, bookmarks, notes, planner,
// gamification). Never throws — storage can be unavailable (private
// browsing, quota exceeded, disabled) and callers shouldn't have to guard
// against that themselves.

import { getUserState } from '../menu/authfetch'

const PREFIX = 'uelearn:'

function userNamespace() {
  // Keep each signed-in user's local data separate on shared devices.
  const user = getUserState()
  return user?.email || user?.msisdn || 'guest'
}

function fullKey(key) {
  return `${PREFIX}${userNamespace()}:${key}`
}

export function loadState(key, fallback) {
  try {
    const raw = localStorage.getItem(fullKey(key))
    if (raw == null) return fallback
    return JSON.parse(raw)
  } catch {
    return fallback
  }
}

export function saveState(key, value) {
  try {
    localStorage.setItem(fullKey(key), JSON.stringify(value))
    return true
  } catch {
    return false
  }
}

export function removeState(key) {
  try {
    localStorage.removeItem(fullKey(key))
  } catch {
    // ignore
  }
}

// Tiny id generator — good enough for client-only records (decks, notes,
// bookmarks, planner items). Not used for anything sent as a stable
// cross-device identifier.
export function makeId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}