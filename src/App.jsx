import { useEffect, useLayoutEffect, useState,useRef } from 'react'
import './index.css'
import mainlogo from '/imgs/Untitled.png'
import spinner from '/imgs/loader.svg'
import uelogo from '/imgs/ueicon.webp'
import spacelogo from '/imgs/my1.png'
import { Link } from 'react-router-dom'
import Search from './Search'
import SearchList from './Searchlist'
import Showfiles from './Showfiles'
import studd from '/imgs/stud7.png'
import LoadComponet from './Loadcomponent'
import { SmileFilled, TeamOutlined } from '@ant-design/icons'



function App() {
 const [loader, setloader] = useState(true)
 const [searching, setsearching] = useState(false)
 const [find, setfind] = useState("")
 const [NetworkError, setNetworkError] = useState("Type the course code in the search bar...🔎")
 const [Refreshing, setRefreshing] = useState(false)
 const [payload, setpayload] = useState([{createdOn:"",description:"",downloadLink:""}])
 const [showpdf, setshowpdf] = useState(false)
 const [extractedtext, setextractedtext] = useState("")
 const [spin, setspin] = useState(false)
 const bar = useRef(null)
 const [pdflink, setpdflink] = useState("https://notfound.com")
 const [Files, setFiles] = useState([{name:"",previewLink:"",fileType:"",viewLink:"",directDownload:""}])
 const [actualDlink, setactualDlink] = useState("https://notfound.com")


 
useEffect(() => {
    document.body.onload=()=>{
      setloader(false);
    }
  
  }, [])
  useLayoutEffect(() => {
    setTimeout(() => {
      setloader(false);

    }, 3000);
  }, [])
  useLayoutEffect(() => {
    fetch("https://benasdom.github.io/ugpascoapi/ugpasco.json")
    .then(res=>res.json()).then(res=>setpayload(res.data))
    .catch(err=>setTimeout(()=>{setNetworkError("Oops! kindly check your internet connectivity 🔌💻🥺 "+err);network(`${err}`)},500));
 
  }, [payload,find])
  const sender=()=>{
    setspin(true);
    sendMessage();

  }
  async function sendMessage() {
  
     
        const token = '6715619579:AAEVuhwuW1Mwj09YQU3nyDDICHAZb0iiLQo';
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
          .then(()=> {alert('Form submitted successfully !');setspin(false);}
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
        <div className="landingpage">
            <ul className="mlist">
                <img className="reglate" src={mainlogo} alt=""/>

               <Link to="/uepasco/about"> <li>ABOUT</li></Link>
               <Link to="/uepasco/contact"> <li>CONTACT</li></Link>
<div className="rightmenu">
    <Search setsearching={setsearching} eprop={"none"} setfind={setfind} find={find} searching={searching} bar={bar}/>
               
                <div className="onne"><svg viewBox="0 0 20 20" fill="none" role="img" width="20" title="Expo documentation">
                    <title>documentation</title>
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M9.584.02a.157.157 0 00-.157.001L.708 5.071l-.003.001a.157.157 0 00-.079.135V15.31c0 .056.03.108.079.136l1.71.984.004.003a.157.157 0 00.157 0l1.054-.61v1.183c0 .056.03.108.078.136l1.715.987a.157.157 0 00.156 0l.003-.002 2.024-1.172.91 2.934a.157.157 0 00.198.102l1.815-.594a.156.156 0 00.03-.013l8.732-4.666a.157.157 0 00.075-.186L16.06 4.258a.157.157 0 00-.205-.098l-1.473.529v-1.85a.157.157 0 00-.079-.135l-.002-.001-1.713-.986a.157.157 0 00-.156 0l-1.054.61V1.144a.157.157 0 00-.078-.136L9.584.02zM5.33 9.56l-.003-1.578-1.383-.805v9.74l1.4.806-.014-8.119a.156.156 0 010-.045zM.94 5.48l1.384.805.017 9.741-1.4-.806V5.48zm9.968-4.336l-1.4-.806-8.412 4.87 1.385.806 8.427-4.87zM5.483 7.71l8.427-4.87-1.4-.806-8.411 4.87 1.384.806zm5.09 11.313l-3.21-9.971 8.455-4.519 3.21 9.97-8.456 4.52zM5.678 9.678l3.09 9.967 1.514-.496-3.21-9.972-1.394.501z" fill="var(--Untitled.png)"></path></svg></div>
                <div className="onne"><svg viewBox="0 0 20 20" fill="none" width="20px" height="20px" role="img" title="Additional links"><title>Additional links</title><circle cx="4.167" cy="10" r="1.741" fill="var(--bders)"></circle><circle cx="10" cy="10" r="1.741" fill="var(--bder)"></circle><circle cx="15.833" cy="10" r="1.741" fill="var(--Untitled.png)"></circle></svg></div>
                <div className="onne" title="Try our premium"><div className="dp">Go-pro</div></div>
            </div>  
                      </ul>
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="none"  width="16" height="16" stroke-width="2"><path d="M12.784 1.442a.8.8 0 0 0-1.569 0l-.191.953a.8.8 0 0 1-.628.628l-.953.19a.8.8 0 0 0 0 1.57l.953.19a.8.8 0 0 1 .628.629l.19.953a.8.8 0 0 0 1.57 0l.19-.953a.8.8 0 0 1 .629-.628l.953-.19a.8.8 0 0 0 0-1.57l-.953-.19a.8.8 0 0 1-.628-.629l-.19-.953h-.002ZM5.559 4.546a.8.8 0 0 0-1.519 0l-.546 1.64a.8.8 0 0 1-.507.507l-1.64.546a.8.8 0 0 0 0 1.519l1.64.547a.8.8 0 0 1 .507.505l.546 1.641a.8.8 0 0 0 1.519 0l.546-1.64a.8.8 0 0 1 .506-.507l1.641-.546a.8.8 0 0 0 0-1.519l-1.64-.546a.8.8 0 0 1-.507-.506L5.56 4.546Zm5.6 6.4a.8.8 0 0 0-1.519 0l-.147.44a.8.8 0 0 1-.505.507l-.441.146a.8.8 0 0 0 0 1.519l.44.146a.8.8 0 0 1 .507.506l.146.441a.8.8 0 0 0 1.519 0l.147-.44a.8.8 0 0 1 .506-.507l.44-.146a.8.8 0 0 0 0-1.519l-.44-.147a.8.8 0 0 1-.507-.505l-.146-.441Z" fill="currentColor"></path></svg>
        </div>
      
      <div className="landingpage">
        
      <div className="prehuge">
        
        {/* <img className="micropic" src={studa} alt=""/> */}
        {/* <img className="micropic" src={studb} alt=""/> */}
        </div>

      <div className="phuge">

<img className="huge fil" src={mainlogo} alt=""/>
<img className="huge fil" src={mainlogo} alt=""/>
<div className="ptext">ue-pasco</div>
</div>
<div className="midmessage">
  <div className="midleft">
<div className="welcome">✨ Welcome ! </div>
<div className="welcmessage">

Practice makes perfect. Keep your self busy with the resources we provide.
</div>

  </div>
  <div className="midleft">
  <img className="messagepic" src={studd} alt=""/>

  </div>
</div>

      </div>
<div className="tel">
  <div className="telegram">
    Join our telegram community 
  </div>

</div>

   {
    loader?
    <LoadComponet opacity={1} indexed={100} mainlogo={mainlogo}/>
     :<LoadComponet opacity={0} indexed={-100}/>
   }
   {showpdf?
<Showfiles actualDlink={actualDlink} pdflink={pdflink} mainlogo={mainlogo} setshowpdf={setshowpdf}/>
:false}
         <div className="scrldn"><div className="scrd">

        {/* <!-- <div className="started">get started</div> --> */}

        </div> 
    </div> 

       </div>
       {searching?<SearchList mainlogo={mainlogo}  setextractedtext={extractedtext} extractedtext={extractedtext} setpdflink={setpdflink} pdflink={pdflink} setshowpdf={setshowpdf}  showpdf={showpdf} setsearching={setsearching} find={find} NetworkError={NetworkError} payload={payload} bar={bar} setfind={setfind} setactualDlink={setactualDlink}/>:""}
       <div className="footer">
        <div className="foot1">
            <img className="brands" title='uepasco' src={mainlogo} alt="" />
            <img className="brands" title='unityelites.com' src={uelogo} alt="" />
            <img className="brands" title='myfolder.space' src={spacelogo} alt="" />
        </div>
        <div className="foot1"> 
        <div className="foot2">Developed by Unity Elites</div>
        <div className="foot2">resourced by Myfolder.space</div>
        </div>
        <div className="foot1">
        <div className="twwo" title="make a suggestion">
                    <div className="search">{spin?<img src={spinner} className="spinner" width={200}/>:<i className="fa fa-envelope"></i>}</div>
                    
                    <div className="input"><input type="text"  id='suggested' className="find" placeholder="Make a suggestion"/></div>
                    <div className="slash" onClick={sender}>
                        <svg className="sendarrow" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="none"  stroke-width="2"><path d="M.5 1.163A1 1 0 0 1 1.97.28l12.868 6.837a1 1 0 0 1 0 1.766L1.969 15.72A1 1 0 0 1 .5 14.836V10.33a1 1 0 0 1 .816-.983L8.5 8 1.316 6.653A1 1 0 0 1 .5 5.67V1.163Z" fill="white"></path></svg></div>
     </div>

     
        </div>
        
    </div>
    <div className="navbottom">
<div className="nbottomlist">


<Link to="/uepasco/"><div className='navb'> <i> <img className="homepic" src={mainlogo} alt=""/></i><div className='nt'>home</div></div></Link>
<Link to="/uepasco/about"><div className='navb'> <i>{<SmileFilled/>}</i><div  className='nt'>about</div></div></Link>
        <Link to="/uepasco/contact"> <div className='navb'> <i>{<TeamOutlined/>}</i><div  className='nt'>contact</div></div></Link>
</div>


 </div>
 

    </>
  )
}




export default App



