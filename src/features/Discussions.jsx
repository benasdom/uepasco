/**
 * Community discussions — the one feature in this batch that genuinely
 * needs a backend, since it's shared, multi-user data that can't be faked
 * with localStorage. This component is fully wired up to call the routes
 * below via the app's existing fetchWithAuth/AuthError pattern; until
 * those routes exist server-side it shows a friendly "not set up yet"
 * state instead of crashing.
 *
 * Required backend routes (all under the existing `domain` base URL,
 * same JWT auth as the rest of the app):
 *
 *   GET  /api/v1/discussions?course=<code>
 *        -> { threads: [{ id, title, body, course, authorName, createdAt, replyCount }] }
 *
 *   POST /api/v1/discussions   body: { title, body, course }
 *        -> created thread object
 *
 *   GET  /api/v1/discussions/:id
 *        -> { thread: {...}, replies: [{ id, body, authorName, createdAt }] }
 *
 *   POST /api/v1/discussions/:id/replies   body: { body }
 *        -> created reply object
 */
import { useEffect, useState } from 'react'
import { fetchWithAuth, domain, AuthError } from '../menu/authfetch'
import './styles/hub.css'

export default function Discussions() {
  const [course, setCourse] = useState('')
  const [threads, setThreads] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [backendMissing, setBackendMissing] = useState(false)
  const [activeThreadId, setActiveThreadId] = useState(null)

  const loadThreads = async (courseFilter) => {
    setLoading(true)
    setError(null)
    try {
      const qs = courseFilter ? `?course=${encodeURIComponent(courseFilter)}` : ''
      const data = await fetchWithAuth(`${domain}/api/v1/discussions${qs}`, { method: 'GET' })
      setThreads(data?.threads ?? [])
      setBackendMissing(false)
    } catch (err) {
      if (err instanceof AuthError) {
        setError('Please sign in to view discussions.')
      } else if (String(err.message).includes('404')) {
        setBackendMissing(true)
      } else {
        setError("Couldn't load discussions right now.")
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadThreads() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const createThread = async () => {
    const title = prompt('Thread title:')
    if (!title?.trim()) return
    const body = prompt('What do you want to ask or share?')
    if (!body?.trim()) return
    const threadCourse = prompt('Course code (optional):') || ''

    try {
      await fetchWithAuth(`${domain}/api/v1/discussions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title.trim(), body: body.trim(), course: threadCourse.trim() }),
      })
      loadThreads(course)
    } catch (err) {
      alert(err instanceof AuthError ? 'Please sign in first.' : "Couldn't post — try again.")
    }
  }

  if (activeThreadId) {
    return <ThreadView threadId={activeThreadId} onBack={() => setActiveThreadId(null)} />
  }

  return (
    <div className="hub-page">
      <p className="hub-eyebrow">COMMUNITY</p>
      <h2 className="hub-title">Discussions</h2>

      {backendMissing ? (
        <div className="hub-card">
          <p style={{ fontSize: 13 }}>
            Discussions aren't set up on the backend yet. This screen is fully built and ready — it just needs the
            <code> /api/v1/discussions</code> routes added server-side (documented at the top of this file).
          </p>
        </div>
      ) : (
        <>
          <div className="hub-row" style={{ marginBottom: 12, gap: 8 }}>
            <input
              className="hub-input"
              placeholder="Filter by course code…"
              value={course}
              onChange={(e) => setCourse(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') loadThreads(course) }}
            />
            <button className="hub-btn hub-btn-ghost" onClick={() => loadThreads(course)}>Filter</button>
          </div>

          <button className="hub-btn" style={{ marginBottom: 14 }} onClick={createThread}>+ New thread</button>

          {error && <div className="hub-error">{error}</div>}
          {loading && <div className="hub-empty">Loading…</div>}
          {!loading && !error && threads.length === 0 && <div className="hub-empty">No threads yet — start one.</div>}

          {threads.map((t) => (
            <div key={t.id} className="hub-list-item" style={{ cursor: 'pointer' }} onClick={() => setActiveThreadId(t.id)}>
              <div className="hub-row">
                <span style={{ fontWeight: 700, fontSize: 13 }}>{t.title}</span>
                {t.course && <span className="hub-badge-pill">{t.course}</span>}
              </div>
              <div style={{ fontSize: 12, color: 'var(--hub-text-muted)', marginTop: 4 }}>
                {t.authorName ?? 'Someone'} · {t.replyCount ?? 0} replies
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  )
}

function ThreadView({ threadId, onBack }) {
  const [thread, setThread] = useState(null)
  const [replies, setReplies] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = async () => {
    setLoading(true)
    try {
      const data = await fetchWithAuth(`${domain}/api/v1/discussions/${threadId}`, { method: 'GET' })
      setThread(data?.thread ?? null)
      setReplies(data?.replies ?? [])
    } catch {
      setError("Couldn't load this thread.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [threadId]) // eslint-disable-line react-hooks/exhaustive-deps

  const postReply = async () => {
    const body = prompt('Your reply:')
    if (!body?.trim()) return
    try {
      await fetchWithAuth(`${domain}/api/v1/discussions/${threadId}/replies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body: body.trim() }),
      })
      load()
    } catch (err) {
      alert(err instanceof AuthError ? 'Please sign in first.' : "Couldn't post reply.")
    }
  }

  return (
    <div className="hub-page">
      <button className="hub-btn hub-btn-ghost" style={{ marginBottom: 12 }} onClick={onBack}>← All threads</button>

      {loading && <div className="hub-empty">Loading…</div>}
      {error && <div className="hub-error">{error}</div>}

      {thread && (
        <div className="hub-card">
          <div style={{ fontWeight: 700, fontSize: 15 }}>{thread.title}</div>
          <div style={{ fontSize: 13, marginTop: 8 }}>{thread.body}</div>
        </div>
      )}

      <button className="hub-btn" style={{ marginBottom: 14 }} onClick={postReply}>+ Reply</button>

      {replies.map((r) => (
        <div key={r.id} className="hub-list-item">
          <div style={{ fontSize: 13 }}>{r.body}</div>
          <div style={{ fontSize: 11, color: 'var(--hub-text-muted)', marginTop: 4 }}>
            {r.authorName ?? 'Someone'} · {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : ''}
          </div>
        </div>
      ))}
    </div>
  )
}