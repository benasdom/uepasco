import React, { useState } from 'react'
import spinner from '/imgs/loader.svg'

const Search=({setsearching,setfind,bar,eprop})=>{
    const [spin, setspin] = useState(false)
    return(
    <div className="twwo" title="search"  onClick={()=>(setsearching(true))}>
                    <div className="search"><i className="fa fa-search"></i></div>
                    
                    <div className="input"><input type="text" style={{pointerEvents:eprop}} ref={bar} onChange={(e)=>{return setfind(e.target.value.trim(""))}}  className="find" placeholder="Search..."/></div>
                    <div className="slash">{spin?<img src={spinner} className="spinner" width={200}/>:"/"}</div>

     </div>
    )
}

export default Search

