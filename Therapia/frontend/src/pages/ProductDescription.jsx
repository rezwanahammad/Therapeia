import React, { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { products } from '../data/mockData';
import './ProductDescription.css';
import Header from '../components/Header';
import Footer from '../components/Footer';

const ProductDescription = () => {
  const { id } = useParams();
  const product = useMemo(() => products.find((p) => String(p.id) === String(id)), [id]);
  const [quantity, setQuantity] = useState(1);
  const [isBuying, setIsBuying] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');

  if (!product) {
    return (
      <>
        <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />
        <main className="pd-page">
          <div className="pd-container">
            <h2>Product not found</h2>
          </div>
        </main>
      </>
    );
  }

  const fullStars = Math.floor(product.rating);
  const hasHalfStar = product.rating % 1 !== 0;
  const emptyStars = 5 - Math.ceil(product.rating);

  const totalPrice = (product.price * quantity).toFixed(2);

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
            <img src={product.image} alt={product.name} />
            {product.discount > 0 && (
              <span className="pd-discount">{product.discount}% OFF</span>
            )}
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
                <span className="pd-reviews">({product.reviews})</span>
              </div>
            </div>

            <div className="pd-pricing">
              <span className="pd-price">৳{product.price}</span>
              {product.originalPrice > product.price && (
                <span className="pd-original">৳{product.originalPrice}</span>
              )}
            </div>

            <div className="pd-stock">{product.inStock ? 'In Stock ✅' : 'Out of Stock ❌'}</div>

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
              <button className="btn-cart" onClick={handleAddToCart} disabled={!product.inStock}>Add to Cart</button>
              <button className="btn-buy" onClick={handleBuyNow} disabled={!product.inStock}>Buy Now</button>
            </div>

            <div className="pd-summary">
              <div>Total: <strong>৳{totalPrice}</strong></div>
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