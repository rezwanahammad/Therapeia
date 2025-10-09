import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Header.css';
import AuthModal from './AuthModal';

const Header = ({ searchQuery, onSearchChange, onLoggedIn, currentUser, onLogout }) => {
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [modalMode, setModalMode] = useState('login');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    console.log('Searching for:', searchQuery);
  };

  const handleLogout = async () => {
    try {
      if (typeof onLogout === 'function') {
        await Promise.resolve(onLogout());
      }
    } finally {
      navigate('/');
    }
  };

  // Compute display address for logged-in user; fallback to "Kuet" when not logged in
  const resolveLocationText = () => {
    // Prefer default address from addresses array; fallback to single `address` field if present
    const addresses = Array.isArray(currentUser?.addresses) ? currentUser.addresses : [];
    let def = addresses.find(a => a?.isDefault) || addresses[0];
    if (!def && currentUser?.address) {
      def = currentUser.address; // in case some users have `address` single object
    }
    if (!def) return null;
    const parts = [
      def.line1 || def.addressLine1 || def.street,
      def.city,
      def.state,
    ].filter(Boolean);
    const joined = parts.join(', ');
    return joined || def.city || def.country || null;
  };
  const locationText = resolveLocationText() || (currentUser ? `${currentUser.firstName}'s address` : 'Kuet');

  return (
    <header className="header">
      <div className="header-container">
        {/* Logo */}
        <div
          className="logo"
          onClick={() => navigate('/')}
          onKeyDown={(e) => { if (e.key === 'Enter') navigate('/'); }}
          role="button"
          tabIndex={0}
          aria-label="Go to Home"
          style={{ cursor: 'pointer' }}
        >
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
              onChange={(e) => onSearchChange(e.target.value)}
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
            <span
              className="location"
              role="button"
              tabIndex={0}
              aria-label="Manage delivery address"
              title="Manage delivery address"
              onClick={() => { navigate(currentUser ? '/account' : '/login'); }}
              onKeyDown={(e) => { if (e.key === 'Enter') navigate(currentUser ? '/account' : '/login'); }}
              style={{ cursor: 'pointer' }}
            >
              {locationText}
            </span>
          </div>
          
          <div className="action-buttons">
            {currentUser ? (
              <>
                <button className="action-btn" onClick={() => navigate('/account')}>
                  👋 Hello {currentUser.firstName}
                </button>
                <button className="action-btn" onClick={handleLogout}>Logout</button>
              </>
            ) : (
              <>
                {/* Open login as popup/modal instead of navigating */}
                <button className="action-btn" onClick={() => { setModalMode('login'); setIsAuthOpen(true); }}>
                  Login
                </button>
                <button className="action-btn" onClick={() => { setModalMode('signup'); setIsAuthOpen(true); }}>
                Create Account
                </button>
              </>
            )}
            <button className="action-btn cart-btn" onClick={() => navigate('/cart')}>
              🛒 Cart
              <span className="cart-count">{(currentUser?.cart?.length ?? 0)}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="navigation">
        <div className="nav-container">
          <div className="nav-links">
            <a href="#" className="nav-link active">Home</a>
            <a href="#" className="nav-link">Medicine</a>
            <a href="#" className="nav-link">Healthcare</a>
            <a href="#" className="nav-link">Beauty</a>
            <a href="#" className="nav-link">Baby & Mom Care</a>
            <a href="#" className="nav-link">Herbal</a>
            <a href="#" className="nav-link">More</a>
          </div>
          
          <div className="contact-info">
            Call for Order: 210707
          </div>
        </div>
      </nav>
      {isAuthOpen && (
        <AuthModal 
          isOpen={isAuthOpen} 
          initialMode={modalMode}
          onClose={() => setIsAuthOpen(false)} 
          onLoggedIn={onLoggedIn}
        />
      )}
    </header>
  );
};

export default Header;
