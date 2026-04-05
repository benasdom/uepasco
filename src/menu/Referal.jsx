import bob from '../../public/imgs/bob.jpg';
import jessy from '../../public/imgs/jessy.jpg';
import brown from '../../public/imgs/brown.jpg';
import guylogs from '../../public/imgs/guylogs.png';
import rbadge from '../../public/imgs/reff.png'
import {MoneyCollectOutlined,ThunderboltFilled } from '@ant-design/icons'
import { useState,useEffect } from 'react'
import {domain, fetchWithAuth } from './authfetch'

const dp=[bob, jessy,guylogs, brown];

const Referal=()=>{
    const [seen, setseen] = useState(true)
    const [reflink, setreflink] = useState("")
    const [refered, setrefered] = useState([])
    const [score, setscore] = useState(0)
    const [loaded,setloaded] = useState(false)
    const [showing,setshowing] = useState(false)
    const [message,setmessage] = useState("")
let cred;
    try {
        cred = JSON.parse(localStorage.getItem("userInfo"));
    } catch (err) {
        console.error("Error parsing userInfo:", err);
        cred = null;
    }

    let refcode = cred?.userReferalCode

useEffect(() => {
  if(refcode){
    setreflink(`${refcode}`)}
  else{false}
}, [])

    const handleCopy=()=>{
        if (!navigator.clipboard) {
            seterrors("Clipboard API not supported");
            return;
        }
        navigator.clipboard.writeText(reflink)
            .then(() => {
                setmessage("copied successfully !!!");
                setTimeout(() => {
                    setmessage("")
                }, 3000);
                setseen(false);
                setTimeout(()=>{setseen(true)},1000)
            })
            .catch((err) => {
                console.error("Copy failed:", err);
                seterrors("Failed to copy to clipboard");
            });
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

let storeddata;
  try {
    storeddata = JSON.parse(localStorage.getItem("userInfo"));
  } catch (err) {
    console.error("Error parsing userInfo:", err);
    storeddata = null;
  }
  let url = domain+'/api/v1/user/referals';
  let accessToken = storeddata?.accessToken;
  let refreshToken = storeddata?.refreshToken;
  const options={
    headers: { Authorization: `Bearer ${accessToken}` }
  }

  useEffect(() => {
    if (accessToken && refreshToken) {
      fetchWithAuth(url,options)
      .then((data)=>{
        if (Array.isArray(data)) {
          setrefered(data);
        } else {
          console.warn("Unexpected data format:", data);
          setrefered([]);
        }
        setloaded(true);
      })
      .catch((err)=>{
        console.error("Fetch error:", err);
        seterrors(`${err}`.toLowerCase().replace(/typeerror/gim,"Sorry"));
        setloaded(true);
      })
    } else {
      setloaded(true);
    }
  }, [url, accessToken, refreshToken]);

    return (
          <div className="rlevel">

                    <img src={rbadge} className="refbadge" alt=""  />
                  
                {showing && <div className="successmessage" style={{position:"absolute",display:"flex",margin:"auto"}} ></div>}

                <div className="levelitem2 reffirstboxtop">
                      <div className="refpage" style={{fontSize:40,width:200}}><MoneyCollectOutlined className='micon'/>Referals</div>
        
                  
                    <div className="refer">
                    
                        <div className="hint"><div className="fnav"><i className='fa fa-code fa-dark'></i></div>Referal Code</div>
                        <input value={reflink.length?reflink:"***"} type={"text"} readOnly className="ref" />
                        <div className="copy" onClick={handleCopy}><div className="fnav"><i className="fa fa-copy fa-dark"></i></div>{seen?" Copy":"Copied !"}<div className="prem4"></div></div>
                    </div>
                  
                    <div className="streak"></div>
                </div>
                <div className='yourrefs'><div className="fnav"><i className="fa fa-users fa-dark"></i></div>You have ({((refered?.length ?? 0) > 0)?refered.length:0}) referals</div>
                <div className="reflist">
     {(refered?.length ?? 0) > 0 ?refered.map((a,b)=>{return (
                    <div className='refblock' key={""+b}>
                    <div className='refblockleft' style={{backgroundImage: a.referedUserDetails?.highestStreakScore ? `url(${dp[`${a.referedUserDetails.highestStreakScore}`.length < 4 ? `${a.referedUserDetails.highestStreakScore}`.length - 1 : 3]})` : ""}}></div>
                    <div className='refblockcenter'>
                    <div className="refblockcenterdivone">{a.referedUserDetails?.firstName ?? "User"}</div>
                    <div className="refblockcenterdiv"> {a.referedUserDetails?.dateCreated ? new Date(a.referedUserDetails.dateCreated).toISOString().slice(0,10) : "N/A"}</div>
                    </div>
                    <div className='refblockend'><ThunderboltFilled className='micon'/>{a.referedUserDetails?.highestStreakScore ?? 0}</div>
                    </div>)}
                )
                :
               !loaded && Array(3).fill("").map((a,b)=>{
                    return (
                    <div className='refblock refloader' key={a+""+b}>
                    <div style={{visibility:"hidden"}}className='refblockleft '></div>
                    <div style={{visibility:"hidden"}}className='refblockcenter'>
                        <div style={{visibility:"hidden"}}className="refblockcenterdivone">Benjamin</div>
                        <div style={{visibility:"hidden"}}className="refblockcenterdiv"> {new Date().toISOString().slice(0,10)}</div>
                    </div>
                    <div style={{visibility:"hidden"}}className='refblockend'><ThunderboltFilled className='micon'/>Loading...</div>
                    </div>);
                })
                }
                                  <div className="streak" style={{margin:10}}></div>

                </div>
           
            </div>
    )
}
export default Referal;
