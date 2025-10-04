import React from 'react'
import { getCurrentUser } from '../utils/auth'

const AccountDashboard = () => {
  const user = getCurrentUser()
  return (
    <div style={{ maxWidth: 900, margin: '24px auto', background: '#fff', border: '1px solid #e9ecef', borderRadius: 12, padding: 16 }}>
      <h2 style={{ marginTop: 0 }}>Account Dashboard</h2>
      {user ? (
        <>
          <p>Welcome, {user.firstName} {user.lastName}</p>
          <p>Email: {user.email}</p>
          <p>Phone: {user.phone}</p>
          <p style={{ color: '#777' }}>This is a placeholder. You can implement your full dashboard here later.</p>
        </>
      ) : (
        <p>Please log in to view your dashboard.</p>
      )}
    </div>
  )
}

export default AccountDashboard