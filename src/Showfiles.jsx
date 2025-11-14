import { CloseCircleOutlined,FileProtectOutlined,ArrowDownOutlined,SolutionOutlined,ArrowLeftOutlined,StarTwoTone,SaveOutlined } from '@ant-design/icons'
import React, { useEffect, useState } from 'react'
import spinner from '/imgs/loader.svg'
import { marked } from "marked";
import domain, { fetchWithAuth } from './menu/authfetch';
import racoon_learn from '/imgs/racoon_learn.jpg'


const Showfiles=({pdflink,setshowpdf,mainlogo,actualDlink,credits,extract,dataerror,raw})=>{
    const [solns, setsolns] = useState(false);
    const [storeme, setstoreme] = useState(false);
    const [rawView, setrawView] = useState(true);

    const enableEdit=()=>{
        document.querySelector(".toptex").setAttribute("contenteditable","true");
        document.querySelector(".toptex").focus();
    }    
  
    //  https://pasco-lovat.vercel.app/api/files/

    return (
        <div className="texttit" id="waiting" >
        <div className="viewer">
            <div className="pdfloader">
                <div className='pdfnav'>
                    <div className="pdfnavcontainer">
                    <div className='closesearch' onClick={()=>setshowpdf(false)}>
                    <div className="bbtn"><div className="ba"><CloseCircleOutlined/><span className='prem3'></span></div></div> 
                    </div>
                    <div className="pnleft">
                <a target='_blank' href={"http://localhost:5175"+actualDlink}  download className="bbtn">
                    {<ArrowDownOutlined/>} 
    <div className="prem3"></div></a>
                <div className="download" onClick={()=>{setsolns(true)}} style={{marginBottom:5,fontSize:13}}>
                    {<StarTwoTone style={{marginRight:"5px",fontWeight:900}}/>}Solution 
    <div className="prem3"></div></div>
    <img className="logopdf" src={mainlogo} width="150" alt=""/></div></div>

    </div>
    <iframe src={"http://localhost:5175"+pdflink} className="loadpdf" id="loadtext" data-text="Loading...."> Loading....</iframe>
    {solns?
    <div  className="soln">
    <div  className="solntop">
        <div className="closesearch" onClick={()=>{setsolns(false)}} >
            <div className="bbtn"><div className="ba"><ArrowLeftOutlined/><span className='prem3'></span></div></div>
            
        </div>
        <div className="solmenu">
            <div className="download" style={{pointerEvents:"none"}}>credits Left:{credits??"0"}</div>
            <div className="download" style={{pointerEvents:"none"}}>buy more</div>
            <div className="download" style={{pointerEvents:"none"}}>credits</div>
            <div className="imgsmall">
             <img className="logopdf" src={mainlogo} width="200" alt=""/></div>
        </div>

        </div>

        {dataerror.length?<div className='aierror2'>Extraction failed 🚨🚨🚨</div>
        :(extract !="loading..."?<div className='aisuccess'>Extraction successfull <span>✔️✔️✔️</span></div>
        :false)}
        {extract=="loading..."?false
        :<div className="responses"><div className="rbackdrop" style={{zIndex:0,bottom:0,position:"absolute"}}></div><div className="download" onClick={()=>{setrawView(false)}}><span>Raw</span><span className="prem4"></span></div>
        <div className="download" onClick={()=>{setrawView(true)}}><span>
            Solved</span><span className="prem4"></span></div><div className='download' onClick={enableEdit}><span>Edit Response</span><span className="prem4"></span></div></div>}
         <br></br><div className="midsection"><div className="tabs">
            <div className="rlearn" >
                <img src={racoon_learn} alt="" className="racoon" style={{margin:10}}/>
            </div>
            <div className="rbackdrop" style={{zIndex:0,bottom:0,position:"absolute"}}></div>

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
            <div className="toptex"  dangerouslySetInnerHTML={{ __html: dataerror.length?
         `<div class='aierror'>${dataerror}</div>`:(rawView?`${extract=="loading..."?
            `<div class="aiload"><div class="think">🧠 Thinking ...</div><img alt='...' src='/imgs/loader.svg' class="spinner rey" width="200"/></div>`
            :marked(extract)}`:raw
)}}>
    </div> </div>
                     
    </div>:false}
            </div>

         </div>  
         {storeme?<Showsavebox setstoreme={setstoreme} extract={extract} mainlogo={mainlogo} />:false}
       </div> 
    )
}

export default Showfiles

const Showsavebox=({setstoreme,extract,mainlogo})=>{
    const [title, settitle] = useState("");
    const [desc, setdesc] = useState(""); 
    const [isSaving, setIsSaving] = useState(false);

    const saveme=async()=>{
        // Basic client-side checks
        const storedRaw = localStorage.getItem('userInfo');
        if(!storedRaw){
            alert('Please login to save solutions');
            return;
        }
        const stored = JSON.parse(storedRaw);
        if(!stored?.accessToken){
            alert('Missing access token. Please login again.');
            return;
        }

        setIsSaving(true);
        const controller = new AbortController();
        const timeout = setTimeout(()=>{
            controller.abort();
        }, 8000); // 8s timeout to avoid long hangs

        try{
            const resp = await fetch(domain+"/api/savesolution",{
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${stored.accessToken}`
                },
                body: JSON.stringify({title,desc,solution:extract}),
                signal: controller.signal
            });

            clearTimeout(timeout);

            // If aborted, fetch will throw; check response
            if(!resp.ok){
                const errBody = await resp.text().catch(()=>null);
                console.error('save resp not ok', resp.status, errBody);
                alert('Error saving solution: '+(errBody || resp.statusText || resp.status));
                return;
            }

            const data = await resp.json().catch(()=>null);
            if(data && data.success){
                alert('Saved successfully');
                setstoreme(false);
            } else {
                console.error('save returned unexpected body', data);
                alert('Error saving solution: '+(data?.error || JSON.stringify(data) || 'Unknown'));
            }
        }catch(err){
            if(err.name === 'AbortError'){
                alert('Save request timed out. Please try again.');
            } else {
                console.error('save error', err);
                alert('Error saving solution: '+(err.message||err));
            }
        }finally{
            clearTimeout(timeout);
            setIsSaving(false);
        }
    }
                <div className={"bbtn savebtn" + (isSaving? ' disabled' : '')} onClick={()=>{ if(!isSaving) saveme(); }}>
                    <div className="ba">{isSaving? 'Saving...' : 'Save Solution'}<span className='prem3'></span></div>
                </div>
    return (
        <div className="storesoln">
            <div className="storesolntop">
                <div className="closesearch"   >
                    <div className="bbtn" onClick={()=>{setstoreme(false)}}><div className="ba"><CloseCircleOutlined/><span className='prem3'></span></div></div>
                </div>
                <div className="imgsmall">
                    <img className="logopdf" src={mainlogo} width="200" alt=""/></div>
            </div>
            <div className="storesolnbody">
                <p>Save this as a good response</p>
                <div className="download" onClick={saveme}><div className="ba">Save<span className='prem3'></span></div></div>
                <div className="download" onClick={()=>{setstoreme(false)}}><div className="ba">reject<span className='prem3'></span></div></div>
            </div>
        </div>

    )}
