import { useState,useEffect } from 'react'

const Search=({setsearching,setfind,bar,eprop,handleMenu})=>{
    const [spin, setspin] = useState(false)

    const handleSearch=()=>{
        setsearching(true)
            const lcontent = document.querySelector(".listcontent");
            if(lcontent) lcontent.style.cssText="pointer-events:all;clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);";
            const mcomp =document.querySelector(".menucomp");
            if(mcomp) mcomp.style.cssText="pointer-events:none;clip-path: polygon(0 0, 0% 0, 0% 100%, 0 100%);";
    }
    useEffect(() => {
     setfind("")
    }, [])
    
    return(
    <div className="twwo" title="search">
                    <div className="search" onClick={handleSearch}><i className="fa fa-search"></i></div>
                    
                    <div className="input" onClick={handleSearch}>
                        <input type="text"
                        style={{pointerEvents:eprop}}
                        ref={bar} onChange={(e)=>{return setfind(e.target.value.trim(""))}}
                        className="find"
                        placeholder="Search a course code..."/></div>
                    <div className="slash" onClick={handleMenu}>{eprop!="all"?"/":"♒"}</div>

     </div>
    )
}

export default Search

