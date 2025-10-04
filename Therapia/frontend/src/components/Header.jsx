import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Header.css';
import AuthModal from './AuthModal';

const Header = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    console.log('Searching for:', searchQuery);
  };

  return (
    <header className="header">
      <div className="header-container">
        {/* Logo */}
        <div className="logo">
          <h1>Therapeia</h1>
          <span className="tagline">Your Health Partner</span>
        </div>

        {/* Search Bar */}
        <div className="search-section">
          <form onSubmit={handleSearch} className="search-form">
            <input
              type="text"
              placeholder="Search for healthcare products"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            <button type="submit" className="search-button">
              🔍
            </button>
          </form>
        </div>

        {/* User Actions */}
        <div className="user-actions">
          <div className="delivery-info">
            <span className="delivery-text">Deliver to</span>
            <span className="location">📍 Dhaka</span>
          </div>
          
          <div className="action-buttons">
            <button className="action-btn" onClick={() => setIsAuthOpen(true)}>
              👤 Account
            </button>
            <button className="action-btn cart-btn">
              🛒 Cart
              <span className="cart-count">0</span>
            </button>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="navigation">
        <div className="nav-container">
          <div className="nav-links">
            <Link to="/" className="nav-link active">Home</Link>
            <a href="#" className="nav-link">Medicine</a>
            <a href="#" className="nav-link">Healthcare</a>
            <a href="#" className="nav-link">Beauty</a>
            <a href="#" className="nav-link">Baby & Mom Care</a>
            <a href="#" className="nav-link">Herbal</a>
            <a href="#" className="nav-link">More</a>
            <Link to="/admin" className="nav-link">Admin</Link>
          </div>
          
          <div className="contact-info">
            📞 Call for Order: 16778
          </div>
        </div>
      </nav>
      {isAuthOpen && (
        <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
      )}
    </header>
  );
};

export default Header;