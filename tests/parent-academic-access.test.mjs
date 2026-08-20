import assert from "node:assert/strict"
import test from "node:test"

import { getCanonicalAcademicAccessState } from "../src/features/parent/academic-access.ts"

test("uses the server academic access decision without payment heuristics", () => {
  assert.deepEqual(
    getCanonicalAcademicAccessState({
      academicAccess: "LOCKED",
      cardAmountDue: 7_500,
    }),
    { amount: 7_500, blocked: true, reason: "card" }
  )
})

test("grants access when the server says the card is active", () => {
  assert.deepEqual(
    getCanonicalAcademicAccessState({
      academicAccess: "GRANTED",
      cardAmountDue: 0,
    }),
    { amount: null, blocked: false, reason: null }
  )
})
