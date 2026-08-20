import assert from "node:assert/strict"
import test from "node:test"

import { fmtDate, fmtMonthShort, fmtRelativeTime } from "../src/lib/format.ts"

const date = new Date(2026, 7, 4, 12)

test("formats long dates in French", () => {
  assert.equal(fmtDate(date, "long", "fr"), "mardi 4 août 2026")
})

test("formats long dates in English", () => {
  assert.equal(fmtDate(date, "long", "en"), "Tuesday, August 4, 2026")
})

test("formats abbreviated evaluation months in the active locale", () => {
  assert.equal(fmtMonthShort(date, "fr"), "ao\u00fbt")
  assert.equal(fmtMonthShort(date, "en"), "Aug")
})

test("formats compact notification ages in the active locale", () => {
  const now = new Date(2026, 7, 4, 12)
  const twoDaysAgo = new Date(2026, 7, 2, 12)

  assert.equal(fmtRelativeTime(twoDaysAgo, "fr", now), "2 j")
  assert.equal(fmtRelativeTime(twoDaysAgo, "en", now), "2d")
})
