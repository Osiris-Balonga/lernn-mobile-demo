import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"

const appSource = readFileSync(
  new URL("../src/App.tsx", import.meta.url),
  "utf8"
)

test("keeps the notification detail above sticky workspace headers", () => {
  assert.match(
    appSource,
    /mobile-device-shell fixed inset-0 z-\[60\] mx-auto flex flex-col bg-background/
  )
})
