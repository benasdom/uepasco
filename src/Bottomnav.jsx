import { Link } from "react-router-dom"
import './index.css'
import mainlogo   from '/imgs/titled.png'


import {
  SmileFilled, TeamOutlined, MoneyCollectOutlined, PoweroffOutlined, SolutionOutlined
} from '@ant-design/icons'
import { logout } from "./menu/authfetch"
import ThemeToggle from "./features/ThemeToggle"
import PWAInstallButton from "./PWAInstallButton"
import { getLastSolution } from "./Searchlist"
import { useState, useEffect } from "react"

const styles=`

  .amb-nav {
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 10;
    display: flex;
    align-items: center;
    gap: 4px;
    background: rgba(10,12,28,0.8);
    border: 1px solid rgba(255,255,255,0.1);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border-radius: 24px;
    padding: 8px 12px;
    box-shadow: 0 8px 40px rgba(0,0,0,0.5);
    white-space: nowrap;
  }
  .amb-nav-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    padding: 8px 14px;
    border-radius: 16px;
    color: rgba(255,255,255,0.4);
    font-size: 10px;
    font-weight: 500;
    text-decoration: none;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    transition: all 0.2s ease;
    min-width: 52px;
  }
  .amb-nav-item:hover { color: rgba(255,255,255,0.8); background: rgba(255,255,255,0.06); }
  .amb-nav-item.active { color: #c4b5fd; background: rgba(139,92,246,0.15); }
  .amb-nav-icon { font-size: 18px; line-height: 1; display: flex; align-items: center; justify-content: center; }
  .amb-nav-logo { width: 20px; height: 20px; object-fit: contain; opacity: 0.5; transition: opacity 0.2s; }
  .amb-nav-item:hover .amb-nav-logo, .amb-nav-item.active .amb-nav-logo { opacity: 1; }
    @media (max-width: 600px) {
    .amb-card { padding: 32px 24px; border-radius: 20px; }
    .amb-nav {
      max-width: 94vw;
      overflow-x: auto;
      -webkit-overflow-scrolling: touch;
      scrollbar-width: none;
    }
    .amb-nav::-webkit-scrollbar { display: none; }
    .amb-nav-item { padding: 8px 10px; min-width: 44px; }
    .amb-nav-label { font-size: 8px; }
  }

`;
export function Bottomnav({cname="",active=""}) {
   const logoutUser=()=>{
      if(confirm("Confirm to Leave")){
        logout();
      location.reload();
  
      }
    }

   // Computed here (rather than passed as a prop) so every page that
   // renders Bottomnav — not just App.jsx — gets the shortcut for free
   // once a solution has been viewed at least once.
   const [lastSolution, setLastSolution] = useState(null);
   useEffect(() => {
     setLastSolution(getLastSolution());
   }, []);

  return (
    <>
    <style>{styles}</style>
    <ThemeToggle />
    <div className={cname}>
 <nav className={`amb-nav `}>
          <Link to="/" className={`amb-nav-item ${active=="home"?"active":""}`}>
            <span className="amb-nav-icon"><img className="amb-nav-logo" src={mainlogo} alt="" /></span>
            <span className="amb-nav-label">Home</span>
          </Link>
          {lastSolution && (
            <Link
              to={`/dashboard/solution/${lastSolution.namedfile}`}
              className={`amb-nav-item ${active=="solutions"?"active":""}`}
              title={lastSolution.courseName || "Your last solution"}
            >
              <span className="amb-nav-icon"><SolutionOutlined /></span>
              <span className="amb-nav-label">Solutions</span>
            </Link>
          )}
          <Link to="/about" className={`amb-nav-item ${active=="about"?"active":""}`}>
            <span className="amb-nav-icon"><SmileFilled /></span>
            <span className="amb-nav-label">About</span>
          </Link>
          <Link to="/contact" className={`amb-nav-item ${active=="contact"?"active":""}`}>
            <span className="amb-nav-icon"><TeamOutlined /></span>
            <span className="amb-nav-label">Contact</span>
          </Link>
          <Link to="/payment" className={`amb-nav-item ${active=="payment"?"active":""}`} target="_blank" rel="noopener noreferrer">
            <span className="amb-nav-icon"><MoneyCollectOutlined /></span>
            <span className="amb-nav-label">Upgrade</span>
          </Link>
          <PWAInstallButton variant="navitem" />
          <div className={`amb-nav-item`} onClick={logoutUser} >
            <span className="amb-nav-icon"><PoweroffOutlined /></span>
            <span className="amb-nav-label">Logout</span>
          </div>
        </nav>
    </div>
  
    </>

  )
}