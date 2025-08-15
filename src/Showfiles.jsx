import { CloseCircleOutlined,ArrowDownOutlined,ArrowLeftOutlined,StarTwoTone } from '@ant-design/icons'
import React, { useEffect, useState } from 'react'
import { marked } from "marked";


const Showfiles=({pdflink,setshowpdf,mainlogo,actualDlink,extract})=>{
    const [solns, setsolns] = useState(false)
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
                <a target='_blank' href={actualDlink} className="bbtn">
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
         <div className="toptex"  dangerouslySetInnerHTML={{ __html: extract}}></div>          
    </div>:false}
            </div>
         </div>  
       </div> 
    )
}

export default Showfiles