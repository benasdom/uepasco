import React, { useState } from 'react'
import Search from './Search'
import Showfiles from './Showfiles'
import pdfpic from '/imgs/pdf.png'
import { ExportOutlined,
    ArrowLeftOutlined,FileProtectOutlined, AppstoreOutlined,GoldFilled,DollarOutlined,SolutionOutlined,ScheduleOutlined,
LogoutOutlined,
MoneyCollectFilled,TeamOutlined,
} from '@ant-design/icons'
import spinner from '/imgs/loader.svg'
import { Link } from 'react-router-dom'
import mainlogo from '/imgs/titled.png'
import racoon from '/imgs/racoon_job.jpg'
import Overview from './menu/Overview'
import LoadComponent from './Loadcomponent'
import ModelComponent from './ModelComponent'
import { domain, fetchWithAuth, LocalApiPath,userState } from './menu/authfetch'

const SearchList=({
    setsearching,selectedVal,setselectedVal,
    payload,find,setcourseName,setfind,bar,
    setRefreshing,pdf,NetworkError,
    setdataerror,setcredits,
    pdflink,courseName,
    actualDlink,credits,dataerror,
    setpdflink,setactualDlink})=>{
    const [spin, setspin] = useState(false)
    const [fetchError, setfetchError] = useState(false)
    const [currentView, setcurrentView] = useState("")
    const [errorMessage, seterrorMessage] = useState("")
    const [selectModel, setselectModel] = useState(false)
    const [selectlink, setselectlink] = useState("")
    const [showpdf, setshowpdf] = useState(false)
     const [extract, setextract] = useState("loading...")
     const [extractedtext, setextractedtext] = useState("")
     const [raw, setraw] = useState("")

    const fix=(res, courseName)=>{
        setcourseName(courseName);
        setselectModel(true);
        setselectlink(res);
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
        setactualDlink(solutionData.directDownload)
        const solved = solutionData.extractedText;
        const processAIResponse = (response) => {
  // Check if the response is an error object or contains the error string
  if (!response.includes("h3") || response.includes('div class="aierror"') || response.toLowerCase().includes("error")) {
    console.log("Message for dev:AI response indicates an error:", response);
    return "<div class='aierror'>There was an error processing your request.</div><div class='aierror'>This is due to limits and not a network error. You can reclaim your lost credits and choose and choose a different model, or try again later.</div><button>reclaim credits</button>";
  }
  return response; // If it's clean, return the real content
};
const cleanedResponse = processAIResponse(solved);
        setextract(cleanedResponse || "");
        
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
         {showpdf?
<Showfiles 
actualDlink={actualDlink}
raw={raw} pdflink={pdflink} 
mainlogo={mainlogo}
setshowpdf={setshowpdf}
dataerror={dataerror}
credits={credits}
courseName={courseName}
extract={extract}
selectedVal={selectedVal}
       />
:    
<div> 
            <div className="searchnav" > 
            <div className="closesearch" onClick={()=>{setsearching(false);bar.current.value=""}}>
            <div className="bbtn"><div className="ba"><ArrowLeftOutlined/><span className='prem3'></span></div></div>
            </div>

            <Search handleMenu={handleMenu} eprop={"all"} setsearching={setsearching} bar={bar} find={find} setRefreshing={setRefreshing} setfind={setfind}/>

</div>
                        {/* <div className="solnav" style={{color:"golenrod"}} >⚡{userState.credits??"0"}</div> */}

          <div className="bothsides">
            <div className="sidemenubar">
                <div className="mymenubox" onClick={handleMenu}>
                    <div className="rbackdrop"></div>
                    <img className="racoonp" src={racoon} alt="" />
<div className="firstitem">
    <div className="abs">
    </div>
    <Link 
    to="/uelearn/Payment"
target="_blank"
 rel="noopener noreferrer" 
    >
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
    <div className="menuitems logout"style={{padding:20}} onClick={leave}><div className="inmenu"><LogoutOutlined className='micon'/>Logout</div></div>
                
                </div>
            </div>
<div className="mcontent">
         <Menucompt currentView={currentView} setcurrentView={setcurrentView} />
              <div className="listcontent">
                {selectModel?
                <ModelComponent 
                setselectedVal={setselectedVal} 
                selectedVal={selectedVal} 
                setselectModel={setselectModel}
                    getpayload={getpayload}
                    selectlink={selectlink}
                />:false}
               
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
                    return a=<div key={b+""} style={{margin:0, width:"100%"}} className="filtered mn4" data-ptext="title..." data-texts="details..."><div className="desc err4">
                        <img className="reglate" src={mainlogo} style={{marginRight:10}} alt=""/>{NetworkError}</div></div>
                    })}
            </div>
            </div>
          </div>
          </div>}
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