import React, { useEffect, useMemo, useState } from 'react'
import { getCurrentUser } from '../utils/auth'
import './account.css'

function splitName(fullName = '') {
  const parts = String(fullName).trim().split(/\s+/)
  const firstName = parts[0] || ''
  const lastName = parts.slice(1).join(' ') || ''
  return { firstName, lastName }
}

const AccountDashboard = () => {
  const [user, setUser] = useState(getCurrentUser())
  const [status, setStatus] = useState(null)
  const initialForm = useMemo(() => {
    const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(' ')
    return {
      fullName,
      gender: user?.gender || 'prefer_not_say',
      dateOfBirth: user?.dateOfBirth ? new Date(user.dateOfBirth).toISOString().slice(0, 10) : '',
      email: user?.email || '',
      phone: user?.phone || '',
    }
  }, [user])
  const [form, setForm] = useState(initialForm)

  useEffect(() => { setForm(initialForm) }, [initialForm])

  useEffect(() => {
    // Refresh user from session cookie
    const load = async () => {
      try {
        const res = await fetch('/api/auth/me')
        if (res.ok) {
          const data = await res.json()
          setUser(data.user)
        }
      } catch (err) {
        console.error('Failed to refresh user:', err)
      }
    }
    load()
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const updateProfile = async () => {
    if (!user?._id) return
    setStatus('pending')
    try {
      const { firstName, lastName } = splitName(form.fullName)
      const payload = {
        firstName,
        lastName,
        gender: form.gender,
        phone: form.phone,
        dateOfBirth: form.dateOfBirth ? new Date(form.dateOfBirth) : undefined,
      }
      const res = await fetch(`/api/users/${user._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.message || 'Failed to update profile')
      setUser(data.user)
      setStatus({ type: 'success', message: 'Profile updated' })
    } catch (err) {
      setStatus({ type: 'error', message: err.message })
    }
  }

  if (!user) {
    return (
      <div className="account-wrapper">
        <div className="account-content">
          <div className="account-card">
            <h2>Account Dashboard</h2>
            <p>Please log in to view your dashboard.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="account-wrapper">
      <aside className="account-sidebar">
        <div className="account-user">
          <div className="avatar">👤</div>
          <div>
            <div className="user-name">{user.firstName} {user.lastName}</div>
            <div className="cash">Arogga Cash : <span>50</span></div>
            <button className="view-profile">View Profile</button>
          </div>
        </div>
        <nav className="account-nav">
          <button className="nav-link">🔔 Notification</button>
          <button className="nav-link">🧾 Orders</button>
          <button className="nav-link">🧪 My Lab Test</button>
          <button className="nav-link">💊 Prescriptions</button>
          <button className="nav-link">📣 Notified Products</button>
          <button className="nav-link">💡 Suggest Products</button>
          <button className="nav-link">💖 Wishlist</button>
          <button className="nav-link">🏠 Manage Address</button>
          <button className="nav-link">💳 Transaction History</button>
          <button className="nav-link">🎁 Special Offers</button>
          <button className="nav-link">👥 Refer and Earn</button>
          <button className="nav-link">🩺 Health Tips</button>
          <button className="nav-link">⭐ Rate us</button>
        </nav>
        <div className="account-legal">
          <button className="nav-link">📞 Legal & Support</button>
          <button className="nav-link">📜 Terms & Conditions</button>
        </div>
      </aside>
      <main className="account-content">
        <header className="account-topbar">
          <h1>View Profile</h1>
        </header>
        <div className="account-card">
          <div className="profile-header">
            <div className="profile-avatar">
              <div className="avatar-circle">👤</div>
              <button className="avatar-camera">📷</button>
            </div>
          </div>
          <form className="profile-form" onSubmit={e => { e.preventDefault(); updateProfile() }}>
            <div className="form-row">
              <label>Full Name *</label>
              <input name="fullName" value={form.fullName} onChange={handleChange} />
            </div>
            <div className="grid-2">
              <div className="form-row">
                <label>Gender</label>
                <select name="gender" value={form.gender} onChange={handleChange}>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                  <option value="prefer_not_say">Prefer not to say</option>
                </select>
              </div>
              <div className="form-row">
                <label>Date of Birth</label>
                <input type="date" name="dateOfBirth" value={form.dateOfBirth} onChange={handleChange} />
              </div>
            </div>
            <div className="grid-2">
              <div className="form-row">
                <label>Email Address</label>
                <div className="with-addon">
                  <input value={form.email} readOnly />
                  <span className="addon ok">✅</span>
                </div>
              </div>
              <div className="form-row">
                <label>Mobile No</label>
                <div className="with-button">
                  <input name="phone" value={form.phone} onChange={handleChange} placeholder="Enter mobile no" />
                  <button type="button" className="verify-btn">Verify</button>
                </div>
                <p className="hint">Please verify account phone number for one time to get cash on delivery.</p>
              </div>
            </div>
            <div className="actions">
              <button className="primary" type="submit">Update Profile</button>
            </div>
            {status === 'pending' && <p className="status">Updating...</p>}
            {status?.type === 'success' && <p className="status success">{status.message}</p>}
            {status?.type === 'error' && <p className="status error">{status.message}</p>}
          </form>
        </div>
      </main>
    </div>
  )
}

export default AccountDashboard