import { useEffect, useState } from 'react'

function decodeRoutePart(value) {
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}

export function parseHashRoute(hash = window.location.hash) {
  const routeValue = hash.startsWith('#') ? hash.slice(1) : hash
  const [rawPathname = '/', search = ''] = routeValue.split('?')
  const pathname = rawPathname || '/'
  const searchParams = new URLSearchParams(search)

  if (pathname === '/') {
    return { name: 'catalog', pathname, searchParams }
  }

  if (pathname === '/cart') {
    return { name: 'cart', pathname, searchParams }
  }

  const productMatch = pathname.match(/^\/product\/([^/]+)$/)

  if (productMatch) {
    return {
      name: 'product',
      pathname,
      searchParams,
      productId: decodeRoutePart(productMatch[1]),
    }
  }

  return { name: 'notFound', pathname, searchParams }
}

export function createProductHash(productId, { colorId, sizeId } = {}) {
  const searchParams = new URLSearchParams()

  if (colorId) {
    searchParams.set('color', colorId)
  }

  if (sizeId) {
    searchParams.set('size', sizeId)
  }

  const search = searchParams.toString()

  return `#/product/${encodeURIComponent(productId)}${search ? `?${search}` : ''}`
}

export function replaceHash(hash) {
  if (window.location.hash === hash) {
    return
  }

  window.history.replaceState(
    null,
    '',
    `${window.location.pathname}${window.location.search}${hash}`,
  )
}

export function useHashRoute() {
  const [route, setRoute] = useState(() => parseHashRoute())

  useEffect(() => {
    const updateRoute = () => setRoute(parseHashRoute())

    window.addEventListener('hashchange', updateRoute)

    return () => window.removeEventListener('hashchange', updateRoute)
  }, [])

  return route
}
