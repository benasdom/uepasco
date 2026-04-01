import { useEffect } from "react"
import { InfoCircleOutlined } from "@ant-design/icons"
import Dashboard from "./Dashboard"
import Earn from "./Earn"
import Leaderboard from "./Leaderboard"
import Referal from "./Referal"
import Nss from "./Nss"
import Job from "./Job"
import Solve from "./Solve"
import Advert from "./Advert"
export default function Overview({currentView,setcurrentView}) {
    const views="dashboard-nss-referal-solve-earn-leaderboard-advert-job".split("-")
const leave=()=>{
    if(confirm("Do you wish to logout"))
    {
        localStorage.removeItem("userInfo");
        location.reload();

    }
    }
  
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
               
                                <div onClick={leave} className="in">
                     <div className="insp"><div className="prem4"></div><span className="fnav">🚪</span>Logout</div></div>
                                <div onClick={()=>{setcurrentView("dashboard")}} className="in">
                     <div className="insp"><div className="prem4"></div><span className="fnav"><i className='fa fa-user fa-dark'></i></span>Profile</div></div>

                <div onClick={()=>{setcurrentView("referal")}} className="in">
                     <div className="insp"><div className="prem4"></div><span className="fnav"><i className='fa fa-users fa-dark'></i></span>Referal</div></div>
                <div onClick={()=>{setcurrentView("earn")}} className="in">
                     <div className="insp"><div className="prem4"></div><span className="fnav"><i className='fa fa-dollar fa-dark'></i></span>Earn</div></div>
                <div onClick={()=>{setcurrentView("nss")}} className="in">
                     <div className="insp"><div className="prem4"></div><span className="fnav"><i className='fa fa-briefcase fa-dark'></i></span>NSS guide</div></div>
                <div onClick={()=>{setcurrentView("solve")}} className="in">
                     <div className="insp"><div className="prem4"></div><span className="fnav"><i className='fa fa-star fa-dark'></i></span>Solve with AI</div></div>
                <div onClick={()=>{setcurrentView("advert")}} className="in">
                     <div className="insp"><div className="prem4"></div><span className="fnav"><i className='fa fa-shop fa-dark'></i></span>Advertise</div></div>
                <div onClick={()=>{setcurrentView("job")}} className="in">
                     <div className="insp"><div className="prem4"></div><span className="fnav"><i className='fa fa-certificate fa-dark'></i></span>Job guide</div></div>
                <div onClick={()=>{setcurrentView("leaderboard")}} className="in">
                     <div className="insp"><div className="prem4"></div><span className="fnav"><i className='fa fa-medal fa-dark'></i></span>leaderboard</div></div>
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
                   To go back, click the search box
                                   </div>
                <div className="construction">
            ♒

                </div>
            <div className="missingtext">Use the links below to navigate through this space</div>

            </div>
        </div>
    )
}