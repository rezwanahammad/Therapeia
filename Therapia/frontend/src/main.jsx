import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import AdminLayout from './pages/admin/AdminLayout.jsx'
import AdminProducts from './pages/admin/AdminProducts.jsx'

const router = createBrowserRouter([
  { path: '/', element: <App /> },
  {
    path: '/admin',
    element: <AdminLayout />,
    children: [
      { index: true, element: <div>Admin Dashboard</div> },
      { path: 'products', element: <AdminProducts /> },
    ],
  },
])

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
