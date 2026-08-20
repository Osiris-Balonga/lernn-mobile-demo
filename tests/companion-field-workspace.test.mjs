import assert from "node:assert/strict"
import { access, readFile } from "node:fs/promises"
import test from "node:test"

import { extractCardToken } from "../src/features/companion/parse.ts"

test("extracts Lernn card tokens from scanner payload variants", () => {
  const opaqueToken = "A".repeat(43)

  assert.equal(
    extractCardToken(`lernn://card-login?v=1&t=${opaqueToken}`),
    opaqueToken
  )
  assert.equal(extractCardToken("NDG01-STU-0001"), "NDG01-STU-0001")
  assert.equal(
    extractCardToken(JSON.stringify({ cardToken: "NDG01-STU-0002" })),
    "NDG01-STU-0002"
  )
  assert.equal(
    extractCardToken("https://lernn.io/cards/NDG01-STU-0001"),
    "NDG01-STU-0001"
  )
})

test("rejects malformed opaque Lernn card QR values", () => {
  assert.equal(
    extractCardToken(`lernn://card-login?v=2&t=${"A".repeat(43)}`),
    null
  )
  assert.equal(extractCardToken("lernn://card-login?v=1&t=CARD-123"), null)
})

test("rejects empty and oversized scanner payloads", () => {
  assert.equal(extractCardToken("  "), null)
  assert.equal(extractCardToken("x".repeat(257)), null)
})

test("allows the employee gate scanner route", async () => {
  const routeSource = await readFile(
    new URL("../src/routes/$locale.app.$section.tsx", import.meta.url),
    "utf8"
  )

  assert.match(routeSource, /"gate-scanner"/)
})

test("exposes real companion actions for gate and course sessions", async () => {
  const workspaceSource = await readFile(
    new URL("../src/features/companion/workspace.tsx", import.meta.url),
    "utf8"
  )

  assert.match(workspaceSource, /session\.action === "GATE_SCANNER"/)
  assert.match(
    workspaceSource,
    /session\.action === "COURSE_ATTENDANCE_ROUNDS"/
  )
  assert.match(workspaceSource, /Ouvrir les appels/)
  assert.doesNotMatch(workspaceSource, /Etats v1 prevus/)
})

test("uses the single canonical companion API response", async () => {
  const [apiSource, typeSource] = await Promise.all([
    readFile(
      new URL("../src/features/companion/api.ts", import.meta.url),
      "utf8"
    ),
    readFile(
      new URL("../src/features/companion/types.ts", import.meta.url),
      "utf8"
    ),
  ])

  assert.match(apiSource, /get<CompanionSession>/)
  assert.match(apiSource, /post<CompanionSession>/)
  assert.doesNotMatch(
    apiSource,
    /unwrapApiResponse|normalizeCompanionSession|unknown>/
  )
  assert.doesNotMatch(typeSource, /UNKNOWN|CLOSED|PENDING/)
  assert.doesNotMatch(
    typeSource,
    /\btitle:|\bdescription:|\bschoolName:|\btoken:/
  )
})

test("does not retain removed PWA or raw scanner error compatibility", async () => {
  const [viteSource, scannerSource] = await Promise.all([
    readFile(new URL("../vite.config.ts", import.meta.url), "utf8"),
    readFile(
      new URL(
        "../src/components/brand/scanner/scanner-camera-viewport.tsx",
        import.meta.url
      ),
      "utf8"
    ),
  ])

  assert.doesNotMatch(
    viteSource,
    /legacyServiceWorker|sw\.js|workbox|vendor-pdf/
  )
  await assert.rejects(
    access(new URL("../nginx.conf.template", import.meta.url))
  )
  assert.doesNotMatch(scannerSource, /markError\(error\.message\)/)
  assert.match(
    scannerSource,
    /markError\(m\.auth_card_login_camera_error\(\)\)/
  )
  assert.match(scannerSource, /height: \{ ideal: 720 \}/)
  assert.match(scannerSource, /width: \{ ideal: 1280 \}/)
  assert.doesNotMatch(scannerSource, /height: \{ min:/)
  assert.doesNotMatch(scannerSource, /width: \{ min:/)
})
