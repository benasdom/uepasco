import { useEffect } from "react"
import { InfoCircleOutlined } from "@ant-design/icons"
import Dashboard from "./dashboard"
import Earn from "./Earn"
import Leaderboard from "./Leaderboard"
import Referal from "./Referal"
import Nss from "./Nss"
import Job from "./Job"
import Solve from "./Solve"
import Advert from "./Advert"
export default function Overview({currentView,setcurrentView}) {
    const views="dashboard-nss-referal-solve-earn-leaderboard-advert-job".split("-")

  
    return (
        <div className="profile">
          <div className="wrap">
            {currentView==views[0]?<Dashboard/>
          :(currentView==views[1]?<Nss/>
          :(currentView==views[2]?<Referal/>
          :(currentView==views[3]?<Solve/>
          :(currentView==views[4]?<Earn/>
          :(currentView==views[5]?<Leaderboard/>
          :(currentView==views[6]?<Advert/>
          :(currentView==views[7]?<Job/>:<MissingComp/>)))))))
          }
          </div>
            <div className="onmenu">
                <div onClick={()=>{setcurrentView("referal")}} className="in">
                     <div className="insp"><div className="prem4"></div>Referal</div></div>
                <div onClick={()=>{setcurrentView("earn")}} className="in">
                     <div className="insp"><div className="prem4"></div>Earn</div></div>
                <div onClick={()=>{setcurrentView("nss")}} className="in">
                     <div className="insp"><div className="prem4"></div>NSS guide</div></div>
                <div onClick={()=>{setcurrentView("solve")}} className="in">
                     <div className="insp"><div className="prem4"></div>Solve with AI</div></div>
                <div onClick={()=>{setcurrentView("advert")}} className="in">
                     <div className="insp"><div className="prem4"></div>Advertise</div></div>
                <div onClick={()=>{setcurrentView("job")}} className="in">
                     <div className="insp"><div className="prem4"></div>Job guide</div></div>
                <div onClick={()=>{setcurrentView("leaderboard")}} className="in">
                     <div className="insp"><div className="prem4"></div>leaderboard</div></div>
            </div>

    </div>
  )
}
const MissingComp=()=>{
    return(
        <div className="userlevel">
            <div className="missing">
                <div className="missingtext">
                    
                   <InfoCircleOutlined className="micon"/> 
    This page is currently under construction
                </div>
                <div className="construction">
            🚧

                </div>
            </div>
        </div>
    )
}