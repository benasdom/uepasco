import React from 'react'
import { Link } from 'react-router-dom';

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
    
    <Link to="/uepasco/" className='return'>👈 </Link>
        </div>  )
}

