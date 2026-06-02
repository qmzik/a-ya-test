import React from 'react'

import Layout from './components/Layout'
import StatusMessage from './components/StatusMessage'
import { CartProvider } from './context/CartContext'
import { useHashRoute } from './hooks/useHashRoute'
import CartPage from './pages/CartPage'
import CatalogPage from './pages/CatalogPage'
import ProductPage from './pages/ProductPage'

function AppContent() {
  const route = useHashRoute()

  if (route.name === 'catalog') {
    return <CatalogPage />
  }

  if (route.name === 'product') {
    return <ProductPage route={route} />
  }

  if (route.name === 'cart') {
    return <CartPage />
  }

  return (
    <Layout>
      <StatusMessage
        title="Страница не найдена"
        action={<a href="#/">Вернуться в каталог</a>}
      >
        Проверьте адрес или перейдите к списку товаров.
      </StatusMessage>
    </Layout>
  )
}

export default function App() {
  return (
    <CartProvider>
      <AppContent />
    </CartProvider>
  )
}
