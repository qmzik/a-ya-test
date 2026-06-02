import React from 'react'

import { createProductHash } from '../hooks/useHashRoute'
import { formatPrice } from '../utils/catalog'
import { displayText } from '../utils/text'

/**
 * @typedef {Object} ResolvedCartLine
 * @property {string} key
 * @property {number} quantity
 * @property {number} unitPrice
 * @property {number} lineTotal
 * @property {{ id: number, name: string }} product
 * @property {{ id: number, name: string, images: string[] }} color
 * @property {{ id: number, name: string }} size
 */

/**
 * @typedef {Object} CartLineProps
 * @property {ResolvedCartLine} line
 * @property {(key: string) => void} onDecrement
 * @property {(key: string) => void} onIncrement
 * @property {(key: string) => void} onRemove
 */

/**
 * @param {CartLineProps} props
 */
export default function CartLine({
  line,
  onDecrement,
  onIncrement,
  onRemove,
}) {
  const productName = displayText(line.product.name)
  const productHash = createProductHash(line.product.id, {
    colorId: line.color.id,
    sizeId: line.size.id,
  })

  return (
    <article className="cart-line">
      <a className="cart-line-image" href={productHash}>
        <img
          src={line.color.images[0]}
          alt={`${productName}, ${displayText(line.color.name)}`}
        />
      </a>
      <div className="cart-line-info">
        <a className="cart-line-title" href={productHash}>
          {productName}
        </a>
        <p>
          Цвет: {displayText(line.color.name)} · Размер: {line.size.name}
        </p>
        <p>{formatPrice(line.unitPrice)} ₽ за шт.</p>
      </div>
      <div className="quantity-control" aria-label="Количество">
        <button
          type="button"
          onClick={() => onDecrement(line.key)}
          disabled={line.quantity === 1}
          aria-label={`Уменьшить количество ${productName}`}
        >
          −
        </button>
        <strong>{line.quantity}</strong>
        <button
          type="button"
          onClick={() => onIncrement(line.key)}
          aria-label={`Увеличить количество ${productName}`}
        >
          +
        </button>
      </div>
      <strong className="cart-line-total">{formatPrice(line.lineTotal)} ₽</strong>
      <button
        type="button"
        className="remove-button"
        onClick={() => onRemove(line.key)}
        aria-label={`Удалить ${productName} из корзины`}
      >
        Удалить
      </button>
    </article>
  )
}
