import React, { useEffect, useState } from 'react'
import domain,{fetchWithAuth} from './authfetch'
const Dashboard=()=>{
      const [userscore, setuserscore] = useState(null)
      const [maxscore, setmaxscore] = useState(0)
      const [streaks, setstreaks] = useState({steakScore:"",date:""})
    //   const [dp, setdp] = useState([bob,wayne,jessy,brown])
      const storeddata = JSON.parse(localStorage.getItem("userInfo"));

      let accessToken = storeddata?.accessToken;
      let refreshToken = storeddata?.refreshToken;
      let url = domain+'/api/v1/user/streak';
    
      useEffect(() => {
      storeddata?setmaxscore(storeddata?.highestStreakScore):false
        if (accessToken.length && refreshToken.length && typeof(userscore=="number")) {
          let options={
            headers:{Authorization:`Bearer ${accessToken}`},
          }
          fetchWithAuth(url,options,refreshToken,(data)=>{setstreaks(data);setuserscore(data.streakScore)})
        }
      }, []);
      
    const transformdata=()=>{
      let newdate=new Date((streaks.date.split(/T/gim)[0]));
      if(storeddata.useractivedate != null){
        let useractivedate=storeddata.useractivedate
        let predate=new Date((useractivedate[1].split(/T/gim)[0]))
        let diffInDays=Math.floor((newdate - predate) / (1000 * 60 * 60 * 24))
        if(diffInDays > 0){
        updateStreakToOne(diffInDays,useractivedate,newdate);
          console.log("There was a difference so the dates were updated")
        }
        else{
          updateStreakToOne(diffInDays);
    
          console.log("There was no updates made to the date array")
          ;}}
      else{
        if(storeddata.lastLogin){
          let lastvalidlogin=storeddata.lastLogin;
          let olddate=new Date((lastvalidlogin.split(/T/gim)[0]))
          let prevolddated=[olddate]
          let diffed=Math.floor((newdate - olddate) / (1000 * 60 * 60 * 24))
          updateStreakToOne(diffed,prevolddated,newdate);
          console.log("useractive data didnt exist so just updating it")
        }
        else{
          alert("Welcome to cyber earn 🥳🥳🥂")
          console.log("I think we need to update datas")
    
    
        }
    
      }
    }
      const updateStreakToOne=(val,useractivedates,freshdate)=>{
        if (val === 1) {
        console.log("incrementing")
    
    
          if (accessToken && refreshToken && typeof(userscore)=="number") {
            let options={
              method:"POST",
              headers:{"Content-Type":"application/json","Authorization":`Bearer ${accessToken}`},
              body:JSON.stringify((userscore ==0)?{streakScore:1}:{streakScore:userscore+1})
            }
            fetchWithAuth(url,options,refreshToken,(data)=>{
              try{
                localStorage.setItem("userInfo",JSON.stringify({...data,accessToken,refreshToken,useractivedate:[...useractivedates,freshdate].slice(-2)}))}
              catch(err){alert(err)}
              // console.log(JSON.parse(localStorage.getItem("userInfo")))
    
              })
          }    } else if (val > 1) {
            console.log("resetting")
    
            if (accessToken && refreshToken && typeof(userscore)=="number") {
              let options={
                method:"POST",
                headers:{"Content-Type":"application/json","Authorization":`Bearer ${accessToken}`},
                body:JSON.stringify({streakScore:1})
              }
              fetchWithAuth(url,options,refreshToken,(data)=>{
                  try{
                    localStorage.setItem("userInfo",JSON.stringify({...data,accessToken,refreshToken,useractivedate:[...useractivedates,freshdate].slice(-2)}))}
                    catch(err){alert(err)}
              })
            }    
        } else if (val === 0) {
          console.log("maintaining")
      console.log(storeddata)
    
          if (userscore == 0){
            if (accessToken && refreshToken && typeof(userscore)=="number") {
              let options={
                method:"POST",
                headers:{"Content-Type":"application/json","Authorization":`Bearer ${accessToken}`},
                body:JSON.stringify({streakScore:1})
              }
              fetchWithAuth(url,options,refreshToken,(data)=>{
                  try{
                    localStorage.setItem("userInfo",JSON.stringify({...data,accessToken,refreshToken,useractivedate:[...useractivedates,freshdate].slice(-2)}))}
                    catch(err){alert(err)}
                })
            }
          }
          else{
            false
          }
    
            false
        }
      
    }
        let toupdate=true
      useEffect(()=>{
      toupdate?(userscore!=null?setTimeout(transformdata,5000):false):false;
      return ()=>{
        toupdate=false
      }},[userscore])
    return (
          <div className="userlevel">
                <div className="levelitem">

                    <div className="litem">
                        <div className="hint">level</div>
                    <div className="hint"> badge</div>

                    </div>

                    <div className="litem">
                        <div className="hint"> <div className="mtext">Rookie level</div></div>
                        <div className="hint"><div className="pic"> 🥈</div></div>

                    </div>

                </div>
                <div className="levelitem2">
                    <div className="streak">⚡STREAK⚡</div>
                    <div className="streaka">
                        <div className="hint">streak score</div>
                        <div className="hint">Highest streak</div>
                    </div>
                    <div className="streaks">
                        <div className="hint">{userscore !=null?userscore:1}</div>
                        <div className="hint">{maxscore?maxscore:1}</div>

                    </div>
                    <div className="streak"></div>
                </div>
            </div>
    )
}
export default Dashboard;