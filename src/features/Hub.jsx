import { useEffect, useState } from 'react'
import { getFromLocalStorage } from '../menu/fromlocal'
import { getActivity } from '../lib/activity'
import { tierForStreak, nextTier, computeXp, levelForXp, xpForNextLevel } from '../lib/gamification'
import Flashcards from './Flashcards'
import MockTest from './MockTest'
import Library from './Library'
import Planner from './Planner'
import Discussions from './Discussions'
import ThemeToggle from './ThemeToggle'
import AIGenerator from './AIGenerator'
import './styles/hub.css'

const TILES = [
  { key: 'ai-generator', icon: '✨', label: 'AI Generator' },
  { key: 'flashcards', icon: '🗂️', label: 'Flashcards' },
  { key: 'mocktest', icon: '⏱️', label: 'Mock Tests' },
  { key: 'library', icon: '🔖', label: 'Library' },
  { key: 'planner', icon: '📅', label: 'Planner' },
  { key: 'discussions', icon: '💬', label: 'Discussions' },
]

export default function Hub() {
  const [view, setView] = useState(null)
  const [streakInfo, setStreakInfo] = useState({ highestStreakScore: 0 })
  const [activity, setActivity] = useState({ cardsReviewed: 0, mockTestsTaken: 0 })
  const [genSeed, setGenSeed] = useState(null) // { text, label } prefill when jumping in from a note

  useEffect(() => {
    setStreakInfo(getFromLocalStorage('userInfo', {}))
    setActivity(getActivity())
  }, [view]) // refresh summary whenever user returns to the hub

  const openGeneratorFromNote = (note) => {
    setGenSeed({ text: note.body, label: note.title })
    setView('ai-generator')
  }

  if (view === 'ai-generator') {
    return (
      <BackWrap onBack={() => { setGenSeed(null); setView(null) }}>
        <AIGenerator
          initialText={genSeed?.text || ''}
          initialSourceLabel={genSeed?.label || ''}
          onNavigate={(target) => { setGenSeed(null); setView(target) }}
        />
      </BackWrap>
    )
  }
  if (view === 'flashcards') return <BackWrap onBack={() => setView(null)}><Flashcards /></BackWrap>
  if (view === 'mocktest') return <BackWrap onBack={() => setView(null)}><MockTest /></BackWrap>
  if (view === 'library') return <BackWrap onBack={() => setView(null)}><Library onGenerateFromNote={openGeneratorFromNote} /></BackWrap>
  if (view === 'planner') return <BackWrap onBack={() => setView(null)}><Planner /></BackWrap>
  if (view === 'discussions') return <BackWrap onBack={() => setView(null)}><Discussions /></BackWrap>

  const highestStreak = streakInfo?.highestStreakScore ?? 0
  const tier = tierForStreak(highestStreak)
  const upcoming = nextTier(highestStreak)
  const xp = computeXp({ highestStreak, ...activity })
  const level = levelForXp(xp)
  const xpFloor = xpForNextLevel(level - 1)
  const xpCeil = xpForNextLevel(level)
  const progressPct = Math.min(100, Math.round(((xp - xpFloor) / (xpCeil - xpFloor)) * 100))

  return (
    <div className="hub-page">
      <ThemeToggle />
      <p className="hub-eyebrow">LEARNING HUB</p>
      <h2 className="hub-title">Your progress</h2>

      <div className="hub-card">
        <div className="hub-row">
          <div>
            <div style={{ fontSize: 22, fontWeight: 700 }}>{tier.emoji} {tier.name}</div>
            <div style={{ fontSize: 12, color: 'var(--hub-text-muted)' }}>Level {level} · {xp} XP</div>
          </div>
          <div className="hub-badge-pill">🔥 {highestStreak}d best streak</div>
        </div>
        <div className="hub-progress-track" style={{ marginTop: 12 }}>
          <div className="hub-progress-fill" style={{ width: `${progressPct}%` }} />
        </div>
        {upcoming && (
          <div style={{ fontSize: 11, color: 'var(--hub-text-muted)', marginTop: 6 }}>
            {upcoming.min - highestStreak} more streak days to reach {upcoming.emoji} {upcoming.name}
          </div>
        )}
      </div>

      <div className="hub-grid-2" style={{ marginBottom: 14 }}>
        <div className="hub-card" style={{ marginBottom: 0, textAlign: 'center' }}>
          <div style={{ fontSize: 20, fontWeight: 700 }}>{activity.cardsReviewed}</div>
          <div style={{ fontSize: 11, color: 'var(--hub-text-muted)' }}>Cards reviewed</div>
        </div>
        <div className="hub-card" style={{ marginBottom: 0, textAlign: 'center' }}>
          <div style={{ fontSize: 20, fontWeight: 700 }}>{activity.mockTestsTaken}</div>
          <div style={{ fontSize: 11, color: 'var(--hub-text-muted)' }}>Mock tests taken</div>
        </div>
      </div>

      <p className="hub-eyebrow" style={{ marginBottom: 8 }}>EXPLORE</p>
      <div className="hub-nav-grid">
        {TILES.map((t) => (
          <div key={t.key} className="hub-nav-tile" onClick={() => setView(t.key)}>
            <span className="hub-nav-tile-icon">{t.icon}</span>
            {t.label}
          </div>
        ))}
      </div>
    </div>
  )
}

function BackWrap({ children, onBack }) {
  return (
    <div>
      <div style={{ maxWidth: 480, margin: '0 auto', padding: '20px 16px 0' }}>
        <button className="hub-btn hub-btn-ghost" onClick={onBack}>← Hub</button>
      </div>
      {children}
    </div>
  )
}