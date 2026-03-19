import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeftOutlined, StarFilled, CrownFilled, WalletFilled, RocketFilled } from '@ant-design/icons'
import PaystackPop from '@paystack/inline-js'
import { domain, fetchWithAuth, LocalApiPath } from './authfetch'
import mainlogo from '/imgs/titled.png'
import stat1 from '/imgs/bob.jpg'
import stat2 from '/imgs/jessy.jpg'
import stat3 from '/imgs/jess.jpg'
import stat4 from '/imgs/jude.jpg'

import LoadComponent from "../Loadcomponent";

const Payment = ({ setcredits }) => {
  const udata = JSON.parse(localStorage.getItem("userInfo"));
  const [credits, setCreditsDisplay] = useState(udata?.credits || 0);  let urlPost = domain + '/api/v1/user/credits';
  const [counter, setcounter] = useState("")
  const [paymentcode, setpaymentcode] = useState("") // This will store your Public Key
  const [loadme, setloadme] = useState(false)
  const [fetchError, setfetchError] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  
  const countdownDate = new Date("Jan 2, 2026 00:00:00").getTime();
  
  useEffect(() => {
    const x = setInterval(function () {
      const now = new Date().getTime();
      const distance = countdownDate - now;
      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      setcounter(`${days}d ${hours}h ${minutes}m ${seconds}s left`);
      if (distance < 0) {
        clearInterval(x);
        document.querySelector(".endsin").innerHTML = "Promo has ended";
      }
    }, 1000);
    return () => clearInterval(x);
  }, []);



  const initPayment = async (tier) => {
    setloadme(true);
    const udata = JSON.parse(localStorage.getItem("userInfo"));

    try {
      const response = await fetch(LocalApiPath + "/api/v1/initialize-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: udata?.email || 'customer@email.com',
          amount: tier.amountInGhs,
          tierName: tier.name
        })
      });

      const resData = await response.json();
      const code = resData.access_code || resData.data?.access_code;

      if (code) {
        const popup = new PaystackPop();
        popup.resumeTransaction(code, {
          onSuccess: (transaction) => {
            // Pass the reference to handleFinalize
            handleFinalize(tier, udata, transaction.reference);
          },
          onCancel: () => setloadme(false),
          onError: () => {
            setloadme(false);
            setErrorMessage("🔴 Payment window error.");
            setfetchError(true);
          }
        });
      }
    } catch (err) {
      setloadme(false);
      setErrorMessage("🔴 Failed to initialize transaction.");
      setfetchError(true);
    }
  }
