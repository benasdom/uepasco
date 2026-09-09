import { useEffect, useRef, useState } from 'react'
import { loadState, saveState, makeId } from '../lib/localStore'
import { bumpMockTestsTaken } from '../lib/activity'
import './styles/hub.css'

const SETS_KEY = 'mock-test-sets'
const HISTORY_KEY = 'mock-test-history'
const DECKS_KEY = 'flashcard-decks'

function loadSets() { return loadState(SETS_KEY, []) }
function loadHistory() { return loadState(HISTORY_KEY, []) }
function loadDecks() { return loadState(DECKS_KEY, []) }

export default function MockTest() {
  const [sets, setSets] = useState(loadSets)
  const [history, setHistory] = useState(loadHistory)
  const [decks] = useState(loadDecks)
  const [activeSet, setActiveSet] = useState(null) // { title, questions:[{q,options,correct}] } or deck-derived
  const [tab, setTab] = useState('custom') // 'custom' | 'decks' | 'history'

  const persistSets = (next) => { setSets(next); saveState(SETS_KEY, next) }
  const persistHistory = (next) => { setHistory(next); saveState(HISTORY_KEY, next) }

  const createSet = () => {
    const title = prompt('Test title (e.g. "Mid-sem mock — Networking")')
    if (!title?.trim()) return
    persistSets([{ id: makeId(), title: title.trim(), questions: [] }, ...sets])
  }

  const addQuestion = (setId) => {
    const typeChoice = prompt('Question type — enter "mcq" for multiple choice or "fill" for fill-in-the-blank:', 'mcq')
    if (!typeChoice?.trim()) return

    if (typeChoice.trim().toLowerCase().startsWith('fill')) {
      const q = prompt('Question text (use ___ to mark the blank):')
      if (!q?.trim()) return
      const correctAnswer = prompt('Correct answer:')
      if (!correctAnswer?.trim()) return
      const hintsRaw = prompt('Optional hints, separated by " | " (leave blank for none):')
      const hints = hintsRaw ? hintsRaw.split('|').map((h) => h.trim()).filter(Boolean) : []

      const next = sets.map((s) =>
        s.id === setId
          ? { ...s, questions: [...s.questions, { id: makeId(), type: 'fillIn', q: q.trim(), correctAnswer: correctAnswer.trim(), hints }] }
          : s
      )
      persistSets(next)
      return
    }

    const q = prompt('Question text:')
    if (!q?.trim()) return
    const optionsRaw = prompt('Enter 4 options, separated by " | " (e.g. A | B | C | D):')
    if (!optionsRaw?.trim()) return
    const options = optionsRaw.split('|').map((o) => o.trim()).filter(Boolean)
    if (options.length < 2) { alert('Need at least 2 options.'); return }
    const correctRaw = prompt(`Which option is correct? Enter 1-${options.length}:`)
    const correct = Number(correctRaw) - 1
    if (Number.isNaN(correct) || correct < 0 || correct >= options.length) { alert('Invalid choice.'); return }

    const next = sets.map((s) =>
      s.id === setId ? { ...s, questions: [...s.questions, { id: makeId(), type: 'mcq', q: q.trim(), options, correct }] } : s
    )
    persistSets(next)
  }

  const deleteSet = (id) => {
    if (!confirm('Delete this test?')) return
    persistSets(sets.filter((s) => s.id !== id))
  }

  const recordResult = (title, score, total, durationSec) => {
    const entry = { id: makeId(), title, score, total, durationSec, takenAt: Date.now() }
    persistHistory([entry, ...history].slice(0, 50))
    bumpMockTestsTaken(1)
  }

  if (activeSet) {
    return (
      <TestRunner
        set={activeSet}
        onFinish={(score, total, durationSec) => {
          recordResult(activeSet.title, score, total, durationSec)
          setActiveSet(null)
        }}
        onExit={() => setActiveSet(null)}
      />
    )
  }

  return (
    <div className="hub-page">
      <p className="hub-eyebrow">RETENTION</p>
      <h2 className="hub-title">Mock Tests</h2>

      <div className="hub-tabs">
        <button className={`hub-tab ${tab === 'custom' ? 'active' : ''}`} onClick={() => setTab('custom')}>My tests</button>
        <button className={`hub-tab ${tab === 'decks' ? 'active' : ''}`} onClick={() => setTab('decks')}>From flashcards</button>
        <button className={`hub-tab ${tab === 'history' ? 'active' : ''}`} onClick={() => setTab('history')}>History</button>
      </div>

      {tab === 'custom' && (
        <>
          <button className="hub-btn" style={{ marginBottom: 16 }} onClick={createSet}>+ New test</button>
          {sets.length === 0 && <div className="hub-empty">No custom tests yet. Build one from your own notes for timed self-testing.</div>}
          {sets.map((s) => (
            <div key={s.id} className="hub-card">
              <div className="hub-row">
                <div style={{ fontWeight: 700 }}>
                  {s.title}
                  {s.source === 'ai' && <span className="hub-badge-pill" style={{ marginLeft: 8, fontSize: 10 }}>✨ AI</span>}
                </div>
                <button className="hub-btn hub-btn-danger" style={{ padding: '6px 10px' }} onClick={() => deleteSet(s.id)}>✕</button>
              </div>
              <div style={{ fontSize: 12, color: 'var(--hub-text-muted)', margin: '6px 0 10px' }}>{s.questions.length} questions</div>
              <div className="hub-row">
                <button className="hub-btn hub-btn-ghost" onClick={() => addQuestion(s.id)}>+ Add question</button>
                <button className="hub-btn" disabled={s.questions.length === 0} onClick={() => setActiveSet(s)}>Start</button>
              </div>
            </div>
          ))}
        </>
      )}

      {tab === 'decks' && (
        <>
          {decks.length === 0 && <div className="hub-empty">No flashcard decks yet — create one in Flashcards first.</div>}
          {decks.map((d) => (
            <div key={d.id} className="hub-card hub-row">
              <div>
                <div style={{ fontWeight: 700 }}>
                  {d.name}
                  {d.source === 'ai' && <span className="hub-badge-pill" style={{ marginLeft: 8, fontSize: 10 }}>✨ AI</span>}
                </div>
                <div style={{ fontSize: 12, color: 'var(--hub-text-muted)' }}>{d.cards.length} cards</div>
              </div>
              <button
                className="hub-btn"
                disabled={d.cards.length < 2}
                onClick={() => setActiveSet(deckToRecallSet(d))}
              >
                Start
              </button>
            </div>
          ))}
        </>
      )}

      {tab === 'history' && (
        <>
          {history.length === 0 && <div className="hub-empty">No tests taken yet.</div>}
          {history.map((h) => (
            <div key={h.id} className="hub-list-item hub-row">
              <div>
                <div style={{ fontWeight: 600, fontSize: 13 }}>{h.title}</div>
                <div style={{ fontSize: 11, color: 'var(--hub-text-muted)' }}>
                  {new Date(h.takenAt).toLocaleDateString()} · {Math.round(h.durationSec)}s
                </div>
              </div>
              <span className="hub-badge-pill">{h.score}/{h.total}</span>
            </div>
          ))}
        </>
      )}
    </div>
  )
}

