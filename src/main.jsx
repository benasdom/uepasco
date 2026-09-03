import React, { useState } from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter as Router, Route,Routes } from 'react-router-dom';
import App from './App.jsx'
import './index.css'

import About from './About.jsx';
import Contact from './Contact.jsx';
import Notfound from './Notfound.jsx';
import Payment from './menu/Payment.jsx';
import Reset from './menu/Reset.jsx';
import './mobile.css'
import './print.css'
import Register from './menu/Register.jsx';
import { AppProvider } from './Appcontext.jsx';
import { registerServiceWorker } from './lib/registerServiceWorker';
import PrivacyTermsPage from './menu/privacyTerms.jsx';
import Searchlist from './Searchlist.jsx';

registerServiceWorker();

const MainRouter = () => {
  const [credits, setCredits] = useState(0);

  return (
    <Router basename="/">
      <AppProvider>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/reset-password" element={<Reset />} />
          <Route path="/login" element={<Register />} />
          <Route path="/about" element={<About />} />
          <Route path="/dashboard" element={<Searchlist />} />
          <Route path="/dashboard/solution/:filename" element={<Searchlist />} />
          <Route path="/dashboard/:view" element={<Searchlist />} />
          <Route path="/payment" element={<Payment setcredits={setCredits} />} />
          <Route path="/policy_and_terms" element={<PrivacyTermsPage/>} />
          <Route path="*" element={<Notfound />} />
        </Routes>
      </AppProvider>
    </Router>
  );
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <MainRouter />
  </React.StrictMode>
)