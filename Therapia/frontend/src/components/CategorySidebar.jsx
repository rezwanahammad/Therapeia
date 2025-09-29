import React, { useState } from 'react';
import { categories } from '../data/mockData';
import './CategorySidebar.css';

const CategorySidebar = ({ onCategorySelect, selectedCategory }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="category-sidebar">
      <div className="sidebar-header">
        <h3>
          📂 Shop By Category
        </h3>
        <button 
          className="toggle-btn"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? '−' : '+'}
        </button>
      </div>
      
      {isExpanded && (
        <div className="category-list">
          <div 
            className={`category-item ${selectedCategory === 'all' ? 'active' : ''}`}
            onClick={() => onCategorySelect('all')}
          >
            <span className="category-icon">🏪</span>
            <span className="category-name">All Products</span>
          </div>
          
          {categories.map(category => (
            <div 
              key={category.id}
              className={`category-item ${selectedCategory === category.name ? 'active' : ''}`}
              onClick={() => onCategorySelect(category.name)}
            >
              <span className="category-icon">{category.icon}</span>
              <span className="category-name">{category.name}</span>
              <span className="category-arrow">›</span>
            </div>
          ))}
        </div>
      )}
      
      {/* Flash Sale Banner */}
      <div className="flash-sale-banner">
        <div className="flash-sale-header">
          <span className="flash-icon">⚡</span>
          <span className="flash-text">FLASH SALE</span>
        </div>
        <div className="flash-sale-discount">
          Up to 76% OFF
        </div>
        <div className="flash-sale-time">
          Limited Time ⏰
        </div>
      </div>
    </div>
  );
};

export default CategorySidebar;