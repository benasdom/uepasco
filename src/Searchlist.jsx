import React, { useState } from 'react'
import Search from './Search'
import ConvertApi from 'convertapi-js'
import pdfpic from '/imgs/pdf.png'
import { CloseCircleOutlined,ExportOutlined,InfoCircleOutlined,
    ArrowLeftOutlined,FileProtectOutlined, DashboardOutlined,AppstoreOutlined,UserOutlined,
PieChartFilled,  HomeOutlined,GoldFilled,DollarOutlined,SolutionOutlined,ScheduleOutlined,
MoneyCollectFilled,TeamOutlined,
StarFilled,
} from '@ant-design/icons'
import premimg from '/imgs/premium.png'
import spinner from '/imgs/loader.svg'
import mainlogo from '/imgs/Untitled.png'


const SearchList=({setsearching,payload,find,setfind,bar,setRefreshing,pdf,NetworkError,setshowpdf,setpdflink,setactualDlink})=>{
    const [spin, setspin] = useState(false)
    const fix=(res)=>{
        setspin(true)
         let namedfile=res.split("=")[1]

fetch(`https://pasco-lovat.vercel.app/api/files/${namedfile}`)
  .then(response => response.json())
  .then(data => {setpdflink(data.previewLink);setactualDlink(data.directDownload);converttotext(data.directDownload);openpdf()})
  .catch(err=>{alert(err.message)})
  .finally(()=>{setspin(false);})

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
            <div className="closesearch" onClick={()=>{setsearching(false);bar.current.value=""}}>
            {spin?<img src={spinner} className="spinner" width={200}/>:<div className="backbtn"><ArrowLeftOutlined/></div>}
            </div>
                       <Search eprop={"all"} setsearching={setsearching} bar={bar} find={find} setRefreshing={setRefreshing} setfind={setfind}/>
</div>
          <div className="bothsides">
            <div className="sidemenubar">
                <div className="mymenubox">
<div className="firstitem">
    <div className="abs">
    <img src={premimg} className="primg" alt="" />
    <img src={premimg} className="primg" alt="" />
    </div>
    <div className="paid">Go premium </div>
</div>
                <div className="mymenu">

    <div className="menuitems"><div className="inmenu">< AppstoreOutlined className='micon'/>Overview</div></div>
    <div className="menuitems"><div className="inmenu"><FileProtectOutlined className='micon'/>Solved with slides <div className="prem">Premium</div></div></div>
    <div className="menuitems"><div className="inmenu"><PieChartFilled className='micon'/>Dashboard</div></div>
    <div className="menuitems"><div className="inmenu"><GoldFilled className='micon'/>Leaderboard</div></div>
    <div className="menuitems"><div className="inmenu"><MoneyCollectFilled className='micon'/>Referal Details</div></div>
    <div className="menuitems"><div className="inmenu"><DollarOutlined className='micon'/>Earn</div></div>
    <div className="menuitems"><div className="inmenu"><ScheduleOutlined className='micon'/>Advertise your business</div></div>
    <div className="menuitems"><div className="inmenu"><SolutionOutlined className='micon'/>NSS Guide</div></div>
    <div className="menuitems"><div className="inmenu"><TeamOutlined className='micon'/>Job Application Guide</div></div>
                </div></div>
            </div>
              <div className="listcontent">
            {
                   find!="" && payload.length>1?payload
                   .filter((a,b,c)=>c.indexOf(a)==b)
                   .filter((a,b,c)=>a.description.toLowerCase().includes(find.toLowerCase()))
                   .sort((a,b)=>b.createdOn.slice(0,4)*1-a.createdOn.slice(0,4)*1)
                   .slice(0,30)
                   .map((a,b)=>{
                    return a=<div className="filtered" key={b+""} data-ptext="title..." title={a.description.replace("-",",")} data-texts="details..."><img src={pdfpic} alt="" className="imgthumb"/>
                    <div className="pinfo">
                        <div className="titles">{a.description}</div><div className="describe">{a.createdOn}</div>
                        </div><div href={a.downloadLink} onClick={(ev) => fix(ev.target.attributes.href.value)} className="download">{<ExportOutlined style={{marginRight:"5px"}}/>} open</div></div> })
                    :new Array(1).fill("").map((a,b)=>{
                    return a=<div key={b+""} className="filtered mn4" data-ptext="title..." data-texts="details..."><img src="" alt="" className="imgthumb"/><div className="desc err4">
                        <img className="reglate" src={mainlogo} style={{marginRight:10}} alt=""/>{NetworkError}</div></div>
                    })}
            </div>
          </div>
        </div>
    )
}

export default SearchList