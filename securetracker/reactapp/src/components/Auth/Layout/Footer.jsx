import React from "react";
import { Link } from "react-router-dom";
import "./Footer.css";
 
const Footer = () => {
  return (
    <footer className="st-footer">
      <div className="st-footer__inner">
        <div className="st-footer__brand">
          <div className="st-footer__logo" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none">
              <path
                d="M12 22s7-4.6 7-12a7 7 0 1 0-14 0c0 7.4 7 12 7 12Z"
                fill="currentColor"
                opacity="0.18"
              />
              <path
                d="M12 22s7-4.6 7-12a7 7 0 1 0-14 0c0 7.4 7 12 7 12Z"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinejoin="round"
              />
              <path
                d="M12 13.2a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4Z"
                fill="currentColor"
              />
            </svg>
          </div>
 
          <div>
            <div className="st-footer__title">Secure Tracker</div>
            <div className="st-footer__sub">Asset tracking • Alerts • Insights</div>
          </div>
        </div>
 
        <div className="st-footer__cols">
          <div className="st-footer__col">
            <div className="st-footer__head">Product</div>
            <Link className="st-footer__link" to="/dashboard">Dashboard</Link>
            <Link className="st-footer__link" to="/assets">Assets</Link>
            <Link className="st-footer__link" to="/map">Live Map</Link>
          </div>
 
          <div className="st-footer__col">
            <div className="st-footer__head">Support</div>
            <Link className="st-footer__link" to="/support">Help Center</Link>
            <Link className="st-footer__link" to="/privacy">Privacy Policy</Link>
            <Link className="st-footer__link" to="/terms">Terms of Service</Link>
          </div>
 
          <div className="st-footer__col">
            <div className="st-footer__head">Contact</div>
            <a className="st-footer__link" href="mailto:support@securetracker.com">
              support@securetracker.com
            </a>
            <div className="st-footer__note">Mon–Fri • 9:00–18:00</div>
          </div>
        </div>
      </div>
 
      <div className="st-footer__bottom">
        <div>© {new Date().getFullYear()} Secure Tracker. All rights reserved.</div>
 
        <div className="st-footer__bottomLinks">
          <Link to="/privacy">Privacy</Link>
          <span className="st-dot">•</span>
          <Link to="/terms">Terms</Link>
          <span className="st-dot">•</span>
          <Link to="/support">Support</Link>
        </div>
      </div>
    </footer>
  );
};
 
export default Footer;