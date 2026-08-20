const OPAQUE_QR_TOKEN_PATTERN = /^[A-Za-z0-9_-]{43}$/

export async function sha256Hex(value: string): Promise<string> {
  const bytes = new TextEncoder().encode(value)
  const cryptoApi = globalThis.crypto
  if (!cryptoApi?.subtle) {
    throw new Error("Web Crypto is unavailable")
  }

  const digest = await cryptoApi.subtle.digest("SHA-256", bytes)
  return Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, "0")
  ).join("")
}

export function extractStrictCardQrToken(rawValue: string): string | null {
  let url: URL
  try {
    url = new URL(rawValue.trim())
  } catch {
    return null
  }

  if (url.protocol !== "lernn:" || url.hostname !== "card-login") return null

  const versions = url.searchParams.getAll("v")
  const tokens = url.searchParams.getAll("t")
  const keys = [...url.searchParams.keys()]
  if (
    keys.length !== 2 ||
    keys.some((key) => key !== "v" && key !== "t") ||
    versions.length !== 1 ||
    versions[0] !== "1" ||
    tokens.length !== 1
  ) {
    return null
  }

  return OPAQUE_QR_TOKEN_PATTERN.test(tokens[0] ?? "") ? tokens[0]! : null
}

export function normalizePublicCardCode(value: string): string {
  return value.trim().toUpperCase().replace(/\s+/g, "")
}
