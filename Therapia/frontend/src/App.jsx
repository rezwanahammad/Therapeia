import { useState } from 'react'
import Header from './components/Header'
import Footer from './components/Footer'
import CategorySidebar from './components/CategorySidebar'
import ProductGrid from './components/ProductGrid'
import { products } from './data/mockData'
import './App.css'

function App() {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  const handleCategorySelect = (category) => {
    setSelectedCategory(category)
  }

  return (
    <div className="app">
      <Header 
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />
      
      <main className="main-content">
        <div className="container">
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
