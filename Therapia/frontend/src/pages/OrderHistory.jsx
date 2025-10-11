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
  const [searchQuery, setSearchQuery] = useState('')
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
    <div className="page">
      <Header
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onLoggedIn={(u) => { setCU(u); setCurrentUser(u); }}
        currentUser={currentUser}
        onLogout={async () => {
          try {
            await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
          } catch {}
          setCU(null)
          setCurrentUser(null)
        }}
      />
      <main className="container-fluid" style={{ padding: 16 , width: '80%', margin: '0 auto'}}>
        <h2>My Orders</h2>
        {loading && <p>Loading…</p>}
        {error && <p style={{ color: '#c62828' }}>{error}</p>}
        {!loading && orders.length === 0 && <p>No orders yet.</p>}
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, gap: 16 }}>
          {orders.map(o => (
            <li key={o._id} style={{ border: '1px solid #e5e7eb', borderRadius: 12, padding: 12, background: '#fff', boxShadow: '0 1px 2px rgba(0,0,0,0.04)', marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 600 }}>Order #{String(o._id).slice(-6)}</div>
                  <div style={{ color: '#555' }}>Placed: {new Date(o.createdAt).toLocaleString()}</div>
                </div>
                <a href={`/orders/${o._id}`} style={{ color: '#0c7b67', textDecoration: 'none', fontWeight: 600 }}>View</a>
              </div>
              {Array.isArray(o.items) && o.items.length > 0 && (
                <div style={{ marginTop: 10 }}>
                  {o.items.map((it, idx) => {
                    const src = it.product?.imageUrl || it.imageUrl
                    return (
                      <div key={idx} style={{ display: 'grid', gridTemplateColumns: '48px 1fr auto', alignItems: 'center', gap: 12, padding: '6px 0', borderBottom: idx === (o.items.length - 1) ? 'none' : '1px solid #f1f3f5' }}>
                        <div style={{ width: 48, height: 48, borderRadius: 8, overflow: 'hidden', background: '#f3f4f6' }}>
                          {src ? (
                            <img
                              src={src}
                              alt={it.name}
                              width={48}
                              height={48}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              loading="lazy"
                              decoding="async"
                              fetchPriority="low"
                            />
                          ) : null}
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{it.name}</div>
                          <div style={{ color: '#6b7280' }}>Qty: {it.quantity}</div>
                        </div>
                        <div style={{ fontWeight: 600 }}>৳{Number((it.price ?? 0) * (it.quantity ?? 0)).toFixed(2)}</div>
                      </div>
                    )
                  })}
                </div>
              )}
              <div style={{ marginTop: 8 }}>
                <StatusBadge status={o.status} />
              </div>
              {/* <div style={{ marginTop: 8 }}>
                <NextStageButton status={o.status} />
              </div> */}
              <div style={{ marginTop: 8, color: '#37474f', fontWeight: 600 }}>Total: ৳{Number(o.totalAmount).toFixed(2)}</div>
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

function NextStageButton({ status }) {
  const nextLabel = status === 'pending' ? 'Process' : status === 'processing' ? 'Ship' : status === 'shipped' ? 'Deliver' : 'Complete'
  const disabled = !['pending', 'processing', 'shipped'].includes(status)
  return (
    <button className="admin-btn" disabled style={{ opacity: 0.5 }} title="Only admins can advance order stages">
      {nextLabel}
    </button>
  )
}