import {  MoneyCollectOutlined, SmileFilled, TeamOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import mainlogo from '/imgs/titled.png'


export default function About() {

  
  return (
    <div className="page cpage">
    
    <div className="notfound">
      <br></br>
          <div className="">
            <h2 className="about hide"> Unity Elites is a team of developers, that offers services of web development, mobile development, front-end back-end systems, ecommerce, sales, advertisement and many more.</h2>
          </div>
          <h1 className="notfound-text">
            🧑‍💻
          </h1>

          <div className="">
            <h2 className="not-found-text2">
              If you wish to know more about us visit <a className='link' target='_blank' href="https://benasdom.github.io/ue"> 👉 unityelites 👈</a>
             </h2>
          </div>
    </div>
    
  <Link to="/uelearn/"  className="return"><i className="fa fa-arrow-left"></i></Link>
      <div className="navbottom">
<div className="nbottomlist">


<Link to="/uelearn/"><div className='navb'> <i> <img className="homepic" src={mainlogo} alt=""/></i><div className='nt'>home</div></div></Link>
<Link to="/uelearn/about"><div className='navb'> <i>{<SmileFilled/>}</i><div  className='nt'>about</div></div></Link>
  <Link to="/uelearn/contact"> <div className='navb'> <i>{<TeamOutlined/>}</i><div  className='nt'>contact</div></div></Link>
  <Link to="/uelearn/payment"   target="_blank" rel="noopener noreferrer"> <div className='navb'> <i>{<MoneyCollectOutlined/>}</i><div  className='nt'>upgrade</div></div></Link>

</div>


 </div>
        </div>  )
}

