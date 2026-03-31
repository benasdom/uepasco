import { CloseCircleOutlined,FileProtectOutlined,ArrowDownOutlined,SolutionOutlined,ArrowLeftOutlined,StarTwoTone,SaveOutlined } from '@ant-design/icons'
import React, { useEffect, useState } from 'react'
import spinner from '/imgs/loader.svg'
import { marked } from "marked";
import { Link } from 'react-router-dom'
import {domain, fetchWithAuth,LocalApiPath } from './menu/authfetch';
import racoon_learn from '/imgs/racoon_learn.jpg'
import racoon_save from '/imgs/save.jpg'
import PdfViewer from './menu/PdfViewer';

const MAX_RECENTS = 5;

const saveToRecents = (courseName, extract) => {
  const stored = JSON.parse(localStorage.getItem('recentSolutions') || '[]');
  const filtered = stored.filter(x => x.course !== courseName);
  const updated = [{ course: courseName, solution: extract, savedAt: Date.now() }, ...filtered].slice(0, MAX_RECENTS);
  localStorage.setItem('recentSolutions', JSON.stringify(updated));
};

const getRecents = () => JSON.parse(localStorage.getItem('recentSolutions') || '[]');
const Showfiles=({pdflink,courseName,selectedVal,setshowpdf,mainlogo,actualDlink,credits,extract,dataerror,raw})=>{
    const [solns, setsolns] = useState(false);
    const [recentItems, setRecentItems] = useState(getRecents());
    const [iframeLoaded, setIframeLoaded] = useState(false);
    const [storeme, setstoreme] = useState(false);
    const [rawView, setrawView] = useState(true);
    const [sideTabs, setSideTabs] = useState(false);
    const [savedquery, setsavedquery] = useState(null); // ADDED THIS LINE
    const [founditems, setfounditems] = useState([]);

    const enableEdit=()=>{
        document.querySelector(".toptex").setAttribute("contenteditable","true");
        document.querySelector(".toptex").focus();
    }    
  
    //  https://pasco-lovat.vercel.app/api/files/
    // https://ue-past-questions-back.vercel.app/
        const storedRaw = localStorage.getItem('userInfo');
        const stored = JSON.parse(storedRaw);
        const refreshToken = stored?.refreshToken;
        if(!stored?.accessToken){
            alert('Missing access token. Please login again.');
            return;
        }
        const controller = new AbortController();
        const timeout = setTimeout(()=>{
            controller.abort();
        }, 8000);
    const findSaved=async ()=>{
        try{
    const options = {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${stored.accessToken}`,
        },
        signal: controller.signal,
    };  


   let founditems = await fetchWithAuth(domain+`/api/v1/solutions/queries`,options);
   // Extract nested response data (fetchWithAuth already returns data.data)
   founditems = founditems?.api_response?.data || founditems;
   setfounditems(founditems);
console.log("Hasty",founditems);
}
        catch(err){
            if(err.name === 'AbortError'){
                alert('Save request timed out. Please try again.');
            } else {
                console.error('save error', err);
                alert('Error saving solution: '+(err.message||err));
            }
        }finally{
            clearTimeout(timeout);
        }
    }
    useEffect(() => {
      findSaved();
    }, [])

useEffect(() => {
  if (extract && extract !== "loading..." && !dataerror.length) {
    saveToRecents(courseName, extract);
    setRecentItems(getRecents());
  }
}, [extract]);
    
    return (
        <div className="texttit" id="waiting" >
        <div className="viewer">
            <div className="pdfloader">
                <div className='pdfnav'>
                    <div className="pdfnavcontainer">
                    <div className='closesearch' onClick={()=>setshowpdf(false)}>
                    <div className="bbtn"><div className="ba"><i className='fa fa-close'></i><span className='prem3'></span></div></div> 
                    </div>
                    <div className="pnleft">
                {iframeLoaded || raw ? (
  <>
    {/download/gi.test(actualDlink)?<a target='_blank' href={LocalApiPath+actualDlink} download className="bbtn">
      {<ArrowDownOutlined/>} 
      <div className="prem3"></div>
    </a>:<></>}
    <div className="download" onClick={()=>{setsolns(true)}} style={{marginBottom:5,fontSize:13}}>
      <div className="fnav"><i className='solstar'>✨</i></div> Solution 
      <div className="prem3"></div>
    </div>
  </>
) : (
  <>
    <div className="download refloader"></div>
    <div className="download refloader"></div>
  </>
)}
    <img className="logopdf" src={mainlogo} width="150" alt=""/></div></div>
    </div>
{/* <iframe 
// src={`https://docs.google.com/viewer?url=${LocalApiPath}${pdflink}&embedded=true`}
src={`${LocalApiPath}${pdflink}&embedded=true`}
className="loadpdf" 
  data-text="Loading...."
onLoad={() => setTimeout(() => setIframeLoaded(true), 4000)}
> Loading....
</iframe> */}

{<PdfViewer 
url={`${LocalApiPath}${pdflink}&embedded=true`} 
setIframeLoaded={setIframeLoaded}
/>}
    {solns?
    <div  className="soln">
    <div  className="solntop">
       <div className="rbackdrop" style={{zIndex:1}}></div>
        <div className="closesearch" onClick={()=>{setsolns(false); setsavedquery(null);}} >
            <div className="bbtn"><div className="ba"><ArrowLeftOutlined/><span className='prem3'></span></div></div>
            
        </div>
        {extract !="loading..."?
        <div className="solmenu">
            <div className="solnav" style={{color:"golenrod"}} ><span className="goldtop">⚡</span>{credits??"0"}</div>
                <Link to="/uelearn/Payment"
                target="_blank"
                 rel="noopener noreferrer"
                >
            
            <div className="solnav clickable" >
            <span className="goldtop">
            💸</span> Top up</div>
            </Link>
            <div className="imgsmall">
             <img className="logopdf" src={mainlogo} width="200" alt=""/></div>
        </div>:<div className="solmenu">
            <div className="solnav refloader" ></div>
            <div className="solnav refloader" ></div>
            <div className="solnav refloader" ></div>

            </div>}

        </div>

        {dataerror.length?<div className='aierror2'>Extraction failed 🚨🚨🚨</div>
        :(extract !="loading..."?<div className='aisuccess'>Extraction successfull <span>✔️✔️✔️</span></div>
        :false)}
        {extract=="loading..."?<div  className="responses ">
            <div className="download refloader" ></div>
            <div className="download refloader" ></div>
            <div className="download refloader" ></div>
            <div className='download soltoggle' onClick={()=>setSideTabs(!sideTabs)} style={{width:40,aspectRatio:"1/1"}}><span className='fnav'><i className='fa fa-hamburger'></i></span>more</div>

            </div>
        :<div className="responses"><div className="rbackdrop" style={{zIndex:0,bottom:0,position:"absolute"}}></div><div className="download" onClick={()=>{setrawView(false)}}><span><div className="fnav"><i className='fa fa-box'></i></div> Raw</span><span className="prem4"></span></div>
        <div className="download" onClick={()=>{setrawView(true)}}><span>
          <div className="fnav"><i className='fa fa-check'></i></div>  Solved</span><span className="prem4"></span></div><div className='download' onClick={enableEdit}><span><div className="fnav"><i className='fa fa-pen'></i></div>Edit Response</span><span className="prem4"></span></div>
        {savedquery && <div className='download today' onClick={()=>{setsavedquery(null);setrawView(true)}} style={{background: 'rgb(115, 191, 2)'}}><span>☀️ TODAYS QUERY</span><span className="prem4"></span></div>}
        {<div className='download' onClick={()=>setSideTabs(!sideTabs)} style={{width:40,aspectRatio:"1/1"}}><span className='fnav'><i className='fa fa-hamburger'></i></span>more</div>}
        </div>}
         <br></br>
         <div className="midsection">
            {extract=="loading" || sideTabs?<div className="tabs" >
               <div className="history-data">
                            <div className=' soltoggle' onClick={()=>setSideTabs(!sideTabs)} 
                            style={{position:'absolute',width:40,aspectRatio:"1/1",right:0,margin:10}}><div className="fnav"><i className='fa fa-hamburger'></i></div></div>


            <div className="rlearn" >
                <img src={racoon_learn} alt="" className="racoon" style={{margin:10}}/>
            </div>
            <div className="rbackdrop" style={{zIndex:0,bottom:0,position:"absolute"}}></div>

          <div className="history-data-block">
            <div className="sidebarbtns">
            <div className='sideopts' onClick={()=>{setstoreme(true)}}><span className="prem2"></span>
                <div className="tabbtn"><SaveOutlined size={10}/></div>
                <div className="tabbtn" >save</div>
                
                </div>
            <div className='sideopts'  onClick={()=>{setrawView(false)}}><span className="prem2"></span>
                <div className="tabbtn"><SolutionOutlined size={10}/></div>
                <div className="tabbtn">raw</div>
                </div>
            <div className='sideopts'  onClick={()=>{setrawView(true)}}><span className="prem2"></span>
                <div className="tabbtn"><FileProtectOutlined size={10}/></div>
                <div className="tabbtn">solved</div>

                </div>
                </div>
                    <input type="search" name="" placeholder='🔍find saved query' id="searchsolved" />

             <div className="tabbtn" style={{ width: "100%", marginTop: 10,padding:5, opacity: 0.6 }}>
<span style={{margin:"auto",fontSize:11}}>
<SolutionOutlined size={3}/><span style={{paddingLeft:6}}> Saved queries</span>   

</span>
   </div>
        <div className="history-data-box">
         
  {founditems?.solutions?.length > 0
    ? founditems.solutions.map((x, y) => (
        <div
          className="history-data-item"
          onClick={() => { setsavedquery(x); setrawView(true); }}
          key={y + ""}
          style={{
            background: savedquery?.id === x.id ? '#e6f7ff14' : 'transparent',
            borderLeft: savedquery?.id === x.id ? '4px solid #00ff11ff' : 'none'
          }}
        >
          <div className="hdi-text"><span className="fnav">📜</span><span className='chistory'>{x.course}</span></div>
          <div className="hdi-opts">...</div>
        </div>
      ))
    : (
      <div className="history-data-item">
        <div className="hdi-text">No saved queries</div>
      </div>
    )
  }</div>
          </div>


  {recentItems.length > 0 && (
    <>
      <div className="tabbtn" style={{ width: "100%", marginTop: 10, opacity: 0.6 }}>
<span style={{margin:"auto",fontSize:11}}>
        🕓 <span style={{ paddingLeft: 3 }}>Recents</span>

</span>      </div>
      {recentItems.map((x, y) => (
        <div
          className="history-data-item"
          onClick={() => { setsavedquery(x); setrawView(true); }}
          key={"recent-" + y}
          style={{
            background: savedquery?.course === x.course ? '#e6f7ff14' : 'transparent',
            borderLeft: savedquery?.course === x.course ? '4px solid orange' : 'none'
          }}
        >
          <div className="hdi-text"><span className="fnav">📜</span><span className='chistory'>{x.course}</span></div>
          <div className="hdi-opts">~</div>
        </div>
      ))}
    </>
  )}
</div>
                         </div>:<></>}
            {extract !="loading"?<div className={sideTabs?"toptex":" toptex toptex2"}  dangerouslySetInnerHTML={{ __html: dataerror.length && !savedquery?
         `<div class='aierror'>${dataerror}</div>`:(rawView?`${marked(savedquery?.solution || extract)}`:raw?.replace(/(university.?of.?ghana)|(all.?rights.?reserved)/gim,"")??""
)}}>
    </div>:<div className="toptex refloader2"></div>} </div>
                     
    </div>:false}
            </div>

         </div>  
         {storeme?<Showsavebox    
         selectedVal={selectedVal}
         courseName={courseName}
         setstoreme={setstoreme}
         extract={extract}
         mainlogo={mainlogo}/>:false}
       </div> 
    )
}

export default Showfiles

const Showsavebox=({setstoreme,extract,courseName,selectedVal})=>{
    const [notemessage,setnotemessage] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [fetchError, setfetchError] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    const saveme=async()=>{
        if("Dont save bad responses" != notemessage){
            setErrorMessage('Please type the note correctly to proceed');
            setfetchError(true);
            return;
        }
        const storedRaw = localStorage.getItem('userInfo');
        if(!storedRaw){
            setErrorMessage('Please login to save solutions');
            setfetchError(true);
            return;
        }
        const stored = JSON.parse(storedRaw);
        const refreshToken = stored?.refreshToken;
        if(!stored?.accessToken){
            setErrorMessage('Missing access token. Please login again.');
            setfetchError(true);
            return;
        }

        setIsSaving(true);
        const controller = new AbortController();
        const timeout = setTimeout(()=>{
            controller.abort();
        }, 8000); // 8s timeout to avoid long hangs
try{
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${stored.accessToken}`,
        },
        body: JSON.stringify({
            courseName,
            solution:extract,
            validated:false,
            modelName: selectedVal,
        }),
        signal: controller.signal,
    };  
   let final = await fetchWithAuth(domain+`/api/v1/solutions/`,options);
   // Extract nested response data (fetchWithAuth already returns data.data)
   final = final?.api_response?.data || final;
console.log(final)
   // show success toast briefly, then close save modal
   setSuccessMessage('Saved successfully 🥳🥳');
   setTimeout(()=>{
       setSuccessMessage('');
       setstoreme(false);
   },1500);
}
        catch(err){
            if(err.name === 'AbortError'){
                setErrorMessage('Save request timed out. Please try again.');
                setfetchError(true);
            } else {
                console.error('save error', err);
                setErrorMessage('Error saving solution: '+(err.message||err));
                setfetchError(true);
            }
        }finally{
            clearTimeout(timeout);
            setIsSaving(false);
            // do not immediately close here: close happens after showing success toast
        }
    }
    return (
        <div className="storesoln">
                     {fetchError && <Toaster setfetchError={setfetchError} errorMessage={errorMessage} />}
                    {successMessage && <SuccessToaster message={successMessage} />}

            <div className="storesolnbody">
                <div className="savetitle" style={{zIndex:2}}>Save response</div>
                <div className="saveimg">
                    <img className="saveimgitem" src={racoon_save} />
                    <div className="rbackdrop" style={{left:0,height:"220px",opacity:.8}}></div>

                </div>
                    <div className="bbtn2" style={{zIndex:2}} onClick={()=>{setstoreme(false)}}><div className="ba"><CloseCircleOutlined/><span className='prem3'></span></div></div> 

                <p className="note">Note: Dont save bad responses</p>
                <p className="notemessage">Saving your good responses helps you not to spend your credits for same topics</p>
                <div className="savebox"><input type="text" onChange={(e) => setnotemessage(e.target.value)} className="savetext" placeholder="Please type the above 'Note'" /></div>
                <div className="download btnlight" onClick={saveme}><div className="ba">{isSaving?"Saving...":"Save"}<span className='prem2'></span></div></div>
            </div>
        </div>

    )}

    
const Toaster=({errorMessage,setfetchError})=>{
    setTimeout(()=>setfetchError(false),2000)
    return (
<div className="toast">
<div className="successmessage">{  "🔴 "+errorMessage.toLowerCase()}</div>
</div>
    )
}

const SuccessToaster=({message})=>{
    setTimeout(()=>{},2000)
    return (
<div className="toast">
<div className="successmessage" style={{color:'#3c763d'}}>{  "✅ "+message}</div>
</div>
    )
}