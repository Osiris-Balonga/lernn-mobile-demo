import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import test from "node:test"
import { isStudentDashboardLoading } from "../src/features/student/dashboard-query-state.ts"

test("upcoming evaluations use their dedicated query error state", async () => {
  const source = await readFile(
    new URL("../src/App.tsx", import.meta.url),
    "utf8"
  )

  assert.doesNotMatch(source, /getUpcomingEvaluationsFromDashboard/)
  assert.match(source, /isError=\{upcomingEvaluationsQuery\.isError\}/)
  assert.match(
    source,
    /onRetry=\{\(\) => void upcomingEvaluationsQuery\.refetch\(\)\}/
  )
})

test("keeps the student dashboard in loading state while the academic year resolves", () => {
  assert.equal(
    isStudentDashboardLoading({
      hasSchool: true,
      isAcademicYearLoading: true,
      isDashboardPending: true,
    }),
    true
  )
})

test("keeps a pending dashboard query out of the error branch", () => {
  assert.equal(
    isStudentDashboardLoading({
      hasSchool: true,
      isAcademicYearLoading: false,
      isDashboardPending: true,
    }),
    true
  )
})

test("does not show an endless loader when the profile has no school", () => {
  assert.equal(
    isStudentDashboardLoading({
      hasSchool: false,
      isAcademicYearLoading: false,
      isDashboardPending: true,
    }),
    false
  )
})
