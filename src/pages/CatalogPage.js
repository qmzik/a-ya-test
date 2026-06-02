import React, { useEffect, useMemo, useState } from 'react'

import Layout from '../components/Layout'
import ProductCard from '../components/ProductCard'
import StatusMessage from '../components/StatusMessage'
import { getProducts } from '../services/api'
import { filterAndSortProducts } from '../utils/catalog'

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
          {visibleProducts.map((product) => (
            <ProductCard product={product} key={product.id} />
          ))}
        </section>
      )}
    </Layout>
  )
}
