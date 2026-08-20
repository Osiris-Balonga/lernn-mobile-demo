import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"

const pickerSource = readFileSync(
  new URL("../src/demo/demo-account-picker.tsx", import.meta.url),
  "utf8"
)

test("offers every student cycle plus the unified parent account", () => {
  const optionsSource = pickerSource.slice(
    pickerSource.indexOf("const DEMO_ACCOUNT_OPTIONS"),
    pickerSource.indexOf("] as const")
  )
  const accountIds = [...optionsSource.matchAll(/id: "([^"]+)"/g)].map(
    (match) => match[1]
  )

  assert.deepEqual(accountIds, ["clara", "boris", "mireille", "parent-makaya"])
  assert.match(pickerSource, /name: "Clara Makaya"/)
  assert.match(pickerSource, /className: "CE1-A"/)
  assert.match(pickerSource, /cycle: "Primaire"/)
  assert.match(pickerSource, /name: "Boris Mbemba"/)
  assert.match(pickerSource, /className: "5E-A"/)
  assert.match(pickerSource, /cycle: "Collège"/)
  assert.match(pickerSource, /name: "Mireille Nsimba"/)
  assert.match(pickerSource, /className: "TERM-D"/)
  assert.match(pickerSource, /cycle: "Lycée"/)
  assert.match(pickerSource, /name: "Sandrine Makaya"/)
  assert.match(pickerSource, /className: "Clara & Boris"/)
  assert.match(pickerSource, /cycle: "Parent"/)
})

test("keeps the demo picker keyboard and touch accessible", () => {
  assert.match(pickerSource, /aria-labelledby="demo-account-picker-title"/)
  assert.match(pickerSource, /aria-label={`Préremplir le compte de/)
  assert.match(pickerSource, /type="button"/)
  assert.match(pickerSource, /min-h-14/)
  assert.match(pickerSource, /focus-visible:ring-3/)
  assert.match(pickerSource, /alt={`Photo de/)
})

test("does not expose a raw QR secret or production identity", () => {
  assert.doesNotMatch(pickerSource, /lernn:\/\/card-login/i)
  assert.doesNotMatch(pickerSource, /qrToken|qrTokenHash|CARD-[A-Z0-9]+/i)
  assert.doesNotMatch(pickerSource, /schoolId|identityId|organizationId/)
})
