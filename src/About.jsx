import React from 'react'
import { Link } from 'react-router-dom';

export default function About() {
  return (
    <div className="page">
    
    <div className="notfound">
    <h3>About Us</h3>
          <div className="">
            <h1 className="about"> Unity Elites is a team of developers, that offers services of web development, mobile development, front-end back-end systems, ecommerce, sales, advertisement and many more.</h1>
          </div>
          <h1 className="notfound-text">
            🧑‍💻🧑🏾‍💻👩🏾‍💻
          </h1>

          <div className="">
            <h2 className="not-found-text2">
              If you wish to know more about us visit <a className='link' href="unityelites.com">👉 www.unityelites.com 👈</a>
             </h2>
          </div>
    </div>
    <a href="/uepasco" className='return'>👈 </a>
        </div>  )
}
