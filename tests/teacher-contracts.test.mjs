import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import test from "node:test"

import { buildChangedTeacherGrades } from "../src/features/teacher/grade-entry.ts"
import { buildChangedTeacherAppreciations } from "../src/features/teacher/appreciations.ts"
import {
  normalizeTeacherSchedule,
  resolveCourseAttendanceSessionIdentity,
} from "../src/features/teacher/normalizers.ts"

test("normalizes the canonical API schedule contract for the teacher workspace", () => {
  const schedule = normalizeTeacherSchedule({
    staffAssignmentId: "staff-assignment-1",
    staffAssignment: {
      id: "staff-assignment-1",
      identity: { firstName: "Cedric", lastName: "Mbemba" },
    },
    scheduleStatus: "PUBLISHED",
    slots: [
      {
        id: "slot-1",
        dayOfWeek: "MONDAY",
        startTime: "07:30",
        endTime: "08:25",
        classGroup: {
          id: "group-1",
          code: "CP-A",
          name: "Cours preparatoire A",
        },
        subjectLevel: {
          id: "subject-level-1",
          subject: { id: "subject-1", code: "MATH", name: "Mathematiques" },
        },
        staffAssignment: {
          id: "staff-assignment-1",
          identity: { firstName: "Cedric", lastName: "Mbemba" },
        },
      },
    ],
  })

  assert.equal(schedule.slots[0].classGroup.id, "group-1")
  assert.equal(schedule.slots[0].classGroup.name, "Cours preparatoire A")
  assert.equal(schedule.slots[0].subjectLevel.subject.name, "Mathematiques")
  assert.equal(schedule.staffAssignmentId, "staff-assignment-1")
  assert.equal(schedule.slots[0].staffAssignment.id, "staff-assignment-1")
  assert.equal("teacherId" in schedule, false)
  assert.equal("teacher" in schedule, false)
  assert.equal("teacherId" in schedule.slots[0], false)
  assert.equal("teacher" in schedule.slots[0], false)
})

test("uses only canonical API evaluation types", async () => {
  const [typesSource, queriesSource, appSource] = await Promise.all([
    readFile(
      new URL("../src/features/evaluations/types.ts", import.meta.url),
      "utf8"
    ),
    readFile(
      new URL("../src/features/teacher/queries.ts", import.meta.url),
      "utf8"
    ),
    readFile(new URL("../src/App.tsx", import.meta.url), "utf8"),
  ])

  for (const type of ["EXAM", "HOMEWORK", "ORAL", "PROJECT", "QUIZ"]) {
    assert.match(typesSource, new RegExp(`"${type}"`))
  }

  for (const legacyType of [
    "COMMON_ASSESSMENT",
    "FINAL_EXAM",
    "HOME_ASSIGNMENT",
    "IN_CLASS_ASSESSMENT",
  ]) {
    assert.doesNotMatch(queriesSource, new RegExp(legacyType))
    assert.doesNotMatch(appSource, new RegExp(legacyType))
  }

  assert.doesNotMatch(
    queriesSource,
    /toApiEvaluationType|fromApiEvaluationType/
  )
})

test("keeps a planned slot session id null so the app opens it through the API", () => {
  assert.deepEqual(
    resolveCourseAttendanceSessionIdentity({
      id: "slot-1",
      scheduleSlotId: "slot-1",
      sessionId: null,
    }),
    {
      id: "slot-1",
      scheduleSlotId: "slot-1",
      sessionId: null,
    }
  )
})

test("rejects a course attendance session without a canonical identifier", () => {
  assert.throws(
    () =>
      resolveCourseAttendanceSessionIdentity({
        scheduleSlotId: null,
        sessionId: null,
      }),
    /COURSE_ATTENDANCE_SESSION_ID_REQUIRED/
  )
})

test("sends only changed, entered grades so partial drafts can be saved", () => {
  const students = [
    { enrollmentId: "enrollment-1", grade: null, status: "present" },
    { enrollmentId: "enrollment-2", grade: 8, status: "present" },
    { enrollmentId: "enrollment-3", grade: null, status: "present" },
  ]

  assert.deepEqual(
    buildChangedTeacherGrades(students, {
      "enrollment-1": "9",
      "enrollment-2": "8",
      "enrollment-3": "",
    }),
    [{ absent: false, enrollmentId: "enrollment-1", score: 9 }]
  )
})

test("sends only non-empty appreciation changes", () => {
  const existing = new Map([
    [
      "enrollment-1",
      {
        id: "appreciation-1",
        studentEnrollmentId: "enrollment-1",
        studentName: "Alice Durand",
        label: "Bien",
        comment: "Continue.",
      },
    ],
  ])

  assert.deepEqual(
    buildChangedTeacherAppreciations({
      drafts: {
        "enrollment-1": { label: "Bien", comment: "Continue." },
        "enrollment-2": { label: " Tres bien ", comment: " Bravo. " },
        "enrollment-3": { label: "", comment: "Sans label" },
      },
      existing,
      periodId: "period-1",
      students: [
        { studentEnrollmentId: "enrollment-1" },
        { studentEnrollmentId: "enrollment-2" },
        { studentEnrollmentId: "enrollment-3" },
      ],
      subjectLevelId: "subject-level-1",
    }),
    [
      {
        comment: "Bravo.",
        label: "Tres bien",
        periodId: "period-1",
        studentEnrollmentId: "enrollment-2",
        subjectLevelId: "subject-level-1",
      },
    ]
  )
})
