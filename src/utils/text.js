const WINDOWS_1251_HIGH_CHARS =
  'ЂЃ‚ѓ„…†‡€‰Љ‹ЊЌЋЏђ‘’“”•–—\u0098™љ›њќћџ ЎўЈ¤Ґ¦§Ё©Є«¬­®Ї°±Ііґµ¶·ё№є»јЅѕїАБВГДЕЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯабвгдежзийклмнопрстуфхцчшщъыьэюя'

function encodeWindows1251(value) {
  const bytes = []

  for (const character of value) {
    const code = character.charCodeAt(0)

    if (code < 128) {
      bytes.push(code)
      continue
    }

    const index = WINDOWS_1251_HIGH_CHARS.indexOf(character)

    if (index === -1) {
      return null
    }

    bytes.push(index + 128)
  }

  return bytes
}

export function displayText(value) {
  if (typeof value !== 'string' || !/[РС]/.test(value)) {
    return value
  }

  const bytes = encodeWindows1251(value)

  if (!bytes) {
    return value
  }

  try {
    const encoded = bytes
      .map((byte) => `%${byte.toString(16).padStart(2, '0')}`)
      .join('')

    return decodeURIComponent(encoded)
  } catch {
    return value
  }
}
