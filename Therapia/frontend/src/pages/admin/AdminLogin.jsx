import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './admin.css'

export default function AdminLogin() {
  const [email, setEmail] = useState('admin@example.com')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(data?.message || 'Login failed')
      }
      navigate('/admin', { replace: true })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: 420, margin: '60px auto' }}>
      <div className="admin-card">
        <div className="admin-header">
          <h2 className="admin-title">Admin Login</h2>
        </div>
        <form onSubmit={onSubmit}>
          <div className="form-row">
            <label>Email</label>
            <input
              className="form-input"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="admin@example.com"
              autoComplete="username"
              required
            />
          </div>
          <div className="form-row">
            <label>Password</label>
            <input
              className="form-input"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Your admin password"
              autoComplete="current-password"
              required
            />
          </div>
          <div className="form-actions">
            <button className="admin-btn" type="submit" disabled={loading}>
              {loading ? 'Logging in…' : 'Login'}
            </button>
          </div>
          {error && <p style={{ color: '#f03e3e', marginTop: 8 }}>{error}</p>}
        </form>
      </div>
    </div>
  )
}