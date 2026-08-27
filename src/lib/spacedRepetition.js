// Simplified SM-2 (SuperMemo 2) spaced-repetition scheduler.
// Grades: 0 = Again, 1 = Hard, 2 = Good, 3 = Easy

const DAY_MS = 24 * 60 * 60 * 1000

export function initialCardState() {
  return {
    interval: 0,       // days until next review
    easeFactor: 2.5,
    repetitions: 0,
    dueAt: Date.now(),  // new cards are due immediately
  }
}

// Returns a new schedule state — never mutates the card passed in.
export function schedule(card, grade) {
  const state = card ?? initialCardState()
  let { interval, easeFactor, repetitions } = state

  if (grade === 0) {
    // "Again" — reset progress, review soon
    repetitions = 0
    interval = 0
    return {
      ...state,
      interval,
      repetitions,
      easeFactor: Math.max(1.3, easeFactor - 0.2),
      dueAt: Date.now() + 10 * 60 * 1000, // 10 minutes
    }
  }

  repetitions += 1

  if (repetitions === 1) interval = 1
  else if (repetitions === 2) interval = 3
  else interval = Math.round(interval * easeFactor)

  // Ease adjustment based on grade (1=Hard, 2=Good, 3=Easy)
  const easeDelta = { 1: -0.15, 2: 0, 3: 0.15 }[grade] ?? 0
  easeFactor = Math.max(1.3, easeFactor + easeDelta)

  return {
    interval,
    easeFactor,
    repetitions,
    dueAt: Date.now() + interval * DAY_MS,
  }
}

export function isDue(card) {
  return !card || card.dueAt <= Date.now()
}