const handleSetCredits = (val) => {
  setCreditsDisplay(val);
  setcredits && setcredits(val);
};
  const handleFinalize = (tier, udata, reference) => {
    console.log(reference)
    let options = {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      // ✅ SECURE: Only send reference and tier name. 
      // The server will verify the payment and decide the credit amount.
      body: JSON.stringify({ 
        reference: reference, 
        tierName: tier.name 
      }),
    }
    
    fetchWithAuth(urlPost, options)
      .then((data) => {
        console
        // Assume backend returns the actual added credits in 'data.added'
        const creditsAdded = data.added || tier.creditReward;
        
        const updatedUserData = {
          ...udata,
          credits: (udata?.credits || 0) + creditsAdded,
          tier: tier.premiumType
        };
        localStorage.setItem("userInfo", JSON.stringify(updatedUserData));
      
handleSetCredits(updatedUserData.credits);
setErrorMessage(`🟢 Success! ${creditsAdded} credits added.`);
        setfetchError(true);
      })
      .catch((err) => {
        console.error("Verification error:", err);
        setErrorMessage("🔴 Payment verification failed or server error.");
        setfetchError(true);
      })
      .finally(() => setloadme(false));
  }

  return (
    <div className="pcontainer">
      {fetchError && <Toaster setfetchError={setfetchError} errorMessage={errorMessage} />}
      <div className="pcontainer2">
        <h2 className="paytitle">Choose Your Plan</h2>
        <h2 className="endsin">
  <p className="cdown">PROMO: 🎟️ {counter}</p>
</h2>

<p className="user-credits">
  💳 Your Credits: <strong>{credits}</strong>
</p>
        
        <div className="payopts">
          {tiers.map((tier, index) => (
            <div key={tier.name+index} className="pt">
              <img src={tier.image} className="paypic"/>

              <div>
                {tier.oldPrice && <p className="oprice">{tier.oldPrice}</p>}
                <p className="nprice">
                   {tier.oldPrice ? "🎟️ " : ""} {tier.priceDisplay}
                </p>
              </div>
              <h3 className="tier">
                <span className="goldtop"></span>
                <span style={{marginRight: '8px'}}>{tier.icon}</span>
                {tier.name}
              </h3>
              <ul className="payfeatures">

                <p style={{fontSize: "25px", margin: "10px 0"}}>
                  {tier.icon}</p>

                {tier.description.map((item, idx) => (
                  <li key={idx}><span style={{ color: "rgb(0,120,250)" }}>✔</span> {item}</li>
                ))}
              </ul>
              <button 
                className="watch" 
                onClick={() => tier.button !== "default" && initPayment(tier)} 
                style={{ pointerEvents: tier.button === "default" ? "none" : "all" }}
              >
                {tier.button !== "default" ? <div className="sp">{tier.button}</div> : <div>Active</div>}
              </button>
            </div>
          ))}
        </div>
        <Link to="/uelearn/" className='return' style={{ position: "fixed", margin: "auto", bottom: 0, marginBottom: 10 }}><ArrowLeftOutlined /> </Link>
      </div>
      {loadme ? <LoadComponent opacity={1} indexed={100} mainlogo={mainlogo} /> : <LoadComponent opacity={0} indexed={-100} />}
    </div>
  );
};

const tiers = [
  {
    name: "Normal User",
    premiumType: "normal-user",
    priceDisplay: "Free",
    amountInGhs: 0,
    creditReward: 0,
    icon: <StarFilled style={{color: "#FFD700"}}/>,
    image:stat1,
    description: ["Access to referral tools", "Basic analytics"],
    button: "default",
  },
  {
    name: "Credit Pack",
    premiumType: "credits",
    priceDisplay: "GHS 25",
    amountInGhs: 25,
    creditReward: 200,
    icon: <WalletFilled style={{color: "#FFD700"}}/>,
    image:stat2,

    description: ["200 AI Credits", "Standard Support", "No Expiry"],
    button: "Buy Now",
  },
  {
    name: "Premium User",
    premiumType: "premium-user",
    oldPrice: "GHS 20/month",
    priceDisplay: "GHS 50 lifetime",
    amountInGhs: 50,
    creditReward: 600,
    icon: <CrownFilled style={{color: "#FFD700"}}/>,
    image:stat3,

    description: ["Access to referral tools", "500 + 100 Bonus Credits", "Priority support"],
    button: "Upgrade",
  },
  {
    name: "Affiliate",
    premiumType: "affiliate",
    oldPrice: "GHS 70/month",
    priceDisplay: "GHS 500 lifetime",
    amountInGhs: 500,
    creditReward: 1500,
    icon: <RocketFilled style={{color: "#FFD700"}}/>,
    image:stat4,

    description: ["All Premium features", "1500 Bonus Credits", "Monthly Earns: 1.5k-2k cedis"],
    button: "Go Pro",
  }
];

const Toaster = ({ errorMessage, setfetchError }) => {
  useEffect(() => {
    const t = setTimeout(() => setfetchError(false), 3000)
    return () => clearTimeout(t)
  }, [])
  return (
    <div className="toast">
      <div className="successmessage">{errorMessage.toLowerCase()}</div>
    </div>
  )
}

export default Payment;