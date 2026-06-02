import React, { useEffect, useState } from 'react'

import CartLine from '../components/CartLine'
import Layout from '../components/Layout'
import StatusMessage from '../components/StatusMessage'
import { useCart } from '../context/CartContext'
import { formatPrice } from '../utils/catalog'
import { isValidPromoCode, normalizePromoCode } from '../utils/cart'

export default function CartPage() {
  const {
    applyPromo,
    clearPromo,
    decrementLine,
    discount,
    incrementLine,
    promoCode,
    removeLine,
    resolvedLines,
    status,
    subtotal,
    total,
  } = useCart()
  const [promoInput, setPromoInput] = useState(promoCode || '')
  const [promoError, setPromoError] = useState('')

  useEffect(() => {
    setPromoInput(promoCode || '')
  }, [promoCode])

  function submitPromo(event) {
    event.preventDefault()
    const normalizedCode = normalizePromoCode(promoInput)

    if (!isValidPromoCode(normalizedCode)) {
      setPromoError('Промокод не найден. Попробуйте SALE10 или SAVE100.')
      return
    }

    applyPromo(normalizedCode)
    setPromoInput(normalizedCode)
    setPromoError('')
  }

  return (
    <Layout>
      <a className="back-link" href="#/">
        ← Продолжить покупки
      </a>
      <section className="page-heading compact">
        <p className="eyebrow">Ваш заказ</p>
        <h1>Корзина</h1>
      </section>

      {status === 'loading' && (
        <StatusMessage title="Загружаем корзину">
          Проверяем товары и актуальные цены.
        </StatusMessage>
      )}

      {status === 'error' && (
        <StatusMessage title="Не удалось загрузить корзину">
          Обновите страницу и попробуйте еще раз.
        </StatusMessage>
      )}

      {status === 'success' && resolvedLines.length === 0 && (
        <StatusMessage
          title="Корзина пока пуста"
          action={<a href="#/">Перейти в каталог</a>}
        >
          Добавьте товар, чтобы оформить заказ.
        </StatusMessage>
      )}

      {status === 'success' && resolvedLines.length > 0 && (
        <div className="cart-layout">
          <section className="cart-lines" aria-label="Товары в корзине">
            {resolvedLines.map((line) => (
              <CartLine
                line={line}
                key={line.key}
                onDecrement={decrementLine}
                onIncrement={incrementLine}
                onRemove={removeLine}
              />
            ))}
          </section>

          <aside className="order-summary">
            <h2>Итого</h2>
            <form className="promo-form" onSubmit={submitPromo}>
              <label className="field">
                <span>Промокод</span>
                <input
                  value={promoInput}
                  onChange={(event) => {
                    setPromoInput(event.target.value)
                    setPromoError('')
                  }}
                  placeholder="SALE10"
                />
              </label>
              <button type="submit" className="secondary-button">
                Применить
              </button>
            </form>
            {promoError && <p className="form-error">{promoError}</p>}
            {promoCode && (
              <div className="applied-promo">
                <span>Применен {promoCode}</span>
                <button type="button" onClick={clearPromo}>
                  Отменить
                </button>
              </div>
            )}
            <dl className="summary-list">
              <div>
                <dt>Товары</dt>
                <dd>{formatPrice(subtotal)} ₽</dd>
              </div>
              <div>
                <dt>Скидка</dt>
                <dd>− {formatPrice(discount)} ₽</dd>
              </div>
              <div className="summary-total">
                <dt>К оплате</dt>
                <dd>{formatPrice(total)} ₽</dd>
              </div>
            </dl>
          </aside>
        </div>
      )}
    </Layout>
  )
}
