import React, { useState } from 'react';
import './AuthModal.css';

const AuthModal = ({ isOpen, onClose }) => {
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState('+88');
  const [showReferral, setShowReferral] = useState(false);
  const [referral, setReferral] = useState('');

  if (!isOpen) return null;

  return (
    <div className="auth-modal-overlay" onClick={onClose}>
      <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
        <button className="auth-close" onClick={onClose} aria-label="Close">✕</button>

        <div className="auth-content">
          {/* Left side illustration and text */}
          <div className="auth-left">
            <div className="illustration">
              <img src="/assets/react.svg" alt="illustration" />
            </div>
            <h2 className="auth-left-title">Quick & easy ordering process</h2>
            <p className="auth-left-desc">
              Now you can order your medicine from Therapeia. We provide all the
              medicines you need.
            </p>
            <div className="auth-dots">
              <span className="dot active" />
              <span className="dot" />
              <span className="dot" />
            </div>
          </div>

          {/* Right side login/signup */}
          <div className="auth-right">
            <h2 className="auth-title">Login</h2>
            <p className="auth-subtitle">
              Login to make an order, access your orders, special offers, health tips, and more!
            </p>

            <label className="auth-label">Phone Number</label>
            <div className="phone-input">
              <select className="country-select" value={countryCode} onChange={(e) => setCountryCode(e.target.value)}>
                <option value="+88">(+88) BD</option>
              </select>
              <input
                type="tel"
                className="number-input"
                placeholder="Enter number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            <button className="referral-toggle" onClick={() => setShowReferral((s) => !s)}>
              Have a referral code?
              <span className="chevron">▸</span>
            </button>
            {showReferral && (
              <input
                type="text"
                className="referral-input"
                placeholder="Enter referral code"
                value={referral}
                onChange={(e) => setReferral(e.target.value)}
              />
            )}

            <button className="send-btn">Send</button>

            <div className="divider">
              <span>or</span>
            </div>

            <div className="social-buttons">
              <button className="social-btn google" aria-label="Sign in with Google">G</button>
              <button className="social-btn linkedin" aria-label="Sign in with LinkedIn">in</button>
            </div>

            <p className="terms">
              By continuing you agree to <a href="#">Terms & Conditions</a>,
              <a href="#"> Privacy Policy</a> & <a href="#">Refund-Return Policy</a>
            </p>
            <p className="signup-callout">
              New here? <a href="#">Create an account</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;