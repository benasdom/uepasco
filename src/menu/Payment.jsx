import React, { useState } from "react";
import { Link } from "react-router-dom";

const tiers = [
  {
    name: "Normal User",
    price: "Free",
    description: [
      "Access to referral tools",
      "Basic analytics"
    ],
    button: "default",
  },
  {
    name: "Premium User",
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

const Payment = () => {
    const [counter,setcounter]=useState("")
    const [ticket,setticket]=useState("🎟️")
    const countdownDate = new Date("Jan 2, 2026 00:00:00").getTime();
    const x = setInterval(function () {
      const now = new Date().getTime();
      const distance = countdownDate - now;
      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        setcounter(" "+days + "days " + hours + "hours " + minutes + "minutes " + seconds + "seconds left");
      if (distance < 0) {
        clearInterval(x);
        document.querySelector(".endsin").innerHTML = "Promo has ended";
      }
    }, 1000);
  return (
    <div className="pcontainer">
      <div className="pcontainer2">
        <h2 className="paytitle">
          Choose Your Plan
        </h2>
           <h2 className="endsin" >
          Promo Ending: <p className="cdown">{`${ticket} ${counter} `}</p>
        </h2>
        
        <div className="payopts">
          {tiers.map((tier, index) => (
            <div
              key={index}
              className="pt">
              <h3 className="tier">
                {tier.name}
              </h3>
             <div >
                 <p className="" style={{color:"red",textDecoration:"line-through"}}>
                {tier.oldPrice}
              </p>
              <p className="" style={{color:"gold"}}>
                - {(tier.oldPrice?ticket:"")+tier.price}
              </p>
             </div>
              <ul className="payfeatures">
                <li> ✔ No pop up ads</li>
                {tier.description.map((item, idx) => (
                  <li key={idx}>✔ {item}</li>
                ))}
              </ul>
              <button className="watch" style={{pointerEvents:"none"}}>
                {tier.button!="default"?<div className="sp" style={{pointerEvents:"all"}}>{tier.button}</div>:<div>active</div>}
              </button>
            </div>
          ))}
        </div>
            <Link to="/uepasco/" className='return' style={{position:"fixed",margin:"auto",bottom:0,marginBottom:10}}>👈 </Link>
      </div>
    </div>
  );
};

export default Payment;

