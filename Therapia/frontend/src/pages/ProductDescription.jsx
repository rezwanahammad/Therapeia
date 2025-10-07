import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import './ProductDescription.css';
import Header from '../components/Header';
import Footer from '../components/Footer';

const ProductDescription = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [isBuying, setIsBuying] = useState(false);

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
        <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />
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
        <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />
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

  const increment = () => setQuantity((q) => Math.min(q + 1, 99));
  const decrement = () => setQuantity((q) => Math.max(q - 1, 1));

  const handleAddToCart = () => {
    alert(`Added ${quantity} x ${product.name} to cart`);
  };

  const handleBuyNow = () => {
    setIsBuying(true);
  };

  const closeBuy = () => setIsBuying(false);

  return (
    <>
      <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />
      <main className="pd-page">
        <div className="pd-container">
          <div className="pd-content">
          <div className="pd-image">
            <img src={product.imageUrl || product.image} alt={product.name} />
          </div>
          <div className="pd-details">
            <h2 className="pd-name">Here is your {product.name}</h2>
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
                <button onClick={decrement} className="qty-btn" aria-label="Decrease quantity">−</button>
                <input
                  type="number"
                  min={1}
                  max={99}
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, Math.min(99, Number(e.target.value) || 1)))}
                  className="qty-input"
                />
                <button onClick={increment} className="qty-btn" aria-label="Increase quantity">+</button>
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
          </div>
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
      <Footer />
    </>
  );
};

export default ProductDescription;