// Turns a flashcard deck into a self-graded recall "test" — each card is
// shown as a question, user reveals the answer and marks themselves
// right/wrong (no auto-generated multiple choice, since the deck only has
// free-text front/back).
function deckToRecallSet(deck) {
  return {
    title: `${deck.name} — recall test`,
    recall: true,
    questions: deck.cards.map((c) => ({ id: c.id, q: c.front, answer: c.back })),
  }
}

function TestRunner({ set, onFinish, onExit }) {
  const [index, setIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [selected, setSelected] = useState(null)
  const [revealed, setRevealed] = useState(false)
  const [answerText, setAnswerText] = useState('')
  const [checked, setChecked] = useState(false) // fill-in: has the answer been submitted?
  const [showHint, setShowHint] = useState(false)
  const startRef = useRef(Date.now())

  const question = set.questions[index]
  const isLast = index === set.questions.length - 1
  const isFillIn = !set.recall && question?.type === 'fillIn'

  const finish = (finalScore) => {
    const durationSec = (Date.now() - startRef.current) / 1000
    onFinish(finalScore, set.questions.length, durationSec)
  }

  const nextQuestion = (correct) => {
    const newScore = score + (correct ? 1 : 0)
    setScore(newScore)
    setSelected(null)
    setRevealed(false)
    setAnswerText('')
    setChecked(false)
    setShowHint(false)
    if (isLast) finish(newScore)
    else setIndex((i) => i + 1)
  }

  if (!question) return null

  const normalize = (s) => (s || '').trim().toLowerCase().replace(/\s+/g, ' ')
  const isCorrectFillIn = checked && normalize(answerText) === normalize(question.correctAnswer)

  return (
    <div className="hub-page">
      <div className="hub-row" style={{ marginBottom: 12 }}>
        <button className="hub-btn hub-btn-ghost" onClick={onExit}>✕ Exit</button>
        <span style={{ fontSize: 12, color: 'var(--hub-text-muted)' }}>
          {index + 1} / {set.questions.length}
        </span>
      </div>

      <div className="hub-card">
        <p style={{ fontWeight: 700, fontSize: 15, marginBottom: 14 }}>{question.q}</p>

        {set.recall ? (
          <>
            {revealed && (
              <div className="hub-list-item" style={{ marginBottom: 10 }}>{question.answer}</div>
            )}
            {!revealed ? (
              <button className="hub-btn" onClick={() => setRevealed(true)}>Reveal answer</button>
            ) : (
              <div className="hub-grade-row" style={{ gridTemplateColumns: '1fr 1fr' }}>
                <button className="hub-grade-btn" data-grade="0" onClick={() => nextQuestion(false)}>Got it wrong</button>
                <button className="hub-grade-btn" data-grade="3" onClick={() => nextQuestion(true)}>Got it right</button>
              </div>
            )}
          </>
        ) : isFillIn ? (
          <>
            <input
              className="hub-input"
              type="text"
              placeholder="Type your answer…"
              value={answerText}
              disabled={checked}
              onChange={(e) => setAnswerText(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !checked && answerText.trim()) setChecked(true) }}
            />

            {question.hints?.length > 0 && !checked && (
              <div style={{ marginTop: 8 }}>
                {!showHint ? (
                  <button className="hub-btn hub-btn-ghost" style={{ fontSize: 12 }} onClick={() => setShowHint(true)}>💡 Show hint</button>
                ) : (
                  <div style={{ fontSize: 12, color: 'var(--hub-text-muted)' }}>{question.hints.join(' · ')}</div>
                )}
              </div>
            )}

            {checked && (
              <div
                className="hub-list-item"
                style={{
                  marginTop: 10,
                  borderColor: isCorrectFillIn ? 'var(--hub-success)' : 'var(--hub-danger)',
                }}
              >
                <div style={{ fontWeight: 700, marginBottom: 4 }}>
                  {isCorrectFillIn ? '✅ Correct' : '❌ Not quite'}
                </div>
                {!isCorrectFillIn && (
                  <div style={{ fontSize: 12 }}>Correct answer: {question.correctAnswer}</div>
                )}
                {question.explanation && (
                  <div style={{ fontSize: 12, color: 'var(--hub-text-muted)', marginTop: 4 }}>{question.explanation}</div>
                )}
              </div>
            )}

            {!checked ? (
              <button className="hub-btn" style={{ marginTop: 10 }} disabled={!answerText.trim()} onClick={() => setChecked(true)}>
                Submit
              </button>
            ) : (
              <button className="hub-btn" style={{ marginTop: 10 }} onClick={() => nextQuestion(isCorrectFillIn)}>
                {isLast ? 'Finish' : 'Next'}
              </button>
            )}
          </>
        ) : (
          <>
            {question.options.map((opt, i) => (
              <button
                key={i}
                className="hub-btn hub-btn-ghost"
                style={{
                  display: 'block', width: '100%', textAlign: 'left', marginBottom: 8,
                  borderColor: selected === i ? 'var(--hub-accent)' : undefined,
                }}
                onClick={() => setSelected(i)}
              >
                {opt}
              </button>
            ))}
            <button
              className="hub-btn"
              disabled={selected === null}
              style={{ marginTop: 6 }}
              onClick={() => nextQuestion(selected === question.correct)}
            >
              {isLast ? 'Finish' : 'Next'}
            </button>
          </>
        )}
      </div>
    </div>
  )
}