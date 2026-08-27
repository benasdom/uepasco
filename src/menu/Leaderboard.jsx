import rbadge from '../../public/imgs/leader.png'
import racoonleaderboard from '../../public/imgs/racoon_leaderboard.jpg'
import racoonrun from '../../public/imgs/racoon_goldmedal.jpg'
import bob from '../../public/imgs/bob.jpg'
import jessy from '../../public/imgs/jessy.jpg'
import brown from '../../public/imgs/brown.jpg'
import guylogs from '../../public/imgs/guylogs.png'
import { ThunderboltFilled, DollarCircleFilled } from '@ant-design/icons'
import { useState, useEffect } from 'react'
import { domain, fetchWithAuth } from './authfetch'
import './styles/Leaderboard.css'

const fallbackAvatars = [bob, jessy, guylogs, brown]

const Leaderboard = () => {
  const [tab, setTab] = useState('streak') // 'streak' | 'affiliate'
  const [topStreaks, setTopStreaks] = useState([])
  const [topAffiliates, setTopAffiliates] = useState([])
  const [yourRank, setYourRank] = useState(null)
  const [loaded, setLoaded] = useState(false)
  const [showing, setShowing] = useState(false)
  const [message, setMessage] = useState('')

  const seterrors = (pop) => {
    setMessage(pop)
    setShowing(true)
    setTimeout(() => setShowing(false), 6000)
  }

  useEffect(() => {
    if (showing) {
      const el = document.querySelector('.successmessage')
      if (el) el.textContent = '🔴' + message
    }
  }, [message, showing])

  let storeddata
  try {
    storeddata = JSON.parse(localStorage.getItem('userInfo'))
  } catch (err) {
    console.error('Error parsing userInfo:', err)
    storeddata = null
  }
  const accessToken = storeddata?.accessToken
  const refreshToken = storeddata?.refreshToken
  const url = domain + '/api/v1/leaderboard'
  const options = { headers: { Authorization: `Bearer ${accessToken}` } }

  useEffect(() => {
    if (accessToken && refreshToken) {
      fetchWithAuth(url, options)
        .then((res) => {
          // handles both { data: {...} } and an already-unwrapped payload
          const data = res?.data ?? res
          setTopStreaks(Array.isArray(data?.topStreaks) ? data.topStreaks : [])
          setTopAffiliates(Array.isArray(data?.topAffiliates) ? data.topAffiliates : [])
          setYourRank(data?.yourRank ?? null)
          setLoaded(true)
        })
        .catch((err) => {
          console.error('Fetch error:', err)
          seterrors(`${err}`.toLowerCase().replace(/typeerror/gim, 'sorry'))
          setLoaded(true)
        })
    } else {
      setLoaded(true)
    }
  }, [url, accessToken, refreshToken])

  const list = tab === 'streak' ? topStreaks : topAffiliates
  const currentRank = tab === 'streak' ? yourRank?.streak : yourRank?.affiliate
  const position = currentRank?.rank ?? 0

  const ordinal = (n) => {
    if (!n) return ''
    if (n > 3) return 'th'
    if (n === 3) return 'rd'
    if (n === 2) return 'nd'
    return 'st'
  }

  const avatarFor = (entry) =>
    entry.profilePic ||
    fallbackAvatars[Math.abs((entry.userId ?? '').length) % fallbackAvatars.length]

  return (
    <div className="lb-card">
      <div className="lb-dotgrid" aria-hidden="true" />
      <div className="lb-glow" aria-hidden="true" />

      <div className="lb-banner">
        <img src={racoonleaderboard} className="lb-banner-img" alt="" />
        <div className="lb-banner-overlay" aria-hidden="true" />
        <img src={rbadge} className="lb-badge" alt="" />
        <div className="lb-title">🏁 Leaderboard</div>
      </div>

      {showing && (
        <div
          className="successmessage"
          style={{ position: 'absolute', display: 'flex', margin: 'auto' }}
        ></div>
      )}

      <div className="lb-tabs" >
        <div
          className={`lb-tab${tab === 'streak' ? ' lb-tab-active' : ''}`}
          onClick={() => setTab('streak')}
          
        >
          <ThunderboltFilled /> Streaks
        </div>
        <div
          className={`lb-tab${tab === 'affiliate' ? ' lb-tab-active' : ''}`}
          onClick={() => setTab('affiliate')}
        >
          <DollarCircleFilled /> Affiliates
        </div>
      </div>

      <div className="lb-position">
        You came{' '}
        <span className="lb-position-value">
          {position || '—'}
          <sup>{ordinal(position)}</sup>
        </span>
      </div>

      <div className="lb-list">
        {loaded && list.length > 0
          ? list.map((entry, b) => {
              const rank = entry.rank ?? b + 1
              const isTop3 = rank <= 3
              const name =
                [entry.firstName, entry.lastName].filter(Boolean).join(' ') || 'User'
              const value =
                tab === 'streak'
                  ? entry.highestStreakScore ?? entry.streakScore ?? 0
                  : `GHS ${entry.totalEarningsGhs ?? '0.00'}`

              return (
                <div
                  className={`lb-row${isTop3 ? ` lb-row-top lb-row-top-${rank}` : ''}`}
                  key={entry.userId ?? b}
                >
                  <div className="lb-row-rank">
                    {rank === 1 ? (
                      <img src={racoonrun} className="lb-row-medal" alt="1st place" />
                    ) : (
                      <span className="lb-row-rank-number">{rank}</span>
                    )}
                  </div>

                  <div
                    className="lb-row-avatar"
                    style={{ backgroundImage: `url(${avatarFor(entry)})` }}
                  ></div>

                  <div className="lb-row-body">
                    <div className="lb-row-name">{name}</div>
                    {tab === 'streak' && (
                      <div className="lb-row-date">
                        Current streak: {entry.streakScore ?? 0}
                      </div>
                    )}
                  </div>

                  <div className="lb-row-end">
                    <span className="lb-icon-chip">
                      {tab === 'streak' ? <ThunderboltFilled /> : <DollarCircleFilled />}
                    </span>
                    <span className="lb-rank-chip">{value}</span>
                  </div>
                </div>
              )
            })
          : !loaded &&
            Array(5)
              .fill('')
              .map((_, b) => (
                <div className="lb-row lb-row-loading" key={b}>
                  <div className="lb-row-rank">
                    <span className="lb-row-rank-number">–</span>
                  </div>
                  <div className="lb-row-avatar"></div>
                  <div className="lb-row-body">
                    <div className="lb-row-name">Loading...</div>
                    <div className="lb-row-date"> </div>
                  </div>
                  <div className="lb-row-end">
                    <span className="lb-icon-chip">
                      <ThunderboltFilled />
                    </span>
                    <span className="lb-rank-chip">–</span>
                  </div>
                </div>
              ))}

        {loaded && list.length === 0 && (
          <div className="lb-empty">
            No {tab === 'streak' ? 'streaks' : 'affiliates'} yet. Be the first!
          </div>
        )}
      </div>
    </div>
  )
}

export default Leaderboard