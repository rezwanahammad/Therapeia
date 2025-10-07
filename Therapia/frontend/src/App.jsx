import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import CategorySidebar from './components/CategorySidebar'
import ProductGrid from './components/ProductGrid'
import './App.css'
// Dashboard moved to its own route as requested

function App() {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [currentUser, setCurrentUser] = useState(null)
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  
  // Prefer proxy-relative paths in dev; allow explicit base via env
  const API_BASE = import.meta.env.VITE_API_URL || ''

  useEffect(() => {
    const loadMe = async () => {
      try {
        const res = await fetch('/api/auth/me')
        if (!res.ok) return
        const data = await res.json()
        setCurrentUser(data.user)
      } catch {
        // ignore if not logged in
      }
    }
    loadMe()
  }, [])
  
  // Load products for the Home page from backend
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true)
        setError('')
        const res = await fetch(`${API_BASE ? API_BASE + '/api' : '/api'}/products`)
        const contentType = res.headers.get('content-type') || ''
        if (!contentType.includes('application/json')) {
          const text = await res.text()
          throw new Error(`Expected JSON, got: ${text.slice(0, 60)}...`)
        }
        const data = await res.json()
        const raw = Array.isArray(data.products) ? data.products : []
        // Adapt API product shape to UI card needs
        const normalized = raw.map(p => ({
          id: p._id || p.id,
          name: p.name,
          price: p.price,
          category: p.category,
          image: p.imageUrl,
          inStock: (p.inventory ?? 0) > 0,
          originalPrice: p.price,
          discount: 0,
          rating: 0,
          reviews: 0,
        }))
        setProducts(normalized)
      } catch (e) {
        setError(e.message || 'Failed to load products')
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [])

  const handleCategorySelect = (category) => {
    setSelectedCategory(category)
  }

  return (
    <div className="app">
      <Header 
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onLoggedIn={(user) => setCurrentUser(user)}
        currentUser={currentUser}
        onLogout={async () => {
          try { await fetch('/api/auth/logout', { method: 'POST' }) } catch { /* ignore logout errors */ }
          setCurrentUser(null)
          navigate('/')
        }}
      />
      
      <main className="main-content">
        <div className="container">
          {/* Account dashboard is available on /account route */}
          <div className="content-layout">
            <aside className="sidebar">
              <CategorySidebar 
                onCategorySelect={handleCategorySelect}
                selectedCategory={selectedCategory}
              />
            </aside>
            
            <section className="products-section">
              {loading ? (
                <div style={{ padding: '12px', color: '#666' }}>Loading products...</div>
              ) : (
                <ProductGrid 
                  products={products}
                  selectedCategory={selectedCategory}
                  searchQuery={searchQuery}
                  currentUser={currentUser}
                />
              )}
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default App
