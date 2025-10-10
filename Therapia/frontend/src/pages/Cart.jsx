import React, { useEffect, useMemo, useState } from 'react'
import Header from '../components/Header'
import { useNotifications } from '../components/NotificationProvider'
import Footer from '../components/Footer'
import AuthModal from '../components/AuthModal'
import { getCurrentUser, setCurrentUser } from '../utils/auth'
import { useNavigate } from 'react-router-dom'
import './ProductDescription.css'

const Cart = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [user, setUser] = useState(getCurrentUser())
  const [cart, setCart] = useState([])
  const [status, setStatus] = useState(null)
  const [isAuthOpen, setIsAuthOpen] = useState(false)
  const [authMode, setAuthMode] = useState('login')
  const [isBuying, setIsBuying] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState('Bank')
  const [isPlacingOrder, setIsPlacingOrder] = useState(false)
  const navigate = useNavigate()
  const { notify } = useNotifications()
  const total = useMemo(() => Array.isArray(cart)
    ? cart.reduce((sum, ci) => sum + Number(ci.product?.price || 0) * Number(ci.quantity || 1), 0)
    : 0, [cart])

  useEffect(() => {
    const onAuthChanged = (e) => {
      const next = e?.detail?.user || getCurrentUser()
      setUser(next)
    }
    window.addEventListener('authChanged', onAuthChanged)
    return () => window.removeEventListener('authChanged', onAuthChanged)
  }, [])

  useEffect(() => {
    const load = async () => {
      if (!user?._id) { setCart([]); return }
      try {
        setStatus('pending')
        const res = await fetch(`/api/users/${user._id}/cart`)
        const data = await res.json()
        if (!res.ok) throw new Error(data?.message || 'Failed to load cart')
        setCart(data.cart || [])
        setStatus('success')
      } catch (err) {
        setStatus({ type: 'error', message: err.message })
        console.error('Load cart error:', err)
      }
    }
    load()
  }, [user?._id])

  const updateQty = async (itemId, quantity) => {
    if (!user?._id) return
    try {
      const res = await fetch(`/api/users/${user._id}/cart/${itemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.message || 'Failed to update cart')
      setCart(data.cart || [])
      notify({ title: 'Quantity Updated', type: 'success' })
    } catch (err) {
      console.error('Update qty error:', err)
      notify({ title: 'Update Failed', message: err.message, type: 'error' })
    }
  }

  const removeItem = async (itemId) => {
    if (!user?._id) return
    try {
      const res = await fetch(`/api/users/${user._id}/cart/${itemId}`, { method: 'DELETE' })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.message || 'Failed to remove item')
      setCart(data.cart || [])
      notify({ title: 'Removed from Cart', type: 'success' })
    } catch (err) {
      console.error('Remove item error:', err)
      notify({ title: 'Remove Failed', message: err.message, type: 'error' })
    }
  }

  const openCheckout = () => {
    if (!user?._id) {
      setAuthMode('login')
      setIsAuthOpen(true)
      return
    }
    if (!Array.isArray(cart) || cart.length === 0) {
      notify({ title: 'Cart Empty', message: 'Add items before checkout', type: 'info' })
      return
    }
    setIsBuying(true)
  }

  const resolveLocationText = () => {
    const addresses = Array.isArray(user?.addresses) ? user.addresses : []
    let def = addresses.find(a => a?.isDefault) || addresses[0]
    if (!def && user?.address) {
      def = user.address
    }
    if (!def) return null
    const parts = [
      def.line1 || def.addressLine1 || def.street,
      def.city,
      def.state,
    ].filter(Boolean)
    const joined = parts.join(', ')
    return joined || def.city || def.country || null
  }

  const confirmPayment = async () => {
    if (!user?._id) {
      setAuthMode('login')
      setIsAuthOpen(true)
      return
    }
    try {
      setIsPlacingOrder(true)
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ paymentMethod })
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.message || 'Failed to create order')
      const orderId = data?.order?._id
      notify({ title: 'Order Placed', message: `Order #${String(orderId || '').slice(-6)}`, type: 'success' })
      setIsBuying(false)
      if (orderId) navigate(`/orders/${orderId}`)
    } catch (err) {
      console.error('Create order error:', err)
      notify({ title: 'Checkout Failed', message: err.message, type: 'error' })
    } finally {
      setIsPlacingOrder(false)
    }
  }

  return (
    <>
      <Header 
        searchQuery={searchQuery} 
        onSearchChange={setSearchQuery}
        currentUser={user}
        onLoggedIn={(u) => { setCurrentUser(u); setUser(u); }}
        onLogout={async () => { try { await fetch('/api/auth/logout', { method: 'POST' }) } catch {}; setCurrentUser(null); setUser(null); }}
      />
      <main className="main-content">
        <div className="container" style={{ maxWidth: 960 }}>
          <h2 style={{ marginTop: '1rem' }}>My Cart</h2>
          {!user?._id && (
            <div style={{ background: '#fff', border: '1px solid #e9ecef', borderRadius: 12, padding: 16 }}>
              <p>You are not logged in. Please log in or create an account to view your cart.</p>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => { setAuthMode('login'); setIsAuthOpen(true) }} style={{ background: '#10847e', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 12px' }}>Login</button>
                <button onClick={() => { setAuthMode('signup'); setIsAuthOpen(true) }} style={{ background: '#0c6f68', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 12px' }}>Create Account</button>
              </div>
            </div>
          )}

          {user?._id && (
            <div style={{ background: '#fff', border: '1px solid #e9ecef', borderRadius: 12, padding: 16 }}>
              {status === 'pending' && <p>Loading cart...</p>}
              {Array.isArray(cart) && cart.length === 0 && status !== 'pending' && <p>Your cart is empty.</p>}
              {Array.isArray(cart) && cart.length > 0 && (
                <div>
                  {cart.map(ci => (
                    <div key={ci._id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid #eee' }}>
                      <img
                        src={ci.product?.imageUrl}
                        alt={ci.product?.name}
                        style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 8, cursor: (ci.product?._id || ci.product?.id) ? 'pointer' : 'default' }}
                        onClick={() => {
                          const pid = ci.product?._id || ci.product?.id
                          if (pid) navigate(`/product/${pid}`)
                        }}
                      />
                      <div style={{ flex: 1 }}>
                        <div
                          style={{ fontWeight: 600, cursor: (ci.product?._id || ci.product?.id) ? 'pointer' : 'default' }}
                          role="link"
                          tabIndex={0}
                          onClick={() => {
                            const pid = ci.product?._id || ci.product?.id
                            if (pid) navigate(`/product/${pid}`)
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              const pid = ci.product?._id || ci.product?.id
                              if (pid) navigate(`/product/${pid}`)
                            }
                          }}
                        >
                          {ci.product?.name}
                        </div>
                        <div style={{ color: '#666' }}>৳{ci.product?.price} · {ci.product?.company}</div>
                        <div style={{ color: '#888', fontSize: '0.85rem' }}>Available: {Number.isFinite(Number(ci.product?.inventory)) ? Number(ci.product?.inventory) : '—'}</div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <button
                          onClick={() => updateQty(ci._id, Math.max(1, (ci.quantity || 1) - 1))}
                          disabled={(ci.quantity || 1) <= 1}
                          style={{ padding: '4px 8px', opacity: (ci.quantity || 1) <= 1 ? 0.5 : 1, cursor: (ci.quantity || 1) <= 1 ? 'not-allowed' : 'pointer' }}
                        >−</button>
                        <span>{ci.quantity || 1}</span>
                        <button
                          onClick={() => updateQty(ci._id, (ci.quantity || 1) + 1)}
                          disabled={Number(ci.product?.inventory ?? Infinity) <= 0 || (ci.quantity || 1) >= Number(ci.product?.inventory ?? Infinity)}
                          style={{ padding: '4px 8px', opacity: (Number(ci.product?.inventory ?? Infinity) <= 0 || (ci.quantity || 1) >= Number(ci.product?.inventory ?? Infinity)) ? 0.5 : 1, cursor: (Number(ci.product?.inventory ?? Infinity) <= 0 || (ci.quantity || 1) >= Number(ci.product?.inventory ?? Infinity)) ? 'not-allowed' : 'pointer' }}
                        >+</button>
                      </div>
                      <button onClick={() => removeItem(ci._id)} style={{ padding: '6px 10px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: 6 }}>Remove</button>
                    </div>
                  ))}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
                    <div style={{ fontWeight: 600 }}>Total: ৳{Number(total).toFixed(2)}</div>
                    <button onClick={openCheckout} style={{ background: '#10847e', color: '#fff', border: 'none', borderRadius: 6, padding: '10px 14px' }}>Confirm Order</button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
      {isBuying && (
        <div className="buy-modal" role="dialog" aria-modal="true">
          <div className="buy-content">
            <h3>Checkout</h3>
            <hr />
            <div className="buy-summary">
              <div>
                <div style={{ fontWeight: 600 }}>Items</div>
                <div className="summary-box">{Array.isArray(cart) ? cart.length : 0} item(s)</div>
              </div>
              <div>
                <div style={{ fontWeight: 600 }}>Total Price</div>
                <div className="summary-box">৳{Number(total).toFixed(2)}</div>
              </div>
              <div>
                <div style={{ fontWeight: 600 }}>Delivery Address</div>
                <div className="summary-box" style={{ color: '#555' }}>{resolveLocationText() || (user ? `${user.firstName}'s address` : 'Not logged in')}</div>
              </div>
              <div>
                <div style={{ fontWeight: 600 }}>Arrival</div>
                <div className="summary-box">Probable arrival: 3–7 days</div>
              </div>
              <div>
                <div style={{ fontWeight: 600, marginBottom: 6, color: '#37474f' }}>Payment Method</div>
                <div className="payment-options" role="radiogroup" aria-label="Select payment method">
                  {['Bank', 'Bkash', 'Nagad'].map(pm => (
                    <label key={pm} className={`payment-option ${paymentMethod === pm ? 'active' : ''}`}>
                      <input
                        type="radio"
                        name="payment-method"
                        value={pm}
                        checked={paymentMethod === pm}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                      />
                      <span className="pm-label">{pm}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div className="buy-actions" style={{ marginTop: 12 }}>
              <button type="button" className="btn-secondary" onClick={() => setIsBuying(false)} disabled={isPlacingOrder}>Cancel</button>
              <button type="button" className="btn-primary" onClick={confirmPayment} disabled={isPlacingOrder}>
                {isPlacingOrder ? 'Placing…' : 'Confirm Payment'}
              </button>
            </div>
          </div>
        </div>
      )}
      <AuthModal
        isOpen={isAuthOpen}
        initialMode={authMode}
        onClose={() => setIsAuthOpen(false)}
        onLoggedIn={async (u) => {
          try {
            setCurrentUser(u)
            setUser(u)
          } finally {
            setIsAuthOpen(false)
          }
        }}
      />
      <Footer />
    </>
  )
}

export default Cart