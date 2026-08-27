// Badge/level tiers derived from the streak score the backend already
// tracks (see /api/v1/user/streak). No new backend endpoint required —
// this is a pure client-side presentation layer on top of existing data.
// XP additionally factors in local activity (flashcard reviews, mock
// tests taken) tracked by the other features in this folder.

export const TIERS = [
  { min: 0,   name: 'Rookie',     emoji: '🥉' },
  { min: 5,   name: 'Consistent', emoji: '🥈' },
  { min: 15,  name: 'Dedicated',  emoji: '🥇' },
  { min: 30,  name: 'Relentless', emoji: '🏆' },
  { min: 60,  name: 'Legend',     emoji: '👑' },
]

export function tierForStreak(highestStreak = 0) {
  let current = TIERS[0]
  for (const tier of TIERS) {
    if (highestStreak >= tier.min) current = tier
  }
  return current
}

export function nextTier(highestStreak = 0) {
  return TIERS.find((t) => t.min > highestStreak) ?? null
}

// XP: 10 per streak day (capped contribution) + activity from local features.
export function computeXp({ highestStreak = 0, cardsReviewed = 0, mockTestsTaken = 0 }) {
  return highestStreak * 10 + cardsReviewed * 2 + mockTestsTaken * 25
}

export function levelForXp(xp) {
  // Level N requires N*200 cumulative XP (simple, predictable curve).
  return Math.max(1, Math.floor(Math.sqrt(xp / 200)) + 1)
}

export function xpForNextLevel(level) {
  return level * level * 200
}