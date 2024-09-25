import React from 'react'
import { Link } from 'react-router-dom';

const  Notfound=()=> {
  return (
    <>
 <div className="page cpage">
 <div className="notfound">
    <br></br>
        <div className="">
          <h1 className="about">
          <h3>OOPS! PAGE NOT FOUND. The page you are looking for does not exist</h3>
          </h1>
        </div>
        <h1 className="notfound-text">404</h1>


        <div className="">
          <h2 className="not-found-text2">
          WE ARE SORRY, BUT THE PAGE YOU REQUESTED WAS NOT FOUND
           </h2>
        </div>
  </div>
  <br></br>
  <Link to="/uepasco/" className='return'>👈 </Link>
    </div>
</>
   
  )
}

export default Notfound
