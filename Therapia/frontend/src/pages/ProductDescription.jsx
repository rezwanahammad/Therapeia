import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { products } from '../data/mockData';

const ProductDescription = () => {
  const { id } = useParams();
  const product = products.find((p) => String(p.id) === String(id));
  const name = product?.name || 'Product';

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Here is your {name}</h2>
      <p><Link to="/">← Back to Home</Link></p>
    </div>
  );
};

export default ProductDescription;