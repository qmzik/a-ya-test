import { displayText } from './text'

export function getMinimumPrice(product) {
  const prices = product.colors
    .map((color) => Number(color.price))
    .filter(Number.isFinite)

  return prices.length > 0 ? Math.min(...prices) : 0
}

export function isProductInStock(product) {
  return product.colors.some((color) => color.sizes.length > 0)
}

export function filterAndSortProducts(
  products,
  { query = '', inStockOnly = false, sortDirection = 'asc' } = {},
) {
  const normalizedQuery = query.trim().toLocaleLowerCase('ru')

  return products
    .filter((product) => {
      const matchesQuery = displayText(product.name)
        .toLocaleLowerCase('ru')
        .includes(normalizedQuery)
      const matchesStock = !inStockOnly || isProductInStock(product)

      return matchesQuery && matchesStock
    })
    .sort((left, right) => {
      const difference = getMinimumPrice(left) - getMinimumPrice(right)

      return sortDirection === 'desc' ? -difference : difference
    })
}

export function formatPrice(price) {
  const numericPrice = Number(price)

  return Number.isFinite(numericPrice) ? numericPrice.toFixed(2) : '0.00'
}

export function getProductPreviewImage(product) {
  return product.colors.find((color) => color.images.length > 0)?.images[0] || ''
}
