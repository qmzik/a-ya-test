import { cartReducer, initialCartState } from './cartReducer'

const line = { productId: 1, colorId: 2, sizeId: 3 }

describe('cart reducer', () => {
  test('adds a line and increments an existing combination', () => {
    const addedState = cartReducer(initialCartState, { type: 'add', line })
    const incrementedState = cartReducer(addedState, { type: 'add', line })

    expect(incrementedState.lines).toEqual([{ ...line, quantity: 2 }])
  })

  test('does not decrement below one and removes a line explicitly', () => {
    const addedState = cartReducer(initialCartState, { type: 'add', line })
    const decrementedState = cartReducer(addedState, {
      type: 'decrement',
      key: '1:2:3',
    })
    const removedState = cartReducer(decrementedState, {
      type: 'remove',
      key: '1:2:3',
    })

    expect(decrementedState.lines[0].quantity).toBe(1)
    expect(removedState.lines).toEqual([])
  })

  test('applies known promo codes and ignores invalid replacements', () => {
    const promotedState = cartReducer(initialCartState, {
      type: 'applyPromo',
      promoCode: ' sale10 ',
    })
    const unchangedState = cartReducer(promotedState, {
      type: 'applyPromo',
      promoCode: 'missing',
    })

    expect(promotedState.promoCode).toBe('SALE10')
    expect(unchangedState).toBe(promotedState)
  })
})
