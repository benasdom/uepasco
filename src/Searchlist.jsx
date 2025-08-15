import React, { useState } from 'react'
import Search from './Search'
import pdfpic from '/imgs/pdf.png'
import { CloseCircleOutlined,ExportOutlined,InfoCircleOutlined,
    ArrowLeftOutlined,FileProtectOutlined, DashboardOutlined,AppstoreOutlined,UserOutlined,
PieChartFilled,  HomeOutlined,GoldFilled,DollarOutlined,SolutionOutlined,ScheduleOutlined,
LogoutOutlined,
MoneyCollectFilled,TeamOutlined,
StarFilled,
} from '@ant-design/icons'
import spinner from '/imgs/loader.svg'
import { Link } from 'react-router-dom'
import mainlogo from '/imgs/Untitled.png'
import Overview from './menu/overview'



const SearchList=({setsearching,payload,find,setfind,bar,setRefreshing,pdf,NetworkError,setshowpdf,setextract,setpdflink,setactualDlink})=>{
   
    const [spin, setspin] = useState(false)
    const [fetchError, setfetchError] = useState(false)
    const [currentView, setcurrentView] = useState("")
    const [errorMessage, seterrorMessage] = useState("")
    const fix=(res)=>{
        setextract("loading...");
        setspin(true);
         let namedfile=res.split("=")[1]
        //  https://pasco-lovat.vercel.app/api/files/
fetch(`http://localhost:5175/api/files/${namedfile}`)
  .then(response => response.json())
  .then(data => {setpdflink(data.previewLink);setactualDlink(data.directDownloa);openpdf(namedfile)})
  .catch(err=>{seterrorMessage(err.message);setspin(false);setfetchError(true)})
  .finally(()=>{setspin(false);})

   fetch(`http://localhost:5175/api/solutions/${namedfile}`)
  .then(response => response.json())
  .then(data => {setextract(data.extractedText);data.error?setextract(data.error):false})
  .catch(err=>{setextract("Extraction failed");setfetchError(true)})


}
const leave=()=>{
    if(confirm("Do you wish to logout"))
    {
        localStorage.removeItem("userInfo");
        location.reload();

    }
    }
    const openpdf=(url)=>{
    setshowpdf(true)
    }
    const handleMenu=()=>{
             document.querySelector(".menucomp").style.cssText="clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);pointer-events:all;";
            document.querySelector(".listcontent").style.cssText="clip-path: polygon(100% 0, 100% 0, 100% 100%, 100% 100%);pointer-events:none;";
        }
    return(
        <div className="searchlist">       
            <div className="searchnav"> 
            <div className="closesearch" onClick={()=>{setsearching(false);bar.current.value=""}}>
            {spin?<img src={spinner} className="spinner" width={200}/>:<div className="bbtn"><div className="ba"><ArrowLeftOutlined/><span className='prem3'></span></div></div>}
            </div>
            <Search handleMenu={handleMenu} eprop={"all"} setsearching={setsearching} bar={bar} find={find} setRefreshing={setRefreshing} setfind={setfind}/>
</div>
          <div className="bothsides">
            <div className="sidemenubar">
                <div className="mymenubox" onClick={handleMenu}>
<div className="firstitem">
    <div className="abs">
    </div>
    <Link to="/uepasco/Payment">
    <div className="paid">✨Go premium ✨</div></Link>
</div>
                <div className="mymenu">
    <div className="menuitems" onClick={()=>{setcurrentView("dashboard")}}><div className="inmenu">< AppstoreOutlined className='micon'/>General </div></div>
    <div className="menuitems" onClick={()=>{setcurrentView("solve")}}><div className="inmenu"><FileProtectOutlined className='micon'/>Solved with slides <div className="prem3">✨</div></div></div>
    <div className="menuitems" onClick={()=>{setcurrentView("leaderboard")}}><div className="inmenu"><GoldFilled className='micon'/>Leaderboard</div></div>
    <div className="menuitems" onClick={()=>{setcurrentView("referal")}}><div className="inmenu"><MoneyCollectFilled className='micon'/>Referal Details</div></div>
    <div className="menuitems" onClick={()=>{setcurrentView("earn")}}><div className="inmenu"><DollarOutlined className='micon'/>Earn <div className="prem3">💰</div></div></div>
    <div className="menuitems" onClick={()=>{setcurrentView("advert")}}><div className="inmenu"><ScheduleOutlined className='micon'/>Advertise your business <div className="prem3">📢</div></div></div>
    <div className="menuitems" onClick={()=>{setcurrentView("nss")}}><div className="inmenu"><SolutionOutlined className='micon'/>NSS Guide</div></div>
    <div className="menuitems" onClick={()=>{setcurrentView("job")}}><div className="inmenu"><TeamOutlined className='micon'/>Job Application Guide</div></div>
                </div>
    <div className="menuitems logout" onClick={leave}><div className="inmenu"><LogoutOutlined className='micon'/>Logout</div></div>
                
                </div>
            </div>
<div className="mcontent">
         <Menucompt currentView={currentView} setcurrentView={setcurrentView}/>
              <div className="listcontent">
            {      find!="" && payload.length>1?payload
                   .filter((a,b,c)=>c.indexOf(a)==b)
                   .filter((a,b,c)=>a.description.toLowerCase().includes(find.toLowerCase()))
                   .sort((a,b)=>b.createdOn.slice(0,4)*1-a.createdOn.slice(0,4)*1)
                   .slice(0,30)
                   .map((a,b)=>{
                    return a=<div className="filtered" key={b+""} data-ptext="title..." title={a.description.replace("-",",")} data-texts="details..."><img src={pdfpic} alt="" className="imgthumb"/>
                    <div className="pinfo">
                        <div className="titles">{(a.description).replace(/o/gi,["⚾","⚽"][b%2])}</div><div className="describe">{a.createdOn}</div>
                        </div><div href={a.downloadLink} onClick={(ev) => fix(ev.target.attributes.href.value)} className="download">{<ExportOutlined style={{marginRight:"5px"}}/>} open<span className='prema'></span></div></div> })
                    :new Array(1).fill("").map((a,b)=>{
                    return a=<div key={b+""} className="filtered mn4" data-ptext="title..." data-texts="details..."><img src="" alt="" className="imgthumb"/><div className="desc err4">
                        <img className="reglate" src={mainlogo} style={{marginRight:10}} alt=""/>{NetworkError}</div></div>
                    })}
            </div>
            </div>
          </div>
          {fetchError && <Toaster setfetchError={setfetchError} errorMessage={errorMessage} />}
        </div>
    )
}
const Toaster=({errorMessage,setfetchError})=>{
    setTimeout(()=>setfetchError(false),2000)
    return (
        
          <div className="toast">
            <div className="toastmessage"><InfoCircleOutlined className='micon'/> {  "Sorry: 🔌 "+errorMessage.toLowerCase()}</div>
          </div>
    )
}
const Menucompt=({currentView,setcurrentView})=>{
    return (
        
    <div className="menucomp">
<div className="menuhead">
    <Overview currentView={currentView} setcurrentView={setcurrentView}/>
</div>
    </div>
    )
}
export default SearchList
