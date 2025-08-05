import { InfoCircleFilled, LockOutlined, MailOutlined, MessageOutlined,UserAddOutlined, PhoneOutlined, ClockCircleOutlined, CheckCircleOutlined } from "@ant-design/icons";
import bob from '../../public/imgs/bob.jpg';
import jessy from '../../public/imgs/jessy.jpg';
import brown from '../../public/imgs/brown.jpg';
import guylogs from '../../public/imgs/guylogs.png';
import logo from '../../public/imgs/untitled.jpg';
import { useState, useEffect } from "react";
import domain from "./authfetch";

const rand = Math.floor(Math.random() * 4);
export default function Register({setshows}) {
    const [email, setemail] = useState("");
    const [firstName, setfirstName] = useState("");
    const [lastName, setlastName] = useState("");
    const [otp, setotp] = useState("");
    const [msisdn, setmsisdn] = useState("");
    const [confirm, setconfirm] = useState("");
    const [password, setpassword] = useState("");
    const [showing, setshowing] = useState(false);
    const [indics, setindics] = useState(false)
    const [olduseremail, setolduseremail] = useState("");
    const [oldpwd, setoldpwd] = useState("");
    const [message, setmessage] = useState("");
    const [showopage, setshowopage] = useState(false);
    const [hasref, sethasref] = useState(false);
    const [counter, setcounter] = useState(10);
    const [temptoken, settemptoken] = useState(""); 
    const [referalCode, setreferalCode] = useState(""); 
    const [bools, setbools] = useState(false)
    const [mountsignup  , setmountsignup  ] = useState(false)
    const [logged, setlogged] = useState({
        id:'', dateCreated:'',firstName:'', lastName:'',msisdn:''
    })
    
// Added missing state

    const bb = [bob, jessy,guylogs, brown];
    const found = bb[rand];

    const seterrors = (pop) => {
        setmessage(pop);
        setshowing(true);
        setindics(false);
        setTimeout(() => {
            setshowing(false);
        }, 6000);
    };
    

    const getOtp=(msisdn)=>{
    setbools(true);
        setindics(true);

startcounter();
    const options = {
        method: 'POST',
        headers: {
            "Content-Type":"application/json",
            "Authorization": `Bearer ${temptoken}`},
        body:JSON.stringify({msisdn:msisdn}),
     };

    try{
        fetch(domain+"/api/v1/send/sms/otp",options)
        .then((res)=>{res.status==200?seterrors("Sent successfully"):false})
        .catch(()=>{ seterrors("There was a promblem please retry");setindics(false);})
        .finally(()=>{setbools(false)})
    }
    catch(err){
        seterrors(err)}
}

const startcounter=()=>{
    let val=setInterval(()=>{counter>=1?setcounter((counter)=>counter-1):false},1000)
    setTimeout(()=>{clearInterval(val);setbools(false);setcounter(15)},11000)


}
 

useEffect(() => {
    try{
        logged.id!=""
        ?localStorage.setItem("userInfo",JSON.stringify(logged))
        :false;
        settemptoken(logged.accessToken)

    }
    catch(err){err=>seterrors("Error",err)

    }
}, [logged])



    useEffect(() => {
        if (showing) {
            const messageElement = document.querySelector(".successmessage");
            if (messageElement) {
                /success/gim.test(message)?messageElement.textContent = "🟢"+message+"🥳🥳🥳"
                :messageElement.textContent = "🔴"+message;
    
            }
        }
    }, [message, showing]);
  
const activateuser=()=>{
        try{
            setshows(false)
    }
    catch(err){
    seterrors(err)
    }


}
const otpRequestCheck=(vals)=>{
    const options = {
        method: 'POST',
        headers: {
            "Content-Type":"application/json",
            "Authorization": `Bearer ${temptoken}`},
        body:JSON.stringify({path:"msisdn",otp:vals}),
     };
    try{
        fetch(domain+"/api/v1/verification",options)
        .then((res)=>{ console.log(res);res.status==200?activateuser():servererrors(res)})
        .catch((err)=>{err?seterrors("There was a problem please retry"):false;})
        .finally(()=>{setbools(false)})
    }
    catch(err){
        seterrors(err)
        setbools(false)

    }

}
const authenticate= ()=>{
    let id =`${new Date().getTime()}`
    let payloadData={email,msisdn,firstName,lastName,password}
    payloadData=referalCode.length?{...payloadData,referalCode}:payloadData
    const options = {
        method: 'POST',
        headers: {
            "User-Agent":"Apidog/1.0.0 (https://apidog.com)",
            "Content-Type":"application/json"},
        body:JSON.stringify(payloadData),
        redirect: 'follow'
     };
     

fetch(domain+"/api/v1/auth/register", options)
.then(response => response.json())
.then((result) =>{result.status?userreg(result):servererrors(result)})
.catch((error)=>{ seterrors(`${error}`);console.log(error); })
}
const servererrors=(pop)=>{
    seterrors(pop.message)
}
const userreg=(result)=>{
populate(result);
setshowopage(true);

}

const populate=(result)=>{
       setlogged({...result.data.userData,accessToken:result.data.token,refreshToken:result.data.refreshToken});
    setindics(false);
    seterrors(`Successful Entry`);

 
}

    const ValidateSignup = (pp) => {
        
        if(!showopage){

        if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/gim.test(email.trim())) {
            seterrors("Add valid email eg. hithere@gmail.com");
            return false;
        }
         else if (firstName.trim().length<3){
            seterrors("firstName must have a valid length");
            return false;
        }
         else if (lastName.trim().length<3){
            seterrors("lastName must have a valid length");
            return false;
        }
         else if (password === ""){
            seterrors("Add a valid password");
            return false;
        }
        else if (/\s/gim.test(password)) {
            seterrors("Password should not be spaced");
            return false;
        }
     
        else if (password.length < 5) {
            seterrors("Password must be at least 5 char long");
            return false;
        }
        else if (confirm !== password) {
            seterrors("Enter the same password to confirm");
            return false;
        }
        else{
            setindics(true)
            authenticate()
            
        }
        
        }
        else{
                    if (msisdn.length < 10) {
            seterrors("Add a valid Phone number");
            return false;
        }
        else if (otp.length!=6 && pp=="proceed") {
            seterrors("Wrong OTP code");
            return false;
        }
        else {
            if(pp=="verify"){
            otpRequestCheck(otp)
            }
            else{

            pp !="proceed"?getOtp(msisdn):false;
            }
        }


        }
    };
    

    const ValidateLogin=()=>{
        if(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/gim.test(olduseremail.trim())==false){
            seterrors("Add a valid emial eg.hello@gmail.com");
        return false;
        } 
        else if (/\s/gim.test(olduseremail)){
            seterrors("email should not be spaced");
        return false
        }
        else if(oldpwd==""){
            seterrors("Add a valid password");
        return false;
        }
        else if (/\s/gim.test(oldpwd)){
            seterrors("Password should not be spaced");

        }

        else if(oldpwd.length<5){
            seterrors("password must be at least 5 char long");
        return false;
        }else{
            setindics(true)
            authlogin()

        }
    }
    const authlogin=()=>{
        let id =`${new Date().getTime()}`
        let payloadData={email:olduseremail,password:oldpwd}
        const options = {
            method: 'POST',
            headers: {
                "User-Agent":"Apidog/1.0.0 (https://apidog.com)",
                "Content-Type":"application/json"},
            body:JSON.stringify(payloadData),
            redirect: 'follow'
         };
fetch(domain+"/api/v1/auth/login", options)
.then(response => response.json())
.then((result) =>{result.status?userin(result):servererrors(result)})
.catch((error)=>{ seterrors(`${error}`)})
}
const userin=(result)=>{
populate(result);
setTimeout(() => {
activateuser()
}, 1000);

}



    return (
        <div>
            <div className="register">
                {showing && <div className="successmessage"></div>}

                <img className="regpic" src={found} alt=""/>
                <img className="regpic" src={found} alt=""/>
                
                <div className="regbox">
                    <div className="half">
                        <div className="picked">
                            <img src={found} className="brown" alt=""/>
                            <img src={found} className="brown mask" alt=""/>
                        </div>
                    </div>
                    <div className="half">
                        <div className="regform">
                           {!showopage && mountsignup?(
                            <div className="mbox">
                            <div className="inputform">
                                <MailOutlined className="micon"/>
                                <input onChange={(e) => setemail(e.currentTarget.value)} type="text" placeholder='EMAIL' className="impbox"/>
                            </div>
                            <div className="inputform">
                                <UserAddOutlined className="micon"/>
                                <input onChange={(e) => setfirstName(e.currentTarget.value)} type="text" placeholder='firstName' className="impbox"/>
                            </div>
                            <div className="inputform">
                                <UserAddOutlined className="micon"/>
                                <input onChange={(e) => setlastName(e.currentTarget.value)} type="text" placeholder='lastName' className="impbox"/>
                            </div>
                            <div className="inputform">
                                <LockOutlined/>
                                <input onChange={(e) => setpassword(e.currentTarget.value)} type="password" placeholder='PASSWORD' className="impbox"/>
                            </div>
                            <div className="inputform">
                                <LockOutlined/>
                                <input onChange={(e) => setconfirm(e.currentTarget.value)} type="password" placeholder='CONFIRM PASSWORD' className="impbox"/>
                            </div>
                            
                            {hasref ? (
                                <>
                                    <div className="regbutton" onClick={() => sethasref(false)}>
                                        remove referal section
                                    </div>
                                    <div className="inputform">
                                        <input className='impbox' type="text" onChange={(e) => setreferalCode(e.currentTarget.value)} placeholder='referal code...'/>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="noted">
                                        <InfoCircleFilled className="micon"/>Optional: Add referal code
                                    </div>
                                    <div className="regbutton" onClick={() => sethasref(true)}>
                                        Add referal code
                                    </div>
                                </>
                            )}
                            <div className="otpverbox">
                                
                            <div className="regbutton" onClick={()=>{ValidateSignup("proceed")}}>
                                {indics?"...":"Sign Up"}
                            </div>
                            <div className="regbutton" style={{filter:"invert("}} onClick={()=>{setmountsignup(false)}}>
                                {"Login Instead?"}
                            </div>
                            </div>
                            
                            </div>):false}
                            {!showopage && !mountsignup?(
                                <div className="mbox">
                           
                            <div className="inputform">
                                <UserAddOutlined className="micon"/>
                                <input onChange={(e) => setolduseremail(e.currentTarget.value)} type="text" placeholder='username' className="impbox"/>
                            </div>
                            <div className="inputform">
                                <LockOutlined/>
                                <input onChange={(e) => setoldpwd(e.currentTarget.value)} type="password" placeholder='PASSWORD' className="impbox"/>
                            </div>
                            
                         
                            <div className="regbutton" onClick={()=>{ValidateLogin()}}>
                                {indics?"...":"Sign in"}
                            </div>
                            
                            <div className="noted">
                                <InfoCircleFilled className="micon"/> Dont have an account?
                            </div>
                            <div className="regbutton" style={{background:"black",color:"white"}} onClick={()=>{setmountsignup(true)}}>
                                {"Sign Up Instead?"}
                            </div></div>
                            ):false}
                           {showopage?( <div className="tootp">
                                   <div className="inputform">
                                <PhoneOutlined/>
                                <input onChange={(e) => setmsisdn(e.currentTarget.value)} type="text" placeholder='Phone' className="impbox"/>
                            </div>
                            <div className="noted">
                                <InfoCircleFilled className="micon"/> Click verify to get OTP code
                            </div>
                            <div className="otpverbox"> 
                                <div className="otpver" onClick={ValidateSignup}> 
                                    <CheckCircleOutlined className="micon" style={{filter: "invert(1)"}}/>{bools?"...":"Verify"}
                                </div>
                                <div className="resend">
                                    <ClockCircleOutlined className="micon"/> <span className="count">{!bools?"count down":"wait.."+counter+"s"}</span>
                                </div>
                            </div>
                            <div className="inputform">
                                <MessageOutlined/>
                                <input onChange={(e) => setotp(e.currentTarget.value)} type="number" placeholder='OTP CODE HERE (6 DIGIT)' className="impbox"/>
                            </div>
                            <div className="regbutton" onClick={()=>{ValidateSignup("verify")}}>
                                {indics?"...":"Proceed"}

                            </div>
                         
                            </div>
                        
                        ):false}
                        </div>
                    </div>
                    <img className="tinylogo" src={logo} alt=""/>
                </div>
            </div>
        </div>
    );
}