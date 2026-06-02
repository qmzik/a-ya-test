import React, { useEffect, useMemo, useState } from 'react'

import Layout from '../components/Layout'
import StatusMessage from '../components/StatusMessage'
import { getProducts } from '../services/api'
import {
  filterAndSortProducts,
  formatPrice,
  getMinimumPrice,
  getProductPreviewImage,
  isProductInStock,
} from '../utils/catalog'
import { displayText } from '../utils/text'

export default function CatalogPage() {
  const [products, setProducts] = useState([])
  const [status, setStatus] = useState('loading')
  const [query, setQuery] = useState('')
  const [inStockOnly, setInStockOnly] = useState(false)
  const [sortDirection, setSortDirection] = useState('asc')

  useEffect(() => {
    let isCurrent = true

    getProducts()
      .then((loadedProducts) => {
        if (isCurrent) {
          setProducts(loadedProducts)
          setStatus('success')
        }
      })
      .catch(() => {
        if (isCurrent) {
          setStatus('error')
        }
      })

    return () => {
      isCurrent = false
    }
  }, [])

  const visibleProducts = useMemo(
    () =>
      filterAndSortProducts(products, {
        query,
        inStockOnly,
        sortDirection,
      }),
    [inStockOnly, products, query, sortDirection],
  )

  return (
    <Layout>
      <section className="page-heading">
        <p className="eyebrow">Одежда и аксессуары</p>
        <h1>Каталог товаров</h1>
        <p>Выберите вещь, цвет и размер, затем добавьте покупку в корзину.</p>
      </section>

      <section className="catalog-controls" aria-label="Фильтры каталога">
        <label className="field">
          <span>Поиск</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Название товара"
          />
        </label>
        <label className="field">
          <span>Цена</span>
          <select
            value={sortDirection}
            onChange={(event) => setSortDirection(event.target.value)}
          >
            <option value="asc">Сначала дешевле</option>
            <option value="desc">Сначала дороже</option>
          </select>
        </label>
        <label className="checkbox-field">
          <input
            type="checkbox"
            checked={inStockOnly}
            onChange={(event) => setInStockOnly(event.target.checked)}
          />
          <span>В наличии</span>
        </label>
      </section>

      {status === 'loading' && (
        <StatusMessage title="Загружаем товары">
          Каталог появится через несколько секунд.
        </StatusMessage>
      )}

      {status === 'error' && (
        <StatusMessage title="Не удалось загрузить каталог">
          Обновите страницу и попробуйте еще раз.
        </StatusMessage>
      )}

      {status === 'success' && visibleProducts.length === 0 && (
        <StatusMessage title="Ничего не найдено">
          Измените строку поиска или отключите фильтр наличия.
        </StatusMessage>
      )}

      {status === 'success' && visibleProducts.length > 0 && (
        <section className="product-grid" aria-label="Список товаров">
          {visibleProducts.map((product) => {
            const inStock = isProductInStock(product)

            return (
              <a
                className="product-card"
                href={`#/product/${product.id}`}
                key={product.id}
              >
                <div className="product-image-frame">
                  <img
                    src={getProductPreviewImage(product)}
                    alt={displayText(product.name)}
                  />
                </div>
                <div className="product-card-body">
                  <p className="product-card-brand">{product.brand}</p>
                  <h2>{displayText(product.name)}</h2>
                  <div className="product-card-meta">
                    <strong>от {formatPrice(getMinimumPrice(product))} ₽</strong>
                    <span className={inStock ? 'stock-label' : 'stock-label out'}>
                      {inStock ? 'В наличии' : 'Нет в наличии'}
                    </span>
                  </div>
                </div>
              </a>
            )
          })}
        </section>
      )}
    </Layout>
  )
}
