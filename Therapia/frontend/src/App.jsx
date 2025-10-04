import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import CategorySidebar from './components/CategorySidebar'
import ProductGrid from './components/ProductGrid'
import { products } from './data/mockData'
import './App.css'
// Dashboard moved to its own route as requested

function App() {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [currentUser, setCurrentUser] = useState(null)
  const navigate = useNavigate()

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
              <ProductGrid 
                products={products}
                selectedCategory={selectedCategory}
                searchQuery={searchQuery}
              />
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default App
