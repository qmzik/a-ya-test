import React from 'react'

import {
  formatPrice,
  getMinimumPrice,
  getProductPreviewImage,
  isProductInStock,
} from '../utils/catalog'
import { displayText } from '../utils/text'

/**
 * @typedef {Object} ProductColor
 * @property {number} id
 * @property {string} name
 * @property {string[]} images
 * @property {string} price
 * @property {string} description
 * @property {number[]} sizes
 */

/**
 * @typedef {Object} Product
 * @property {number} id
 * @property {string} name
 * @property {number} categoryId
 * @property {string} brand
 * @property {ProductColor[]} colors
 */

/**
 * @typedef {Object} ProductCardProps
 * @property {Product} product
 */

/**
 * @param {ProductCardProps} props
 */
export default function ProductCard({ product }) {
  const inStock = isProductInStock(product)

  return (
    <a className="product-card" href={`#/product/${product.id}`}>
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
}
