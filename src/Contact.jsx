import React from 'react'
import { useState } from 'react';
 import { Link } from 'react-router-dom';
 import spinner from '/imgs/loader.svg'

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
    <div className="page">
    
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
 <div className="download " onClick={sender}>{spin?<img src={spinner} className="spinner" width={200}/>:false}Submit</div>
            </div>
          </div>
 
    </div>
    <a href="/uepasco" className='return'>👈 </a>
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