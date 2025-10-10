import React, { useEffect, useState } from 'react'
import { useNotifications } from '../../components/NotificationProvider'

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const { notify } = useNotifications()

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      setError('')
      try {
        const res = await fetch('/api/admin/users', { credentials: 'include' })
        const data = await res.json().catch(() => ({}))
        if (!res.ok) throw new Error(data?.message || 'Failed to load users')
        if (!cancelled) setUsers(data.users || [])
        if (!cancelled) notify({ title: 'Users Loaded', message: `Fetched ${data.users?.length || 0} users`, type: 'info', duration: 2000 })
      } catch (err) {
        if (!cancelled) {
          setError(err.message)
          notify({ title: 'Load Users Failed', message: err.message, type: 'error' })
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  async function deleteUser(id) {
    if (!confirm('Delete this user? This cannot be undone.')) return
    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE', credentials: 'include' })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.message || 'Failed to delete user')
      setUsers(us => us.filter(u => u._id !== id))
      notify({ title: 'User Deleted', message: `User ${String(id).slice(-6)} removed`, type: 'success' })
    } catch (err) {
      notify({ title: 'Delete Failed', message: err.message, type: 'error' })
    }
  }

  function formatAddress(addresses = []) {
    if (!addresses || addresses.length === 0) return '—'
    const a = addresses.find(x => x.isDefault) || addresses[0]
    const parts = [a.line1, a.line2, a.city, a.state, a.postalCode, a.country].filter(Boolean)
    return parts.join(', ')
  }

  return (
    <div>
      <h2>Users</h2>
      {loading && <p>Loading…</p>}
      {error && <p style={{ color: '#c62828' }}>{error}</p>}
      <div className="admin-card">
        {users.length === 0 ? (
          <p>No users found.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd', padding: 8 }}>Name</th>
                <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd', padding: 8 }}>Address</th>
                <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd', padding: 8 }}>Total Orders</th>
                <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd', padding: 8 }}>Email</th>
                <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd', padding: 8 }}>Mobile</th>
                <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd', padding: 8 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u._id}>
                  <td style={{ padding: 8 }}>{[u.firstName, u.lastName].filter(Boolean).join(' ') || '—'}</td>
                  <td style={{ padding: 8 }}>{formatAddress(u.addresses)}</td>
                  <td style={{ padding: 8 }}>{u.totalOrders || 0}</td>
                  <td style={{ padding: 8 }}>{u.email || '—'}</td>
                  <td style={{ padding: 8 }}>{u.phone || '—'}</td>
                  <td style={{ padding: 8 }}>
                    <button className="admin-btn" style={{ background: '#ef4444' }} onClick={() => deleteUser(u._id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}