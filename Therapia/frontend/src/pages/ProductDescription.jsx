import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import './ProductDescription.css';
import Header from '../components/Header';
import Footer from '../components/Footer';
import AuthModal from '../components/AuthModal';
import { getCurrentUser, setCurrentUser } from '../utils/auth';

const ProductDescription = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [isBuying, setIsBuying] = useState(false);
  const [currentUser, setUserState] = useState(getCurrentUser());
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [pendingAddQty, setPendingAddQty] = useState(0);

  useEffect(() => {
    const onAuthChanged = (e) => {
      const user = e?.detail?.user || getCurrentUser();
      setUserState(user);
    };
    window.addEventListener('authChanged', onAuthChanged);
    return () => window.removeEventListener('authChanged', onAuthChanged);
  }, []);

  const [searchQuery, setSearchQuery] = useState('');

  const API_BASE = import.meta.env.VITE_API_URL || '';

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await fetch(`${API_BASE ? API_BASE + '/api' : '/api'}/products/${id}`);
        const contentType = res.headers.get('content-type') || '';
        if (!contentType.includes('application/json')) {
          const text = await res.text();
          throw new Error(`Expected JSON, got: ${text.slice(0, 60)}...`);
        }
        const data = await res.json();
        const p = data.product || data;
        if (!p || (!p._id && !p.id)) throw new Error('Product not found');
        setProduct(p);
      } catch (e) {
        setError(e.message || 'Failed to load product');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <>
        <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} currentUser={currentUser} onLoggedIn={(u) => { setCurrentUser(u); setUserState(u); }} onLogout={async () => { try { await fetch('/api/auth/logout', { method: 'POST' }) } catch { /* ignore */ } setCurrentUser(null); setUserState(null); }} />
        <main className="pd-page">
          <div className="pd-container">
            <div>Loading product...</div>
          </div>
        </main>
      </>
    );
  }

  if (error || !product) {
    return (
      <>
        <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} currentUser={currentUser} onLoggedIn={(u) => { setCurrentUser(u); setUserState(u); }} onLogout={async () => { try { await fetch('/api/auth/logout', { method: 'POST' }); } catch { /* ignore */ } setCurrentUser(null); setUserState(null); }} />
        <main className="pd-page">
          <div className="pd-container">
            <h2>{error || 'Product not found'}</h2>
          </div>
        </main>
      </>
    );
  }

  const rating = Number(product.rating || 0);
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;
  const emptyStars = 5 - Math.ceil(rating);

  const totalPrice = ((product.price || 0) * quantity).toFixed(2);

  const maxQty = Math.min(99, Number(product?.inventory ?? 99));
  const increment = () => setQuantity((q) => Math.min(q + 1, maxQty));
  const decrement = () => setQuantity((q) => Math.max(q - 1, 1));

  const handleAddToCart = async () => {
    if (!currentUser?._id) {
      setPendingAddQty(quantity);
      setAuthMode('login');
      setIsAuthOpen(true);
      return;
    }
    try {
      const res = await fetch(`/api/users/${currentUser._id}/cart`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product._id || product.id, quantity })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || 'Failed to add to cart');
      const meRes = await fetch('/api/auth/me');
      const meData = await meRes.json();
      if (meRes.ok && meData.user) {
        setCurrentUser(meData.user);
        setUserState(meData.user);
      }
      alert(`Added ${quantity} x ${product.name} to cart`);
    } catch (err) {
      alert(err.message);
      console.error('Add to cart failed:', err);
    }
  };

  const handleBuyNow = () => {
    setIsBuying(true);
  };

  const closeBuy = () => setIsBuying(false);

  return (
    <>
      <Header 
        searchQuery={searchQuery} 
        onSearchChange={setSearchQuery} 
        currentUser={currentUser}
        onLoggedIn={(u) => { setCurrentUser(u); setUserState(u); }}
        onLogout={async () => { try { await fetch('/api/auth/logout', { method: 'POST' }); } catch { /* ignore */ } setCurrentUser(null); setUserState(null); }}
      />
      <main className="pd-page">
        <div className="pd-container">
          <div className="pd-content">
          <div className="pd-image">
            <img src={product.imageUrl || product.image} alt={product.name} />
          </div>
          <div className="pd-details">
            <h2 className="pd-name">{product.name}</h2>
            <div className="pd-meta">
              <span className="pd-category">{product.category}</span>
              <div className="pd-rating">
                {[...Array(fullStars)].map((_, i) => (
                  <span key={`f-${i}`} className="star filled">★</span>
                ))}
                {hasHalfStar && <span className="star half">★</span>}
                {[...Array(emptyStars)].map((_, i) => (
                  <span key={`e-${i}`} className="star empty">★</span>
                ))}
                {product.reviews ? <span className="pd-reviews">({product.reviews})</span> : null}
              </div>
            </div>

            <div className="pd-pricing">
              <span className="pd-price">৳{product.price}</span>
            </div>

            <div className="pd-stock">{(product.inventory ?? 0) > 0 ? `In stock: ${product.inventory}` : 'Out of Stock ❌'}</div>

            <div className="pd-qty">
              <span>Quantity</span>
              <div className="qty-controls">
                <button
                  onClick={decrement}
                  className="qty-btn"
                  aria-label="Decrease quantity"
                  disabled={quantity <= 1}
                  style={{ opacity: quantity <= 1 ? 0.5 : 1, cursor: quantity <= 1 ? 'not-allowed' : 'pointer' }}
                >−</button>
                <input
                  type="number"
                  min={1}
                  max={maxQty}
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, Math.min(99, Number(e.target.value) || 1)))}
                  className="qty-input"
                />
                <button
                  onClick={increment}
                  className="qty-btn"
                  aria-label="Increase quantity"
                  disabled={(product.inventory ?? 0) <= 0 || quantity >= maxQty}
                  style={{ opacity: ((product.inventory ?? 0) <= 0 || quantity >= maxQty) ? 0.5 : 1, cursor: ((product.inventory ?? 0) <= 0 || quantity >= maxQty) ? 'not-allowed' : 'pointer' }}
                >+</button>
              </div>
            </div>

            <div className="pd-actions">
              <button className="btn-cart" onClick={handleAddToCart} disabled={(product.inventory ?? 0) <= 0}>Add to Cart</button>
              <button className="btn-buy" onClick={handleBuyNow} disabled={(product.inventory ?? 0) <= 0}>Buy Now</button>
            </div>

            <div className="pd-summary">
              <div>Total: <strong>৳{totalPrice}</strong></div>
              <p><strong>Generic:</strong> {product.generic}</p>
              <p><strong>Company:</strong> {product.company}</p>
              {product.strength && <p><strong>Strength:</strong> {product.strength}</p>}
              {product.dosageForm && <p><strong>Dosage Form:</strong> {product.dosageForm}</p>}
              {product.isPrescriptionRequired ? <p><strong>Prescription:</strong> Required</p> : <p><strong>Prescription:</strong> Not required</p>}
            </div>

            {/* Safety advices moved below to full-width section */}
          </div>
          {/* Move full-width safety section below the grid */}
          {product.safety && (
            <div className="safety-section full-width">
              <h3 style={{ margin: 0, marginBottom: '0.5rem' }}>Safety Advices</h3>
              {[
                { key: 'alcohol', label: 'Alcohol' },
                { key: 'pregnancy', label: 'Pregnancy' },
                { key: 'breastfeeding', label: 'Breastfeeding' },
                { key: 'driving', label: 'Driving' },
                { key: 'kidney', label: 'Kidney' },
                { key: 'liver', label: 'Liver' },
              ].map(({ key, label }) => {
                const item = product.safety?.[key] || { status: 'unknown', en: '' };
                const status = String(item.status || 'unknown');
                const statusLabel =
                  status === 'unsafe' ? 'UNSAFE' :
                  status === 'safe' ? 'SAFE' :
                  status === 'caution' ? 'CAUTION' :
                  status === 'safe_if_prescribed' ? 'SAFE IF PRESCRIBED' : 'UNKNOWN';
                const statusClass =
                  status === 'unsafe' ? 'red' :
                  status === 'safe' ? 'green' :
                  status === 'caution' ? 'orange' :
                  status === 'safe_if_prescribed' ? 'amber' : 'gray';
                const note = item.en || '';
                return (
                  <div key={key} className="safety-item">
                    <div className={`safety-badge ${statusClass}`}>{statusLabel}</div>
                    <div className="safety-content">
                      <div className="safety-title">{label}</div>
                      <div className="safety-note">{note || 'No specific guidance available.'}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        {isBuying && (
          <div className="buy-modal" role="dialog" aria-modal="true">
            <div className="buy-content">
              <h3>Checkout</h3>
              <p><strong>{product.name}</strong> × {quantity}</p>
              <p>Total: <strong>৳{totalPrice}</strong></p>
              <form className="buy-form" onSubmit={(e) => { e.preventDefault(); alert('Order placed!'); closeBuy(); }}>
                <input type="text" placeholder="Full Name" required className="buy-input" />
                <input type="tel" placeholder="Phone Number" required className="buy-input" />
                <textarea placeholder="Delivery Address" required rows={3} className="buy-input"></textarea>
                <div className="buy-actions">
                  <button type="button" className="btn-secondary" onClick={closeBuy}>Cancel</button>
                  <button type="submit" className="btn-primary">Place Order</button>
                </div>
              </form>
            </div>
          </div>
        )}
        </div>
      </main>
      {/* Auth modal for login/signup when adding to cart */}
      <AuthModal
        isOpen={isAuthOpen}
        initialMode={authMode}
        onClose={() => setIsAuthOpen(false)}
        onLoggedIn={async (user) => {
          try {
            setCurrentUser(user);
            setUserState(user);
            if (pendingAddQty > 0) {
              const res = await fetch(`/api/users/${user._id}/cart`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ productId: product._id || product.id, quantity: pendingAddQty })
              });
              const data = await res.json();
              if (!res.ok) throw new Error(data?.message || 'Failed to add to cart');
              const meRes = await fetch('/api/auth/me');
              const meData = await meRes.json();
              if (meRes.ok && meData.user) {
                setCurrentUser(meData.user);
                setUserState(meData.user);
              }
              alert(`Added ${pendingAddQty} x ${product.name} to cart`);
            }
          } catch (err) {
            console.error('Post-login add to cart failed:', err);
            alert(err.message);
          } finally {
            setPendingAddQty(0);
            setIsAuthOpen(false);
          }
        }}
      />
      <Footer />
    </>
  );
};

export default ProductDescription;