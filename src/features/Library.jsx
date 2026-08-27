import { useState } from 'react'
import { loadState, saveState, makeId } from '../lib/localStore'
import './styles/hub.css'

const BOOKMARKS_KEY = 'bookmarks'
const NOTES_KEY = 'notes'

export default function Library() {
  const [tab, setTab] = useState('bookmarks')
  const [bookmarks, setBookmarks] = useState(() => loadState(BOOKMARKS_KEY, []))
  const [notes, setNotes] = useState(() => loadState(NOTES_KEY, []))

  const persistBookmarks = (next) => { setBookmarks(next); saveState(BOOKMARKS_KEY, next) }
  const persistNotes = (next) => { setNotes(next); saveState(NOTES_KEY, next) }

  const addBookmark = () => {
    const course = prompt('Course code (e.g. CSM 261):')
    if (!course?.trim()) return
    const label = prompt('What are you bookmarking? (e.g. "2022 mid-sem, Q3")')
    if (!label?.trim()) return
    const entry = { id: makeId(), course: course.trim(), label: label.trim(), createdAt: Date.now() }
    persistBookmarks([entry, ...bookmarks])
  }

  const removeBookmark = (id) => persistBookmarks(bookmarks.filter((b) => b.id !== id))

  const addNote = () => {
    const title = prompt('Note title:')
    if (!title?.trim()) return
    const body = prompt('Note content:')
    if (!body?.trim()) return
    const entry = { id: makeId(), title: title.trim(), body: body.trim(), createdAt: Date.now() }
    persistNotes([entry, ...notes])
  }

  const removeNote = (id) => persistNotes(notes.filter((n) => n.id !== id))

  return (
    <div className="hub-page">
      <p className="hub-eyebrow">PERSONAL ORGANIZATION</p>
      <h2 className="hub-title">Library</h2>

      <div className="hub-tabs">
        <button className={`hub-tab ${tab === 'bookmarks' ? 'active' : ''}`} onClick={() => setTab('bookmarks')}>
          Bookmarks
        </button>
        <button className={`hub-tab ${tab === 'notes' ? 'active' : ''}`} onClick={() => setTab('notes')}>
          Notes
        </button>
      </div>

      {tab === 'bookmarks' && (
        <>
          <button className="hub-btn" style={{ marginBottom: 14 }} onClick={addBookmark}>+ Add bookmark</button>
          {bookmarks.length === 0 && (
            <div className="hub-empty">
              No bookmarks yet. Save a course code + reference here so you can find it again fast — search itself still happens on the main search page.
            </div>
          )}
          {bookmarks.map((b) => (
            <div key={b.id} className="hub-list-item hub-row">
              <div>
                <span className="hub-badge-pill">{b.course}</span>
                <div style={{ marginTop: 6, fontSize: 13 }}>{b.label}</div>
              </div>
              <button className="hub-btn hub-btn-danger" style={{ padding: '6px 10px' }} onClick={() => removeBookmark(b.id)}>✕</button>
            </div>
          ))}
        </>
      )}

      {tab === 'notes' && (
        <>
          <button className="hub-btn" style={{ marginBottom: 14 }} onClick={addNote}>+ Add note</button>
          {notes.length === 0 && <div className="hub-empty">No notes yet.</div>}
          {notes.map((n) => (
            <div key={n.id} className="hub-list-item">
              <div className="hub-row">
                <div style={{ fontWeight: 700, fontSize: 13 }}>{n.title}</div>
                <button className="hub-btn hub-btn-danger" style={{ padding: '6px 10px' }} onClick={() => removeNote(n.id)}>✕</button>
              </div>
              <div style={{ fontSize: 12, color: 'var(--hub-text-muted)', marginTop: 6, whiteSpace: 'pre-wrap' }}>{n.body}</div>
            </div>
          ))}
        </>
      )}
    </div>
  )
}