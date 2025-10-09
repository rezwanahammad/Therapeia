import React, { useEffect, useState } from 'react'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { useNotifications } from '../components/NotificationProvider'
import { getCurrentUser, setCurrentUser } from '../utils/auth'

export default function OrderHistory() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [currentUser, setCU] = useState(getCurrentUser())
  const { notify } = useNotifications()

  useEffect(() => {
    async function loadMe() {
      try {
        const res = await fetch('/api/auth/me')
        if (res.ok) {
          const data = await res.json()
          setCU(data.user)
          setCurrentUser(data.user)
        }
      } catch {}
    }
    loadMe()
  }, [])

  useEffect(() => {
    let cancelled = false
    async function loadOrders() {
      setLoading(true)
      setError('')
      try {
        const res = await fetch('/api/orders', { credentials: 'include' })
        const data = await res.json().catch(() => ({}))
        if (!res.ok) throw new Error(data?.message || 'Failed to load orders')
        if (!cancelled) setOrders(data.orders || [])
        if (!cancelled) notify({ title: 'Orders Loaded', message: `Fetched ${data.orders?.length || 0} orders`, type: 'info', duration: 2500 })
      } catch (err) {
        if (!cancelled) {
          setError(err.message)
          notify({ title: 'Load Orders Failed', message: err.message, type: 'error' })
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    loadOrders()
    return () => { cancelled = true }
  }, [])

  return (
    <div>
      <Header currentUser={currentUser} onLoggedIn={(u) => { setCU(u); setCurrentUser(u); }} />
      <main className="container" style={{ padding: 16 }}>
        <h2>My Orders</h2>
        {loading && <p>Loading…</p>}
        {error && <p style={{ color: '#c62828' }}>{error}</p>}
        {!loading && orders.length === 0 && <p>No orders yet.</p>}
        <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gap: 12 }}>
          {orders.map(o => (
            <li key={o._id} style={{ border: '1px solid #eee', borderRadius: 8, padding: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontWeight: 600 }}>Order #{String(o._id).slice(-6)}</div>
                  <div style={{ color: '#555' }}>Placed: {new Date(o.createdAt).toLocaleString()}</div>
                </div>
                <a href={`/orders/${o._id}`} style={{ color: '#0c7b67' }}>View</a>
              </div>
              <div style={{ marginTop: 8 }}>
                <StatusBadge status={o.status} />
              </div>
              <div style={{ marginTop: 8, color: '#555' }}>Total: ৳{Number(o.totalAmount).toFixed(2)}</div>
            </li>
          ))}
        </ul>
      </main>
      <Footer />
    </div>
  )
}

function StatusBadge({ status }) {
  const colors = {
    pending: '#f59e0b',
    processing: '#3b82f6',
    shipped: '#6366f1',
    delivered: '#16a34a',
    canceled: '#ef4444',
  }
  const bg = colors[status] || '#999'
  return (
    <span style={{ background: bg, color: '#fff', padding: '4px 8px', borderRadius: 6, fontSize: 12, fontWeight: 600 }}>
      {status}
    </span>
  )
}