import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
} from 'react'

import { getProducts, getSizes } from '../services/api'
import {
  calculateDiscount,
  calculateItemCount,
  calculateSubtotal,
  calculateTotal,
  resolveCartLines,
  serializeCart,
  STORAGE_KEY,
} from '../utils/cart'
import { cartReducer, createInitialCartState } from './cartReducer'

const CartContext = createContext(null)

function readStoredCart() {
  try {
    return createInitialCartState(window.localStorage.getItem(STORAGE_KEY))
  } catch {
    return createInitialCartState()
  }
}

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, undefined, readStoredCart)
  const [catalogState, setCatalogState] = useState({
    status: 'loading',
    products: [],
    sizes: [],
    error: null,
  })

  useEffect(() => {
    let isCurrent = true

    Promise.all([getProducts(), getSizes()])
      .then(([products, sizes]) => {
        if (isCurrent) {
          setCatalogState({ status: 'success', products, sizes, error: null })
        }
      })
      .catch((error) => {
        if (isCurrent) {
          setCatalogState({
            status: 'error',
            products: [],
            sizes: [],
            error,
          })
        }
      })

    return () => {
      isCurrent = false
    }
  }, [])

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, serializeCart(state))
    } catch {
      // Browsers may deny storage access. The in-memory cart remains usable.
    }
  }, [state])

  const resolvedLines = useMemo(() => {
    if (catalogState.status !== 'success') {
      return []
    }

    return resolveCartLines(
      state.lines,
      catalogState.products,
      catalogState.sizes,
    )
  }, [catalogState, state.lines])

  const itemCount =
    catalogState.status === 'success'
      ? calculateItemCount(resolvedLines)
      : calculateItemCount(state.lines)
  const subtotal = calculateSubtotal(resolvedLines)
  const discount = calculateDiscount(subtotal, state.promoCode)
  const total = calculateTotal(subtotal, state.promoCode)

  const value = {
    ...state,
    ...catalogState,
    resolvedLines,
    itemCount,
    subtotal,
    discount,
    total,
    addLine: (line) => dispatch({ type: 'add', line }),
    incrementLine: (key) => dispatch({ type: 'increment', key }),
    decrementLine: (key) => dispatch({ type: 'decrement', key }),
    removeLine: (key) => dispatch({ type: 'remove', key }),
    applyPromo: (promoCode) => dispatch({ type: 'applyPromo', promoCode }),
    clearPromo: () => dispatch({ type: 'clearPromo' }),
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const cart = useContext(CartContext)

  if (!cart) {
    throw new Error('useCart must be used inside CartProvider')
  }

  return cart
}
