import React, { useEffect, useState } from 'react'
import {domain,fetchWithAuth} from './authfetch'
import coins from '/imgs/coin.png'

const Dashboard=()=>{
  const [userscore, setuserscore] = useState(null)
  const [maxscore, setmaxscore] = useState(0)
  const [earning, setearning] = useState(null)
  const [storedval, setstoredval] = useState("")
  const [showprofile, setshowprofile] = useState(false)
  const [streaks, setstreaks] = useState({steakScore:"",date:""})

  let url = domain+'/api/v1/user/streak';
  let url2 = domain+'/api/v1/user/wallet';

  useEffect(() => {
    const storeddata = JSON.parse(localStorage.getItem("userInfo"));
    const currentScore = storeddata?.streakScore ?? 0;
    setuserscore(currentScore);
    setstoredval(storeddata);

    if (storeddata?.highestStreakScore) {
      setmaxscore(storeddata.highestStreakScore);
    }

    setstreaks({
      steakScore: currentScore,
      date: new Date().toISOString()
    });

    const accessToken = storeddata?.accessToken;
    const refreshToken = storeddata?.refreshToken;

    if (accessToken?.length > 0 && refreshToken?.length > 0) {
      let options = {
        headers: {Authorization: `Bearer ${accessToken}`},
      }
      fetchWithAuth(url2, options).then((data) => {
        setearning(data?.balance);
        console.log("Fetched wallet data:", data);
      }).catch((err) => {
        console.error("Error fetching wallet:", err);
        setearning([]);
      })
    }
  }, []);

  const transformdata = () => {
  const freshStoredData = JSON.parse(localStorage.getItem("userInfo"));
  const freshAccessToken = freshStoredData?.accessToken;
  const freshRefreshToken = freshStoredData?.refreshToken;

let newdate = new Date((streaks.date.split(/T/gim)[0]));
  if (freshStoredData?.useractivedate != null) {
    let useractivedate = freshStoredData.useractivedate;
    const lastEntry = useractivedate[1] ?? useractivedate[0];
    console.log("lastEntry:", lastEntry);

    if (!lastEntry) { console.log("bailing — no lastEntry"); return; }

    let predate = new Date((lastEntry.split(/T/gim)[0]));
    let diffInDays = Math.floor((newdate - predate) / (1000 * 60 * 60 * 24));
    console.log("predate:", predate);
    console.log("diffInDays:", diffInDays);

    updateStreakToOne(diffInDays, useractivedate, newdate, freshAccessToken, freshRefreshToken);
  } else {
    console.log("no useractivedate — going to else branch");
    let prevolddated = [streaks.date];
    updateStreakToOne(0, prevolddated, newdate, freshAccessToken, freshRefreshToken);
  }
}

  const updateStreakToOne = (val, useractivedates, freshdate, freshAccessToken, freshRefreshToken) => {
    if (val === 1) {
      console.log("incrementing")
      if (freshAccessToken && freshRefreshToken && typeof(userscore) === "number") {
        let options = {
          method: "POST",
          headers: {"Content-Type": "application/json", "Authorization": `Bearer ${freshAccessToken}`},
          body: JSON.stringify(userscore === 0 ? {streakScore: 1} : {streakScore: userscore + 1})
        }
        fetchWithAuth(url, options, freshRefreshToken)
          .then((data) => {
            try {
              localStorage.setItem("userInfo", JSON.stringify({
                ...data,
                accessToken: freshAccessToken,
                refreshToken: freshRefreshToken,
                useractivedate: [...useractivedates, freshdate].slice(-2)
              }));
              setuserscore(data?.streakScore ?? userscore + 1);
            } catch(err) { alert(err) }
          })
      }
    } else if (val > 1) {
      console.log("resetting")
      if (freshAccessToken && freshRefreshToken && typeof(userscore) === "number") {
        let options = {
          method: "POST",
          headers: {"Content-Type": "application/json", "Authorization": `Bearer ${freshAccessToken}`},
          body: JSON.stringify({streakScore: 1})
        }
        fetchWithAuth(url, options, freshRefreshToken)
          .then((data) => {
            try {
              localStorage.setItem("userInfo", JSON.stringify({
                ...data,
                accessToken: freshAccessToken,
                refreshToken: freshRefreshToken,
                useractivedate: [...useractivedates, freshdate].slice(-2)
              }));
              setuserscore(1);
            } catch(err) { alert(err) }
          })
      }
    } else if (val === 0) {
      console.log("maintaining")
      if (userscore === 0) {
        if (freshAccessToken && freshRefreshToken && typeof(userscore) === "number") {
          let options = {
            method: "POST",
            headers: {"Content-Type": "application/json", "Authorization": `Bearer ${freshAccessToken}`},
            body: JSON.stringify({streakScore: 1})
          }
          fetchWithAuth(url, options, freshRefreshToken)
            .then((data) => {
              try {
                localStorage.setItem("userInfo", JSON.stringify({
                  ...data,
                  accessToken: freshAccessToken,
                  refreshToken: freshRefreshToken,
                  useractivedate: [...useractivedates, freshdate].slice(-2)
                }));
                setuserscore(1);
              } catch(err) { alert(err) }
            })
        }
      }
    }
  }

  useEffect(() => {
    if (userscore != null && streaks.date) {
      const t = setTimeout(transformdata, 5000);
      return () => clearTimeout(t);
    }
  }, [userscore, streaks.date])

  return (
   
     showprofile? <div className="userlevel flex-col">
              <div className="profilehead" >
          <span className='profilebtn' setshowprofile onClick={()=>{setshowprofile(false)}}>
            <div className="fnav"><i className="fa fa-user fa-dark"></i></div> <div className="profiletxt">View profile details</div></span></div>

      <div className="levelitem">
        <div className="litem">
          <div className="hint-top" >level</div>
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
          <img src={coins} className="backdrop"/>
          <div className="earnval">GHS: {(earning != 0 && !earning) ? "_____" : earning}</div>
        </div>
      </div>
    </div>
    :
    <div className="userlevel flex-col">
              <div className="profilehead" >
          <span className='profilebtn' setshowprofile onClick={()=>{setshowprofile(true)}}>
            <div className="fnav"><i className="fa fa-user fa-dark"></i></div> <div className="profiletxt">User Wallet and streak</div></span></div>

      <div className="rbackdrop2" style={{opacity:.3}}></div>

      <div className="profilebox">
        <div className="profileleft"></div>
        <div className="profileright">
          <div className="pinfohead">
            <div className="pinfotop">
            <div className="iconb">
              <i className="fa fa-user fa-dark"></i>
              </div>
               <div className="ptitleinfo">Profile details</div></div>

            </div>
         <div className="pinfobox1">
            <div className="pinfoboxitem">
              <div className="pinfoboxitemfirst">
                <div className="pitop">
                  <div className="labelicon">
                <div className="iconb"><i className="fa fa-person fa-dark"></i></div>

                  </div>
                <div className="labelbox">
                  <div className="fstlabel">First Name</div>
                  <div className="fstname">{storedval?.firstName??""}</div>
                 </div>
                </div>
             
              </div>
              <div className="pinfoboxitemfirst">
                <div className="pitop">
                  <div className="labelicon">
                <div className="iconb"><i className="fa fa-person fa-dark"></i></div>

                  </div>
                      <div className="labelbox">
                  <div className="fstlabel">Last Name</div>
                  <div className="fstname">{storedval?.lastName??""}</div>
                 </div>
                </div>
        
              </div>
            </div>
            <div className="pinfoboxitem">
              <div className="pinfoboxitemsecond">
                <div className="iconb"><i className="fa fa-envelope"></i></div>
                        <div className="labelbox">
                  <div className="fstlabel">Email: </div>
                  <div className="fstname">{storedval?.email??""}</div>
                 </div>
                </div>
            </div>
            
         </div>
   <div className="pinfohead">
            <div className="pinfotop">
            <div className="iconb">
              <i className="fa fa-zap fa-dark"></i>
              </div>
               <div className="ptitleinfo">User Credits</div>
               </div>
  
            </div>
               <div className="pinfobox1">
            <div className="pinfoboxitem">
             <div className="pinfoboxitemsecond">
              <div className="fnav">
              <i className="fa fa-zap fa-dark"></i>
              </div>
             <span class="fstlabel"> Remaining Credits:</span><div className="fstname">{`${storedval?.credits??0}`}</div>
             </div>
            </div>
            </div>
        </div>

      </div>
    </div>
   
  )
}
export default Dashboard;