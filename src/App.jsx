import { useEffect, useLayoutEffect, useState,useRef } from 'react'
import './index.css'
import mainlogo from '/imgs/titled.png'
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
     const [dated, setdated] = useState("")
     const [maxscore, setmaxscore] = useState(0)
     const [Files, setFiles] = useState([{name:"",previewLink:"",fileType:"",viewLink:"",directDownload:""}])

  const [credits, setcredits] = useState("")
 const [dataerror, setdataerror] = useState("")
 const [shows, setshows] = useState(false)
 const [spin, setspin] = useState(false)
 const bar = useRef(null)
 const [pdflink, setpdflink] = useState("https://notfound.com")
 const [actualDlink, setactualDlink] = useState("https://notfound.com")
 const [username, setusername] = useState("")
 const [courseName, setcourseName] = useState("")

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
  try {
    getuserdata().then((updata) => {
      console.log("User data received:", updata)
      const stored = JSON.parse(localStorage.getItem("userInfo") || '{}');
      if(updata.status==="success"){
        localStorage.setItem("userInfo",JSON.stringify({...stored,...updata.data}))
        setusername(updata.data.firstName)
        setmaxscore(updata.data.highestStreakScore)
        setloader(false)
      }
      else{
        console.log("User data structure:", updata)
        // If response structure is different, try accessing data directly
        if(updata.firstName){
          localStorage.setItem("userInfo",JSON.stringify({...stored,...updata}))
          setusername(updata.firstName)
          setmaxscore(updata.highestStreakScore || 0)
          setloader(false)
        }
      }
    })
  } catch(err){
    console.error("Error fetching user data:", err)
    setloader(false)
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
    {!searching?<div>
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
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="none"  width="16" height="16" strokeWidth="2">
                      
                      {!loader?<path d="M12.784 1.442a.8.8 0 0 0-1.569 0l-.191.953a.8.8 0 0 1-.628.628l-.953.19a.8.8 0 0 0 0 1.57l.953.19a.8.8 0 0 1 .628.629l.19.953a.8.8 0 0 0 1.57 0l.19-.953a.8.8 0 0 1 .629-.628l.953-.19a.8.8 0 0 0 0-1.57l-.953-.19a.8.8 0 0 1-.628-.629l-.19-.953h-.002ZM5.559 4.546a.8.8 0 0 0-1.519 0l-.546 1.64a.8.8 0 0 1-.507.507l-1.64.546a.8.8 0 0 0 0 1.519l1.64.547a.8.8 0 0 1 .507.505l.546 1.641a.8.8 0 0 0 1.519 0l.546-1.64a.8.8 0 0 1 .506-.507l1.641-.546a.8.8 0 0 0 0-1.519l-1.64-.546a.8.8 0 0 1-.507-.506L5.56 4.546Zm5.6 6.4a.8.8 0 0 0-1.519 0l-.147.44a.8.8 0 0 1-.505.507l-.441.146a.8.8 0 0 0 0 1.519l.44.146a.8.8 0 0 1 .507.506l.146.441a.8.8 0 0 0 1.519 0l.147-.44a.8.8 0 0 1 .506-.507l.44-.146a.8.8 0 0 0 0-1.519l-.44-.147a.8.8 0 0 1-.507-.505l-.146-.441Z" fill="currentColor"></path>
                      :"ue-learn"}
                      </svg>
        </div>

      <div className="landingpage">
      <div className="prehuge">
        
        {/* <img className="micropic" src={studa} alt=""/> */}
        {/* <img className="micropic" src={studb} alt=""/> */}
        </div>

      <div className="phuge">
<img className="huge fil" src={mainlogo} alt=""/>
<img className="huge fil" src={mainlogo} alt=""/>
<div className="ptext">
<svg width="525" height="80" viewBox="0 0 525 80" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M30.5566 79.8779C22.832 79.8779 16.748 79.0405 12.3047 77.3657C7.86133 75.6567 4.69971 72.8198 2.81982 68.855C0.939941 64.856 0 59.4043 0 52.5V19.6875H9.89502V52.5C9.89502 56.3965 10.2026 59.6094 10.8179 62.1387C11.4673 64.6338 12.5952 66.582 14.2017 67.9834C15.8081 69.3506 18.064 70.3076 20.9692 70.8545C23.9087 71.4014 27.6855 71.6748 32.2998 71.6748C39.1357 71.6748 44.502 71.1108 48.3984 69.9829C52.2949 68.855 55.0464 67.0947 56.6528 64.7021C58.2935 62.2754 59.1138 59.1309 59.1138 55.2686V19.6875H68.9575V78.75H59.1138V70.9058C57.6782 72.8882 55.8667 74.5459 53.6792 75.8789C51.4917 77.2119 48.5693 78.2031 44.9121 78.8525C41.2549 79.5361 36.4697 79.8779 30.5566 79.8779ZM149.963 61.2158C149.963 65.625 149.297 69.0942 147.964 71.6235C146.665 74.1528 144.666 75.9985 141.965 77.1606C139.265 78.3228 135.813 79.0576 131.609 79.3652C127.439 79.707 122.466 79.8779 116.689 79.8779C110.093 79.8779 104.487 79.5361 99.873 78.8525C95.293 78.2031 91.5845 76.853 88.7476 74.8022C85.9448 72.7173 83.894 69.6069 82.5952 65.4712C81.3306 61.3354 80.6982 55.8154 80.6982 48.9111C80.6982 42.2119 81.3135 36.8457 82.5439 32.8125C83.8086 28.7793 85.8423 25.7373 88.645 23.6865C91.4478 21.6357 95.1221 20.2686 99.668 19.585C104.248 18.9014 109.836 18.5596 116.433 18.5596C123.987 18.5596 130.242 19.0894 135.198 20.1489C140.154 21.2085 143.845 23.2251 146.272 26.1987C148.733 29.1724 149.963 33.5303 149.963 39.2725V51.936H90.5933C90.6274 56.311 90.9351 59.8145 91.5161 62.4463C92.0972 65.0781 93.2593 67.0605 95.0024 68.3936C96.7456 69.7266 99.3433 70.6152 102.795 71.0596C106.282 71.4697 110.913 71.6748 116.689 71.6748C121.885 71.6748 126.072 71.5723 129.25 71.3672C132.463 71.1621 134.89 70.7178 136.531 70.0342C138.206 69.3164 139.333 68.2568 139.915 66.8555C140.496 65.4541 140.786 63.5742 140.786 61.2158H149.963ZM116.433 26.7627C110.862 26.7627 106.367 26.9678 102.949 27.3779C99.5654 27.7881 96.9849 28.5913 95.2075 29.7876C93.4302 30.9497 92.2168 32.6929 91.5674 35.0171C90.9521 37.3413 90.6274 40.4004 90.5933 44.1943H140.53V39.2725C140.53 36.8115 140.239 34.7778 139.658 33.1714C139.111 31.5308 138.018 30.249 136.377 29.3262C134.736 28.3691 132.31 27.7026 129.097 27.3267C125.918 26.9507 121.697 26.7627 116.433 26.7627ZM162.729 52.5V44.2969H202.104V52.5H162.729ZM218.511 78.75V0H228.354V78.75H218.511ZM312.385 61.2158C312.385 65.625 311.719 69.0942 310.386 71.6235C309.087 74.1528 307.087 75.9985 304.387 77.1606C301.687 78.3228 298.235 79.0576 294.031 79.3652C289.861 79.707 284.888 79.8779 279.111 79.8779C272.515 79.8779 266.909 79.5361 262.295 78.8525C257.715 78.2031 254.006 76.853 251.169 74.8022C248.367 72.7173 246.316 69.6069 245.017 65.4712C243.752 61.3354 243.12 55.8154 243.12 48.9111C243.12 42.2119 243.735 36.8457 244.966 32.8125C246.23 28.7793 248.264 25.7373 251.067 23.6865C253.87 21.6357 257.544 20.2686 262.09 19.585C266.67 18.9014 272.258 18.5596 278.855 18.5596C286.409 18.5596 292.664 19.0894 297.62 20.1489C302.576 21.2085 306.267 23.2251 308.694 26.1987C311.155 29.1724 312.385 33.5303 312.385 39.2725V51.936H253.015C253.049 56.311 253.357 59.8145 253.938 62.4463C254.519 65.0781 255.681 67.0605 257.424 68.3936C259.167 69.7266 261.765 70.6152 265.217 71.0596C268.704 71.4697 273.335 71.6748 279.111 71.6748C284.307 71.6748 288.494 71.5723 291.672 71.3672C294.885 71.1621 297.312 70.7178 298.953 70.0342C300.627 69.3164 301.755 68.2568 302.336 66.8555C302.917 65.4541 303.208 63.5742 303.208 61.2158H312.385ZM278.855 26.7627C273.284 26.7627 268.789 26.9678 265.371 27.3779C261.987 27.7881 259.407 28.5913 257.629 29.7876C255.852 30.9497 254.639 32.6929 253.989 35.0171C253.374 37.3413 253.049 40.4004 253.015 44.1943H302.952V39.2725C302.952 36.8115 302.661 34.7778 302.08 33.1714C301.533 31.5308 300.439 30.249 298.799 29.3262C297.158 28.3691 294.731 27.7026 291.519 27.3267C288.34 26.9507 284.119 26.7627 278.855 26.7627ZM356.323 79.8779C349.248 79.8779 343.403 79.502 338.789 78.75C334.209 78.0322 330.791 76.4258 328.535 73.9307C326.313 71.4355 325.203 67.5562 325.203 62.2925C325.203 56.9263 326.245 52.9956 328.33 50.5005C330.449 47.9712 333.782 46.3306 338.328 45.5786C342.908 44.8267 348.906 44.4507 356.323 44.4507C362.339 44.4507 367.38 44.5874 371.448 44.8608C375.515 45.1343 379.155 45.6128 382.368 46.2964C382.3 41.7505 381.992 38.1787 381.445 35.5811C380.898 32.9492 379.873 31.001 378.369 29.7363C376.865 28.4717 374.661 27.6685 371.755 27.3267C368.884 26.9507 365.056 26.7627 360.271 26.7627C354.802 26.7627 350.513 26.8823 347.402 27.1216C344.326 27.3608 342.087 27.7881 340.686 28.4033C339.285 29.0186 338.396 29.9072 338.02 31.0693C337.678 32.2314 337.507 33.7354 337.507 35.5811H327.664C327.664 31.8896 328.159 28.916 329.15 26.6602C330.176 24.4043 331.902 22.6953 334.329 21.5332C336.755 20.3711 340.071 19.585 344.275 19.1748C348.513 18.7646 353.845 18.5596 360.271 18.5596C367.175 18.5596 372.729 19.0039 376.934 19.8926C381.172 20.7812 384.385 22.3877 386.572 24.7119C388.794 27.002 390.281 30.2148 391.033 34.3506C391.819 38.4863 392.212 43.8184 392.212 50.3467V78.75H382.368V74.6997C381.206 75.9302 379.6 76.9214 377.549 77.6733C375.498 78.4253 372.764 78.9722 369.346 79.314C365.962 79.6899 361.621 79.8779 356.323 79.8779ZM356.323 71.8799C362.168 71.8799 366.833 71.8115 370.32 71.6748C373.806 71.5381 376.404 71.1621 378.113 70.5469C379.856 69.9316 381.001 68.9404 381.548 67.5732C382.095 66.2061 382.368 64.292 382.368 61.8311V52.7563L356.323 52.4487C351.709 52.3804 347.983 52.4487 345.146 52.6538C342.344 52.8247 340.208 53.2349 338.738 53.8843C337.268 54.4995 336.277 55.4907 335.764 56.8579C335.286 58.1909 335.046 60.0024 335.046 62.2925C335.046 64.5142 335.286 66.2744 335.764 67.5732C336.277 68.8721 337.268 69.8291 338.738 70.4443C340.208 71.0596 342.344 71.4526 345.146 71.6235C347.983 71.7944 351.709 71.8799 356.323 71.8799ZM406.157 78.75V19.6875H416.001V27.8394C417.095 26.0962 418.188 24.6436 419.282 23.4814C420.41 22.3193 421.863 21.3965 423.64 20.7129C425.452 20.0293 427.896 19.5508 430.972 19.2773C434.048 18.9697 438.098 18.8159 443.123 18.8159V27.0703C436.355 27.0703 431.108 27.3096 427.383 27.7881C423.691 28.2666 421.042 29.0869 419.436 30.249C417.83 31.377 416.855 32.9492 416.514 34.9658C416.172 36.9824 416.001 39.5459 416.001 42.6562V78.75H406.157ZM455.889 78.75V19.6875H465.732V27.5317C467.202 25.5493 469.014 23.8916 471.167 22.5586C473.354 21.2256 476.26 20.2344 479.883 19.585C483.54 18.9014 488.325 18.5596 494.238 18.5596C501.963 18.5596 508.047 19.3115 512.49 20.8154C516.968 22.3193 520.146 25.0024 522.026 28.8647C523.906 32.7271 524.846 38.1958 524.846 45.271V78.75H514.951V45.271C514.951 41.2378 514.609 37.9907 513.926 35.5298C513.242 33.0688 512.063 31.2061 510.388 29.9414C508.748 28.6768 506.475 27.8394 503.569 27.4292C500.664 26.9849 496.973 26.7627 492.495 26.7627C485.659 26.7627 480.293 27.3267 476.396 28.4546C472.5 29.5825 469.749 31.3599 468.142 33.7866C466.536 36.1792 465.732 39.3066 465.732 43.1689V78.75H455.889Z" fill="white"/>
</svg>


</div>
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
<div className="welcome"><i className="bga">🤗</i><span className="welcome" style={{textTransform:"uppercase"}}>{`HI !`}</span>
{/* <span className="prem4 difficon">
  👋🏾
</span> */}
</div>
  <div className="rbackdrop2"></div>

<div className="welcmessage" id="welcid">
Practice makes perfect. Keep your self busy with the resources we provide.
</div>

{/* <>Download Now !</> */}
<PWAInstallButton />
  </div>
  
  <div className="midleft">
  <img className="messagepic" src={racoon} alt=""/>
  </div>

      </div>
      <div className="pgcontent">
        <h2 className="welcome" id="whats">What we help you solve?</h2>
        <h2 className="welcome" id="ol">1. </h2>

        <p className="pgmessage"> Modern psychological research suggests that the best way to learn and retain
           information is through active learning techniques that require the brain to work to remember information. 
          These techniques include:</p>

<p className='pgmessage'>Repeated retrieval practice: This involves remembering information more than once, 
  which enhances accessibility in the future. 
</p>
        <h2 className="welcome" id="ol">2. </h2>

<p className="pgmessage">
Testing: Attempting questions or explaining concepts to others helps reinforce learning and identify gaps. 
</p>
        <h2 className="welcome" id="ol">3. </h2>

<p className="pgmessage">
Spaced repetition: Reviewing material over time helps reinforce it,
 making it easier for the brain to access stored information. 
</p>
        <h2 className="welcome" id="ol">4. </h2>

<p className="pgmessage">
Dual coding: Engaging both verbal and visual information through different channels 
increases the chances of recalling the information later. 
</p>
        <h2 className="welcome" id="ol">5. </h2>

<p className="pgmessage">
Personal connections: Learning through material that feels relevant to personal
 experiences enhances the probability of recall. 
</p>
        <h2 className="welcome" id="ol">6. </h2>

<p className="pgmessage">
These strategies are grounded in decades of research and are designed 
to maximize the cognitive benefits of study time. By incorporating these
 techniques into your study routine, you can improve your ability to learn 
 and retain information effectively.
</p>
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
         <div className="scrldn"><div className="scrd">

        {/* <!-- <div className="started">get started</div> --> */}

        </div> 
    </div> 

       </div>
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
 </div>
 :
 <SearchList 
   setdataerror={setdataerror}
   setcourseName={setcourseName} 
   setcredits={setcredits} 
   setpdflink={setpdflink}
   pdflink={pdflink}
    setsearching={setsearching} find={find}
   NetworkError={NetworkError} payload={payload}
   bar={bar} setfind={setfind}
   setactualDlink={setactualDlink}
   actualDlink={actualDlink}
   dataerror={dataerror}
   credits={credits}
   courseName={courseName}
   selectedVal={selectedVal}
   setselectedVal={setselectedVal}/>
 }

 

    </>
  )
}




export default App

