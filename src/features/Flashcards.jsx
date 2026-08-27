import { useMemo, useState } from 'react'
import { loadState, saveState, makeId } from '../lib/localStore'
import { schedule, isDue, initialCardState } from '../lib/spacedRepetition'
import { bumpCardsReviewed } from '../lib/activity'
import './styles/hub.css'

const KEY = 'flashcard-decks'

function loadDecks() {
  return loadState(KEY, [])
}

const GRADES = [
  { grade: 0, label: 'Again' },
  { grade: 1, label: 'Hard' },
  { grade: 2, label: 'Good' },
  { grade: 3, label: 'Easy' },
]

export default function Flashcards() {
  const [decks, setDecks] = useState(loadDecks)
  const [activeDeckId, setActiveDeckId] = useState(null)
  const [reviewing, setReviewing] = useState(false)

  const persist = (next) => {
    setDecks(next)
    saveState(KEY, next)
  }

  const activeDeck = decks.find((d) => d.id === activeDeckId) || null

  // ── deck list ──
  const createDeck = () => {
    const name = prompt('Deck name (e.g. "Intro to Databases — Chapter 3")')
    if (!name?.trim()) return
    const deck = { id: makeId(), name: name.trim(), cards: [] }
    persist([deck, ...decks])
  }

  const deleteDeck = (id) => {
    if (!confirm('Delete this deck and all its cards?')) return
    persist(decks.filter((d) => d.id !== id))
    if (activeDeckId === id) setActiveDeckId(null)
  }

  // ── card CRUD ──
  const addCard = () => {
    const front = prompt('Question / front of card:')
    if (!front?.trim()) return
    const back = prompt('Answer / back of card:')
    if (!back?.trim()) return

    const card = { id: makeId(), front: front.trim(), back: back.trim(), srs: initialCardState() }
    const next = decks.map((d) =>
      d.id === activeDeckId ? { ...d, cards: [...d.cards, card] } : d
    )
    persist(next)
  }

  const deleteCard = (cardId) => {
    const next = decks.map((d) =>
      d.id === activeDeckId ? { ...d, cards: d.cards.filter((c) => c.id !== cardId) } : d
    )
    persist(next)
  }

  const gradeCard = (cardId, grade) => {
    const next = decks.map((d) => {
      if (d.id !== activeDeckId) return d
      return {
        ...d,
        cards: d.cards.map((c) => (c.id === cardId ? { ...c, srs: schedule(c.srs, grade) } : c)),
      }
    })
    persist(next)
    bumpCardsReviewed(1)
  }

  if (reviewing && activeDeck) {
    return (
      <ReviewSession
        deck={activeDeck}
        onGrade={gradeCard}
        onExit={() => setReviewing(false)}
      />
    )
  }

  if (activeDeck) {
    const dueCount = activeDeck.cards.filter((c) => isDue(c.srs)).length
    return (
      <div className="hub-page">
        <button className="hub-btn hub-btn-ghost" onClick={() => setActiveDeckId(null)}>
          ← All decks
        </button>
        <h2 className="hub-title">{activeDeck.name}</h2>

        <div className="hub-card hub-row">
          <div>
            <div style={{ fontWeight: 700 }}>{activeDeck.cards.length} cards</div>
            <div style={{ fontSize: 12, color: 'var(--hub-text-muted)' }}>{dueCount} due for review</div>
          </div>
          <button className="hub-btn" disabled={dueCount === 0} onClick={() => setReviewing(true)}>
            {dueCount === 0 ? 'All caught up' : `Review (${dueCount})`}
          </button>
        </div>

        <button className="hub-btn hub-btn-ghost" style={{ marginBottom: 14 }} onClick={addCard}>
          + Add card
        </button>

        {activeDeck.cards.length === 0 && <div className="hub-empty">No cards yet — add your first one above.</div>}

        {activeDeck.cards.map((c) => (
          <div key={c.id} className="hub-list-item hub-row">
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontWeight: 600, fontSize: 13 }}>{c.front}</div>
              <div style={{ fontSize: 12, color: 'var(--hub-text-muted)' }}>{c.back}</div>
            </div>
            <button className="hub-btn hub-btn-danger" style={{ padding: '6px 10px' }} onClick={() => deleteCard(c.id)}>
              ✕
            </button>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="hub-page">
      <p className="hub-eyebrow">RETENTION</p>
      <h2 className="hub-title">Flashcards</h2>

      <button className="hub-btn" style={{ marginBottom: 16 }} onClick={createDeck}>
        + New deck
      </button>

      {decks.length === 0 && (
        <div className="hub-empty">
          No decks yet. Create one for any course or topic and add cards as you study.
        </div>
      )}

      {decks.map((d) => {
        const due = d.cards.filter((c) => isDue(c.srs)).length
        return (
          <div key={d.id} className="hub-card hub-row" onClick={() => setActiveDeckId(d.id)} style={{ cursor: 'pointer' }}>
            <div>
              <div style={{ fontWeight: 700 }}>{d.name}</div>
              <div style={{ fontSize: 12, color: 'var(--hub-text-muted)' }}>
                {d.cards.length} cards {due > 0 && `· ${due} due`}
              </div>
            </div>
            <button
              className="hub-btn hub-btn-danger"
              style={{ padding: '6px 10px' }}
              onClick={(e) => { e.stopPropagation(); deleteDeck(d.id) }}
            >
              ✕
            </button>
          </div>
        )
      })}
    </div>
  )
}

function ReviewSession({ deck, onGrade, onExit }) {
  const dueCards = useMemo(() => deck.cards.filter((c) => isDue(c.srs)), [deck])
  const [index, setIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)

  const card = dueCards[index]

  if (!card) {
    return (
      <div className="hub-page">
        <div className="hub-card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 32 }}>✅</div>
          <p style={{ fontWeight: 700, marginTop: 8 }}>Session complete</p>
          <button className="hub-btn" style={{ marginTop: 12 }} onClick={onExit}>Back to deck</button>
        </div>
      </div>
    )
  }

  const handleGrade = (grade) => {
    onGrade(card.id, grade)
    setFlipped(false)
    setIndex((i) => i + 1)
  }

  return (
    <div className="hub-page">
      <div className="hub-row" style={{ marginBottom: 12 }}>
        <button className="hub-btn hub-btn-ghost" onClick={onExit}>✕ Exit</button>
        <span style={{ fontSize: 12, color: 'var(--hub-text-muted)' }}>
          {index + 1} / {dueCards.length}
        </span>
      </div>

      <div className="hub-card hub-flashcard" onClick={() => setFlipped((f) => !f)}>
        {flipped ? card.back : card.front}
      </div>
      <div className="hub-empty" style={{ padding: '8px 0' }}>
        {flipped ? 'Tap card to see question again' : 'Tap card to reveal answer'}
      </div>

      {flipped && (
        <div className="hub-grade-row">
          {GRADES.map((g) => (
            <button
              key={g.grade}
              data-grade={g.grade}
              className="hub-grade-btn"
              onClick={() => handleGrade(g.grade)}
            >
              {g.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}