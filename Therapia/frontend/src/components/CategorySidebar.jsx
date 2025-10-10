import React, { useMemo, useState } from 'react';
import './CategorySidebar.css';

// Removed unused category props and expand/collapse state
const CategorySidebar = ({ onGenericSearch, products = [] }) => {
  const [genericQuery, setGenericQuery] = useState('');

  const topGenerics = useMemo(() => {
    const counts = new Map();
    for (const p of products) {
      const g = String(p?.generic || '').trim();
      if (!g) continue;
      counts.set(g, (counts.get(g) || 0) + 1);
    }
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([name, count]) => ({ name, count }));
  }, [products]);

  return (
    <div className="category-sidebar">
      <div className="sidebar-header">
        <h3>Search by Generic</h3>
      </div>
      
      <div className="category-list" style={{ display: 'grid', gap: 10 }}>
          <div className="category-item" style={{ display: 'grid', gap: 6 }}>
            <input
              type="text"
              value={genericQuery}
              onChange={(e) => {
                const v = e.target.value;
                setGenericQuery(v);
                if (typeof onGenericSearch === 'function') onGenericSearch(v);
              }}
              placeholder="e.g., Paracetamol, Omeprazole"
              style={{ border: '1px solid #d1d5db', borderRadius: 8, padding: '10px 12px' }}
            />
          </div>

          {topGenerics.length > 0 && (
            <div className="category-item" style={{ display: 'grid', gap: 8 }}>
              <span className="category-name" style={{ fontWeight: 600 }}>Popular Generics Overview</span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {topGenerics.map(g => (
                  <button
                    key={g.name}
                    type="button"
                    onClick={() => {
                      setGenericQuery(g.name);
                      if (typeof onGenericSearch === 'function') onGenericSearch(g.name);
                    }}
                    style={{
                      border: '1px solid #d1d5db',
                      borderRadius: 999,
                      padding: '6px 10px',
                      background: '#f8fafc',
                      cursor: 'pointer'
                    }}
                    aria-label={`Filter by ${g.name}`}
                  >
                    {g.name} ({g.count})
                  </button>
                ))}
              </div>
              <p style={{ margin: 0, color: '#64748b', fontSize: 13 }}>
                Browse by common active ingredients to quickly find alternatives.
              </p>
            </div>
          )}
      </div>
      
      
    </div>
  );
};

export default CategorySidebar;