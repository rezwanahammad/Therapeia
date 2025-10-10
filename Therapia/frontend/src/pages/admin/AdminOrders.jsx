import React, { useEffect, useState } from 'react'
import { useNotifications } from '../../components/NotificationProvider'

export default function AdminOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [auditOrderId, setAuditOrderId] = useState(null)
  const [audit, setAudit] = useState([])
  const { notify } = useNotifications()

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      setError('')
      try {
        const res = await fetch('/api/admin/orders', { credentials: 'include' })
        const data = await res.json().catch(() => ({}))
        if (!res.ok) throw new Error(data?.message || 'Failed to load orders')
        if (!cancelled) setOrders(data.orders || [])
        if (!cancelled) notify({ title: 'Admin Orders Loaded', message: `Fetched ${data.orders?.length || 0} orders`, type: 'info', duration: 2500 })
      } catch (err) {
        if (!cancelled) {
          setError(err.message)
          notify({ title: 'Load Orders Failed', message: err.message, type: 'error' })
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  async function setStatus(id, status) {
    try {
      const res = await fetch(`/api/admin/orders/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status })
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.message || 'Failed to update status')
      setOrders(os => os.map(o => o._id === id ? data.order : o))
      notify({ title: 'Status Updated', message: `Order ${String(id).slice(-6)} → ${status}`, type: 'success' })
    } catch (err) {
      notify({ title: 'Update Status Failed', message: err.message, type: 'error' })
    }
  }

  async function setTracking(id) {
    const trackingNumber = prompt('Enter tracking number')
    if (!trackingNumber) return
    try {
      const res = await fetch(`/api/admin/orders/${id}/tracking`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ trackingNumber })
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.message || 'Failed to update tracking')
      setOrders(os => os.map(o => o._id === id ? data.order : o))
      notify({ title: 'Tracking Updated', message: `Order ${String(id).slice(-6)} tracking set`, type: 'success' })
    } catch (err) {
      notify({ title: 'Update Tracking Failed', message: err.message, type: 'error' })
    }
  }

  async function cancel(id) {
    const reason = prompt('Enter cancel reason')
    if (!reason) return
    try {
      const res = await fetch(`/api/admin/orders/${id}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ reason })
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.message || 'Failed to cancel order')
      setOrders(os => os.map(o => o._id === id ? data.order : o))
      notify({ title: 'Order Canceled', message: `Order ${String(id).slice(-6)} canceled`, type: 'info' })
    } catch (err) {
      notify({ title: 'Cancel Failed', message: err.message, type: 'error' })
    }
  }

  async function openAudit(id) {
    setAuditOrderId(id)
    setAudit([])
    try {
      const res = await fetch(`/api/admin/orders/${id}/audit`, { credentials: 'include' })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.message || 'Failed to load audit')
      setAudit(data.audit || [])
      notify({ title: 'Audit Loaded', message: `Entries: ${data.audit?.length || 0}`, type: 'info', duration: 2000 })
    } catch (err) {
      notify({ title: 'Load Audit Failed', message: err.message, type: 'error' })
    }
  }

  return (
    <div>
      <h2>Orders</h2>
      {loading && <p>Loading…</p>}
      {error && <p style={{ color: '#c62828' }}>{error}</p>}
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd', padding: 8 }}>Order</th>
            <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd', padding: 8 }}>User</th>
            <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd', padding: 8 }}>Status</th>
            <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd', padding: 8 }}>Payment</th>
            <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd', padding: 8 }}>Total</th>
            <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd', padding: 8 }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {orders.map(o => (
            <tr key={o._id}>
              <td style={{ padding: 8 }}>#{String(o._id).slice(-6)}</td>
              <td style={{ padding: 8 }}>{String(o.user).slice(-6)}</td>
              <td style={{ padding: 8 }}>{o.status}</td>
              <td style={{ padding: 8 }}>{o.paymentStatus}{o.paymentMethod ? ` (${o.paymentMethod})` : ''}</td>
              <td style={{ padding: 8 }}>৳{Number(o.totalAmount).toFixed(2)}</td>
              <td style={{ padding: 8 }}>
                <button onClick={() => setStatus(o._id, 'processing')}>Process</button>{' '}
                <button onClick={() => setStatus(o._id, 'shipped')}>Ship</button>{' '}
                <button onClick={() => setStatus(o._id, 'delivered')}>Deliver</button>{' '}
                <button onClick={() => setTracking(o._id)}>Tracking</button>{' '}
                <button onClick={() => cancel(o._id)} style={{ color: '#ef4444' }}>Cancel</button>
                {' '}<button onClick={() => openAudit(o._id)}>Audit</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {auditOrderId && (
        <div style={{ marginTop: 16 }}>
          <h3>Audit Trail for #{String(auditOrderId).slice(-6)}</h3>
          {audit.length === 0 ? (
            <p>No audit entries.</p>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {audit.map((a, idx) => (
                <li key={idx} style={{ padding: '6px 0', borderBottom: '1px solid #eee' }}>
                  <strong>{a.type}</strong>
                  <span style={{ marginLeft: 8, color: '#555' }}>{new Date(a.at).toLocaleString()}</span>
                  {a.details && <span style={{ marginLeft: 8, color: '#777' }}>{JSON.stringify(a.details)}</span>}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}