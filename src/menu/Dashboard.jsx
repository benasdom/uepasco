import React, { useEffect, useState } from 'react'
import { domain, fetchWithAuth } from './authfetch'
import coins from '/imgs/coin.png'
import { getFromLocalStorage, setToLocalStorage } from './fromlocal'

const Dashboard = () => {
  const [userscore, setuserscore] = useState(null)
  const [maxscore, setmaxscore] = useState(0)
  const [earning, setearning] = useState(null)
  const [storedval, setstoredval] = useState(null)
  const [showprofile, setshowprofile] = useState(false)
  const [streaks, setstreaks] = useState({ steakScore: "", date: "" })

  let url = domain + '/api/v1/user/streak'
  let url2 = domain + '/api/v1/user/wallet'

  // Helper: update localStorage, storedval state, and maxscore in one place
  const persistUpdate = (newData, freshAccessToken, freshRefreshToken, useractivedate) => {
    const current = getFromLocalStorage("userInfo", {})
    const updated = {
      ...current,
      ...newData,
      accessToken: freshAccessToken,
      refreshToken: freshRefreshToken,
      useractivedate,
    }
    setToLocalStorage("userInfo", updated)
    setstoredval(updated)

    // Update maxscore if new streakScore exceeds it
    const newScore = newData?.streakScore ?? updated?.streakScore
    if (typeof newScore === "number" && newScore > maxscore) {
      setmaxscore(newScore)
    }
  }

  useEffect(() => {
    const storeddata = getFromLocalStorage("userInfo", {})
    const currentScore = storeddata?.streakScore ?? 0

    setuserscore(currentScore)
    setstoredval(storeddata)
    setmaxscore(storeddata?.highestStreakScore ?? 0)
    setstreaks({
      steakScore: currentScore,
      date: new Date().toISOString()
    })

    const accessToken = storeddata?.accessToken
    const refreshToken = storeddata?.refreshToken

    if (accessToken?.length > 0 && refreshToken?.length > 0) {
      fetchWithAuth(url2, {
        headers: { Authorization: `Bearer ${accessToken}` }
      })
        .then((data) => {
          setearning(data?.balance ?? null)
        })
        .catch((err) => {
          console.error("Error fetching wallet:", err)
          setearning(null)
        })
    }
  }, [])

  const transformdata = () => {
    const freshStoredData = getFromLocalStorage("userInfo", {})
    const freshAccessToken = freshStoredData?.accessToken
    const freshRefreshToken = freshStoredData?.refreshToken

    let newdate = new Date(streaks.date.split(/T/gim)[0])

    if (freshStoredData?.useractivedate != null) {
      let useractivedate = freshStoredData.useractivedate

      const lastEntry = useractivedate[1] ?? useractivedate[0]
      if (!lastEntry) return

      let predate = new Date(lastEntry.split(/T/gim)[0])
      let diffInDays = Math.floor((newdate - predate) / (1000 * 60 * 60 * 24))

      updateStreakToOne(diffInDays, useractivedate, newdate, freshAccessToken, freshRefreshToken)
    } else {
      let prevolddated = [streaks.date]
      updateStreakToOne(0, prevolddated, newdate, freshAccessToken, freshRefreshToken)
    }
  }

  const updateStreakToOne = (val, useractivedates, freshdate, freshAccessToken, freshRefreshToken) => {
    if (val === 1) {
      console.log("incrementing")
      if (freshAccessToken && freshRefreshToken && typeof userscore === "number") {
        const newScore = userscore === 0 ? 1 : userscore + 1
        fetchWithAuth(url, {
          method: "POST",
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${freshAccessToken}` },
          body: JSON.stringify({ streakScore: newScore })
        }, freshRefreshToken)
          .then((data) => {
            const score = data?.streakScore ?? newScore
            setuserscore(score)
            persistUpdate(data, freshAccessToken, freshRefreshToken, [...useractivedates, freshdate].slice(-2))
          })
          .catch(err => console.error("Streak increment failed:", err))
      }
    } else if (val > 1) {
      console.log("resetting")
      if (freshAccessToken && freshRefreshToken && typeof userscore === "number") {
        fetchWithAuth(url, {
          method: "POST",
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${freshAccessToken}` },
          body: JSON.stringify({ streakScore: 1 })
        }, freshRefreshToken)
          .then((data) => {
            setuserscore(1)
            persistUpdate(data, freshAccessToken, freshRefreshToken, [...useractivedates, freshdate].slice(-2))
          })
          .catch(err => console.error("Streak reset failed:", err))
      }
    } else if (val === 0) {
      console.log("maintaining")
      if (userscore === 0) {
        if (freshAccessToken && freshRefreshToken && typeof userscore === "number") {
          fetchWithAuth(url, {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${freshAccessToken}` },
            body: JSON.stringify({ streakScore: 1 })
          }, freshRefreshToken)
            .then((data) => {
              setuserscore(1)
              persistUpdate(data, freshAccessToken, freshRefreshToken, [...useractivedates, freshdate].slice(-2))
            })
            .catch(err => console.error("Streak maintain failed:", err))
        }
      }
    }
  }

  useEffect(() => {
    if (userscore != null && streaks.date) {
      const t = setTimeout(transformdata, 5000)
      return () => clearTimeout(t)
    }
  }, [userscore, streaks.date])

  return (
    showprofile
      ? <div className="userlevel flex-col">
          <div className="rbackdrop2" style={{ opacity: .2 }}></div>
          <div className="profilehead">
            <span className="profilebtn" onClick={() => setshowprofile(false)}>
              <div className="fnav"><i className="fa fa-user"></i></div>
              <div className="profiletxt">View profile details</div>
            </span>
          </div>
          <div className="levelitem">
            <div className="litem">
              <div className="hint-top">level</div>
              <div className="hint-top">badge</div>
            </div>
            <div className="litem">
              <div className="hintitems"><div className="mtext">Rookie level</div></div>
              <div className="hintitems"><div className="pic">🥈</div></div>
            </div>
          </div>
          <div className="scrollx">
            <div className="levelitem2 dboard">
              <div className="streak">⚡STREAK⚡</div>
              <div className="streaka">
                <div className="hint">streak score</div>
                <div className="hint">Highest streak</div>
              </div>
              <div className="streaks">
                <div className="hint streaknumbs">{userscore != null ? userscore : 1}</div>
                <div className="hint streaknumbs">{maxscore ? maxscore : 1}</div>
              </div>
              <div className="streak">{"⭐".repeat(10)}</div>
            </div>
            <div className="earndiv">
              <div className="earntext"><div className="fnav">💰</div>Earned</div>
              <img src={coins} className="backdrop" />
              <div className="earnval">GHS: {earning == null ? "_____" : earning}</div>
            </div>
          </div>
        </div>

      : <div className="userlevel flex-col">
          <div className="profilehead">
            <span className="profilebtn" onClick={() => setshowprofile(true)}>
              <div className="fnav"><i className="fa fa-user"></i></div>
              <div className="profiletxt">User Wallet and streak</div>
            </span>
          </div>
          <div className="rbackdrop2" style={{ opacity: .3 }}></div>
          <div className="profilebox">

            <div className="profileleft">
              <fieldset>
                <legend>
                  <div className="ptitleinfo">
                    <div className="iconb"><i className="fa fa-plus"></i></div>Extras
                  </div>
                </legend>
                <div className="pinfoboxitemfirst">
                  <div className="pitop">
                    <div className="labelicon">
                      <div className="iconb"><i className="fa fa-check"></i></div>
                    </div>
                    <div className="labelbox">
                      <div className="fstlabel">User Status:</div>
                      <div className="fstname">
                        {storedval?.isVerified
                          ? <div className="otpsuccess">OTP Verified</div>
                          : <div className="otpfailed">Not Verified</div>}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="pinfoboxitemfirst">
                  <div className="pitop">
                    <div className="labelicon">
                      <div className="iconb"><i className="fa fa-calendar-check"></i></div>
                    </div>
                    <div className="labelbox">
                      <div className="fstlabel">Last Active:</div>
                      <div className="fstname">
                        {storedval?.lastActiveDate
                          ? new Date(storedval.lastActiveDate).toLocaleDateString()
                          : "N/A"}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="pinfoboxitemfirst">
                  <div className="pitop">
                    <div className="labelicon">
                      <div className="iconb"><i className="fa fa-calendar"></i></div>
                    </div>
                    <div className="labelbox">
                      <div className="fstlabel">Date Created:</div>
                      <div className="fstname">
                        {storedval?.dateCreated
                          ? new Date(storedval.dateCreated).toLocaleDateString()
                          : "N/A"}
                      </div>
                    </div>
                  </div>
                </div>
              </fieldset>
            </div>

            <div className="profileright">
              <div className="pinfohead">
                <div className="pinfotop">
                  <div className="iconb"><i className="fa fa-user"></i></div>
                  <div className="ptitleinfo">Profile details</div>
                </div>
              </div>
              <div className="pinfobox1">
                <div className="pinfoboxitem">
                  <div className="pinfoboxitemfirst">
                    <div className="pitop">
                      <div className="labelicon">
                        <div className="fnav"><i className="fa fa-person"></i></div>
                      </div>
                      <div className="labelbox">
                        <div className="fstlabel">First Name</div>
                        <div className="fstname">{storedval?.firstName ?? ""}</div>
                      </div>
                    </div>
                  </div>
                  <div className="pinfoboxitemfirst">
                    <div className="pitop">
                      <div className="labelicon">
                        <div className="fnav"><i className="fa fa-person"></i></div>
                      </div>
                      <div className="labelbox">
                        <div className="fstlabel">Last Name</div>
                        <div className="fstname">{storedval?.lastName ?? ""}</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="pinfoboxitem">
                  <div className="pinfoboxitemsecond">
                    <div className="fnav"><i className="fa fa-envelope"></i></div>
                    <div className="labelbox">
                      <div className="fstlabel">Email:</div>
                      <div className="fstname">{storedval?.email ?? ""}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pinfohead">
                <div className="pinfotop">
                  <div className="fnav"><i className="fa fa-zap"></i></div>
                  <div className="ptitleinfo">User Credits</div>
                </div>
              </div>
              <div className="pinfobox1">
                <div className="pinfoboxitem">
                  <div className="pinfoboxitemsecond">
                    <div className="pitop">
                      <div className="labelicon">
                        <div className="fnav"><i className="fa fa-zap"></i></div>
                      </div>
                      <div className="labelbox">
                        <div className="fstlabel">Remaining Credits:</div>
                        <div className="fstname">{storedval?.credits ?? 0}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pinfohead">
                <div className="pinfotop">
                  <div className="fnav"><i className="fa fa-phone"></i></div>
                  <div className="ptitleinfo">Phone</div>
                </div>
              </div>
              <div className="pinfobox1">
                <div className="pinfoboxitem">
                  <div className="pinfoboxitemsecond">
                    <div className="pitop">
                      <div className="labelicon">
                        <div className="fnav"><i className="fa fa-phone"></i></div>
                      </div>
                      <div className="labelbox">
                        <div className="fstlabel">Contact Number:</div>
                        <div className="fstname">{storedval?.msisdn ?? ""}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
  )
}

export default Dashboard