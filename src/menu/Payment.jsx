import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeftOutlined} from '@ant-design/icons'
import PaystackPop from '@paystack/inline-js'
import {domain,fetchWithAuth, LocalApiPath} from './authfetch'
import mainlogo from '/imgs/Untitled.png'
import LoadComponent from "../Loadcomponent";


const Payment = ({ setcredits }) => {
      let urlPost = domain+'/api/v1/user/credits';
    const [counter,setcounter]=useState("")
    const [paymentcode,setpaymentcode]=useState("")
    const [loadme,setloadme]=useState(false)
    const [status,setstatus]=useState("")
    const [ticket,setticket]=useState("🎟️")
    const [fetchError, setfetchError] = useState(false)
    const [errorMessage, setErrorMessage] = useState("")
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
        document.querySelector(".endsin").innerHTML = "Promo has ended";
      }
    }, 1000);
const getPaymentCode=async ()=>{
    setloadme(true)

  try{
        const payresponse =await fetch(LocalApiPath+"/api/payment");
    const code= await payresponse.json();
    setpaymentcode(code);
    setloadme(false)

  }catch(err){
  setloadme(false)
    setErrorMessage("🔴 Sorry 🔌: " + (err.message || "Failed to load payment code"));
    setfetchError(true);
  }


}
  useEffect(() => {
getPaymentCode();
  }, [])
  
  const initPayment=async (premiumType)=>{
    setloadme(true)
    console.log(paymentcode);

    paymentcode.length?
    (transact(premiumType))
    :false;
;
  }
  const transact=(premiumType)=>{
    setloadme(false)

    const popup = new PaystackPop();

    popup.checkout({
  key: paymentcode,
  email: 'sample@email.com',
  amount: 23400,
  onSuccess: (transaction) => {
    // console.log(transaction);
          let options={
            method:"PUT",
            headers:{
              "Content-Type":"application/json"
            },
            body:JSON.stringify({add:600}),
          }
          try{
          fetchWithAuth(urlPost,options)
        .then(
          (data)=>{
            setstatus(data);console.log(data);
            const udata=JSON.parse(localStorage.getItem("userInfo"));
            const updatedUserData = {
              ...udata,
              credits: (udata?.credits || 0) + 600,
              lastCreditUpdate: new Date().toISOString(),
              creditUpdateTime: Date.now()
            };
            localStorage.setItem("userInfo", JSON.stringify(updatedUserData));
            setcredits && setcredits(updatedUserData.credits);
            setErrorMessage("🟢 Payment successful! 🥳🥳 600 credits added to your account.");
            setfetchError(true);
          }
        )
        }catch(err){
          console.log(err);
          setErrorMessage("🔴 Sorry 🔌: Error processing payment. Please contact support.");
          setfetchError(true);
          }
  },
  

  onLoad: (response) => {
  console.log("onLoad: ", response);
  },
  onCancel: () => {
  console.log("onCancel");
  },
  onError: (error) => {
  setloadme(false)
  console.log("Error: ", error.message);
  }
})
  }
  return (
    <div className="pcontainer">
      {fetchError && <Toaster setfetchError={setfetchError} errorMessage={errorMessage} />}
      <div className="pcontainer2">

        <h2 className="paytitle">
          Choose Your Plan
        </h2>
           <h2 className="endsin" >
          <p className="cdown">PROMO: {`${ticket} ${counter} `}</p>
        </h2>
        <div className="payopts">

          {tiers.map((tier, index) => (
            <div
              key={index}
              className="pt">
             <div >
              
                 <p className="oprice" >
                {tier.oldPrice}
              </p>
              <p className="nprice" >
                - {(tier.oldPrice?ticket:"")+tier.price}
              </p>
             </div>
              <h3 className="tier">
                <span className="goldtop"></span>💎{tier.name}
              </h3>
              <ul className="payfeatures">
                <li> <span style={{color:"rgb(0,120,250)"}}>✔</span> No pop up ads</li>
                {tier.description.map((item, idx) => (
                  <li key={idx}><span style={{color:"rgb(0,120,250)"}}>✔</span> {item}</li>
                ))}
              </ul>
              <button className="watch" onClick={()=>initPayment(tier.premiumType)} style={{pointerEvents:"none"}}>
                {tier.button!="default"?<div className="sp" style={{pointerEvents:"all"}}>{tier.button}</div>:<div>active</div>}
              </button>
              
            </div>
          ))}
        </div>
            <Link to="/uelearn/" className='return' style={{position:"fixed",margin:"auto",bottom:0,marginBottom:10}}><ArrowLeftOutlined/> </Link>
      </div>
{
    loadme?
    <LoadComponent opacity={1} indexed={100} mainlogo={mainlogo}/>
     :<LoadComponent opacity={0} indexed={-100}/>
   }    </div>
  );
};

const tiers = [
  {
    name: "Normal User",
    premiumType:"normal-user",
    price: "Free",
    description: [
      "Access to referral tools",
      "Basic analytics"
    ],
    button: "default",
  },
  {
    name: "Premium User",
    premiumType:"premium-user",
    oldPrice: "GHS 20/month",
    price:"GHS 15 lifetime",
    description: [
      "Premium content access",
      "Early access to new features",
      "Priority support"
    ],
    button: "Upgrade",
  },
  {
    name: "Affiliate",
    premiumType:"affiliate",
    oldPrice: "GHS 70/month",
    price: "GHS 60 lifetime",
    description: [
      "All Premium features",
      "Advanced analytics",
      "Early access to new features",
      "Monthly Earns: 1500-2000 cedis",
      "Priority support"
    ],
    button: "Go Pro",
  },
  {
    name: "Affiliate Pro",
    premiumType:"affiliate-pro",
    oldPrice: "GHS 1129/month",
    price: "GHS 500 lifetime",
    description: [
     "All Premium features",
     "Advanced analytics",
     "Monthly Earns:2000-2500 cedis",
     "Early access to new features",
     "Priority support"
    ],
    button: "Join now ✨",
  }
];


export default Payment;

const Toaster=({errorMessage,setfetchError})=>{
    setTimeout(()=>setfetchError(false),2000)
    return (
<div className="toast">
<div className="successmessage">{  ""+errorMessage.toLowerCase()}</div>
</div>
    )
}

