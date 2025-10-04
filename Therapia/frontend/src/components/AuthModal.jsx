import React, { useState } from 'react';
import './AuthModal.css';
import loginIllustration from '../assets/login1.png';
import signupIllustration from '../assets/signup1.png';

const AuthModal = ({ isOpen, onClose }) => {
  const [mode, setMode] = useState('login'); // 'login' | 'signup'
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState('+88');
  const [showReferral, setShowReferral] = useState(false);
  const [referral, setReferral] = useState('');

  // Signup-only fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="auth-modal-overlay" onClick={onClose}>
      <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
        <button className="auth-close" onClick={onClose} aria-label="Close">✕</button>

        <div className="auth-content">
          {/* Left side illustration and text */}
          <div className="auth-left">
            {mode === 'login' ? (
              <>
                <h2 className="auth-left-title">Quick & easy ordering process</h2>
                <p className="auth-left-desc">
                  Now you can order your medicine from Therapeia. We provide all the
                  medicines you need.
                </p>
                <div className="illustration">
                  <img src={loginIllustration} alt="login illustration" />
                </div>
              </>
            ) : (
              <>
                <h2 className="auth-left-title">Easy & multi-payment solutions</h2>
                <p className="auth-left-desc">
                  You can pay in cash. Or online using your usual methods.
                </p>
                <div className="illustration">
                  <img src={signupIllustration} alt="signup illustration" />
                </div>
              </>
            )}
          </div>

          {/* Right side login/signup */}
          <div className="auth-right">
            {mode === 'login' ? (
              <>
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
                <p className="auth-switch">
                  New here? <button className="link-btn" onClick={() => setMode('signup')}>Create an account</button>
                </p>
              </>
            ) : (
              <>
                <h2 className="auth-title">Create Account</h2>
                <p className="auth-subtitle">
                  Sign up to order quickly, track your purchases, and get offers.
                </p>

                <div className="form-group">
                  <label className="auth-label">Full Name</label>
                  <input
                    type="text"
                    className="text-input"
                    placeholder="Enter your full name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>

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

                <div className="form-group">
                  <label className="auth-label">Email (optional)</label>
                  <input
                    type="email"
                    className="text-input"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="auth-label">Password</label>
                  <input
                    type="password"
                    className="text-input"
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="auth-label">Confirm Password</label>
                  <input
                    type="password"
                    className="text-input"
                    placeholder="Re-enter password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>

                <div className="terms-row">
                  <input
                    id="terms"
                    type="checkbox"
                    checked={acceptTerms}
                    onChange={(e) => setAcceptTerms(e.target.checked)}
                  />
                  <label htmlFor="terms">
                    I agree to the <a href="#">Terms & Conditions</a> and <a href="#">Privacy Policy</a>.
                  </label>
                </div>

                <button className="send-btn">Create Account</button>

                <p className="auth-switch">
                  Already have an account? <button className="link-btn" onClick={() => setMode('login')}>Login</button>
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;