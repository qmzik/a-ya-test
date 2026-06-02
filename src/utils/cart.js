export const STORAGE_KEY = 'mini-catalog-cart'
export const CART_STORAGE_VERSION = 1

export const PROMO_CODES = {
  SALE10: { type: 'percent', value: 10 },
  SAVE100: { type: 'fixed', value: 100 },
}

function normalizeId(value) {
  const id = Number(value)

  return Number.isInteger(id) && id > 0 ? id : null
}

export function makeCartLineKey({ productId, colorId, sizeId }) {
  return `${productId}:${colorId}:${sizeId}`
}

export function normalizePromoCode(value) {
  return typeof value === 'string' ? value.trim().toUpperCase() : ''
}

export function isValidPromoCode(value) {
  return Object.hasOwn(PROMO_CODES, normalizePromoCode(value))
}

export function sanitizeCartLines(lines) {
  if (!Array.isArray(lines)) {
    return []
  }

  const sanitizedLines = new Map()

  lines.forEach((line) => {
    if (!line || typeof line !== 'object') {
      return
    }

    const productId = normalizeId(line.productId)
    const colorId = normalizeId(line.colorId)
    const sizeId = normalizeId(line.sizeId)
    const quantity = Number(line.quantity)

    if (
      !productId ||
      !colorId ||
      !sizeId ||
      !Number.isInteger(quantity) ||
      quantity < 1
    ) {
      return
    }

    const normalizedLine = { productId, colorId, sizeId, quantity }
    const key = makeCartLineKey(normalizedLine)
    const currentLine = sanitizedLines.get(key)

    sanitizedLines.set(key, {
      ...normalizedLine,
      quantity: quantity + (currentLine?.quantity || 0),
    })
  })

  return [...sanitizedLines.values()]
}

export function parseStoredCart(value) {
  if (!value) {
    return { lines: [], promoCode: null }
  }

  try {
    const storedState = JSON.parse(value)

    if (
      !storedState ||
      typeof storedState !== 'object' ||
      storedState.version !== CART_STORAGE_VERSION
    ) {
      return { lines: [], promoCode: null }
    }

    const promoCode = normalizePromoCode(storedState.promoCode)

    return {
      lines: sanitizeCartLines(storedState.lines),
      promoCode: isValidPromoCode(promoCode) ? promoCode : null,
    }
  } catch {
    return { lines: [], promoCode: null }
  }
}

export function serializeCart({ lines, promoCode }) {
  return JSON.stringify({
    version: CART_STORAGE_VERSION,
    lines: sanitizeCartLines(lines),
    promoCode: isValidPromoCode(promoCode) ? normalizePromoCode(promoCode) : null,
  })
}

export function resolveCartLines(lines, products, sizes) {
  const productsById = new Map(
    products.map((product) => [String(product.id), product]),
  )
  const sizesById = new Map(sizes.map((size) => [String(size.id), size]))

  return lines.flatMap((line) => {
    const product = productsById.get(String(line.productId))
    const color = product?.colors.find(
      (item) => String(item.id) === String(line.colorId),
    )
    const size = sizesById.get(String(line.sizeId))
    const isAvailable = color?.sizes.some(
      (sizeId) => String(sizeId) === String(line.sizeId),
    )
    const unitPrice = Number(color?.price)

    if (!product || !color || !size || !isAvailable || !Number.isFinite(unitPrice)) {
      return []
    }

    return [
      {
        ...line,
        key: makeCartLineKey(line),
        product,
        color,
        size,
        unitPrice,
        lineTotal: unitPrice * line.quantity,
      },
    ]
  })
}

export function calculateItemCount(lines) {
  return lines.reduce((total, line) => total + line.quantity, 0)
}

export function calculateSubtotal(lines) {
  return lines.reduce((total, line) => total + line.lineTotal, 0)
}

export function calculateDiscount(subtotal, promoCode) {
  const promotion = PROMO_CODES[normalizePromoCode(promoCode)]

  if (!promotion || subtotal <= 0) {
    return 0
  }

  const discount =
    promotion.type === 'percent'
      ? (subtotal * promotion.value) / 100
      : promotion.value

  return Math.min(subtotal, discount)
}

export function calculateTotal(subtotal, promoCode) {
  return Math.max(0, subtotal - calculateDiscount(subtotal, promoCode))
}
