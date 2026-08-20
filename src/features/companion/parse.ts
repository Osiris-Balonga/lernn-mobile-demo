import {
  extractOpaqueCardQrToken,
  isOpaqueCardQrValue,
} from "../../lib/card-qr.ts"

export function extractCompanionToken(rawText: string) {
  const value = rawText.trim()
  if (!value) return null

  try {
    const url = new URL(value)
    const token = extractTokenFromPath(url.pathname)
    if (token) return token
  } catch {
    const token = extractTokenFromPath(value)
    if (token) return token
  }

  if (/^[A-Za-z0-9._~-]{8,}$/.test(value)) return value
  return null
}

function extractTokenFromPath(path: string) {
  const match = path.match(/\/companion\/([^/?#]+)/)
  const token = match?.[1]
  return token ? decodeURIComponent(token) : null
}

export function extractCardToken(rawValue: string) {
  const value = rawValue.trim()
  if (!value) return null

  const opaqueToken = extractOpaqueCardQrToken(value)
  if (opaqueToken) return opaqueToken
  if (isOpaqueCardQrValue(value)) return null

  try {
    const parsed = JSON.parse(value) as Record<string, unknown>
    const candidate = parsed.cardToken ?? parsed.token ?? parsed.code
    if (typeof candidate === "string" && candidate.trim())
      return candidate.trim()
  } catch {
    // Plain codes and URLs remain valid inputs.
  }
  try {
    const url = new URL(value)
    const queryToken =
      url.searchParams.get("token") ?? url.searchParams.get("code")
    if (queryToken) return queryToken
    const segment = url.pathname.split("/").filter(Boolean).at(-1)
    if (segment) return decodeURIComponent(segment)
  } catch {
    // The scanner commonly receives the public serial directly.
  }
  return value.length <= 256 ? value : null
}
