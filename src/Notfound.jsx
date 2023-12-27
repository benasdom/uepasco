import React from 'react'
import { Link } from 'react-router-dom';

const  Notfound=()=> {
  return (
    <>
 <div className="page">
    
<div className="notfound">
<h3>OOPS! PAGE NOT FOUND</h3>
      <div className="">
        <h1 className="notfound-text">404</h1>
      </div>
      <div className="">
        <h2 className="not-found-text2">
          WE ARE SORRY, BUT THE PAGE YOU REQUESTED WAS NOT FOUND
        </h2>
      </div>
</div>
<Link to="/uepasco">
<div className='return'>Return </div>

  </Link>
    </div>
</>
  )
}

export default Notfound
