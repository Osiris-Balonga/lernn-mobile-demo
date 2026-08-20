export function isStudentDashboardLoading({
  hasSchool,
  isAcademicYearLoading,
  isDashboardPending,
}: {
  hasSchool: boolean
  isAcademicYearLoading: boolean
  isDashboardPending: boolean
}): boolean {
  return hasSchool && (isAcademicYearLoading || isDashboardPending)
}
