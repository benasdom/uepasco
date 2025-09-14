import { CloseCircleOutlined,ArrowDownOutlined,ArrowLeftOutlined,StarTwoTone } from '@ant-design/icons'
import React, { useEffect, useState } from 'react'
import spinner from '/imgs/loader.svg'
import { marked } from "marked";


const Showfiles=({pdflink,setshowpdf,mainlogo,actualDlink,extract,dataerror,raw})=>{
    const [solns, setsolns] = useState(false);
    const [rawView, setrawView] = useState(true);
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
    {solns?<div  className="soln">
        <div className="closesearch" onClick={()=>{setsolns(false)}} >
            <div className="bbtn"><div className="ba"><ArrowLeftOutlined/><span className='prem3'></span></div></div>
            
        </div>

        {dataerror.length?<div className='aierror2'>Extraction failed 🚨🚨🚨</div>
        :(extract !="loading..."?<div className='aisuccess'>Extraction successfull <span>✔️✔️✔️</span></div>
        :false)}
        {extract=="loading..."?false
        :<div className="responses"><div className="download" onClick={()=>{setrawView(false)}}><span>raw</span><span className="prem4"></span></div>
        <div className="download" onClick={()=>{setrawView(true)}}><span>
            solved</span><span className="prem4"></span></div></div>}
         <br></br><div className="toptex"  dangerouslySetInnerHTML={{ __html: dataerror.length?
         `<div class='aierror'>${dataerror}</div>`:(rawView?`${extract=="loading..."?
            `<div class="aiload"><div class="think">🧠 Thinking ...</div><img alt='...' src='/imgs/loader.svg' class="spinner rey" width="200"/></div>`
            :marked(extract)}`:raw
)}}></div> 
                     
    </div>:false}
            </div>

         </div>  
       </div> 
    )
}

export default Showfiles