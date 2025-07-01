import React, { useState } from 'react'
import spinner from '/imgs/loader.svg'

const Search=({setsearching,setfind,bar,eprop,handleMenu})=>{
    const [spin, setspin] = useState(false)

    const handleSearch=()=>{
        setsearching(true)
            document.querySelector(".listcontent").style.cssText="pointer-events:all;clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);";
            document.querySelector(".menucomp").style.cssText="pointer-events:none;clip-path: polygon(0 0, 0% 0, 0% 100%, 0 100%);";

    }
    return(
    <div className="twwo" title="search">
                    <div className="search" onClick={handleSearch}><i className="fa fa-search"></i></div>
                    
                    <div className="input" onClick={handleSearch}><input type="text" style={{pointerEvents:eprop}} ref={bar} onChange={(e)=>{return setfind(e.target.value.trim(""))}}  className="find" placeholder="Search..."/></div>
                    <div className="slash" onClick={handleMenu}>{"/"}</div>

     </div>
    )
}

export default Search

