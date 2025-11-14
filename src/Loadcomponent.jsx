import React from 'react'
import racoonread from '/imgs/racoon_learn.jpg'


const LoadComponent=({opacity,indexed,mainlogo})=>{
    return (
        <div className="texttit" id="waiting" style={{zIndex:indexed}}>
        <div className="mtitle" id="waittxt" style={{opacity:opacity}}>
            <div className="rbackdrop"></div>
            <img src={racoonread} className="racoonload" alt="" srcset="" />
            <div className="loading">
                <div className="logo"><img src={mainlogo} width="150" alt=""/></div>
    <div className="loadtext" id="loadtext" data-text="Loading...."> Loading....</div>
            </div>
    

<span style={{color:"rgba(205,205,245,.3)"}}>
    Questions for various course codes        
    
    </span>
    </div>  
       </div> 
    )
}

export default LoadComponent