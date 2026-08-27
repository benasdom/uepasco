import {
  CloseCircleOutlined,
  MoneyCollectOutlined,
  ArrowDownOutlined,
  SolutionOutlined,
  CheckCircleOutlined,
  CodeOutlined,
  ReloadOutlined,
  CloseOutlined,
  FullscreenOutlined,
  FullscreenExitOutlined,
} from '@ant-design/icons'
import React, { useEffect, useRef, useState, useCallback } from 'react'
import { marked } from 'marked'
import { Link } from 'react-router-dom'
import { domain, fetchWithAuth, LocalApiPath } from './menu/authfetch'
import racoon_learn from '/imgs/racoon_learn.jpg'
import racoon_save from '/imgs/save.jpg'
import PdfViewer from './menu/PdfViewer'

// ─── Constants ────────────────────────────────────────────────────────────────

const MAX_RECENTS = 5
const FETCH_TIMEOUT_MS = 8000
const SEARCH_DEBOUNCE_MS = 400

// ─── localStorage helpers ─────────────────────────────────────────────────────

const saveToRecents = (courseName, extract) => {
  try {
    const stored = JSON.parse(localStorage.getItem('recentSolutions') || '[]')
    const filtered = stored.filter((x) => x.course !== courseName)
    const updated = [
      { course: courseName, solution: extract, savedAt: Date.now() },
      ...filtered,
    ]
      .slice(0, MAX_RECENTS)
      .filter((x) => !/aierror/gim.test(x.solution) || x.solution.length > 15)
      .sort((a, b) => b.savedAt - a.savedAt)
    localStorage.setItem('recentSolutions', JSON.stringify(updated))
  } catch {
    // localStorage unavailable — fail silently
  }
}

const getRecents = () => {
  try {
    return JSON.parse(localStorage.getItem('recentSolutions') || '[]')
  } catch {
    return []
  }
}

// ─── Auth helper ──────────────────────────────────────────────────────────────

const getAuthTokens = () => {
  try {
    const stored = JSON.parse(localStorage.getItem('userInfo') || '{}')
    if (!stored?.accessToken) throw new Error('Missing access token. Please login again.')
    return { accessToken: stored.accessToken, refreshToken: stored.refreshToken }
  } catch (e) {
    throw new Error(e.message || 'Auth error. Please login again.')
  }
}

// ─── Toast ────────────────────────────────────────────────────────────────────

const Toast = ({ message, type = 'error', onDismiss }) => {
  useEffect(() => {
    const t = setTimeout(onDismiss, 3000)
    return () => clearTimeout(t)
  }, [onDismiss])
  return (
    <div className={`sf-toast sf-toast--${type}`}>
      <span className={type === 'error' ? 'sf-toast__dot sf-toast__dot--error' : 'sf-toast__dot sf-toast__dot--success'} />
      <span>{message}</span>
    </div>
  )
}

// ─── Save modal ───────────────────────────────────────────────────────────────

