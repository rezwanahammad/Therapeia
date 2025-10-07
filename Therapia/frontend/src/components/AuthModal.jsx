import React, { useState, useEffect } from 'react'
import './AuthModal.css'
import signupIllustration from '../assets/signup1.png'
import UserForm from './UserForm'
import { setCurrentUser as persistUser } from '../utils/auth'

const AuthModal = ({ isOpen, onClose, onLoggedIn, initialMode = 'login' }) => {
  const [mode, setMode] = useState(initialMode || 'login') // 'login' | 'signup'
  const [loginMethod, setLoginMethod] = useState('email') // 'phone' | 'email'
  const [phoneCountry, setPhoneCountry] = useState('+88')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loginStatus, setLoginStatus] = useState(null)

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode || 'login')
    }
  }, [isOpen, initialMode])

  const handleLogin = async () => {
    setLoginStatus('pending')
    try {
      if (loginMethod === 'phone') {
        throw new Error('Phone login not yet supported. Please use email.')
      }
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password: password.trim() })
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data?.message || `Login failed: ${res.status}`)
      }
      // Cookie is set by server; fetch current user from /api/auth/me
      const meRes = await fetch('/api/auth/me')
      const meData = await meRes.json()
      if (!meRes.ok) {
        throw new Error(meData?.message || 'Failed to load user profile')
      }
      const user = meData.user
      setLoginStatus({ type: 'success', message: 'Logged in successfully' })
      // Persist login for other pages
      persistUser(user)
      if (typeof onLoggedIn === 'function') onLoggedIn(user)
      onClose()
    } catch (err) {
      setLoginStatus({ type: 'error', message: err.message })
      console.error('Login error:', err)
    }
  }

  if (!isOpen) {
    return null
  }

  return (
    <div className="auth-modal-overlay" role="dialog" aria-modal="true">
      <div className="auth-modal">
        <button className="auth-close" onClick={onClose}>×</button>
        <div className="auth-content">
          <div className="auth-left">
            <div className="illustration">
              <img src={signupIllustration} alt="Signup Illustration" />
            </div>
            <h2 className="auth-left-title">Quick & easy ordering process</h2>
            <p className="auth-left-desc">Now you can order your medicine from Therapeia. We provide all the medicines you need.</p>
          </div>
          <div className="auth-right">
            <div className="toggle-buttons">
              <button className={`auth-toggle ${mode === 'login' ? 'active' : ''}`} onClick={() => setMode('login')}>Login</button>
              <button className={`auth-toggle ${mode === 'signup' ? 'active' : ''}`} onClick={() => setMode('signup')}>Create Account</button>
            </div>

            {mode === 'login' ? (
              <>
                <h2 className="auth-title">Login</h2>
                <p className="auth-subtitle">Login to make an order, access your orders, special offers, health tips, and more!</p>

                <div className="toggle-buttons login-method-toggle">
                  <button className={`auth-toggle ${loginMethod === 'phone' ? 'active' : ''}`} onClick={() => setLoginMethod('phone')}>Phone</button>
                  <button className={`auth-toggle ${loginMethod === 'email' ? 'active' : ''}`} onClick={() => setLoginMethod('email')}>Email</button>
                </div>

                {loginMethod === 'phone' ? (
                  <>
                    <label className="auth-label">Phone Number</label>
                    <div className="phone-input">
                      <select className="country-select" value={phoneCountry} onChange={e => setPhoneCountry(e.target.value)}>
                        <option value="+88">(+88) BD</option>
                      </select>
                      <input
                        className="number-input"
                        type="tel"
                        placeholder="Enter number"
                        value={phoneNumber}
                        onChange={e => setPhoneNumber(e.target.value)}
                      />
                    </div>
                    <button className="referral-toggle" type="button"><span>Have a referral code?</span><span className="chevron">›</span></button>
                    <button className="send-btn" onClick={handleLogin} disabled={!phoneNumber.trim() || phoneNumber.trim().length < 7}>Send</button>
                    <div className="divider"><span>or</span></div>
                    <div className="social-buttons">
                      <button className="social-btn google">G</button>
                      <button className="social-btn linkedin">in</button>
                    </div>
                  </>
                ) : (
                  <>
                    <label className="auth-label">Email</label>
                    <input
                      className="text-input"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                    />
                    <label className="auth-label" style={{ marginTop: 8 }}>Password</label>
                    <input
                      className="text-input"
                      type="password"
                      placeholder="Enter password"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                    />
                    <button className="send-btn" onClick={handleLogin} disabled={!email.trim() || !password.trim()}>
                      Login
                    </button>
                    {loginStatus === 'pending' && <p className="status">Logging in...</p>}
                    {loginStatus?.type === 'error' && <p className="status error">{loginStatus.message}</p>}
                  </>
                )}
              </>
            ) : (
              <>
                <h2 className="auth-title">Create Account</h2>
                <p className="auth-subtitle">Fill in your information to create an account.</p>
                <UserForm onSuccess={async () => {
                  try {
                    const meRes = await fetch('/api/auth/me')
                    const meData = await meRes.json()
                    if (meRes.ok && typeof onLoggedIn === 'function') {
                      onLoggedIn(meData.user)
                    }
                  } finally {
                    onClose()
                  }
                }} />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AuthModal
