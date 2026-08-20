import assert from "node:assert/strict"
import test from "node:test"

import { normalizeParentChildrenGrades } from "../src/features/parent/report-card-utils.ts"

const period = {
  id: "period-1",
  code: "T1",
  name: "Trimestre 1",
  type: "TRIMESTER",
  sequence: 1,
  startDate: "2026-01-01",
  endDate: "2026-03-31",
  status: "ACTIVE",
  closedAt: null,
  closedById: null,
  schoolYearId: "year-1",
}

function makeChild(overrides = {}) {
  return {
    identityId: "identity-1",
    firstName: "Jorjia",
    lastName: "Ngoma",
    photoUrl: null,
    classGroup: { id: "class-1", code: "CP-A", name: "CP-A" },
    enrollmentId: "enrollment-1",
    periodAverage: 0,
    rank: 13,
    totalStudents: 14,
    classAverage: 8.5,
    gradingScale: { min: 0, max: 20, passingGrade: 10 },
    subjectAverages: [
      {
        subjectLevelId: "subject-1",
        subjectCode: "MATH",
        subjectName: "Mathematiques",
        coefficient: 2,
        average: 0,
        gradeCount: 0,
        min: null,
        max: null,
      },
    ],
    ...overrides,
  }
}

function makePayload(child) {
  return {
    schoolYear: { id: "year-1", label: "2025-2026" },
    period,
    children: [child],
  }
}

test("does not present missing marks as a zero average or a rank", () => {
  const result = normalizeParentChildrenGrades(makePayload(makeChild()))
  const child = result.children[0]

  assert.equal(child.periodAverage, null)
  assert.equal(child.rank, null)
  assert.equal(child.subjectAverages[0].average, null)
})

test("preserves a legitimate zero when a grade was actually entered", () => {
  const result = normalizeParentChildrenGrades(
    makePayload(
      makeChild({
        rank: 14,
        subjectAverages: [
          {
            ...makeChild().subjectAverages[0],
            gradeCount: 1,
          },
        ],
      })
    )
  )
  const child = result.children[0]

  assert.equal(child.periodAverage, 0)
  assert.equal(child.rank, 14)
  assert.equal(child.subjectAverages[0].average, 0)
})
