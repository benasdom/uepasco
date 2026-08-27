// Aggregated local activity counters. Individual features (Flashcards,
// MockTest) bump these; gamification.js and the Hub summary read them.
import { loadState, saveState } from './localStore'

const KEY = 'activity'

function read() {
  return loadState(KEY, { cardsReviewed: 0, mockTestsTaken: 0 })
}

export function getActivity() {
  return read()
}

export function bumpCardsReviewed(by = 1) {
  const state = read()
  const updated = { ...state, cardsReviewed: state.cardsReviewed + by }
  saveState(KEY, updated)
  return updated
}

export function bumpMockTestsTaken(by = 1) {
  const state = read()
  const updated = { ...state, mockTestsTaken: state.mockTestsTaken + by }
  saveState(KEY, updated)
  return updated
}