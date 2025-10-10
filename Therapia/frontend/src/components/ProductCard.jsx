import React from 'react';
import { useNavigate } from 'react-router-dom';
import './ProductCard.css';
import { useNotifications } from './NotificationProvider';

const ProductCard = ({ product, currentUser }) => {
  const navigate = useNavigate();
  const { notify } = useNotifications();

  const handleCardClick = () => {
    navigate(`/product/${product._id || product.id}`);
  };

  const handleAddToCart = async (e) => {
    e.stopPropagation();
    // If not authenticated, redirect to login
    if (!currentUser?._id) {
      navigate('/login');
      return;
    }
    // Prevent adding when not in stock
    if (!product.inStock) return;

    try {
      const res = await fetch(`/api/users/${currentUser._id}/cart`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product._id || product.id, quantity: 1 })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || 'Failed to add to cart');
      notify({ title: 'Added to Cart', message: product.name, type: 'success' });
    } catch (err) {
      console.error('Add to cart error:', err);
      notify({ title: 'Add to Cart Failed', message: err.message, type: 'error' });
    }
  };

  // Ratings and reviews are not shown in this project.

  return (
    <div className="product-card" onClick={handleCardClick} style={{ cursor: 'pointer' }}>
      {product.discount > 0 && (
        <div className="discount-badge">
          {product.discount}% OFF
        </div>
      )}
      
      <div className="product-image">
        <img src={product.imageUrl || product.image} alt={product.name} />
      </div>
      
      <div className="product-info">
        <h3 className="product-name">{product.name}</h3>
        {/* Rating stars and review count removed */}
        
        <div className="product-pricing">
          <span className="current-price">৳{product.price}</span>
          {product.originalPrice > product.price && (
            <span className="original-price">৳{product.originalPrice}</span>
          )}
        </div>
        
        <div className="product-category">
          <span className="category-tag">{product.generic || product.category}</span>
        </div>
        
        <button 
          className="add-to-cart-btn"
          onClick={handleAddToCart}
          disabled={!product.inStock}
        >
          {product.inStock ? 'ADD' : 'Out of Stock'}
        </button>
      </div>
    </div>
  );
};

export default ProductCard;