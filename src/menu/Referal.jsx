import bob from '../../public/imgs/bob.jpg';
import jessy from '../../public/imgs/jessy.jpg';
import brown from '../../public/imgs/brown.jpg';
import guylogs from '../../public/imgs/guylogs.png';
import rbadge from '../../public/imgs/reff.png'
import {MoneyCollectOutlined,ThunderboltFilled } from '@ant-design/icons'
import { useState,useEffect } from 'react'
import domain, { fetchWithAuth } from './authfetch'

const dp=[bob, jessy,guylogs, brown];

const Referal=()=>{
    const [seen, setseen] = useState(true)
    const [reflink, setreflink] = useState("")
    const [refered, setrefered] = useState([])
    const [score, setscore] = useState(0)
    const [loaded,setloaded] = useState(false)
    const [showing,setshowing] = useState(false)
    const [message,setmessage] = useState("")
let cred=JSON.parse(localStorage.getItem("userInfo"))

    let refcode= cred?.userReferalCode

useEffect(() => {
  if(refcode){
    setreflink(`${refcode}`)}
  else{false}
}, [])

    const handleCopy=()=>{
    navigator.clipboard.writeText(reflink);
    setmessage("copied successfully !!!");
    setTimeout(() => {
      setmessage("")
    }, 3000);
    setseen(false);
    setTimeout(()=>{setseen(true)},1000)
    }

    const seterrors = (pop) => {
        setmessage(pop);
        setshowing(true);
        setTimeout(() => {
            setshowing(false);
        }, 6000);
    };
        useEffect(() => {
            if (showing) {
                const messageElement = document.querySelector(".successmessage");
                if (messageElement) {
                    /success/gim.test(message)?messageElement.textContent = "🟢"+message+"🥳🥳🥳"
                    :messageElement.textContent = "🔴"+message;
        
                }
            }
        }, [message, showing]);

const storeddata = JSON.parse(localStorage.getItem("userInfo"));
  let url = domain+'/api/v1/user/referals';
  let accessToken = storeddata?.accessToken;
  let refreshToken = storeddata?.refreshToken;
  const options={
    headers: { Authorization: `Bearer ${accessToken}` }
  }

  useEffect(() => {
    if (accessToken && refreshToken) {
      fetchWithAuth(url,options,refreshToken,(data)=>{setrefered(data);setloaded(true)})
      .catch((err)=>{seterrors(`${err}`.toLowerCase().replace(/typeerror/gim,"Sorry"));setloaded(true)})
    }
  }, [url]);

    return (
          <div className="rlevel">

                    <img src={rbadge} className="refbadge" alt="" srcset="" />
                  
                {showing && <div className="successmessage" style={{position:"absolute",display:"flex",margin:"auto"}} ></div>}

                <div className="levelitem2 reffirstboxtop">
                      <div className="refpage" style={{fontSize:40,width:200}}><MoneyCollectOutlined className='micon'/>Referals</div>
        
                  
                    <div className="refer">
                    
                        <div className="hint">Referal Code</div>
                        <input value={reflink.length?reflink:"***"} type={"text"} className="ref" />
                        <div className="copy" onClick={handleCopy}>📄{seen?" Copy":"Copied !"}<div className="prem4"></div></div>
                    </div>
                  
                    <div className="streak"></div>
                </div>
                <div className='yourrefs'>You have ({(refered.length > 0)?refered.length:0}) referals</div>
                <div className="reflist">
     {refered.length > 0 ?refered.map((a,b)=>{return (
                    <div className='refblock' key={""+b}>
                    <div className='refblockleft' style={{backgroundImage:`${a.referedUserDetails.highestStreakScore}`.length <4?dp[`${a.referedUserDetails.highestStreakScore}`.length-1]:dp[3]}}></div>
                    <div className='refblockcenter'>
                    <div className="refblockcenterdivone">{`${a.referedUserDetails.firstName}`}</div>
                    <div className="refblockcenterdiv"> {`${new Date(a.referedUserDetails.dateCreated)}`.slice(0,10)}</div>
                    </div>
                    <div className='refblockend'><ThunderboltFilled className='micon'/>{a.referedUserDetails.highestStreakScore}</div>
                    </div>)}
                )
                :
               !loaded && Array(3).fill("").map((a,b)=>{return (
                    <div className='refblock refloader' key={a+""+b}>
                    <div style={{visibility:"hidden"}}className='refblockleft '></div>
                    <div style={{visibility:"hidden"}}className='refblockcenter'>

                        <div style={{visibility:"hidden"}}className="refblockcenterdivone">Benjamin</div>
                        <div style={{visibility:"hidden"}}className="refblockcenterdiv"> {new Date().toISOString().slice(0,10)}</div>
                    </div>{()=>{setscore(b+1)}}
                                        <div style={{visibility:"hidden"}}className='refblockend'><ThunderboltFilled className='micon'/>{score}{b+1}</div>

                    </div>)}
                )}
                                  <div className="streak" style={{margin:10}}></div>

                </div>
           
            </div>
    )
}
export default Referal;
