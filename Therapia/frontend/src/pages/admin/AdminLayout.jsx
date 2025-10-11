import React from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import './admin.css'

const     AdminLayout = () => {
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/auth/logout', { method: 'POST', credentials: 'include' })
    } catch (e) {
      // ignore logout errors
    } finally {
      navigate('/admin/login', { replace: true })
    }
  }
  return (
    <div className="admin-wrapper">
      <aside className="admin-sidebar">
        <div className="admin-brand">Therapeia Admin</div>
        <nav className="admin-nav">
          {/* <NavLink end to="/admin" className="admin-link">Dashboard</NavLink> */}
          <NavLink to="/admin/products" className="admin-link">Products</NavLink>
          <NavLink to="/admin/orders" className="admin-link">Orders</NavLink>
          <NavLink to="/admin/users" className="admin-link">Users</NavLink>
        </nav>
      </aside>
      <main className="admin-content">
        <header className="admin-topbar">
          <h1>Admin Panel</h1>
          <div className="admin-actions">
            <span className="admin-user">👤 Admin</span>
            <button className="admin-btn" onClick={handleLogout} style={{ marginLeft: 12 }}>Logout</button>
          </div>
        </header>
        <section className="admin-page">
          <Outlet />
        </section>
      </main>
    </div>
  )
}

export default AdminLayout