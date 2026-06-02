import React from 'react'

import { useCart } from '../context/CartContext'
import { formatPrice } from '../utils/catalog'

function formatItemCount(itemCount) {
  const tens = itemCount % 100
  const ones = itemCount % 10

  if (tens >= 11 && tens <= 14) {
    return `${itemCount} товаров`
  }

  if (ones === 1) {
    return `${itemCount} товар`
  }

  if (ones >= 2 && ones <= 4) {
    return `${itemCount} товара`
  }

  return `${itemCount} товаров`
}

export default function Layout({ children }) {
  const { itemCount, status, total } = useCart()

  return (
    <div className="app-shell">
      <header className="site-header">
        <a className="brand" href="#/" aria-label="Перейти в каталог">
          Mini Store
        </a>
        <a
          className="cart-link"
          href="#/cart"
          aria-label={`Корзина: ${formatItemCount(itemCount)} на сумму ${formatPrice(total)}`}
        >
          <span>Корзина</span>
          <strong>{itemCount} шт.</strong>
          <span>{status === 'loading' ? '...' : `${formatPrice(total)} ₽`}</span>
        </a>
      </header>
      <main className="page-content">{children}</main>
    </div>
  )
}
