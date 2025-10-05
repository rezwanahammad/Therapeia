import React from 'react'

const UserDashboard = ({ user, onLogout }) => {
  if (!user) return null
  return (
    <section style={{ background: '#fff', border: '1px solid #e9ecef', borderRadius: '12px', padding: '16px', marginBottom: '16px', fontFamily: "'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', 'Liberation Sans', sans-serif" }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ margin: 0 }}>Welcome</h2>
          <p style={{ margin: '4px 0', color: '#555' }}>
            Successfully logged in as {user.firstName} {user.lastName}
          </p>
          <p style={{ margin: '2px 0', fontSize: '14px', color: '#777' }}>Email: {user.email}</p>
          <p style={{ margin: '2px 0', fontSize: '14px', color: '#777' }}>Phone: {user.phone}</p>
        </div>
        <button onClick={onLogout} style={{ background: '#f03e3e', color: '#fff', border: 'none', borderRadius: '6px', padding: '8px 12px', cursor: 'pointer' }}>Logout</button>
      </div>
    </section>
  )
}

export default UserDashboard