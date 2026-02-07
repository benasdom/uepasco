import { useEffect, useLayoutEffect, useState,useRef } from 'react'
import './index.css'
import mainlogo from '/imgs/Untitled.png'
import spinner from '/imgs/loader.svg'
import uelogo from '/imgs/ueicon.webp'
import inspo from '/imgs/jess.jpg'
import inspo1 from '/imgs/jessy.jpg'
import inspo2 from '/imgs/jude.jpg'
import spacelogo from '/imgs/my1.png'
import { Link } from 'react-router-dom'
import Search from './Search'
import SearchList from './Searchlist'
import Showfiles from './Showfiles'
import racoon from '/imgs/racoon.jpg'
import PWAInstallButton from './PWAInstallButton'
import LoadComponent from './Loadcomponent'
import { SmileFilled, TeamOutlined ,MessageOutlined} from '@ant-design/icons'
import Register from './menu/Register'
import { getFromLocalStorage } from './menu/fromlocal'
import { fetchWithAuth, domain } from './menu/authfetch'



function App() {
 const [loader, setloader] = useState(true)
 const [searching, setsearching] = useState(false)
 const [find, setfind] = useState("")
 const [NetworkError, setNetworkError] = useState("Type the course c⚾de in the search bar above ...🔎. ☝🏼")
 const [Refreshing, setRefreshing] = useState(false)
 const [payload, setpayload] = useState([{createdOn:"",description:"",downloadLink:""}])
 const [showpdf, setshowpdf] = useState(false)
 const [extract, setextract] = useState("loading...")
 const [credits, setcredits] = useState("")
 const [dataerror, setdataerror] = useState("")
 const [shows, setshows] = useState(false)
 const [extractedtext, setextractedtext] = useState("")
 const [spin, setspin] = useState(false)
 const bar = useRef(null)
 const [pdflink, setpdflink] = useState("https://notfound.com")
 const [Files, setFiles] = useState([{name:"",previewLink:"",fileType:"",viewLink:"",directDownload:""}])
 const [actualDlink, setactualDlink] = useState("https://notfound.com")
 const [raw, setraw] = useState("")
 const [username, setusername] = useState("")
 const [courseName, setcourseName] = useState("")
 const [maxscore, setmaxscore] = useState(0)
 const [dated, setdated] = useState("")
 const [selectedVal, setselectedVal] = useState("");
 
                const [counter,setcounter]=useState("")
    const [ticket,setticket]=useState("")
    const countdownDate = new Date("Jan 2, 2026 00:00:00").getTime();
    const x = setInterval(function () {
      const now = new Date().getTime();
      const distance = countdownDate - now;
      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        setcounter(" "+days + "days " + hours + "hours " + minutes + "minutes " + seconds + " seconds left");
      if (distance < 0) {
        clearInterval(x);
        let ends = document.querySelector(".endsin");
        if(ends){
        ends.innerHTML = "Promo has ended";
        }
      }
    }, 1000);


const getuserdata=async ()=>{
  let profiledata = await fetchWithAuth(`${domain}/api/v1/user/profile`, {
    method: "GET",
    headers: { 
      "Content-Type": "application/json" },
})
   let profiledatainfo = profiledata?.api_response?.data || profiledata || {};
    //    if (!profiledata.ok) {
    //   console.log(profiledatainfo.error.details)
    //   throw new Error(`Failed to get user profile ${JSON.stringify(profiledatainfo.error.details)} `);

    // }


  

   return profiledatainfo;

    // .catch((err) => {
    //     console.error("Error fetching user data:", err);
    // });
}

useEffect(() => {
  try{
 let updata= getuserdata();
     document.body.onload=()=>{
      console.log(updata)
      if(updata.status==="success"){
          localStorage.setItem("userInfo",JSON.stringify({...stored,...updata.data}))
        setusername(updata.data.firstName)
        setmaxscore(updata.data.highestStreakScore)
      updata.data?setloader(false):false
    }
    else{
      console.log("lets see",updata)
    }}
  }catch(err){
    console.error(err)
  }

  
  }, [])
  
  // Listen for storage changes (when user returns from Payment page)
  useEffect(() => {
    const handleStorageChange = () => {
      const stored = getFromLocalStorage("userInfo");
      if (stored?.credits) {
        setcredits(stored.credits);
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);
  
  useEffect(() => {
  let datestring = `${new Date()}`.split(" ")
  setdated((`${datestring[2]} ${datestring[1]} ${datestring[3]}`));
  
  // Use your helper function instead of direct localStorage access
  const stored = getFromLocalStorage("userInfo");
  
  if (stored && Object.keys(stored).length > 0) {
    setshows(false);
    setusername(stored.firstName || "");
    setmaxscore(stored.highestStreakScore || 0);
    setcredits(stored.credits || 0);
  } else {
    setshows(true);
  }
}, [shows])
  useLayoutEffect(() => {
    setTimeout(() => {
      setloader(false);

    }, 3000);
  }, [])

  useLayoutEffect(() => {
    fetch("https://benasdom.github.io/ugpascoapi/ugpasco.json")
    .then(res=>res.json()).then(res=>setpayload(res.data))
    .catch(err=>setTimeout(()=>{setNetworkError("Oops! kindly check y🍪ur internet connectivity 🔌💻🥺 "+err);network(`${err}`)},500));
  }, [find])
  const sender=()=>{
    setspin(true);
    sendMessage();

  }
  async function sendMessage() {
  
     
        const token = "";
        console.log(token)
;
        const chatId = '815965867';
        const payload =document.querySelector("#suggested").value;
    
        const telegramUrl = `https://api.telegram.org/bot${token}/sendMessage`;
        const params = {
          chat_id: chatId,
          text: payload,
        };
    
        try {
          await fetch(telegramUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(params)
          })
          .then(()=> {alert('Form submitted successfully !');setspin(false);
            document.querySelector("#suggested").value=""
          }
          )
        } catch (error) {
          alert("Failed to submit");
          setspin(false);
         }
      
   
  }

  const network=(erd)=>{
    erd?setRefreshing(false):false;
   }

  return (
    <>
    <div className="page">
<div className="promo" style={{position:"relative",fontWeight:600}}>
  <span className="inv-ico"></span> Promotion ends in: <p className="ticket">{`${ticket} ${counter}`}</p></div>
          <div className="landingpage">
            <ul className="mlist">

                <div className="space"></div>

                <img className="reglate" src={mainlogo} alt=""/>
               <Link to="/uelearn/about"> <li>ABOUT</li></Link>
               <Link to="/uelearn/contact"> <li>CONTACT</li></Link>
<div className="rightmenu">
    <Search setsearching={setsearching} eprop={"none"} setfind={setfind} find={find} searching={searching} bar={bar}/>
               <div className="space"></div>
               <div className="onne"></div>
                <div className="onne" title={username || "GUEST"}><div className="dp">{username ? username.toUpperCase()[0]:"Go-pro"}</div></div>
            </div></ul>
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="none"  width="16" height="16" strokeWidth="2"><path d="M12.784 1.442a.8.8 0 0 0-1.569 0l-.191.953a.8.8 0 0 1-.628.628l-.953.19a.8.8 0 0 0 0 1.57l.953.19a.8.8 0 0 1 .628.629l.19.953a.8.8 0 0 0 1.57 0l.19-.953a.8.8 0 0 1 .629-.628l.953-.19a.8.8 0 0 0 0-1.57l-.953-.19a.8.8 0 0 1-.628-.629l-.19-.953h-.002ZM5.559 4.546a.8.8 0 0 0-1.519 0l-.546 1.64a.8.8 0 0 1-.507.507l-1.64.546a.8.8 0 0 0 0 1.519l1.64.547a.8.8 0 0 1 .507.505l.546 1.641a.8.8 0 0 0 1.519 0l.546-1.64a.8.8 0 0 1 .506-.507l1.641-.546a.8.8 0 0 0 0-1.519l-1.64-.546a.8.8 0 0 1-.507-.506L5.56 4.546Zm5.6 6.4a.8.8 0 0 0-1.519 0l-.147.44a.8.8 0 0 1-.505.507l-.441.146a.8.8 0 0 0 0 1.519l.44.146a.8.8 0 0 1 .507.506l.146.441a.8.8 0 0 0 1.519 0l.147-.44a.8.8 0 0 1 .506-.507l.44-.146a.8.8 0 0 0 0-1.519l-.44-.147a.8.8 0 0 1-.507-.505l-.146-.441Z" fill="currentColor"></path></svg>
        </div>

      <div className="landingpage">
      <div className="prehuge">
        
        {/* <img className="micropic" src={studa} alt=""/> */}
        {/* <img className="micropic" src={studb} alt=""/> */}
        </div>

      <div className="phuge">
<img className="huge fil" src={mainlogo} alt=""/>
<img className="huge fil" src={mainlogo} alt=""/>
<div className="ptext">ue-learn</div>
</div>
</div>

<div className="slideme">
  <div className="slideitem">
    <div className="slideitemhead">
      Questions
    </div>
    <div className="slideitembody">
      <div className="slideb1">
        <p>Using Grade "A" oriented approach</p>
      </div>
      <div className="slideb2"><img width="200" src={inspo2} alt="Past Questions"/></div>
    </div>
    <div className="slidebtn">
    </div>
  </div>
  <div className="slideitem">
    <div className="slideitemhead">
      Strategy
    </div>
    <div className="slideitembody">
      <div className="slideb1">
        <p>Increased retention with psychological learning concepts</p>
      </div>
      <div className="slideb2"><img width="200" src={inspo} alt="Past Questions"/></div>
    </div>
    <div className="slidebtn">
    </div>
  </div>
  <div className="slideitem">
    <div className="slideitemhead">
      Revision
    </div>
    <div className="slideitembody">
      <div className="slideb1">
        <p>Optimised save questions feature and more</p>
      </div>
      <div className="slideb2"><img width="200" src={inspo1} alt="Past Questions"/></div>
    </div>
    <div className="slidebtn">
    </div>
  </div>
</div>
<div className="midmessage">
  <div className="midleft">
<div className="welcome">🤗 Sup <span className="welcome" style={{textTransform:"uppercase"}}>{username || ""}</span> !<span className="prem4 difficon">👋🏾</span>
</div>
  <div className="rbackdrop2"></div>

<div className="welcmessage">
Practice makes perfect. Keep your self busy with the resources we provide.
</div>
{/* <>Download Now !</> */}
<PWAInstallButton />
  </div>
  
  <div className="midleft">
  <img className="messagepic" src={racoon} alt=""/>
  </div>
      </div>
<div className="tel">
  <div className="telegram">
    <span className="itext">Join</span>our telegram community 
  </div>

</div>

   {
    loader?
    <LoadComponent opacity={1} indexed={100} mainlogo={mainlogo}/>
     :<LoadComponent opacity={0} indexed={-100}/>
   }
  {showpdf?
<Showfiles 
actualDlink={actualDlink}
raw={raw} pdflink={pdflink} 
mainlogo={mainlogo}
setshowpdf={setshowpdf}
dataerror={dataerror}
credits={credits}
courseName={courseName}
extract={extract}
selectedVal={selectedVal}
       />
:false}
         <div className="scrldn"><div className="scrd">

        {/* <!-- <div className="started">get started</div> --> */}

        </div> 
    </div> 

       </div>
  {searching?<SearchList 
   mainlogo={mainlogo}
   setdataerror={setdataerror}
   setcourseName={setcourseName} 
   setcredits={setcredits} 
   setraw={setraw}
   setextractedtext={extractedtext}
   extractedtext={extractedtext}
   setpdflink={setpdflink}
   pdflink={pdflink}
   setshowpdf={setshowpdf}
   setextract={setextract} 
   extract={extract}  showpdf={showpdf}
    setsearching={setsearching} find={find}
   NetworkError={NetworkError} payload={payload}
   bar={bar} setfind={setfind} setactualDlink={setactualDlink}
   selectedVal={selectedVal}
   setselectedVal={setselectedVal}/>:""}
       <div className="footer">
        <div className="foot1">
            <img className="brands" title='uelearn' src={mainlogo} alt="" />
            <img className="brands" title='unityelites.com' src={uelogo} alt="" />
            <img className="brands" title='myfolder.space' src={spacelogo} alt="" />
        </div>
        <div className="foot1"> 
        <div className="foot2">Developed by Unity Elites</div>
        <div className="foot2">resourced by Myfolder.space</div>
        </div>
        <div className="foot1">
        <div className="twwo" title="make a suggestion">
                    <div className="search">{spin?<img src={spinner} className="spinner" width={200}/>:<MessageOutlined/>}</div>
                    
                    <div className="input"><input type="text"  id='suggested' className="find" placeholder="Make a suggestion"/></div>
                    <div className="slash" onClick={sender}>
                        <svg className="sendarrow" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="none"  strokeWidth="2"><path d="M.5 1.163A1 1 0 0 1 1.97.28l12.868 6.837a1 1 0 0 1 0 1.766L1.969 15.72A1 1 0 0 1 .5 14.836V10.33a1 1 0 0 1 .816-.983L8.5 8 1.316 6.653A1 1 0 0 1 .5 5.67V1.163Z" fill="white"></path></svg></div>
     </div>

     
        </div>
        {shows?<Register setshows={setshows}/>:<></>}
    </div>
    <div className="navbottom">
<div className="nbottomlist">


<Link to="/uelearn/"><div className='navb'> <i> <img className="homepic" src={mainlogo} alt=""/></i><div className='nt'>home</div></div></Link>
<Link to="/uelearn/about"><div className='navb'> <i>{<SmileFilled/>}</i><div  className='nt'>about</div></div></Link>
  <Link to="/uelearn/contact"> <div className='navb'> <i>{<TeamOutlined/>}</i><div  className='nt'>contact</div></div></Link>
</div>


 </div>

 

    </>
  )
}




export default App

