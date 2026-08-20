import assert from "node:assert/strict"
import { access } from "node:fs/promises"
import test from "node:test"

import { demoDatabase } from "../src/demo/fixtures.ts"

const expectedCoefficients = {
  boris: {
    ANG: 4,
    DES: 1,
    ECM: 1,
    EPS: 2,
    FRA: 6,
    HGE: 4,
    MAT: 5,
    MUS: 1,
    PHY: 2,
    SVT: 2,
  },
  mireille: { ANG: 3, EPS: 2, HGE: 3, MAT: 4, PHI: 3, PHY: 5, SVT: 5 },
}

function round1(value) {
  return Math.round(value * 10) / 10
}

function weightedAverage(rows) {
  const points = rows.reduce(
    (sum, row) => sum + row.average * row.coefficient,
    0
  )
  return round1(points / rows.reduce((sum, row) => sum + row.coefficient, 0))
}

test("uses the October-to-June school year and three chronological trimesters", () => {
  for (const student of Object.values(demoDatabase.students)) {
    const year = student.schoolYears[0]
    assert.equal(year.startDate, "2025-10-01")
    assert.equal(year.endDate, "2026-06-30")
    assert.deepEqual(
      year.periods.map(({ startDate, endDate }) => [startDate, endDate]),
      [
        ["2025-10-01", "2025-12-22"],
        ["2026-01-05", "2026-03-23"],
        ["2026-04-06", "2026-06-30"],
      ]
    )
  }
})

test("keeps every score inside the cycle grading scale and recomputes averages", () => {
  for (const student of Object.values(demoDatabase.students)) {
    const periodAverages = []

    for (const periodGrades of Object.values(student.gradesByPeriod)) {
      const child = periodGrades.children[0]
      const max = child.gradingScale.max
      assert.equal(max, student.id === "clara" ? 10 : 20)

      for (const subject of child.subjectAverages) {
        assert.ok(subject.average >= 0 && subject.average <= max)
        assert.ok(subject.min >= 0 && subject.min <= max)
        assert.ok(subject.max >= 0 && subject.max <= max)

        const detail =
          student.subjectGradesByPeriod[
            `${subject.subjectLevelId}:${periodGrades.period.id}`
          ]
        assert.equal(detail.gradingScale.max, max)
        for (const grade of detail.grades) {
          assert.ok(grade.score >= 0 && grade.score <= max)
          assert.ok(grade.classAverage >= 0 && grade.classAverage <= max)
        }
        const gradeAverage = round1(
          detail.grades.reduce(
            (sum, grade) => sum + grade.score * grade.weight,
            0
          ) / detail.grades.reduce((sum, grade) => sum + grade.weight, 0)
        )
        assert.equal(gradeAverage, subject.average)
      }

      const computed = weightedAverage(child.subjectAverages)
      assert.equal(child.periodAverage, computed)
      periodAverages.push(computed)
    }

    const finalReport = student.reportCards.find(({ kind }) => kind === "FINAL")
    assert.equal(
      finalReport.annualAverage,
      round1(periodAverages.reduce((sum, value) => sum + value, 0) / 3)
    )
  }
})

test("uses the official 5e timetable weights and Terminale D coefficients", () => {
  for (const [studentId, expected] of Object.entries(expectedCoefficients)) {
    const firstPeriod = Object.values(
      demoDatabase.students[studentId].gradesByPeriod
    )[0].children[0]
    assert.deepEqual(
      Object.fromEntries(
        firstPeriod.subjectAverages.map(({ subjectCode, coefficient }) => [
          subjectCode,
          coefficient,
        ])
      ),
      expected
    )
  }
})

test("reserves Saturday classes for the examination class", () => {
  for (const student of Object.values(demoDatabase.students)) {
    const days = new Set(
      student.schedule.slots.map(({ dayOfWeek }) => dayOfWeek)
    )
    assert.equal(days.has("SATURDAY"), student.id === "mireille")
    assert.ok(!days.has("SUNDAY"))
  }
})

test("places regular, departmental and composition evaluations in each trimester", () => {
  const expectedMonths = [
    [10, 11, 12],
    [1, 2, 3],
    [4, 5, 6],
  ]

  for (const student of Object.values(demoDatabase.students)) {
    for (const [
      periodIndex,
      period,
    ] of student.schoolYears[0].periods.entries()) {
      const evaluations = student.evaluations.filter(
        ({ periodId }) => periodId === period.id
      )
      assert.equal(evaluations.length, 3)
      assert.match(evaluations[0].title, /^Devoir régulier/)
      assert.match(evaluations[1].title, /^Devoir départemental/)
      assert.match(evaluations[2].title, /^Composition/)
      assert.deepEqual(
        evaluations.map(
          ({ date }) => new Date(`${date}T12:00:00`).getMonth() + 1
        ),
        expectedMonths[periodIndex]
      )
    }
  }
})

test("provides a generated portrait for every teacher", async () => {
  const photoUrls = new Set()
  for (const student of Object.values(demoDatabase.students)) {
    for (const slot of student.schedule.slots) {
      const photoUrl = slot.staffAssignment.identity.photoUrl
      assert.match(photoUrl, /^\/teacher-photos\/[a-z-]+\.jpg$/)
      photoUrls.add(photoUrl)
    }
    for (const item of student.presence.courseAttendance.data) {
      assert.match(item.teacher.photoUrl, /^\/teacher-photos\/[a-z-]+\.jpg$/)
    }
  }

  await Promise.all(
    [...photoUrls].map((photoUrl) =>
      access(new URL(`../public${photoUrl}`, import.meta.url))
    )
  )
})
