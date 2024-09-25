import React from 'react'
import Search from './Search'
import ConvertApi from 'convertapi-js'
import pdfpic from '/imgs/pdf.png'
import { CloseCircleOutlined } from '@ant-design/icons'


const SearchList=({setsearching,payload,find,setfind,bar,setRefreshing,pdf,NetworkError,setshowpdf,setpdflink})=>{
    const fix=(res)=>{
        setpdflink(res);
        converttotext(res)
        openpdf();
    }
    const converttotext = async (mypdfurl)=>{
      let convertApi = ConvertApi.auth('secret_SNFY1Dcfii6Na6RL')
      let params = convertApi.createParams()
params.add('File', new URL(mypdfurl));
let result = await convertApi.convert('pdf', 'txt', params)
let textres = result.dto.Files.map(a=>a.Url)
fetch(textres).then(res=>res.text()).then(res=>console.log(res))

    }
    const openpdf=()=>{
    setshowpdf(true)
    }
    return(
        <div className="searchlist">
            <div className="searchnav"> 
            <div className="closesearch" onClick={()=>{setsearching(false);bar.current.value=""}}>{<CloseCircleOutlined/>}</div>
                       <Search eprop={"all"} setsearching={setsearching} bar={bar} find={find} setRefreshing={setRefreshing} setfind={setfind}/>
</div>
            <div className="listcontent">
            {
                   find!="" && payload.length>1?payload
                   .filter((a,b,c)=>c.indexOf(a)==b)
                   .filter((a,b,c)=>a.description.toLowerCase().includes(find.toLowerCase()))
                      .map((a,b)=>{
                    return a=<div className="filtered" key={b+""} data-ptext="title..." title={a.description.replace("-",",")} data-texts="details..."><img src={pdfpic} alt="" className="imgthumb"/>
                    <div className="titles">{a.description}</div><div className="describe">{a.createdOn}</div><div href={a.downloadLink} onClick={(ev) => fix(ev.target.attributes.href.value)} className="download">open</div></div> })
                    :new Array(1).fill("").map((a,b)=>{
                    return a=<div key={b+""} className="filtered mn4" data-ptext="title..." data-texts="details..."><img src="" alt="" className="imgthumb"/><div className="desc err4">{NetworkError}</div></div>
                    })}
            </div>
        </div>
    )
}

export default SearchList