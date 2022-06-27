export const compareKeys = (a, b) => {
  // Check type of values first (some e.g. sliders are just numbers)
  if (typeof a !== 'object' || typeof b !== 'object') {
    return typeof a === typeof b
  }

  // Compare object properties
  const aKeys = Object.keys(a).sort()
  const bKeys = Object.keys(b).sort()
  const aTypes = aKeys.map((key) => typeof a[key])
  const bTypes = aKeys.map((key) => typeof b[key])
  return (JSON.stringify(aKeys) === JSON.stringify(bKeys)) && (JSON.stringify(aTypes) === JSON.stringify(bTypes))
}

export const map = (value, low1, high1, low2, high2) => low2 + ((high2 - low2) * (value - low1)) / (high1 - low1)

export const lerp = (a, b, t) => a + (b - a) * t

export const precision = (a) => {
  if (!Number.isFinite(a)) return 0
  let e = 1
  let p = 0
  while (Math.round(a * e) / e !== a) {
    e *= 10
    p += 1
  }
  return p
}

export const setAttributes = (element, attributes) => {
  Object.keys(attributes).forEach((attr) => {
    element.setAttribute(attr, attributes[attr])
  })
}
