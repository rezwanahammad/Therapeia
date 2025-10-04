import React from 'react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-col">
          <div className="brand">Therapeia</div>
          <p className="brand-desc">
            Your trusted health partner. Order medicine, healthcare, and more
            from anywhere.
          </p>
          <div className="certified">Bangladesh's only LegitScript certified online healthcare platform</div>
        </div>

        <div className="footer-col">
          <h4 className="footer-title">Company</h4>
          <ul className="footer-list">
            <li><a href="#">Careers</a></li>
            <li><a href="#">Privacy Policy</a></li>
            <li><a href="#">Terms & Conditions</a></li>
            <li><a href="#">Refund & Return</a></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4 className="footer-title">Useful Links</h4>
          <ul className="footer-list">
            <li><a href="#">FAQ</a></li>
            <li><a href="#">Account</a></li>
            <li><a href="#">Register the Pharmacy</a></li>
            <li><a href="#">Special Offers</a></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4 className="footer-title">Contact Info</h4>
          <address className="contact">
            Address: D/15-1, Road-36, Block-D, Section-10, Mirpur, Dhaka-1216
          </address>
          <div className="contact">Hot Line: 09610018778</div>
          <div className="contact">Whatsapp: 01714653351</div>
          <div className="socials">
            <span aria-label="LinkedIn">ln</span>
            <span aria-label="Facebook">f</span>
            <span aria-label="X">X</span>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div>© {new Date().getFullYear()} Therapeia. All rights reserved.</div>
        <div className="verified">Verified by Therapeia Security</div>
      </div>
    </footer>
  );
};

export default Footer;