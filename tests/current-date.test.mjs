import assert from "node:assert/strict"
import test from "node:test"

import { getMsUntilNextLocalDay } from "../src/hooks/use-current-date.ts"

test("schedules the dashboard date refresh at the next local day", () => {
  const now = new Date(2026, 7, 4, 23, 59, 30)
  assert.equal(getMsUntilNextLocalDay(now), 30_000)
})
