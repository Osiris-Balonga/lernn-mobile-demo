import assert from "node:assert/strict"
import test from "node:test"

import { isLazyChunkLoadError } from "../src/lib/lazy-import.ts"

test("recognizes stale lazy chunks after a deployment", () => {
  assert.equal(
    isLazyChunkLoadError(
      new TypeError("Failed to fetch dynamically imported module")
    ),
    true
  )
  assert.equal(isLazyChunkLoadError(new Error("Loading chunk 42 failed")), true)
})

test("does not reload for application exceptions", () => {
  assert.equal(isLazyChunkLoadError(new Error("Profile is missing")), false)
})
