import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Login from './pages/Login.jsx'
import AccountDashboard from './pages/AccountDashboard.jsx'
import ProductDescription from './pages/ProductDescription.jsx'
import AdminLayout from './pages/admin/AdminLayout.jsx'
import AdminProducts from './pages/admin/AdminProducts.jsx'
import AdminOrders from './pages/admin/AdminOrders.jsx'
import RequireAdmin from './components/admin/RequireAdmin.jsx'
import AdminLogin from './pages/admin/AdminLogin.jsx'
import Cart from './pages/Cart.jsx'
import NotificationProvider from './components/NotificationProvider.jsx'
import OrderHistory from './pages/OrderHistory.jsx'
import OrderDetail from './pages/OrderDetail.jsx'

const router = createBrowserRouter([
  { path: '/', element: <App /> },
  { path: '/login', element: <Login /> },
  { path: '/account', element: <AccountDashboard /> },
  { path: '/orders', element: <OrderHistory /> },
  { path: '/orders/:id', element: <OrderDetail /> },
  { path: '/product/:id', element: <ProductDescription /> },
  { path: '/admin/login', element: <AdminLogin /> },
  { path: '/cart', element: <Cart /> },
  {
    path: '/admin',
    element: (
      <RequireAdmin>
        <AdminLayout />
      </RequireAdmin>
    ),
    children: [
      { index: true, element: <div>Admin Dashboard</div> },
      { path: 'products', element: <AdminProducts /> },
      { path: 'orders', element: <AdminOrders /> },
    ],
  },
])

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <NotificationProvider>
      <RouterProvider router={router} />
    </NotificationProvider>
  </StrictMode>,
)
