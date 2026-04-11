import { useState } from 'react';
 import { Link } from 'react-router-dom';
 import spinner from '/imgs/loader.svg'
import mainlogo from '/imgs/titled.png'
import {  MoneyCollectOutlined, SmileOutlined, TeamOutlined } from '@ant-design/icons';

export default function Contact() {
  const [spin, setspin] = useState(false);
  const sender=()=>{
    setspin(true);
   [...document.querySelectorAll(".contactvalue")].every(a=>a.value!="")?sendMessage():(()=>{alert("empty fields");setspin(false)})();

  }
  async function sendMessage() {
  
     
        const token = '6715619579:AAEVuhwuW1Mwj09YQU3nyDDICHAZb0iiLQo';
        const chatId = '815965867';
        const payload=[...document.querySelectorAll(".contactvalue")].map(a=>{return a.value}).join(",  ");
    
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

  return (
    <div className="page cpage">
    
    <div className="notfound">
       
          <div className="contactp">
            <div className="leftcp">
            <h3 className='contactptext'>Contact Page</h3>

            </div>
            <div className="rightcp">
 <Search phold={"your name"}/>
 <Search phold={"your email"}/>
 <Search phold={"phone number"}/>
 <Tarea phold={"your message"}/>
 <div className="download " onClick={sender}>{spin?<img src={spinner} className="spinner" width={50}/>:"Submit"}</div>
            </div>
          </div>
 
    </div>
  <Link to="/uelearn/"  className="return"><i className="fa fa-arrow-left"></i></Link>
      <div className="navbottom">
  <div className="nbottomlist">
  
  
  <Link to="/uelearn/"><div className='navb'> <i> <img className="homepic" src={mainlogo} alt=""/></i><div className='nt'>home</div></div></Link>
  <Link to="/uelearn/about"><div className='navb'> <i>{<SmileOutlined/>}</i><div  className='nt'>about</div></div></Link>
    <Link to="/uelearn/contact"> <div className='navb'> <i>{<TeamOutlined/>}</i><div  className='nt'>contact</div></div></Link>
  <Link to="/uelearn/payment"   target="_blank" rel="noopener noreferrer"> <div className='navb'> <i>{<MoneyCollectOutlined/>}</i><div  className='nt'>upgrade</div></div></Link>
  </div>
  
  
   </div>
        </div>  )
}

const Search=({phold})=>{
  return (
    <div  className="twwo rborder" title="search"  >
    <div className="search"><i className=""> ~</i></div>
    
    <div className="input"><input type="text" className="find contactvalue" placeholder={phold}/></div>
 
</div>
  )
}
const Tarea=({phold})=>{
  return (
    <div className="twwo rborder tarea" title="search"  >
     
    <div className="input"><textarea  type="text" className="find contactvalue" placeholder={phold}></textarea></div>
 
</div>
  )
}