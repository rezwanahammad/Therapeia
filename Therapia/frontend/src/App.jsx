import { useEffect, useState } from 'react'
import Header from './components/Header'
import Footer from './components/Footer'
import CategorySidebar from './components/CategorySidebar'
import ProductGrid from './components/ProductGrid'
import { products } from './data/mockData'
import './App.css'
import UserDashboard from './components/UserDashboard'

function App() {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [currentUser, setCurrentUser] = useState(null)

  useEffect(() => {
    try {
      const raw = localStorage.getItem('currentUser')
      if (raw) setCurrentUser(JSON.parse(raw))
    } catch (e) {
      console.error('Failed to load currentUser from localStorage:', e)
    }
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
      />
      
      <main className="main-content">
        <div className="container">
          {currentUser && (
            <UserDashboard user={currentUser} onLogout={() => {
              try { localStorage.removeItem('currentUser') } catch { /* ignore */ }
              setCurrentUser(null)
            }} />
          )}
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