const SaveModal = ({ setstoreme, extract, courseName, selectedVal }) => {
  const [noteMessage, setNoteMessage] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [toast, setToast] = useState(null)

  const saveme = async () => {
    if (noteMessage !== 'Dont save bad responses') {
      setToast({ message: 'Please type the note correctly to proceed', type: 'error' })
      return
    }
    let accessToken, refreshToken
    try {
      ;({ accessToken, refreshToken } = getAuthTokens())
    } catch (e) {
      setToast({ message: e.message, type: 'error' })
      return
    }
    setIsSaving(true)
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)
    try {
      await fetchWithAuth(
        domain + '/api/v1/solutions/',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
          body: JSON.stringify({ courseName, solution: extract, validated: false, modelName: selectedVal }),
          signal: controller.signal,
        },
        refreshToken
      )
      setToast({ message: 'Saved successfully!', type: 'success' })
      setTimeout(() => setstoreme(false), 1600)
    } catch (err) {
      setToast({
        message: err.name === 'AbortError' ? 'Request timed out.' : 'Error: ' + (err.message || err),
        type: 'error',
      })
    } finally {
      clearTimeout(timeout)
      setIsSaving(false)
    }
  }

  return (
    <div className="sf-modal-overlay">
      {toast && <Toast message={toast.message} type={toast.type} onDismiss={() => setToast(null)} />}
      <div className="sf-modal">
        <button className="sf-modal__close" onClick={() => setstoreme(false)}>
          <CloseCircleOutlined />
        </button>
        <div className="sf-modal__art">
          <img src={racoon_save} alt="save" />
          <div className="sf-modal__art-fade" />
        </div>
        <div className="sf-modal__body">
          <h3 className="sf-modal__title">Save Response</h3>
          <div className="sf-modal__notice">
            <i className="fa fa-exclamation-triangle sf-modal__notice-icon" />
            <p>Only save <strong>good responses</strong>. This helps you avoid spending credits on the same topic twice.</p>
          </div>
          <div className="sf-modal__field">
            <label>Type to confirm:</label>
            <div className="sf-modal__confirm-phrase">Dont save bad responses</div>
            <input
              type="text"
              value={noteMessage}
              onChange={(e) => setNoteMessage(e.target.value)}
              placeholder="Type the phrase above…"
              className={noteMessage && noteMessage !== 'Dont save bad responses' ? 'sf-modal__input--invalid' : ''}
            />
          </div>
          <button
            className="sf-modal__save-btn"
            onClick={saveme}
            disabled={isSaving}
          >
            {isSaving ? (
              <span className="sf-modal__spinner" />
            ) : (
              <>
                <i className="fa fa-save" /> Save
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Skeleton loader ──────────────────────────────────────────────────────────

const Skeleton = ({ width = '100%', height = 14, style = {} }) => (
  <div className="sf-skeleton" style={{ width, height, borderRadius: 6, ...style }} />
)

// ─── Main component ───────────────────────────────────────────────────────────

const Showfiles = ({
  pdflink,
  courseName,
  selectedVal,
  setshowpdf,
  mainlogo,
  actualDlink,
  credits,
  extract,
  dataerror,
  raw,
  onRegenerate, // ← re-runs the original fetch (PDF + AI solution) so the solution can be regenerated
}) => {
  const [solnsOpen, setSolnsOpen] = useState(false)
  const [recentItems, setRecentItems] = useState(getRecents)
  const [iframeLoaded, setIframeLoaded] = useState(false)
  const [saveOpen, setSaveOpen] = useState(false)
  const [rawView, setRawView] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [savedquery, setSavedquery] = useState(null)
  const [founditems, setFounditems] = useState([])
  const [loadingQueries, setLoadingQueries] = useState(false)
  const [queryError, setQueryError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [activeTab, setActiveTab] = useState('saved') // 'saved' | 'recent'
  const [isRegenerating, setIsRegenerating] = useState(false)
  const [expanded, setExpanded] = useState(false) // solutions drawer: half-screen vs. full-width

  const controllerRef = useRef(null)
  const searchDebounceRef = useRef(null)

  // ── Fetch solutions (all or filtered) ───────────────────────────────────

  const fetchSolutions = useCallback(async (term = '') => {
    controllerRef.current?.abort()
    controllerRef.current = new AbortController()

    const isTerm = term.trim().length > 0
    isTerm ? setIsSearching(true) : setLoadingQueries(true)
    setQueryError('')

    let accessToken, refreshToken
    try {
      ;({ accessToken, refreshToken } = getAuthTokens())
    } catch (e) {
      setQueryError(e.message)
      isTerm ? setIsSearching(false) : setLoadingQueries(false)
      return
    }

    const url = isTerm
      ? `${domain}/api/v1/solutions/queries?courseName=${encodeURIComponent(term.trim())}`
      : `${domain}/api/v1/solutions/queries`

    const timeout = setTimeout(() => controllerRef.current?.abort(), FETCH_TIMEOUT_MS)

    try {
      const result = await fetchWithAuth(
        url,
        {
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
          signal: controllerRef.current.signal,
        },
        refreshToken
      )
      const normalised =
        result?.solutions != null         ? result
        : result?.data?.solutions != null  ? result.data
        : null

      setFounditems(normalised || { solutions: [], solutions_count: 0 })
    } catch (err) {
      if (err.name !== 'AbortError') {
        setQueryError(isTerm ? 'Search failed. Try again.' : 'Could not load saved queries.')
      }
    } finally {
      clearTimeout(timeout)
      isTerm ? setIsSearching(false) : setLoadingQueries(false)
    }
  }, [])

  useEffect(() => {
    fetchSolutions()
    return () => {
      controllerRef.current?.abort()
      clearTimeout(searchDebounceRef.current)
    }
  }, [fetchSolutions])

  const handleSearchChange = useCallback((e) => {
    const val = e.target.value
    setSearchTerm(val)
    clearTimeout(searchDebounceRef.current)
    searchDebounceRef.current = setTimeout(() => fetchSolutions(val), SEARCH_DEBOUNCE_MS)
  }, [fetchSolutions])

  // Save to recents when extract resolves
  useEffect(() => {
    if (extract && extract !== 'loading...' && !dataerror?.length) {
      saveToRecents(courseName, extract)
      setRecentItems(getRecents())
    }
  }, [extract, courseName, dataerror])

  // ── Derived ──────────────────────────────────────────────────────────────

  const isLoading = extract === 'loading...'
  const hasError = dataerror?.length > 0 || !extract || extract === 'loading...'
  const hasDownload = /download/gi.test(actualDlink)

  // Once a fresh load starts coming in (isLoading flips true again), drop the
  // local "regenerating" flag so the button re-appears whatever the outcome.
  useEffect(() => {
    if (isLoading) setIsRegenerating(false)
  }, [isLoading])

  // Regenerating a successful result still spends a credit (getpayload hits the
  // paid /solutions endpoint every time), so confirm before doing that. A failed
  // result costs nothing extra to retry, so no prompt needed there.
  const handleRegenerate = () => {
    if (!onRegenerate || isRegenerating) return
    if (!hasError && !confirm('Regenerate will use another credit for a fresh solution. Continue?')) return
    setIsRegenerating(true)
    onRegenerate()
  }

  const renderedContent = () => {
    if (hasError && !savedquery) return `<div class='sf-ai-error'>${dataerror}</div>`
    if (rawView) return marked(savedquery?.solution || extract || dataerror || '')
    return raw?.replace(/(university.?of.?ghana)|(all.?rights.?reserved)/gim, '') || ''
  }

  return (
    <>
      <style>{STYLES}</style>

      <div className="sf-root">
        {/* ── PDF pane ── */}
        <div className="sf-pdf-pane">
          <div className="sf-pdf-topbar">
            <button className="sf-icon-btn" onClick={() => setshowpdf(false)} title="Close">
              <i className="fa fa-times" />
            </button>
            <img src={mainlogo} className="sf-logo" alt="logo" />
            <div className="sf-pdf-topbar__actions">
              {(iframeLoaded || raw) ? (
                <>
                  {hasDownload && (
                    <a
                      href={LocalApiPath + actualDlink}
                      download
                      target="_blank"
                      rel="noopener noreferrer"
                      className="sf-pill-btn"
                    >
                      <ArrowDownOutlined /> Download
                    </a>
                  )}
                  <Link
                    to="/payment"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="sf-pill-btn sf-pill-btn--topup"
                  >
                    <MoneyCollectOutlined /> Top up
                  </Link>
                  <div className="sf-pill-btn sf-pill-btn--accent" onClick={() => setSolnsOpen(true)}>
                    ✨Solutions
                  </div>
                </>
              ) : (
                <>
                  <div className="sf-skeleton" style={{ width: 90, height: 30, borderRadius: 20 }} />
                  <div className="sf-skeleton" style={{ width: 100, height: 30, borderRadius: 20 }} />
                </>
              )}
            </div>
          </div>

          <div className="sf-pdf-body">
            <PdfViewer
              url={`${LocalApiPath}${pdflink}&embedded=true`}
              setIframeLoaded={setIframeLoaded}
            />
          </div>
        </div>

        {/* ── Solutions drawer ── */}
        {solnsOpen && (
          <div className={`sf-drawer ${expanded ? 'sf-drawer--expanded' : ''}`}>
            {/* Drawer topbar */}
            <div className="sf-drawer__topbar">
              <button
                className="sf-icon-btn"
                onClick={() => { setSolnsOpen(false); setSavedquery(null); setExpanded(false) }}
                title="Close solutions"
              >
                <CloseOutlined />
              </button>
              <span className="sf-drawer__title">
                {savedquery ? (
                  <span className="sf-drawer__title-course">
                    {savedquery.course || courseName}
                  </span>
                ) : (
                  'Solutions'
                )}
              </span>
              <button
                className="sf-icon-btn"
                onClick={() => setExpanded((v) => !v)}
                title={expanded ? 'Collapse' : 'Expand to full screen'}
              >
                {expanded ? <FullscreenExitOutlined /> : <FullscreenOutlined />}
              </button>
              <div className="sf-drawer__credits">
                <Link to="/Payment" target="_blank" rel="noopener noreferrer" className="sf-credits-pill">
                  <i className="fa fa-bolt sf-credits-pill__icon" />
                  <strong>{credits ?? '0'}</strong>
                  <span className="sf-credits-pill__topup"><MoneyCollectOutlined /> Top up</span>
                </Link>
              </div>
            </div>

            {/* Status banner */}
            {!isLoading && (
              <div className={`sf-banner ${hasError ? 'sf-banner--error' : 'sf-banner--success'}`}>
                {hasError ? 'Extraction failed' : 'Extraction successful'}
              </div>
            )}

            {/* Main body: sidebar + content */}
            <div className="sf-drawer__body">

              {/* Sidebar */}
              <div className={`sf-sidebar ${sidebarOpen ? 'sf-sidebar--open' : ''}`}>
                <div className="sf-sidebar__inner">
                  <div className="sf-sidebar__art">
                    <img src={racoon_learn} alt="" />
                  </div>

                  {/* Search */}
                  <div className="sf-search-wrap">
                    <i className="fa fa-search sf-search-wrap__icon" />
                    <input
                      type="search"
                      className="sf-search"
                      placeholder="Search queries…"
                      value={searchTerm}
                      onChange={handleSearchChange}
                    />
                    {isSearching && <span className="sf-search-wrap__spin sf-search-wrap__spin--anim" />}
                  </div>

                  {/* Tabs */}
                  <div className="sf-tabs">
                    <button
                      className={`sf-tab ${activeTab === 'saved' ? 'sf-tab--active' : ''}`}
                      onClick={() => setActiveTab('saved')}
                    >
                      <SolutionOutlined /> Saved
                    </button>
                    <button
                      className={`sf-tab ${activeTab === 'recent' ? 'sf-tab--active' : ''}`}
                      onClick={() => setActiveTab('recent')}
                    >
                      Recent
                    </button>
                  </div>

                  {/* List */}
                  <div className="sf-list">
                    {activeTab === 'saved' ? (
                      loadingQueries || isSearching ? (
                        [1,2,3].map(i => (
                          <div className="sf-list-item" key={i}>
                            <Skeleton height={12} width="70%" />
                          </div>
                        ))
                      ) : queryError ? (
                        <div className="sf-list-empty sf-list-empty--error">{queryError}</div>
                      ) : founditems?.solutions?.length > 0 ? (
                        founditems.solutions.map((x, y) => (
                          <div
                            className={`sf-list-item ${savedquery?.id === x.id ? 'sf-list-item--active' : ''}`}
                            onClick={() => { setSavedquery(x); setRawView(true) }}
                            key={x.id ?? y}
                          >
                            <span className="sf-list-item__initial">{(x.course||'?')[0].toUpperCase()}</span>
                            <div className="sf-list-item__info">
                              <span className="sf-list-item__label">{x.course}</span>
                              <span className="sf-list-item__meta">Saved query</span>
                            </div>
                            <i className="fa fa-chevron-right sf-list-item__arrow" />
                          </div>
                        ))
                      ) : (
                        <div className="sf-list-empty">
                          {searchTerm.trim() ? `No results for "${searchTerm.trim()}"` : 'No saved queries yet'}
                        </div>
                      )
                    ) : (
                      recentItems.length > 0 ? (
                        recentItems.map((x, y) => (
                          <div
                            className={`sf-list-item ${savedquery?.course === x.course ? 'sf-list-item--active sf-list-item--recent' : ''}`}
                            onClick={() => { setSavedquery(x); setRawView(true) }}
                            key={'r' + y}
                          >
                            <span className="sf-list-item__initial sf-list-item__initial--recent">{(x.course||'?')[0].toUpperCase()}</span>
                            <div className="sf-list-item__info">
                              <span className="sf-list-item__label">{x.course}</span>
                              <span className="sf-list-item__meta">Recent</span>
                            </div>
                            <i className="fa fa-chevron-right sf-list-item__arrow" />
                          </div>
                        ))
                      ) : (
                        <div className="sf-list-empty">No recent activity</div>
                      )
                    )}
                  </div>
                </div>
              </div>

              {/* Content area */}
              <div className="sf-content">
                {/* Content toolbar */}
                <div className="sf-content__toolbar">
                  <button
                    className="sf-icon-btn sf-sidebar-toggle"
                    onClick={() => setSidebarOpen(v => !v)}
                    title="Toggle sidebar"
                  >
                    <i className={`fa fa-${sidebarOpen ? 'indent' : 'dedent'}`} />
                  </button>

                  {!isLoading && (
                    <div className="sf-view-toggle">
                      <button
                        className={`sf-view-toggle__btn ${rawView ? 'sf-view-toggle__btn--active' : ''}`}
                        onClick={() => setRawView(true)}
                      >
                        <CheckCircleOutlined style={{marginRight:5}}/>{" Solved"}
                      </button>
                      <button
                        className={`sf-view-toggle__btn ${!rawView ? 'sf-view-toggle__btn--active' : ''}`}
                        onClick={() => setRawView(false)}
                      >
                        <CodeOutlined style={{marginRight:5}}/> Raw
                      </button>
                    </div>
                  )}

                  <div className="sf-content__toolbar-right">
                    {savedquery && (
                      <button
                        className="sf-pill-btn sf-pill-btn--active"
                        onClick={() => { setSavedquery(null); setRawView(true) }}
                        title="Back to current result"
                      >
                        Live result
                      </button>
                    )}
                    {/* Regenerate: shown for the live (not saved/recent) result whether it
                        succeeded or failed. Red-tinted on failure, neutral on success. */}
                    {!isLoading && !savedquery && (
                      <button
                        className={`sf-pill-btn sf-pill-btn--regenerate ${hasError ? '' : 'sf-pill-btn--regenerate-ok'}`}
                        onClick={handleRegenerate}
                        disabled={!onRegenerate || isRegenerating}
                        title={hasError ? 'Try generating the solution again' : 'Generate a fresh solution (uses a credit)'}
                      >
                        {isRegenerating ? (
                          <span className="sf-modal__spinner sf-modal__spinner--small" />
                        ) : (
                          <>
                            <ReloadOutlined /> Regenerate
                          </>
                        )}
                      </button>
                    )}
                    {!isLoading && !hasError && (
                      <button className="sf-pill-btn" onClick={() => setSaveOpen(true)}>
                        <i className="fa fa-bookmark" /> Save
                      </button>
                    )}
                  </div>
                </div>

                {/* Content body */}
                <div className="sf-content__body">
                  {isLoading ? (
                    <div className="sf-content__loading">
                      {[90,75,85,60,80].map((w,i) => (
                        <Skeleton key={i} width={`${w}%`} height={13} style={{ marginBottom: 10 }} />
                      ))}
                    </div>
                  ) : (
                    <div
                      className="sf-prose"
                      dangerouslySetInnerHTML={{ __html: renderedContent() }}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {saveOpen && (
        <SaveModal
          selectedVal={selectedVal}
          courseName={courseName}
          setstoreme={setSaveOpen}
          extract={extract}
        />
      )}
    </>
  )
}

export default Showfiles

// ─── Styles ───────────────────────────────────────────────────────────────────

const STYLES = `
  .sf-root {
    position: fixed;
    inset: 0;
    display: flex;
    background: #0d0d0f;
    color: #e8e8e8;
    font-family: 'Segoe UI', system-ui, sans-serif;
    z-index: 1000;
    overflow: hidden;
  }

  /* ── PDF pane ── */
  .sf-pdf-pane {
    display: flex;
    flex-direction: column;
    flex: 1 1 0;
    min-width: 0;
    width: 0; /* prevents flex child from overflowing on mobile */
    border-right: 1px solid #1e1e24;
    box-sizing: border-box;
  }
  .sf-pdf-topbar {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 14px;
    background: #111115;
    border-bottom: 1px solid #1e1e24;
    flex-shrink: 0;
  }
  .sf-pdf-topbar__actions { display: flex; align-items: center; gap: 8px; margin-left: auto; }
  .sf-logo { height: 28px; object-fit: contain; }
  .sf-pdf-body {
    flex: 1;
    overflow: hidden;
    position: relative;
    min-height: 0;
  }
  .sf-pdf-body > * {
    position: absolute !important;
    inset: 0 !important;
    width: 100% !important;
    height: 100% !important;
  }

  /* ── Drawer ── */
  .sf-drawer {
    width: 52vw;
    min-width: 340px;
    max-width: 780px;
    display: flex;
    flex-direction: column;
    background: #111115;
    border-left: 1px solid #1e1e24;
    overflow: hidden;
    transition: width .22s ease, max-width .22s ease;
  }
  /* Extend button toggles this — drawer covers the full window edge to edge,
     overlaying the PDF pane instead of sharing space with it. */
  .sf-drawer--expanded {
    position: fixed;
    inset: 0;
    width: 100% !important;
    max-width: 100% !important;
    min-width: 0 !important;
    border-left: none;
    z-index: 1150;
    animation: sf-slide-up .22s ease;
  }
  .sf-drawer__topbar {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    background: #0d0d0f;
    border-bottom: 1px solid #1e1e24;
    flex-shrink: 0;
  }
  .sf-drawer__title {
    font-size: 14px;
    font-weight: 600;
    letter-spacing: .02em;
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: #c8c8d0;
  }
  .sf-drawer__title-course { color: #7dd3fc; }
  .sf-drawer__credits { margin-left: auto; flex-shrink: 0; }
  .sf-credits-pill__icon { font-size: 11px; }
  .sf-credits-pill {
    display: flex;
    align-items: center;
    gap: 5px;
    background: #1e1e2a;
    border: 1px solid #2e2e3a;
    border-radius: 20px;
    padding: 4px 10px;
    font-size: 12px;
    color: #fbbf24;
    text-decoration: none;
    transition: background .15s;
  }
  .sf-credits-pill:hover { background: #25253a; }
  .sf-credits-pill__topup {
    color: #94a3b8;
    border-left: 1px solid #2e2e3a;
    padding-left: 8px;
    margin-left: 4px;
  }

  /* ── Banner ── */
  .sf-banner {
    padding: 6px 16px;
    font-size: 12px;
    font-weight: 500;
    flex-shrink: 0;
  }
  .sf-banner--success { background: #0d2b1e; color: #4ade80; border-bottom: 1px solid #14532d; }
  .sf-banner--error   { background: #2b0d0d; color: #f87171; border-bottom: 1px solid #7f1d1d; }

  /* ── Drawer body ── */
  .sf-drawer__body {
    flex: 1;
    display: flex;
    overflow: hidden;
  }

  /* ── Sidebar ── */
  .sf-sidebar {
    width: 0;
    overflow: hidden;
    transition: width .22s ease;
    background: #0d0d0f;
    border-right: 1px solid #1e1e24;
    flex-shrink: 0;
  }
  .sf-sidebar--open { width: 220px; }
  .sf-sidebar__inner {
    width: 220px;
    height: 100%;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
  .sf-sidebar__art {
    flex-shrink: 0;
    height: 80px;
    overflow: hidden;
    position: relative;
  }
  .sf-sidebar__art img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    opacity: .55;
  }
  .sf-sidebar__art::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(to bottom, transparent 40%, #0d0d0f);
  }

  /* Search */
  .sf-search-wrap {
    position: relative;
    padding: 10px 10px 6px;
    flex-shrink: 0;
  }
  .sf-search-wrap__icon {
    position: absolute;
    left: 18px;
    top: 50%;
    transform: translateY(-30%);
    font-size: 11px;
    color: #555;
    pointer-events: none;
  }
  .sf-search-wrap__spin--anim {
    width: 12px;
    height: 12px;
    border: 2px solid #2a2a38;
    border-top-color: #6366f1;
    border-radius: 50%;
    animation: sf-spin .7s linear infinite;
    position: absolute;
    right: 16px;
    top: 50%;
    transform: translateY(-30%);
    display: inline-block;
  }
  .sf-search-wrap__spin {
    position: absolute;
    right: 16px;
    top: 50%;
    transform: translateY(-30%);
    font-size: 11px;
  }
  .sf-search {
    width: 100%;
    background: #1a1a20;
    border: 1px solid #2a2a34;
    border-radius: 8px;
    padding: 6px 28px 6px 28px;
    font-size: 12px;
    color: #d0d0da;
    outline: none;
    box-sizing: border-box;
  }
  .sf-search:focus { border-color: #4f46e5; }

  /* Tabs */
  .sf-tabs {
    display: flex;
    padding: 0 10px;
    gap: 4px;
    flex-shrink: 0;
    border-bottom: 1px solid #1e1e24;
    margin-bottom: 4px;
  }
  .sf-tab {
    flex: 1;
    padding: 7px 4px;
    font-size: 11px;
    background: transparent;
    border: none;
    color: #666;
    cursor: pointer;
    border-bottom: 2px solid transparent;
    transition: color .15s, border-color .15s;
  }
  .sf-tab--active { color: #a5b4fc; border-bottom-color: #6366f1; }

  /* List */
  .sf-list {
    flex: 1;
    overflow-y: auto;
    padding: 4px 8px 8px;
  }
  .sf-list::-webkit-scrollbar { width: 4px; }
  .sf-list::-webkit-scrollbar-thumb { background: #2a2a36; border-radius: 4px; }
  .sf-list-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 9px 10px;
    border-radius: 10px;
    cursor: pointer;
    transition: background .12s, border-color .12s;
    margin-bottom: 3px;
    border: 1px solid transparent;
    position: relative;
  }
  .sf-list-item:hover { background: #16161e; border-color: #2a2a38; }
  .sf-list-item--active {
    background: #12122a !important;
    border-color: #4338ca !important;
  }
  .sf-list-item--recent.sf-list-item--active {
    background: #1a1408 !important;
    border-color: #92400e !important;
  }

  /* Coloured initial avatar */
  .sf-list-item__initial {
    flex-shrink: 0;
    width: 32px;
    height: 32px;
    border-radius: 8px;
    background: linear-gradient(135deg, #3730a3, #6366f1);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 13px;
    font-weight: 700;
    color: #fff;
    letter-spacing: 0;
  }
  .sf-list-item__initial--recent {
    background: linear-gradient(135deg, #92400e, #d97706);
  }
  .sf-list-item--active .sf-list-item__initial {
    box-shadow: 0 0 0 2px #6366f1;
  }
  .sf-list-item--recent.sf-list-item--active .sf-list-item__initial {
    box-shadow: 0 0 0 2px #d97706;
  }

  /* Text block */
  .sf-list-item__info {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  .sf-list-item__label {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 12px;
    font-weight: 500;
    color: #c0c0cc;
    line-height: 1.3;
  }
  .sf-list-item--active .sf-list-item__label { color: #a5b4fc; }
  .sf-list-item--recent.sf-list-item--active .sf-list-item__label { color: #fcd34d; }
  .sf-list-item__meta {
    font-size: 10px;
    color: #444;
    text-transform: uppercase;
    letter-spacing: .04em;
  }

  /* Chevron */
  .sf-list-item__arrow {
    flex-shrink: 0;
    font-size: 9px;
    color: #333;
    transition: color .12s, transform .12s;
  }
  .sf-list-item:hover .sf-list-item__arrow { color: #666; transform: translateX(1px); }
  .sf-list-item--active .sf-list-item__arrow { color: #6366f1; transform: translateX(2px); }

  .sf-list-empty {
    padding: 20px 12px;
    font-size: 12px;
    color: #383840;
    text-align: center;
    line-height: 1.6;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
  }
  .sf-list-empty--error { color: #f87171; }

  /* ── Content area ── */
  .sf-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
  .sf-content__toolbar {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    border-bottom: 1px solid #1e1e24;
    flex-shrink: 0;
    background: #0f0f13;
  }
  .sf-content__toolbar-right { display: flex; align-items: center; gap: 6px; margin-left: auto; }

  .sf-view-toggle {
    display: flex;
    background: #1a1a20;
    border-radius: 8px;
    padding: 2px;
    gap: 2px;
  }
  .sf-view-toggle__btn {
    padding: 4px 12px;
    border-radius: 6px;
    border: none;
    background: transparent;
    color: #666;
    font-size: 12px;
    cursor: pointer;
    transition: background .12s, color .12s;
  }
  .sf-view-toggle__btn--active { background: #2a2a38; color: #a5b4fc; }

  .sf-content__body {
    flex: 1;
    overflow-y: auto;
    padding: 20px 24px;
  }
  .sf-content__body::-webkit-scrollbar { width: 5px; }
  .sf-content__body::-webkit-scrollbar-thumb { background: #2a2a36; border-radius: 4px; }

  .sf-content__loading { display: flex; flex-direction: column; padding-top: 8px; }

  /* Prose styles */
  .sf-prose { font-size: 14px; line-height: 1.75; color: #ccd0da; }
  .sf-prose h1,.sf-prose h2,.sf-prose h3 { color: #e8e8f0; margin: 1.2em 0 .4em; font-weight: 600; }
  .sf-prose h3 { font-size: 15px; color: #a5b4fc; }
  .sf-prose p { margin: 0 0 .9em; }
  .sf-prose code {
    background: #1e1e2a;
    border: 1px solid #2a2a38;
    border-radius: 4px;
    padding: 1px 5px;
    font-size: 12px;
    color: #7dd3fc;
  }
  .sf-prose pre {
    background: #141418;
    border: 1px solid #1e1e28;
    border-radius: 8px;
    padding: 14px;
    overflow-x: auto;
    margin: 1em 0;
  }
  .sf-prose pre code { background: transparent; border: none; padding: 0; color: #c8d3f0; }
  .sf-prose ul,.sf-prose ol { padding-left: 1.4em; margin: .6em 0; }
  .sf-prose li { margin-bottom: .3em; }
  .sf-prose strong { color: #e2e8f0; }
  .sf-prose a { color: #7dd3fc; text-decoration: none; }
  .sf-prose a:hover { text-decoration: underline; }
  .sf-ai-error {
    background: #2b0d0d;
    border: 1px solid #7f1d1d;
    border-radius: 8px;
    padding: 16px;
    color: #f87171;
    font-size: 13px;
  }

  /* ── Buttons ── */
  .sf-icon-btn {
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 8px;
    border: 1px solid #1e1e28;
    background: #1a1a20;
    color: #aaa;
    cursor: pointer;
    transition: background .12s, color .12s;
    flex-shrink: 0;
  }
  .sf-icon-btn:hover { background: #22222e; color: #e0e0e8; }

  .sf-pill-btn {
    display: flex;
    align-items: center;
    gap: 5px;
    padding: 5px 12px;
    border-radius: 20px;
    border: 1px solid #2a2a38;
    background: #1a1a22;
    color: #a0a0b8;
    font-size: 12px;
    cursor: pointer;
    text-decoration: none;
    transition: background .12s, color .12s;
    white-space: nowrap;
  }
  .sf-pill-btn:hover { background: #22222e; color: #e0e0e8; }
  .sf-pill-btn--accent { background: #1e1b4b; border-color: #4338ca; color: #a5b4fc; }
  .sf-pill-btn--accent:hover { background: #25224f; }
  .sf-pill-btn--active { background: #1c2a14; border-color: #4d7c0f; color: #a3e635; }

  /* Top-up pill next to Download/Solutions in the PDF topbar */
  .sf-pill-btn--topup { background: #1c1a0e; border-color: #92400e; color: #fbbf24; }
  .sf-pill-btn--topup:hover { background: #241d0a; color: #fde68a; }

  /* Regenerate pill in the solutions toolbar (red-tinted on failure) */
  .sf-pill-btn--regenerate { background: #2b0d0d; border-color: #7f1d1d; color: #f87171; }
  .sf-pill-btn--regenerate:hover:not(:disabled) { background: #3a1010; color: #fca5a5; }
  .sf-pill-btn--regenerate:disabled { opacity: .6; cursor: not-allowed; }

  /* Regenerate pill when shown on a successful result — neutral, not alarming */
  .sf-pill-btn--regenerate-ok { background: #1a1a22; border-color: #2a2a38; color: #a0a0b8; }
  .sf-pill-btn--regenerate-ok:hover:not(:disabled) { background: #22222e; color: #e0e0e8; }

  .sf-sidebar-toggle { flex-shrink: 0; }

  /* ── Skeleton ── */
  .sf-skeleton {
    background: linear-gradient(90deg, #1a1a22 25%, #22222e 50%, #1a1a22 75%);
    background-size: 200% 100%;
    animation: sf-shimmer 1.4s infinite;
    display: block;
  }
  @keyframes sf-shimmer {
    0%   { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }

  /* ── Toast ── */
  .sf-toast {
    position: fixed;
    bottom: 24px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 18px;
    border-radius: 10px;
    font-size: 13px;
    z-index: 9999;
    animation: sf-fadein .2s ease;
    box-shadow: 0 4px 20px rgba(0,0,0,.5);
  }
  .sf-toast--error   { background: #2b0d0d; border: 1px solid #7f1d1d; color: #f87171; }
  .sf-toast__dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    flex-shrink: 0;
  }
  .sf-toast__dot--error   { background: #f87171; }
  .sf-toast__dot--success { background: #4ade80; }
  .sf-toast--success { background: #0d2b1e; border: 1px solid #14532d; color: #4ade80; }
  @keyframes sf-fadein { from { opacity:0; transform: translateX(-50%) translateY(8px); } to { opacity:1; transform: translateX(-50%) translateY(0); } }

  /* ── Save modal ── */
  .sf-modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,.7);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2000;
    backdrop-filter: blur(4px);
  }
  .sf-modal {
    width: 420px;
    max-width: 94vw;
    background: #111115;
    border: 1px solid #1e1e28;
    border-radius: 16px;
    overflow: hidden;
    position: relative;
    box-shadow: 0 24px 60px rgba(0,0,0,.6);
    animation: sf-fadein .2s ease;
  }
  .sf-modal__close {
    position: absolute;
    top: 10px;
    right: 10px;
    background: rgba(0,0,0,.4);
    border: none;
    color: #aaa;
    font-size: 16px;
    width: 30px;
    height: 30px;
    border-radius: 50%;
    cursor: pointer;
    z-index: 2;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .sf-modal__close:hover { color: #fff; }
  .sf-modal__art { height: 140px; overflow: hidden; position: relative; }
  .sf-modal__art img { width: 100%; height: 100%; object-fit: cover; opacity: .6; }
  .sf-modal__art-fade {
    position: absolute;
    inset: 0;
    background: linear-gradient(to bottom, transparent 30%, #111115);
  }
  .sf-modal__body { padding: 20px 22px 24px; }
  .sf-modal__title { margin: 0 0 14px; font-size: 16px; font-weight: 700; color: #e8e8f0; }
  .sf-modal__notice {
    display: flex;
    gap: 10px;
    background: #1c1a0e;
    border: 1px solid #3d3200;
    border-radius: 8px;
    padding: 10px 12px;
    margin-bottom: 16px;
    font-size: 12px;
    color: #d4b84a;
    line-height: 1.5;
  }
  .sf-modal__notice-icon { font-size: 14px; flex-shrink: 0; color: #d97706; margin-top: 1px; }
  .sf-modal__notice strong { color: #fbbf24; }
  .sf-modal__field { margin-bottom: 16px; }
  .sf-modal__field label { display: block; font-size: 11px; color: #666; margin-bottom: 6px; text-transform: uppercase; letter-spacing: .05em; }
  .sf-modal__confirm-phrase {
    display: inline-block;
    background: #1a1a22;
    border: 1px dashed #3a3a48;
    border-radius: 6px;
    padding: 4px 10px;
    font-size: 12px;
    color: #a5b4fc;
    margin-bottom: 8px;
    font-style: italic;
  }
  .sf-modal__field input {
    width: 100%;
    background: #1a1a22;
    border: 1px solid #2a2a38;
    border-radius: 8px;
    padding: 9px 12px;
    font-size: 13px;
    color: #d0d0da;
    outline: none;
    box-sizing: border-box;
    transition: border-color .15s;
  }
  .sf-modal__field input:focus { border-color: #6366f1; }
  .sf-modal__input--invalid { border-color: #f87171 !important; }
  .sf-modal__save-btn {
    width: 100%;
    padding: 11px;
    background: #4f46e5;
    border: none;
    border-radius: 10px;
    color: #fff;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    transition: background .15s, opacity .15s;
  }
  .sf-modal__save-btn:hover:not(:disabled) { background: #4338ca; }
  .sf-modal__save-btn:disabled { opacity: .55; cursor: not-allowed; }
  .sf-modal__spinner {
    width: 16px;
    height: 16px;
    border: 2px solid rgba(255,255,255,.25);
    border-top-color: #fff;
    border-radius: 50%;
    animation: sf-spin .6s linear infinite;
    display: inline-block;
  }
  .sf-modal__spinner--small { width: 12px; height: 12px; border-width: 2px; }
  @keyframes sf-spin { to { transform: rotate(360deg); } }

  /* ── Responsive ── */
  @media (max-width: 700px) {
    /* PDF pane fills the whole screen normally */
    .sf-root { flex-direction: column; }
    .sf-pdf-pane {
      flex: 1;
      width: 100vw !important;
      min-width: 0 !important;
      border-right: none;
    }

    /* Drawer slides up as a full-screen fixed overlay — never competes with PDF pane */
    .sf-drawer {
      position: fixed;
      inset: 0;
      width: 100% !important;
      max-width: 100% !important;
      min-width: 0 !important;
      border-left: none;
      z-index: 1100;
      animation: sf-slide-up .22s ease;
    }

    /* Sidebar narrows slightly on small screens */
    .sf-sidebar--open { width: 180px; }

    /* Tighten topbar on small screens */
    .sf-drawer__topbar { padding: 10px 12px; }

    /* Hide the Top up label to save space — icon + credits number is enough */
    .sf-credits-pill__topup { display: none; }
  }

  @keyframes sf-slide-up {
    from { transform: translateY(100%); opacity: 0; }
    to   { transform: translateY(0);    opacity: 1; }
  }
`