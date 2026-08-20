interface SubjectColor {
  bg: string
  fg: string
  text: string
  border: string
}

const PALETTE: SubjectColor[] = [
  { bg: "#E1F1FF", fg: "#003E73", text: "#006DC6", border: "#006DC6" },
  { bg: "#E3FCF7", fg: "#003D2C", text: "#00684A", border: "#00684A" },
  { bg: "#FEF5E8", fg: "#7A410D", text: "#C76C17", border: "#C76C17" },
  { bg: "#F1EBFF", fg: "#3D2470", text: "#6C40BF", border: "#6C40BF" },
  { bg: "#FCEEE8", fg: "#7A2A12", text: "#CF4A22", border: "#CF4A22" },
  { bg: "#F0F2F1", fg: "#3A464D", text: "#5C6C75", border: "#5C6C75" },
  { bg: "#E0F4FD", fg: "#064E63", text: "#0E7490", border: "#0E7490" },
  { bg: "#FFF4E6", fg: "#6B3206", text: "#B45309", border: "#B45309" },
  { bg: "#EDE9FE", fg: "#28207A", text: "#4338CA", border: "#4338CA" },
  { bg: "#FAE8F5", fg: "#611068", text: "#A21CAF", border: "#A21CAF" },
  { bg: "#ECFCCB", fg: "#2E4A09", text: "#4D7C0F", border: "#4D7C0F" },
  { bg: "#FFE4E6", fg: "#720B24", text: "#BE123C", border: "#BE123C" },
]

function hashCode(value: string): number {
  let hash = 0x811c9dc5

  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i)
    hash = Math.imul(hash, 0x01000193)
  }

  return Math.abs(hash | 0)
}

const cache = new Map<string, SubjectColor>()

function normalizeHexColor(value?: string | null) {
  if (!value) return null
  const color = value.trim()
  return /^#[0-9A-Fa-f]{6}$/.test(color) ? color.toUpperCase() : null
}

function colorWithAlpha(color: string, alpha: string) {
  return `${color}${alpha}`
}

export function getSubjectColor(
  subjectKey: string,
  apiColor?: string | null
): SubjectColor {
  const normalizedApiColor = normalizeHexColor(apiColor)

  if (normalizedApiColor) {
    return {
      bg: colorWithAlpha(normalizedApiColor, "1A"),
      border: normalizedApiColor,
      fg: normalizedApiColor,
      text: normalizedApiColor,
    }
  }

  const key = subjectKey.trim().toUpperCase()
  const cached = cache.get(key)

  if (cached) return cached

  const color = PALETTE[hashCode(key) % PALETTE.length] ?? PALETTE[0]!
  cache.set(key, color)
  return color
}
