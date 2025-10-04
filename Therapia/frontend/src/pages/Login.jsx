import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { setCurrentUser } from '../utils/auth'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [status, setStatus] = useState(null)
  const navigate = useNavigate()

  const onSubmit = async e => {
    e.preventDefault()
    setStatus('pending')
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password: password.trim() })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.message || 'Login failed')
      const meRes = await fetch('/api/auth/me')
      const meData = await meRes.json()
      if (!meRes.ok) throw new Error(meData?.message || 'Failed to load profile')
      setCurrentUser(meData.user)
      setStatus({ type: 'success', message: 'Logged in' })
      navigate('/')
    } catch (err) {
      setStatus({ type: 'error', message: err.message })
    }
  }

  return (
    <div style={{ maxWidth: 480, margin: '40px auto', background: '#fff', padding: 20, borderRadius: 12, border: '1px solid #e9ecef' }}>
      <h2 style={{ marginTop: 0 }}>Login</h2>
      <p>Enter your email and password to login.</p>
      <form onSubmit={onSubmit}>
        <input
          type="email"
          style={{ width: '100%', padding: '12px 14px', border: '1px solid #ced4da', borderRadius: 8 }}
          placeholder="you@example.com"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          style={{ width: '100%', marginTop: 12, padding: '12px 14px', border: '1px solid #ced4da', borderRadius: 8 }}
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        <button type="submit" style={{ marginTop: 12, width: '100%', background: '#0c7b67', color: '#fff', border: 'none', borderRadius: 8, padding: '12px 18px', cursor: 'pointer' }} disabled={!email.trim() || !password.trim()}>
          Login
        </button>
      </form>
      {status === 'pending' && <p>Logging in...</p>}
      {status?.type === 'error' && <p style={{ color: 'red' }}>{status.message}</p>}
    </div>
  )
}

export default Login
