import React from 'react'

const LoadComponet=({opacity,indexed,mainlogo})=>{
    return (
        <div className="texttit" id="waiting" style={{opacity:opacity,zIndex:indexed}}>
        <div className="mtitle" id="waittxt">
            <div className="loading">
                <div className="logo"><img src={mainlogo} width="150" alt=""/></div>
    <div className="loadtext" id="loadtext" data-text="Loading...."> Loading....</div>
            </div>
    
    Questions for various course codes        
        </div>  
       </div> 
    )
}

export default LoadComponet