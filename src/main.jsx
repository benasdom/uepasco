import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter as Router, Route,Routes } from 'react-router-dom';
import App from './App.jsx'
import './index.css'
import About from './About.jsx';
import Contact from './Contact.jsx';
import Notfound from './Notfound.jsx';
import Payment from './menu/Payment.jsx';
import './mobile.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
 <Router>
 <Routes>
  <Route path="/uepasco" element={<App />} />
  <Route path="/uepasco/contact" element={<Contact />} />
  <Route path="/uepasco/about" element={<About />} />
  <Route path="/uepasco/payment" element={<Payment />} />
  <Route path="*" element={<Notfound />} />
</Routes>
</Router> 
  </React.StrictMode>,
)
