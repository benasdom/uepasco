import React from 'react'

const Search=({setsearching,setfind,bar,eprop})=>{
    return(
    <div className="twwo" title="search"  onClick={()=>(setsearching(true))}>
                    <div className="search"><i className="fa fa-search"></i></div>
                    
                    <div className="input"><input type="text" style={{pointerEvents:eprop}} ref={bar} onChange={(e)=>{return setfind(e.target.value.trim(""))}}  className="find" placeholder="Search..."/></div>
                    <div className="slash">/</div>

     </div>
    )
}

export default Search

