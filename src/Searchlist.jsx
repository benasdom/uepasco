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
import racoon from '/imgs/racoon_job.jpg'
import Overview from './menu/overview'
import LoadComponent from './Loadcomponent'
import ModelComponent from './ModelComponent'
import { domain, fetchWithAuth, LocalApiPath,userState } from './menu/authfetch'

const SearchList=({
    setsearching,selectedVal,setselectedVal,
    payload,find,setcourseName,setfind,bar,
    setRefreshing,pdf,NetworkError,setshowpdf,
    setdataerror,setcredits,setextract,setraw,
    setpdflink,setactualDlink})=>{
   
    const [spin, setspin] = useState(false)
    const [fetchError, setfetchError] = useState(false)
    const [currentView, setcurrentView] = useState("")
    const [errorMessage, seterrorMessage] = useState("")
    const [selectModel, setselectModel] = useState(false)
    const [selecttrue, setselecttrue] = useState(false)

    const fix=(res, courseName)=>{
        setcourseName(courseName);
        !selectModel?setselectModel(true):false;
        selecttrue?getpayload(res):false;
}

const getpayload=async (res)=>{
    let premiumstatus=JSON.parse(localStorage.userInfo).pStatus
    setselectModel(false);
    setextract("loading...");
    setdataerror("");
    setspin(true);
    setfetchError(false);
    seterrorMessage("");

    let namedfile=res.split("=")[1]
    
    try {
        // Fetch PDF link
        const pdfResponse = await fetch(`${LocalApiPath}/api/files/${namedfile}`);
        
        if (!pdfResponse.ok) {
            throw new Error(`Failed to fetch PDF: ${pdfResponse.status}`);
        }
        
        const pdfData = await pdfResponse.json();
        setpdflink(pdfData.previewLink);
        setraw(pdfData.raw);
        setactualDlink(pdfData.directDownload);
        openpdf(namedfile);
        setspin(false);


        // Fetch solutions via external-api proxy endpoint
        const options = {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(
                { 
               
   "filename": namedfile,
   "selectedVal": selectedVal,
   "premiumstatus": premiumstatus??"premiumstatus"
                    })
        };
        const solutionResponse = await fetchWithAuth(`${domain}/api/v1/request/solutions`, options);
        if (!solutionResponse) {
            throw new Error("No response from solutions API");
        }
        // Handle response from fetchWithAuth
        // fetchWithAuth already returns data.data, so extract the nested api_response.data
        let solutionData;
        let remainingCredits;
        try {
            solutionData = solutionResponse.api_response?.data || solutionResponse;
            remainingCredits = solutionResponse.remaining_credits ?? 0;
            setcredits(remainingCredits);
            // Update localStorage with new credits
            const storedUser = JSON.parse(localStorage.getItem("userInfo") || '{}');
            storedUser.credits = remainingCredits;
            localStorage.setItem("userInfo", JSON.stringify(storedUser));
        } catch (e) {
            solutionData = solutionResponse;
        }
        
        setextract(solutionData.extractedText || "");
        
        if (solutionData.error) {
            setdataerror(solutionData.error);
        } else {
            setraw(solutionData.raw);
        }

    } catch(err) {
        console.error("Error in getpayload:", err);
        setdataerror("Extraction failed: " + (err.message || String(err)));
        setfetchError(true);
        seterrorMessage(err.message || "An error occurred");
        setextract(String(err));
    } finally {
        setspin(false);
        setselecttrue(false);
    }
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
            <div className="searchnav" > 
            <div className="closesearch" onClick={()=>{setsearching(false);bar.current.value=""}}>
            <div className="bbtn"><div className="ba"><ArrowLeftOutlined/><span className='prem3'></span></div></div>
            </div>

            <Search handleMenu={handleMenu} eprop={"all"} setsearching={setsearching} bar={bar} find={find} setRefreshing={setRefreshing} setfind={setfind}/>

</div>
                        <div className="solnav" style={{color:"golenrod"}} >⚡{userState.credits??"0"}</div>

          <div className="bothsides">
            <div className="sidemenubar">
                <div className="mymenubox" onClick={handleMenu}>
                    <div className="rbackdrop"></div>
                    <img className="racoonp" src={racoon} alt="" />
<div className="firstitem">
    <div className="abs">
    </div>
    <Link to="/uelearn/Payment">
    <div className="paid">✨Go premium ✨</div></Link>
</div>
                <div className="mymenu">
    <div className="menuitems" onClick={()=>{setcurrentView("dashboard")}}><div className="inmenu">< AppstoreOutlined className='micon'/>General </div></div>
    <div className="menuitems" onClick={()=>{setcurrentView("solve")}}><div className="inmenu"><FileProtectOutlined className='micon'/>Our Products <div className="prem3">✨</div></div></div>
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
         <Menucompt currentView={currentView} setcurrentView={setcurrentView} />
              <div className="listcontent">
                {selectModel?<ModelComponent setselecttrue={setselecttrue} setselectedVal={setselectedVal} selectedVal={selectedVal} setselectModel={setselectModel}/>:false}
            {      find!="" && payload.length>1?payload
                   .filter((a,b,c)=>c.indexOf(a)==b)
                   .filter((a,b,c)=>a.description.toLowerCase().includes(find.toLowerCase()))
                   .sort((a,b)=>b.createdOn.slice(0,4)*1-a.createdOn.slice(0,4)*1)
                   .slice(0,30)
                   .map((a,b)=>{
                    return <div className="filtered" key={b+""} data-ptext="title..." title={a.description.replace("-",",")} data-texts="details..."><img src={pdfpic} alt="" className="imgthumb"/>
                    <div className="pinfo">
                        <div className="titles">{(a.description).replace(/o/gi,["🧿","⭕"][b%2])}</div><div className="describe">{a.createdOn}</div>
                        </div><div href={(/payment/i.test(a.downloadLink))?"":a.downloadLink} onClick={(ev) => fix(a.downloadLink,a.description)} className="download">{<ExportOutlined style={{marginRight:"5px"}}/>} open<span className='prema'></span></div></div> })
                    :new Array(1).fill("").map((a,b)=>{
                    return a=<div key={b+""} className="filtered mn4" data-ptext="title..." data-texts="details..."><img src="" alt="" className="imgthumb"/><div className="desc err4">
                        <img className="reglate" src={mainlogo} style={{marginRight:10}} alt=""/>{NetworkError}</div></div>
                    })}
            </div>
            </div>
          </div>
          {fetchError && <Toaster setfetchError={setfetchError} errorMessage={errorMessage} />}
          
{spin?<LoadComponent opacity={1} indexed={100} mainlogo={mainlogo}/>:<LoadComponent opacity={0} indexed={-100}/>}
        </div>
    )
}
const Toaster=({errorMessage,setfetchError})=>{
    setTimeout(()=>setfetchError(false),2000)
    return (
<div className="toast">
<div className="successmessage">{  "🔴 Sorry: 🔌 "+errorMessage.toLowerCase()}</div>
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