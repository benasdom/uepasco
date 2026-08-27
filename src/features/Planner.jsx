import { useEffect, useRef, useState } from 'react'
import { loadState, saveState, makeId } from '../lib/localStore'
import './styles/hub.css'

const KEY = 'planner-items'
const notifiedIds = new Set() // in-memory guard against duplicate notifications this session

export default function Planner() {
  const [items, setItems] = useState(() => loadState(KEY, []))
  const [notifPermission, setNotifPermission] = useState(
    typeof Notification !== 'undefined' ? Notification.permission : 'unsupported'
  )
  const pollRef = useRef(null)

  const persist = (next) => { setItems(next); saveState(KEY, next) }

  // Poll every 30s for due reminders — fine-grained enough for a study
  // planner, cheap enough to leave running while the tab is open.
  useEffect(() => {
    pollRef.current = setInterval(() => {
      if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return
      const now = Date.now()
      items.forEach((item) => {
        if (item.remindAt && item.remindAt <= now && !item.done && !notifiedIds.has(item.id)) {
          notifiedIds.add(item.id)
          new Notification('Study reminder', { body: item.title })
        }
      })
    }, 30000)
    return () => clearInterval(pollRef.current)
  }, [items])

  const requestPermission = async () => {
    if (typeof Notification === 'undefined') return
    const result = await Notification.requestPermission()
    setNotifPermission(result)
  }

  const addItem = () => {
    const title = prompt('What are you planning to study? (e.g. "Revise CSM 261 — Chapter 4")')
    if (!title?.trim()) return
    const dateStr = prompt('When? (YYYY-MM-DD HH:MM, 24hr — e.g. 2026-08-10 18:00)')
    const remindAt = dateStr ? new Date(dateStr.replace(' ', 'T')).getTime() : null
    const entry = {
      id: makeId(),
      title: title.trim(),
      remindAt: Number.isFinite(remindAt) ? remindAt : null,
      done: false,
      createdAt: Date.now(),
    }
    persist([...items, entry].sort((a, b) => (a.remindAt ?? Infinity) - (b.remindAt ?? Infinity)))
  }

  const toggleDone = (id) => {
    persist(items.map((i) => (i.id === id ? { ...i, done: !i.done } : i)))
  }

  const removeItem = (id) => persist(items.filter((i) => i.id !== id))

  return (
    <div className="hub-page">
      <p className="hub-eyebrow">PERSONAL ORGANIZATION</p>
      <h2 className="hub-title">Study Planner</h2>

      {notifPermission !== 'granted' && notifPermission !== 'unsupported' && (
        <div className="hub-card">
          <p style={{ fontSize: 13, marginBottom: 8 }}>
            Turn on browser notifications to get reminded when a study session is due.
          </p>
          <button className="hub-btn" onClick={requestPermission}>Enable reminders</button>
        </div>
      )}

      <button className="hub-btn" style={{ marginBottom: 14 }} onClick={addItem}>+ Add study session</button>

      {items.length === 0 && <div className="hub-empty">Nothing planned yet.</div>}

      {items.map((item) => (
        <div key={item.id} className="hub-list-item hub-row">
          <div style={{ opacity: item.done ? 0.5 : 1 }}>
            <div style={{ fontWeight: 600, fontSize: 13, textDecoration: item.done ? 'line-through' : 'none' }}>
              {item.title}
            </div>
            {item.remindAt && (
              <div style={{ fontSize: 11, color: 'var(--hub-text-muted)' }}>
                {new Date(item.remindAt).toLocaleString()}
              </div>
            )}
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <button className="hub-btn hub-btn-ghost" style={{ padding: '6px 10px' }} onClick={() => toggleDone(item.id)}>
              {item.done ? '↺' : '✓'}
            </button>
            <button className="hub-btn hub-btn-danger" style={{ padding: '6px 10px' }} onClick={() => removeItem(item.id)}>
              ✕
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}