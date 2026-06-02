import {
  filterAndSortProducts,
  getMinimumPrice,
  isProductInStock,
} from './catalog'
import { displayText } from './text'

const products = [
  {
    id: 1,
    name: 'Jacket',
    colors: [
      { price: '125.00', sizes: [1] },
      { price: '120.00', sizes: [] },
    ],
  },
  {
    id: 2,
    name: 'Cap',
    colors: [{ price: '55.00', sizes: [] }],
  },
  {
    id: 3,
    name: 'Shirt',
    colors: [{ price: '88.00', sizes: [2] }],
  },
]

describe('catalog helpers', () => {
  test('uses the minimum color price', () => {
    expect(getMinimumPrice(products[0])).toBe(120)
  })

  test('considers a product available when any color has a size', () => {
    expect(isProductInStock(products[0])).toBe(true)
    expect(isProductInStock(products[1])).toBe(false)
  })

  test('filters and sorts products without mutating the source array', () => {
    const visibleProducts = filterAndSortProducts(products, {
      query: '',
      inStockOnly: true,
      sortDirection: 'desc',
    })

    expect(visibleProducts.map((product) => product.id)).toEqual([1, 3])
    expect(products.map((product) => product.id)).toEqual([1, 2, 3])
  })

  test('recovers display text without changing the API source', () => {
    expect(displayText('Р¤СѓС‚Р±РѕР»РєР°')).toBe('Футболка')
  })
})
