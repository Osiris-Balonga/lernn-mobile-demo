import assert from "node:assert/strict"
import test from "node:test"

import { parseCardLoginPayload } from "../src/features/auth/card-login-payload.ts"

const opaqueToken = "A".repeat(43)

test("parses the versioned opaque Lernn card QR format", () => {
  assert.deepEqual(
    parseCardLoginPayload(`lernn://card-login?v=1&t=${opaqueToken}`),
    { token: opaqueToken }
  )
})

test("rejects opaque card QRs with a wrong version or invalid token", () => {
  assert.equal(
    parseCardLoginPayload(`lernn://card-login?v=2&t=${opaqueToken}`),
    null
  )
  assert.equal(parseCardLoginPayload("lernn://card-login?v=1&t=CARD-123"), null)
})

test("keeps legacy JSON card QRs working while forwarding only their token", () => {
  const rawPayload = JSON.stringify({
    token: "CARD-7C2A91E4B6D8430FA193B4E850CE2D17",
    identityId: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    schoolId: "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    expiresAt: null,
    hmac: "legacy-signature",
  })

  assert.deepEqual(parseCardLoginPayload(rawPayload), {
    token: "CARD-7C2A91E4B6D8430FA193B4E850CE2D17",
  })
})

test("keeps legacy URL payloads working while forwarding only their token", () => {
  const payload = encodeURIComponent(
    JSON.stringify({
      token: "CARD-7C2A91E4B6D8430FA193B4E850CE2D17",
      identityId: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
      schoolId: "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
      expiresAt: "2027-01-01T00:00:00.000Z",
      hmac: "legacy-signature",
    })
  )

  assert.deepEqual(
    parseCardLoginPayload(`https://example.test/card?payload=${payload}`),
    { token: "CARD-7C2A91E4B6D8430FA193B4E850CE2D17" }
  )
})

test("does not treat public codes or incomplete legacy payloads as a QR login", () => {
  assert.equal(parseCardLoginPayload("NDG01-STU-0002"), null)
  assert.equal(
    parseCardLoginPayload(
      JSON.stringify({ token: "CARD-7C2A91E4B6D8430FA193B4E850CE2D17" })
    ),
    null
  )
})
