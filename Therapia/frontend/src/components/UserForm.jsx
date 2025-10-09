import React, { useState } from 'react'
import './UserForm.css'

const initialForm = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',
  gender: 'prefer_not_say',
  dateOfBirth: '',
  address: {
    line1: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'Bangladesh'
  }
}

export default function UserForm({ onSuccess }) {
  const [form, setForm] = useState(initialForm)
  const [status, setStatus] = useState(null)

  const handleChange = (e) => {
    const { name, value } = e.target
    if (name.startsWith('address.')) {
      const key = name.split('.')[1]
      setForm(prev => ({ ...prev, address: { ...prev.address, [key]: value } }))
    } else {
      setForm(prev => ({ ...prev, [name]: value }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setStatus('pending')
    try {
      // Basic password validations
      const pwd = String(form.password || '')
      const cpwd = String(form.confirmPassword || '')
      if (!pwd || pwd.length < 8) {
        throw new Error('Password must be at least 8 characters')
      }
      if (pwd !== cpwd) {
        throw new Error('Passwords do not match')
      }
      const payload = {
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        phone: form.phone,
        password: pwd,
        gender: form.gender,
        dateOfBirth: form.dateOfBirth ? new Date(form.dateOfBirth) : undefined,
        address: {
          label: 'home',
          line1: form.address.line1,
          city: form.address.city,
          state: form.address.state,
          postalCode: form.address.postalCode,
          country: form.address.country,
          isDefault: true
        }
      }
      // Use auth register to hash password and set session cookie
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      if (!res.ok) throw new Error(`Request failed: ${res.status}`)
      const data = await res.json()
      setStatus({ type: 'success', message: 'Account created successfully', id: data?.user?._id })
      // Inform parent (AuthModal)
      if (typeof onSuccess === 'function') {
        onSuccess(data?.user)
      }
      setForm(initialForm)
    } catch (err) {
      const isNetworkError = err && (err.message === 'Failed to fetch' || err.name === 'TypeError')
      const message = isNetworkError
        ? 'Could not reach backend. Please check server and connection.'
        : err.message
      setStatus({ type: 'error', message })
      // Help debugging in dev
      console.error('User signup error:', err)
    }
  }

  return (
    <section className="user-form">
      <h2>Create Account</h2>
      <form onSubmit={handleSubmit}>
        <div className="grid">
          <label>
            First Name
            <input name="firstName" value={form.firstName} onChange={handleChange} required />
          </label>
          <label>
            Last Name
            <input name="lastName" value={form.lastName} onChange={handleChange} required />
          </label>
          <label>
            Email
            <input type="email" name="email" value={form.email} onChange={handleChange} required />
          </label>
          <label>
            Phone
            <input name="phone" value={form.phone} onChange={handleChange} required />
          </label>
          <label>
            Password
            <input type="password" name="password" value={form.password} onChange={handleChange} required />
          </label>
          <label>
            Confirm Password
            <input type="password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange} required />
          </label>
          <label>
            Gender
            <select name="gender" value={form.gender} onChange={handleChange}>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
              <option value="prefer_not_say">Prefer not to say</option>
            </select>
          </label>
          <label>
            Date of Birth
            <input type="date" name="dateOfBirth" value={form.dateOfBirth} onChange={handleChange} />
          </label>
        </div>

        <h3>Address</h3>
        <div className="grid">
          <label>
            Line 1
            <input name="address.line1" value={form.address.line1} onChange={handleChange} required />
          </label>
          <label>
            City
            <input name="address.city" value={form.address.city} onChange={handleChange} required />
          </label>
          <label>
            State
            <input name="address.state" value={form.address.state} onChange={handleChange} />
          </label>
          <label>
            Postal Code
            <input name="address.postalCode" value={form.address.postalCode} onChange={handleChange} />
          </label>
          <label>
            Country
            <input name="address.country" value={form.address.country} onChange={handleChange} />
          </label>
        </div>

        <button type="submit">Create Account</button>
      </form>

      {status === 'pending' && <p className="status">Saving...</p>}
      {status?.type === 'success' && <p className="status success">{status.message} (ID: {status.id})</p>}
      {status?.type === 'error' && <p className="status error">Error: {status.message}</p>}
    </section>
  )
}