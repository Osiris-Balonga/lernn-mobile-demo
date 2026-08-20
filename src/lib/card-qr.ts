const OPAQUE_CARD_TOKEN = /^[A-Za-z0-9_-]{43}$/

export function extractOpaqueCardQrToken(rawValue: string) {
  const url = parseUrl(rawValue.trim())
  if (!isOpaqueCardQrUrl(url)) return null

  const versions = url.searchParams.getAll("v")
  const tokens = url.searchParams.getAll("t")
  if (versions.length !== 1 || tokens.length !== 1 || versions[0] !== "1") {
    return null
  }

  const token = tokens[0]
  return OPAQUE_CARD_TOKEN.test(token) ? token : null
}

export function isOpaqueCardQrValue(rawValue: string) {
  return isOpaqueCardQrUrl(parseUrl(rawValue.trim()))
}

function parseUrl(value: string) {
  try {
    return new URL(value)
  } catch {
    return null
  }
}

function isOpaqueCardQrUrl(url: URL | null): url is URL {
  return url?.protocol === "lernn:" && url.hostname === "card-login"
}
