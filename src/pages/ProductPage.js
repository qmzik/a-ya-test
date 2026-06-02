import React, { useEffect, useMemo, useState } from 'react'

import Layout from '../components/Layout'
import StatusMessage from '../components/StatusMessage'
import { useCart } from '../context/CartContext'
import { createProductHash, replaceHash } from '../hooks/useHashRoute'
import { getProduct, getSizes } from '../services/api'
import { formatPrice } from '../utils/catalog'
import { displayText } from '../utils/text'

export default function ProductPage({ route }) {
  const { addLine } = useCart()
  const [status, setStatus] = useState('loading')
  const [product, setProduct] = useState(null)
  const [sizes, setSizes] = useState([])
  const [selectedColorId, setSelectedColorId] = useState(null)
  const [selectedSizeId, setSelectedSizeId] = useState(null)
  const [imageIndex, setImageIndex] = useState(0)
  const [wasAdded, setWasAdded] = useState(false)

  useEffect(() => {
    let isCurrent = true

    setStatus('loading')
    setProduct(null)

    Promise.all([getProduct(route.productId), getSizes()])
      .then(([loadedProduct, loadedSizes]) => {
        if (!isCurrent) {
          return
        }

        const requestedColorId = route.searchParams.get('color')
        const initialColor =
          loadedProduct.colors.find(
            (color) => String(color.id) === requestedColorId,
          ) || loadedProduct.colors[0]
        const requestedSizeId = route.searchParams.get('size')
        const initialSizeId = initialColor.sizes.find(
          (sizeId) => String(sizeId) === requestedSizeId,
        )

        setProduct(loadedProduct)
        setSizes(loadedSizes)
        setSelectedColorId(initialColor.id)
        setSelectedSizeId(initialSizeId || null)
        setImageIndex(0)
        setStatus('success')
      })
      .catch((error) => {
        if (isCurrent) {
          setStatus(
            error.message.includes('Product not found') ? 'notFound' : 'error',
          )
        }
      })

    return () => {
      isCurrent = false
    }
  }, [route.productId, route.searchParams])

  useEffect(() => {
    if (!product || !selectedColorId) {
      return
    }

    replaceHash(
      createProductHash(product.id, {
        colorId: selectedColorId,
        sizeId: selectedSizeId,
      }),
    )
  }, [product, selectedColorId, selectedSizeId])

  const selectedColor = useMemo(
    () =>
      product?.colors.find(
        (color) => String(color.id) === String(selectedColorId),
      ),
    [product, selectedColorId],
  )

  function selectColor(color) {
    setSelectedColorId(color.id)
    setSelectedSizeId((currentSizeId) =>
      color.sizes.some((sizeId) => String(sizeId) === String(currentSizeId))
        ? currentSizeId
        : null,
    )
    setImageIndex(0)
    setWasAdded(false)
  }

  function addSelectedLine() {
    if (!product || !selectedColor || !selectedSizeId) {
      return
    }

    addLine({
      productId: product.id,
      colorId: selectedColor.id,
      sizeId: selectedSizeId,
    })
    setWasAdded(true)
  }

  if (status === 'loading') {
    return (
      <Layout>
        <StatusMessage title="Загружаем товар">
          Получаем доступные цвета и размеры.
        </StatusMessage>
      </Layout>
    )
  }

  if (status === 'notFound') {
    return (
      <Layout>
        <StatusMessage
          title="Товар не найден"
          action={<a href="#/">Вернуться в каталог</a>}
        >
          Возможно, он был удален или адрес указан неверно.
        </StatusMessage>
      </Layout>
    )
  }

  if (status === 'error' || !product || !selectedColor) {
    return (
      <Layout>
        <StatusMessage title="Не удалось загрузить товар">
          Обновите страницу и попробуйте еще раз.
        </StatusMessage>
      </Layout>
    )
  }

  return (
    <Layout>
      <a className="back-link" href="#/">
        ← Назад в каталог
      </a>
      <section className="product-details">
        <div className="gallery">
          <div className="gallery-main">
            <img
              src={selectedColor.images[imageIndex]}
              alt={`${displayText(product.name)}, ${displayText(selectedColor.name)}`}
            />
          </div>
          <div className="gallery-thumbnails" aria-label="Изображения товара">
            {selectedColor.images.map((image, index) => (
              <button
                className={index === imageIndex ? 'thumbnail active' : 'thumbnail'}
                type="button"
                key={image}
                onClick={() => setImageIndex(index)}
                aria-label={`Показать изображение ${index + 1}`}
                aria-pressed={index === imageIndex}
              >
                <img src={image} alt="" />
              </button>
            ))}
          </div>
        </div>

        <div className="product-info">
          <p className="eyebrow">{product.brand}</p>
          <h1>{displayText(product.name)}</h1>
          <p className="product-price">{formatPrice(selectedColor.price)} ₽</p>
          <p className="product-description">
            {displayText(selectedColor.description)}
          </p>

          <fieldset className="option-group">
            <legend>Цвет</legend>
            <div className="option-list">
              {product.colors.map((color) => (
                <button
                  type="button"
                  className={
                    color.id === selectedColorId
                      ? 'option-button active'
                      : 'option-button'
                  }
                  key={color.id}
                  onClick={() => selectColor(color)}
                  aria-pressed={color.id === selectedColorId}
                >
                  {displayText(color.name)}
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset className="option-group">
            <legend>Размер</legend>
            <div className="option-list">
              {sizes.map((size) => {
                const isAvailable = selectedColor.sizes.includes(size.id)

                return (
                  <button
                    type="button"
                    className={
                      size.id === selectedSizeId
                        ? 'option-button size active'
                        : 'option-button size'
                    }
                    key={size.id}
                    onClick={() => {
                      setSelectedSizeId(size.id)
                      setWasAdded(false)
                    }}
                    disabled={!isAvailable}
                    aria-pressed={size.id === selectedSizeId}
                  >
                    {size.name}
                  </button>
                )
              })}
            </div>
          </fieldset>

          {selectedColor.sizes.length === 0 && (
            <p className="inline-notice">Этот цвет временно недоступен.</p>
          )}

          <button
            type="button"
            className="primary-button"
            onClick={addSelectedLine}
            disabled={!selectedSizeId}
          >
            {wasAdded ? 'Добавлено в корзину' : 'Добавить в корзину'}
          </button>
        </div>
      </section>
    </Layout>
  )
}
