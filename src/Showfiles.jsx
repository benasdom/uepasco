import { CloseCircleOutlined,DownloadOutlined } from '@ant-design/icons'
import React from 'react'

const Showfiles=({pdflink,setshowpdf,mainlogo,actualDlink})=>{
    return (
        <div className="texttit" id="waiting" >
        <div className="viewer">
            <div className="pdfloader">
                <div className='imgclose'><div className='closesearch' onClick={()=>setshowpdf(false)}>{<CloseCircleOutlined/>}</div>
                <a target='_blank' href={actualDlink} className="download" style={{marginBottom:5,fontSize:13}}>{<DownloadOutlined style={{marginRight:"5px",fontWeight:900}}/>}Download <div className="prem3"></div></a><img className="logopdf" src={mainlogo} width="150" alt=""/></div>
    <iframe src={pdflink} className="loadpdf" id="loadtext" data-text="Loading...."> Loading....</iframe>
            </div>
         </div>  
       </div> 
    )
}

export default Showfiles