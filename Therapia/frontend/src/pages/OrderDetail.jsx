import React, { useEffect, useRef, useState } from 'react'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { useParams } from 'react-router-dom'
import { getCurrentUser, setCurrentUser } from '../utils/auth'
import { useNotifications } from '../components/NotificationProvider'

export default function OrderDetail() {
  const { id } = useParams()
  const [order, setOrder] = useState(null)
  const [status, setStatus] = useState(null)
  const [history, setHistory] = useState([])
  const [error, setError] = useState('')
  const [currentUser, setCU] = useState(getCurrentUser())
  const [searchQuery, setSearchQuery] = useState('')
  const esRef = useRef(null)
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
    async function load() {
      setError('')
      try {
        const res = await fetch(`/api/orders/${id}`, { credentials: 'include' })
        const data = await res.json().catch(() => ({}))
        if (!res.ok) throw new Error(data?.message || 'Failed to load order')
        if (!cancelled) {
          setOrder(data.order)
          setStatus(data.order?.status)
          setHistory(data.order?.statusHistory || [])
          notify({ title: 'Order Loaded', message: `Order ${String(id).slice(-6)} loaded`, type: 'info', duration: 2000 })
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message)
          notify({ title: 'Load Order Failed', message: err.message, type: 'error' })
        }
      }
    }
    load()
    return () => { cancelled = true }
  }, [id])

  useEffect(() => {
    const es = new EventSource(`/api/orders/${id}/stream`)
    es.onmessage = (ev) => {
      try {
        const data = JSON.parse(ev.data)
        setStatus(data.status)
        setHistory(data.history || [])
        notify({ title: 'Order Updated', message: `Status: ${data.status}`, type: 'success', duration: 2500 })
      } catch {}
    }
    es.onerror = () => {
      es.close()
    }
    esRef.current = es
    return () => { es.close() }
  }, [id])

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
      <main className="container" style={{ padding: 16 }}>
        <h2>Order #{String(id).slice(-6)}</h2>
        {error && <p style={{ color: '#c62828' }}>{error}</p>}
        {!order ? (
          <p>Loading…</p>
        ) : (
          <div style={{ display: 'grid', gap: 16 }}>
            <div>
              <StatusBadge status={status} />
            </div>
            <div>
              <h3>Items</h3>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {order.items.map((it, idx) => (
                  <li key={idx} style={{ borderBottom: '1px solid #eee', padding: '8px 0' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '64px 1fr auto', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 64, height: 64, borderRadius: 8, overflow: 'hidden', background: '#f3f4f6' }}>
                        { (it.product?.imageUrl || it.imageUrl) ? (
                          <img
                            src={it.product?.imageUrl || it.imageUrl}
                            alt={it.name}
                            width={64}
                            height={64}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            loading="lazy"
                            decoding="async"
                            fetchPriority="low"
                          />
                        ) : null }
                      </div>
                      <div>
                        <div style={{ fontWeight: 600 }}>{it.name}</div>
                        <div style={{ color: '#6b7280' }}>Qty: {it.quantity}</div>
                      </div>
                      <div style={{ fontWeight: 600 }}>৳{Number(it.price * it.quantity).toFixed(2)}</div>
                    </div>
                  </li>
                ))}
              </ul>
              <div style={{ textAlign: 'right', fontWeight: 600 }}>Total: ৳{Number(order.totalAmount).toFixed(2)}</div>
            </div>
            <div>
              <h3>Status Timeline</h3>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {history.map((h, idx) => (
                  <li key={idx} style={{ padding: '6px 0' }}>
                    <span style={{ fontWeight: 600 }}>{h.status}</span>
                    <span style={{ marginLeft: 8, color: '#555' }}>{new Date(h.at).toLocaleString()}</span>
                    {h.note && <span style={{ marginLeft: 8, color: '#777' }}>— {h.note}</span>}
                  </li>
                ))}
              </ul>
            </div>
            {order.tracking?.trackingNumber && (
              <div>
                <h3>Tracking</h3>
                <div>Carrier: {order.tracking.carrier}</div>
                <div>Number: {order.tracking.trackingNumber}</div>
                {order.tracking.url && <div><a href={order.tracking.url} target="_blank" rel="noreferrer">Track online</a></div>}
              </div>
            )}
          </div>
        )}
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