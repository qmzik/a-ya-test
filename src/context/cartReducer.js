import {
  isValidPromoCode,
  makeCartLineKey,
  normalizePromoCode,
  parseStoredCart,
  sanitizeCartLines,
} from '../utils/cart'

export const initialCartState = {
  lines: [],
  promoCode: null,
}

export function createInitialCartState(storedValue) {
  return parseStoredCart(storedValue)
}

export function cartReducer(state, action) {
  switch (action.type) {
    case 'add': {
      const [line] = sanitizeCartLines([{ ...action.line, quantity: 1 }])

      if (!line) {
        return state
      }

      const lineKey = makeCartLineKey(line)
      const existingLine = state.lines.find(
        (item) => makeCartLineKey(item) === lineKey,
      )

      if (existingLine) {
        return {
          ...state,
          lines: state.lines.map((item) =>
            makeCartLineKey(item) === lineKey
              ? { ...item, quantity: item.quantity + 1 }
              : item,
          ),
        }
      }

      return { ...state, lines: [...state.lines, line] }
    }

    case 'increment':
      return {
        ...state,
        lines: state.lines.map((line) =>
          makeCartLineKey(line) === action.key
            ? { ...line, quantity: line.quantity + 1 }
            : line,
        ),
      }

    case 'decrement':
      return {
        ...state,
        lines: state.lines.map((line) =>
          makeCartLineKey(line) === action.key
            ? { ...line, quantity: Math.max(1, line.quantity - 1) }
            : line,
        ),
      }

    case 'remove':
      return {
        ...state,
        lines: state.lines.filter(
          (line) => makeCartLineKey(line) !== action.key,
        ),
      }

    case 'applyPromo': {
      const promoCode = normalizePromoCode(action.promoCode)

      return isValidPromoCode(promoCode) ? { ...state, promoCode } : state
    }

    case 'clearPromo':
      return { ...state, promoCode: null }

    default:
      return state
  }
}
