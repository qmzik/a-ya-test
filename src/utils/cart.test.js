import {
  calculateDiscount,
  calculateTotal,
  parseStoredCart,
  resolveCartLines,
  sanitizeCartLines,
  serializeCart,
} from './cart'

describe('cart helpers', () => {
  test('returns an empty cart for malformed storage', () => {
    expect(parseStoredCart('{oops')).toEqual({ lines: [], promoCode: null })
    expect(parseStoredCart(JSON.stringify({ version: 99 }))).toEqual({
      lines: [],
      promoCode: null,
    })
  })

  test('drops invalid lines and combines duplicate lines', () => {
    expect(
      sanitizeCartLines([
        { productId: 1, colorId: 2, sizeId: 3, quantity: 1 },
        { productId: '1', colorId: '2', sizeId: '3', quantity: 2 },
        { productId: 2, colorId: 1, sizeId: 1, quantity: 0 },
      ]),
    ).toEqual([{ productId: 1, colorId: 2, sizeId: 3, quantity: 3 }])
  })

  test('restores a valid promo code', () => {
    const serialized = serializeCart({
      lines: [{ productId: 1, colorId: 2, sizeId: 3, quantity: 1 }],
      promoCode: ' sale10 ',
    })

    expect(parseStoredCart(serialized).promoCode).toBe('SALE10')
  })

  test('calculates percentage and capped fixed discounts', () => {
    expect(calculateDiscount(250, 'SALE10')).toBe(25)
    expect(calculateTotal(250, 'SALE10')).toBe(225)
    expect(calculateDiscount(88, 'SAVE100')).toBe(88)
    expect(calculateTotal(88, 'SAVE100')).toBe(0)
  })

  test('resolves only currently available API combinations', () => {
    const lines = [
      { productId: 1, colorId: 2, sizeId: 3, quantity: 2 },
      { productId: 1, colorId: 2, sizeId: 4, quantity: 1 },
    ]
    const products = [
      {
        id: 1,
        colors: [{ id: 2, price: '12.50', sizes: [3] }],
      },
    ]
    const sizes = [
      { id: 3, name: 'M' },
      { id: 4, name: 'L' },
    ]

    expect(resolveCartLines(lines, products, sizes)).toMatchObject([
      { key: '1:2:3', quantity: 2, lineTotal: 25 },
    ])
  })
})
