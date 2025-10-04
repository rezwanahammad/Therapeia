import React from 'react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="global-footer">
      <div className="footer-container">
        <div className="footer-links">
          <a href="#">About</a>
          <a href="#">Contact</a>
          <a href="#">Privacy</a>
          <a href="#">Terms</a>
        </div>
        <div className="footer-info">
          <span>📞 Call for Order: 16778</span>
          <span>© {new Date().getFullYear()} Therapeia</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;