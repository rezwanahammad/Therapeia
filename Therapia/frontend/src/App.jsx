import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import CategorySidebar from './components/CategorySidebar'
import ProductGrid from './components/ProductGrid'
import './App.css'
import { setCurrentUser as persistUser, clearCurrentUser, getCurrentUser } from './utils/auth'
import heroDoctor from './assets/hero-doctor.png'
import chatIcon from './assets/chat_icon.png'
import ChatModal from './components/ChatModal'
import './components/ChatModal.css'
// Dashboard moved to its own route as requested

function App() {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [currentUser, setCurrentUser] = useState(getCurrentUser())
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(false)
  const [, setError] = useState('')
  const navigate = useNavigate()
  const [isChatOpen, setIsChatOpen] = useState(false)
  
  // Prefer proxy-relative paths in dev; allow explicit base via env
  const API_BASE = import.meta.env.VITE_API_URL || ''

  useEffect(() => {
    const loadMe = async () => {
      try {
        const res = await fetch(`${API_BASE ? API_BASE + '/api' : '/api'}/auth/me`, { credentials: 'include' })
        if (!res.ok) return
        const data = await res.json()
        setCurrentUser(data.user)
        // Keep localStorage in sync when session cookie is valid
        persistUser(data.user)
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
        onLoggedIn={(user) => { setCurrentUser(user); persistUser(user); }}
        currentUser={currentUser}
        onLogout={async () => {
          try { await fetch(`${API_BASE ? API_BASE + '/api' : '/api'}/auth/logout`, { method: 'POST', credentials: 'include' }) } catch { /* ignore logout errors */ }
          setCurrentUser(null)
          clearCurrentUser()
          navigate('/')
        }}
      />
      
      <main className="main-content">
        <div className="container">
          {/* Hero section */}
          <section className="hero">
            <div className="hero-inner">
              <div className="hero-text">
                <h2 className="hero-title">Your Health, Our Priority: Quality Medicines Delivered</h2>
                <p className="hero-subtitle">Discover a comprehensive range of medicines, health supplements, and wellness products. Fast, reliable delivery right to your doorstep.</p>
                <button
                  type="button"
                  className="hero-cta"
                  onClick={() => {
                    const el = document.querySelector('.products-section')
                    if (el) {
                      const top = el.getBoundingClientRect().top + window.scrollY - 80
                      window.scrollTo({ top, behavior: 'smooth' })
                    }
                  }}
                >
                  Explore Products
                </button>
              </div>
              <div className="hero-image">
                <img src={heroDoctor} alt="Doctor consulting a patient" />
              </div>
            </div>
          </section>
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
      {/* Floating chat trigger on Home */}
      <button type="button" className="floating-chat-trigger" onClick={() => setIsChatOpen(true)}>
        <span className="chat-trigger-icon">
          <img src={chatIcon} alt="Chat" />
        </span>
       TherapAI
      </button>
      <ChatModal isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} mode="home" />
      <Footer />
    </div>
  )
}

export default App
