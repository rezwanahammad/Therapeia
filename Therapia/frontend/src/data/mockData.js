// Mock data for the medicine e-commerce platform

export const categories = [
  { id: 1, name: 'Medicine', icon: '💊' },
  { id: 2, name: 'Healthcare', icon: '🏥' },
  { id: 3, name: 'Beauty', icon: '💄' },
  { id: 4, name: 'Baby & Mom Care', icon: '👶' },
  { id: 5, name: 'Herbal', icon: '🌿' },
  { id: 6, name: 'Home Care', icon: '🏠' },
  { id: 7, name: 'Supplement', icon: '💪' },
  { id: 8, name: 'Pet Care', icon: '🐕' }
];

export const products = [
  {
    id: 1,
    name: 'Paracetamol 500mg',
    price: 15.50,
    originalPrice: 20.00,
    discount: 22,
    image: 'https://via.placeholder.com/200x200/4CAF50/white?text=Paracetamol',
    category: 'Medicine',
    rating: 4.5,
    reviews: 128,
    inStock: true
  },
  {
    id: 2,
    name: 'Vitamin D3 Tablets',
    price: 45.00,
    originalPrice: 60.00,
    discount: 25,
    image: 'https://via.placeholder.com/200x200/2196F3/white?text=Vitamin+D3',
    category: 'Supplement',
    rating: 4.7,
    reviews: 89,
    inStock: true
  },
  {
    id: 3,
    name: 'Hand Sanitizer 250ml',
    price: 25.00,
    originalPrice: 30.00,
    discount: 17,
    image: 'https://via.placeholder.com/200x200/FF9800/white?text=Sanitizer',
    category: 'Healthcare',
    rating: 4.3,
    reviews: 156,
    inStock: true
  },
  {
    id: 4,
    name: 'Baby Lotion 200ml',
    price: 35.00,
    originalPrice: 42.00,
    discount: 17,
    image: 'https://via.placeholder.com/200x200/E91E63/white?text=Baby+Lotion',
    category: 'Baby & Mom Care',
    rating: 4.6,
    reviews: 73,
    inStock: true
  },
  {
    id: 5,
    name: 'Turmeric Capsules',
    price: 28.00,
    originalPrice: 35.00,
    discount: 20,
    image: 'https://via.placeholder.com/200x200/795548/white?text=Turmeric',
    category: 'Herbal',
    rating: 4.4,
    reviews: 92,
    inStock: true
  },
  {
    id: 6,
    name: 'Face Cream SPF 30',
    price: 55.00,
    originalPrice: 70.00,
    discount: 21,
    image: 'https://via.placeholder.com/200x200/9C27B0/white?text=Face+Cream',
    category: 'Beauty',
    rating: 4.8,
    reviews: 204,
    inStock: true
  },
  {
    id: 7,
    name: 'Antiseptic Liquid 500ml',
    price: 18.00,
    originalPrice: 22.00,
    discount: 18,
    image: 'https://via.placeholder.com/200x200/607D8B/white?text=Antiseptic',
    category: 'Home Care',
    rating: 4.2,
    reviews: 67,
    inStock: true
  },
  {
    id: 8,
    name: 'Dog Shampoo 300ml',
    price: 32.00,
    originalPrice: 40.00,
    discount: 20,
    image: 'https://via.placeholder.com/200x200/8BC34A/white?text=Dog+Shampoo',
    category: 'Pet Care',
    rating: 4.5,
    reviews: 45,
    inStock: true
  }
];

export const flashSaleProducts = products.slice(0, 6).map(product => ({
  ...product,
  discount: Math.max(product.discount + 10, 30) // Increase discount for flash sale
}));