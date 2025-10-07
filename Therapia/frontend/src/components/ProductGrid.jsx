import React from 'react';
import ProductCard from './ProductCard';
import './ProductGrid.css';

const ProductGrid = ({ products, selectedCategory, searchQuery = '' }) => {
  const normalizedQuery = searchQuery.trim().toLowerCase();

  const byCategory = selectedCategory === 'all'
    ? products
    : products.filter(product => product.category === selectedCategory);
    
  const filteredProducts = normalizedQuery
    ? byCategory.filter(product => {
        const name = product.name?.toLowerCase() || '';
        const category = product.category?.toLowerCase() || '';
        return name.includes(normalizedQuery) || category.includes(normalizedQuery);
      })
    : byCategory;

  return (
    <div className="product-grid-container">
      <div className="grid-header">
        <h2>
          {selectedCategory === 'all' ? 'All Products' : selectedCategory}
        </h2>
        <span className="product-count">
          {filteredProducts.length} products found
        </span>
      </div>
      
      {filteredProducts.length === 0 ? (
        <div className="no-products">
          <div className="no-products-icon">📦</div>
          <h3>No products found</h3>
          <p>Try selecting a different category or check back later.</p>
        </div>
      ) : (
        <div className="product-grid">
          {filteredProducts.map(product => (
            <ProductCard key={product.id || product._id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductGrid;