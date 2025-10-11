import React, { useEffect, useMemo, useState } from 'react'
import { useNotifications } from '../../components/NotificationProvider'

export default function AdminOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [auditOrderId, setAuditOrderId] = useState(null)
  const [audit, setAudit] = useState([])
  const [deletingId, setDeletingId] = useState(null)
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

  const nextStatusMap = {
    pending: 'processing',
    processing: 'shipped',
    shipped: 'delivered',
  }

  const grouped = useMemo(() => {
    const by = { pending: [], processing: [], shipped: [], delivered: [] }
    for (const o of orders) {
      if (by[o.status]) by[o.status].push(o)
    }
    return by
  }, [orders])

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

  // Tracking and Cancel actions removed from list per new design

  async function deleteOrder(id) {
    const confirmed = window.confirm('Delete this delivered order? This cannot be undone.')
    if (!confirmed) return
    setDeletingId(id)
    try {
      const res = await fetch(`/api/admin/orders/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.message || 'Failed to delete order')
      setOrders(os => os.filter(o => o._id !== id))
      notify({ title: 'Order Deleted', message: `Removed #${String(id).slice(-6)}`, type: 'success' })
    } catch (err) {
      notify({ title: 'Delete Failed', message: err.message, type: 'error' })
    } finally {
      setDeletingId(null)
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

      <Section title="Pending" items={grouped.pending} onNext={setStatus} nextStatusMap={nextStatusMap} onDelete={deleteOrder} deletingId={deletingId} />
      <Section title="Processing" items={grouped.processing} onNext={setStatus} nextStatusMap={nextStatusMap} onDelete={deleteOrder} deletingId={deletingId} />
      <Section title="Shipping" items={grouped.shipped} onNext={setStatus} nextStatusMap={nextStatusMap} onDelete={deleteOrder} deletingId={deletingId} />
      <Section title="Delivered" items={grouped.delivered} onNext={setStatus} nextStatusMap={nextStatusMap} onDelete={deleteOrder} deletingId={deletingId} />

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

function Section({ title, items, onNext, nextStatusMap, onDelete, deletingId }) {
  return (
    <div className="admin-card" style={{ marginBottom: 16 }}>
      <div className="admin-header">
        <h3 className="admin-title">{title}</h3>
      </div>
      {items.length === 0 ? (
        <p style={{ color: '#6b7280' }}>No orders.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd', padding: 8 }}>Order</th>
              <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd', padding: 8 }}>Date</th>
              <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd', padding: 8 }}>User</th>
              <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd', padding: 8 }}>Status</th>
              <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd', padding: 8 }}>Payment</th>
              <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd', padding: 8 }}>Total</th>
              <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd', padding: 8 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map(o => {
              const next = nextStatusMap[o.status]
              const label = o.status === 'pending' ? 'Process' : o.status === 'processing' ? 'Ship' : o.status === 'shipped' ? 'Deliver' : '—'
              const canNext = Boolean(next)
              const canDelete = o.status === 'delivered'
              const deleting = deletingId === o._id
              return (
                <tr key={o._id}>
                  <td style={{ padding: 8 }}>#{String(o._id).slice(-6)}</td>
                  <td style={{ padding: 8, fontWeight: 600 }}>{new Date(o.createdAt).toLocaleString()}</td>
                  <td style={{ padding: 8 }}>{String(o.user).slice(-6)}</td>
                  <td style={{ padding: 8 }}>{o.status}</td>
                  <td style={{ padding: 8 }}>{o.paymentStatus}{o.paymentMethod ? ` (${o.paymentMethod})` : ''}</td>
                  <td style={{ padding: 8 }}>৳{Number(o.totalAmount).toFixed(2)}</td>
                  <td style={{ padding: 8 }}>
                    <button
                      className="admin-btn"
                      disabled={!canNext}
                      onClick={() => canNext && onNext(o._id, next)}
                      style={{ opacity: canNext ? 1 : 0.5 }}
                    >{label}</button>
                    {' '}
                    {
                      canDelete && (
                        <button
                          className="admin-btn danger"
                          disabled={!canDelete || deleting}
                          onClick={() => canDelete && onDelete(o._id)}
                          style={{ opacity: (!canDelete || deleting) ? 0.5 : 1 }}
                        >{deleting ? 'Deleting…' : 'Delete'}</button>
                      )
                    }
                    {/* <button
                      className="admin-btn danger"
                      disabled={!canDelete}
                      onClick={() => canDelete && deleteOrder(o._id)}
                      style={{ opacity: canDelete ? 1 : 0.5 }}
                    >Delete</button> */}
                    {/*<button className="admin-btn secondary" onClick={() => openAudit(o._id)}>Audit</button>*/}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      )}
    </div>
  )
}