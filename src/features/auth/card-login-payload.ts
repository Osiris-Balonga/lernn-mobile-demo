import type { CardLoginInput } from "./api"
import { extractOpaqueCardQrToken } from "../../lib/card-qr.ts"

/**
 * Converts the content of a student-card QR code into the only value the
 * authentication API needs. New QR codes are intentionally opaque; legacy
 * signed payloads remain readable during the card replacement period.
 */
export function parseCardLoginPayload(rawText: string): CardLoginInput | null {
  const value = rawText.trim()
  if (!value) return null

  return parseOpaqueCardUrl(value) ?? parseLegacyCardPayload(value)
}

function parseOpaqueCardUrl(value: string): CardLoginInput | null {
  const token = extractOpaqueCardQrToken(value)
  return token ? { token } : null
}

function parseLegacyCardPayload(value: string): CardLoginInput | null {
  const jsonPayload = parseJson(value)
  const directPayload = isLegacyPayload(jsonPayload)
    ? jsonPayload
    : parseLegacyPayloadFromUrl(value)

  return directPayload ? { token: directPayload.token.trim() } : null
}

function parseLegacyPayloadFromUrl(value: string): LegacyCardPayload | null {
  let url: URL
  try {
    url = new URL(value)
  } catch {
    return null
  }

  const encodedPayload =
    url.searchParams.get("payload") ?? url.searchParams.get("data")
  if (encodedPayload) {
    const payload = parseJson(encodedPayload)
    return isLegacyPayload(payload) ? payload : null
  }

  const payload = {
    token: url.searchParams.get("token"),
    identityId: url.searchParams.get("identityId"),
    schoolId: url.searchParams.get("schoolId"),
    expiresAt: url.searchParams.get("expiresAt"),
    hmac: url.searchParams.get("hmac"),
  }
  return isLegacyPayload(payload) ? payload : null
}

function parseJson(value: string): unknown | null {
  try {
    return JSON.parse(value)
  } catch {
    return null
  }
}

type LegacyCardPayload = {
  token: string
  identityId: string
  schoolId: string
  expiresAt: string | null
  hmac: string
}

function isLegacyPayload(value: unknown): value is LegacyCardPayload {
  if (!value || typeof value !== "object") return false

  const payload = value as Record<string, unknown>
  return (
    isLegacyToken(payload.token) &&
    typeof payload.identityId === "string" &&
    Boolean(payload.identityId.trim()) &&
    typeof payload.schoolId === "string" &&
    Boolean(payload.schoolId.trim()) &&
    typeof payload.hmac === "string" &&
    Boolean(payload.hmac.trim()) &&
    (payload.expiresAt === null || typeof payload.expiresAt === "string")
  )
}

function isLegacyToken(value: unknown): value is string {
  return (
    typeof value === "string" &&
    Boolean(value.trim()) &&
    value.trim().length <= 256
  )
}
