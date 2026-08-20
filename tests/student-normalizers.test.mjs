import assert from "node:assert/strict"
import test from "node:test"

import {
  normalizeStudentDashboard,
  normalizeStudentSchedule,
} from "../src/features/student/normalizers.ts"

test("normalizes the canonical dashboard identity fields", () => {
  const result = normalizeStudentDashboard({
    academicAccess: "GRANTED",
    balance: 0,
    cardAmountDue: 0,
    cardStatus: "ACTIVE",
    grades: {
      periodAverage: null,
      rank: null,
      subjectAverages: [],
      totalStudents: 0,
    },
    info: {
      identityId: "identity-1",
      enrollmentId: "enrollment-1",
      firstName: "Jean",
      lastName: "Makaya",
      classGroupId: "group-1",
      classGroupCode: "CP-A",
      classGroupName: "CP-A",
      schoolYearLabel: "2025-2026",
      photoUrl: null,
    },
    presence: { present: 2, absent: 1, late: 0 },
    subjects: [],
  })

  assert.equal(result.info.identityId, "identity-1")
  assert.equal(result.info.enrollmentId, "enrollment-1")
  assert.equal(result.info.classGroupId, "group-1")
  assert.equal(result.info.classGroupCode, "CP-A")
  assert.deepEqual(result.presence, { present: 2, absent: 1, late: 0 })
})

test("keeps the strict dashboard payload unchanged", () => {
  const dashboard = {
    academicAccess: "LOCKED",
    balance: 12500,
    cardAmountDue: 7500,
    cardStatus: "PENDING",
    grades: {
      periodAverage: null,
      rank: null,
      subjectAverages: [],
      totalStudents: 24,
    },
    info: {
      identityId: "identity-2",
      enrollmentId: "enrollment-2",
      firstName: "Aline",
      lastName: "Mabiala",
      photoUrl: null,
      classGroupId: "group-2",
      classGroupCode: "CE1-A",
      classGroupName: "CE1 A",
      schoolYearLabel: "2025-2026",
    },
    presence: { present: 10, absent: 2, late: 1 },
    subjects: [],
  }

  assert.equal(normalizeStudentDashboard(dashboard), dashboard)
})

test("normalizes canonical class group schedule fields", () => {
  const result = normalizeStudentSchedule({
    classGroupId: "group-1",
    classGroup: { code: "CP-A", name: "Cours preparatoire A" },
    scheduleStatus: null,
    slots: [],
  })

  assert.equal(result.classGroupId, "group-1")
  assert.deepEqual(result.classGroup, {
    code: "CP-A",
    name: "Cours preparatoire A",
  })
  assert.deepEqual(result.slots, [])
})
