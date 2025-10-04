import React, { useState } from 'react';
import './AuthModal.css';
import signupIllustration from '../assets/signup1.png';
import UserForm from './UserForm';
const AuthModal = ({ isOpen, onClose, onLoggedIn }) => {
  const [mode, setMode] = useState('login'); // 'login' | 'signup'
  const [loginId, setLoginId] = useState('');
  const [loginStatus, setLoginStatus] = useState(null);

  const handleLogin = async () => {
    setLoginStatus('pending');
    try {
      const qs = new URLSearchParams();
      // accept either email or phone typed by user
      if (/@/.test(loginId)) qs.set('email', loginId.trim());
      else qs.set('phone', loginId.trim());
      const res = await fetch(`/api/users/find?${qs.toString()}`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.message || `Login failed: ${res.status}`);
      }
      const user = data?.user;
      try { localStorage.setItem('currentUser', JSON.stringify(user)); } catch { /* ignore storage errors */ }
      setLoginStatus({ type: 'success', message: 'Logged in successfully' });
      if (typeof onLoggedIn === 'function') onLoggedIn(user);
      onClose();
    } catch (err) {
      setLoginStatus({ type: 'error', message: err.message });
      console.error('Login error:', err);
    }
  };

  return (!isOpen) ? null : (
    <div className="auth-modal-overlay" onClick={onClose}>
      <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
        <button className="auth-close" onClick={onClose} aria-label="Close">✕</button>

        <div className="auth-content">
          {/* Left side illustration and text */}
          <div className="auth-left">
            <h2 className="auth-left-title">Easy & multi-payment solutions</h2>
            <p className="auth-left-desc">
              You can pay in cash. Or online using your usual methods.
            </p>
            <div className="illustration">
              <img src={signupIllustration} alt="signup illustration" />
            </div>
          </div>

          {/* Right side: Login or Create Account */}
          <div className="auth-right">
            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
              <button
                className="link-btn"
                onClick={() => setMode('login')}
                style={{ fontWeight: mode === 'login' ? 700 : 400 }}
              >Login</button>
              <span>•</span>
              <button
                className="link-btn"
                onClick={() => setMode('signup')}
                style={{ fontWeight: mode === 'signup' ? 700 : 400 }}
              >Create Account</button>
            </div>

            {mode === 'login' ? (
              <>
                <h2 className="auth-title">Login</h2>
                <p className="auth-subtitle">Enter email or phone to login.</p>
                <label className="auth-label">Email or Phone</label>
                <input
                  className="text-input"
                  placeholder="you@example.com or 01XXXXXXXXX"
                  value={loginId}
                  onChange={e => setLoginId(e.target.value)}
                />
                <button className="send-btn" onClick={handleLogin} disabled={!loginId.trim()}>
                  Login
                </button>
                {loginStatus === 'pending' && <p className="status">Logging in...</p>}
                {loginStatus?.type === 'error' && <p className="status error">{loginStatus.message}</p>}
              </>
            ) : (
              <>
                <h2 className="auth-title">Create Account</h2>
                <p className="auth-subtitle">Fill in your information to create an account.</p>
                <UserForm onSuccess={(user) => {
                  try { localStorage.setItem('currentUser', JSON.stringify(user)); localStorage.setItem('hasAccount', 'true'); } catch { /* ignore storage errors */ }
                  if (typeof onLoggedIn === 'function') onLoggedIn(user);
                  onClose();
                }} />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;