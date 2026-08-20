import { queryOptions } from "@tanstack/react-query"

import { apiClient } from "@/lib/api-client"
import type { PaginatedResponse } from "@/lib/api-client"
import type {
  CourseAttendanceStatus,
  CourseAttendanceSessionStatus,
  TeacherCourseAttendanceCounts,
  TeacherDashboard,
  TeacherAppreciation,
  TeacherClassGradeGrid,
  TeacherCourseAttendanceSessionDetails,
  TeacherCourseAttendanceSessionSummary,
  TeacherCourseAttendanceStudent,
  TeacherEvaluation,
  TeacherEvaluationGradeGrid,
  TeacherEvaluationStatus,
  TeacherEvaluationType,
} from "./types"
import {
  normalizeTeacherSchedule,
  resolveCourseAttendanceSessionIdentity,
} from "./normalizers"
import type { ApiTeacherSchedule } from "./normalizers"

export const teacherDashboardQueryOptions = (
  schoolId: string,
  periodId?: string
) =>
  queryOptions({
    queryKey: ["teacher", "dashboard", schoolId, periodId ?? "current"],
    queryFn: () =>
      apiClient
        .get<{ data: TeacherDashboard }>(
          `/schools/${schoolId}/dashboards/teacher`,
          {
            params: periodId ? { periodId } : undefined,
          }
        )
        .then((response) => response.data),
    staleTime: 60_000,
  })

export type TeacherEvaluationsFilters = {
  classGroupId?: string
  page?: number
  pageSize?: number
  periodId?: string
  status?: TeacherEvaluationStatus
  subjectLevelId?: string
  type?: TeacherEvaluationType
}

type ApiTeacherEvaluation = Omit<
  TeacherEvaluation,
  "classGroupId" | "periodId"
> & {
  classGroupId: string
  periodId: string
}

export const teacherEvaluationsQueryOptions = (
  schoolId: string,
  filters: TeacherEvaluationsFilters = {}
) =>
  queryOptions({
    queryKey: ["teacher", "evaluations", schoolId, filters],
    queryFn: () =>
      apiClient
        .get<PaginatedResponse<ApiTeacherEvaluation>>(
          `/schools/${schoolId}/evaluations`,
          {
            params: {
              page: filters.page ?? 1,
              pageSize: filters.pageSize ?? 100,
              ...(filters.classGroupId
                ? { classGroupId: filters.classGroupId }
                : {}),
              ...(filters.subjectLevelId
                ? { subjectLevelId: filters.subjectLevelId }
                : {}),
              ...(filters.periodId ? { periodId: filters.periodId } : {}),
              ...(filters.status ? { status: filters.status } : {}),
              ...(filters.type ? { type: filters.type } : {}),
            },
          }
        )
        .then((response) => response.data),
    staleTime: 60_000,
  })

export const teacherEvaluationGradeGridQueryOptions = (
  schoolId: string,
  evaluationId: string
) =>
  queryOptions({
    queryKey: ["teacher", "evaluation-grade-grid", schoolId, evaluationId],
    queryFn: () =>
      apiClient
        .get<{
          data: TeacherEvaluationGradeGrid
        }>(`/schools/${schoolId}/evaluations/${evaluationId}/grade-grid`)
        .then((response) => response.data),
    staleTime: 30_000,
  })

export const teacherScheduleQueryOptions = (schoolId: string) =>
  queryOptions({
    queryKey: ["teacher", "schedule", schoolId],
    queryFn: () =>
      apiClient
        .get<{
          data: ApiTeacherSchedule
        }>(`/schools/${schoolId}/schedules/staff-assignment`)
        .then((response) => normalizeTeacherSchedule(response.data)),
    staleTime: 300_000,
  })

export const teacherCourseAttendanceSessionsQueryOptions = (
  schoolId: string,
  date: string
) =>
  queryOptions({
    queryKey: ["teacher", "course-attendance", "sessions", schoolId, date],
    queryFn: () =>
      apiClient
        .get<CourseAttendanceSessionsResponse>(
          `/schools/${schoolId}/course-attendance/sessions`,
          {
            params: { date },
          }
        )
        .then((response) => mapCourseAttendanceSessions(response.data.items)),
    staleTime: 30_000,
  })

export const teacherCourseAttendanceSessionQueryOptions = (
  schoolId: string,
  sessionId: string
) =>
  queryOptions({
    queryKey: ["teacher", "course-attendance", "session", schoolId, sessionId],
    queryFn: () =>
      apiClient
        .get<CourseAttendanceSessionDetailResponse>(
          `/schools/${schoolId}/course-attendance/sessions/${sessionId}`
        )
        .then((response) => mapCourseAttendanceSessionDetail(response.data)),
    staleTime: 15_000,
  })

export type TeacherOpenCourseAttendanceSessionInput = {
  classGroupId?: string | null
  date: string
  endTime?: string | null
  scheduleSlotId?: string | null
  startTime?: string | null
  subjectLevelId?: string | null
}

export async function openTeacherCourseAttendanceSession(
  schoolId: string,
  input: TeacherOpenCourseAttendanceSessionInput
) {
  return apiClient
    .post<CourseAttendanceSessionDetailResponse>(
      `/schools/${schoolId}/course-attendance/sessions/open`,
      input
    )
    .then((response) => mapCourseAttendanceSessionDetail(response.data))
}

export type TeacherPatchCourseAttendanceInput = {
  attendances: Array<{
    attendanceId?: string | null
    enrollmentId: string
    identityId?: string | null
    lateMinutes?: number | null
    note?: string | null
    status: CourseAttendanceStatus
  }>
}

export async function patchTeacherCourseAttendanceAttendances(
  schoolId: string,
  sessionId: string,
  input: TeacherPatchCourseAttendanceInput
) {
  const updates = input.attendances.map((attendance) => {
    const identityId = attendance.identityId ?? null
    if (!identityId) {
      throw new Error("Missing identityId for course attendance update")
    }

    return {
      identityId,
      lateMinutes:
        attendance.status === "LATE" ? (attendance.lateMinutes ?? null) : null,
      note: attendance.note ?? null,
      status: attendance.status,
    }
  })

  return apiClient
    .patch<CourseAttendanceSessionDetailResponse>(
      `/schools/${schoolId}/course-attendance/sessions/${sessionId}/attendances`,
      {
        updates,
      }
    )
    .then((response) => mapCourseAttendanceSessionDetail(response.data))
}

export const teacherClassGradeGridQueryOptions = (
  schoolId: string,
  classGroupId: string,
  subjectLevelId: string,
  periodId: string
) =>
  queryOptions({
    queryKey: [
      "teacher",
      "class-grade-grid",
      schoolId,
      classGroupId,
      subjectLevelId,
      periodId,
    ],
    queryFn: () =>
      apiClient
        .get<{ data: TeacherClassGradeGrid }>(
          `/schools/${schoolId}/evaluations/grade-grid`,
          {
            params: {
              classGroupId,
              subjectLevelId,
              periodId,
            },
          }
        )
        .then((response) => response.data),
    staleTime: 30_000,
  })

export const teacherAppreciationsQueryOptions = (
  schoolId: string,
  classGroupId: string,
  subjectLevelId: string,
  periodId: string
) =>
  queryOptions({
    queryKey: [
      "teacher",
      "appreciations",
      schoolId,
      classGroupId,
      subjectLevelId,
      periodId,
    ],
    queryFn: () =>
      apiClient
        .get<{ data: TeacherAppreciation[] }>(
          `/schools/${schoolId}/evaluations/appreciations`,
          {
            params: {
              classGroupId,
              subjectLevelId,
              periodId,
            },
          }
        )
        .then((response) => response.data),
    staleTime: 30_000,
  })

export async function submitTeacherCourseAttendanceSession(
  schoolId: string,
  sessionId: string
) {
  return apiClient
    .post<CourseAttendanceSessionDetailResponse>(
      `/schools/${schoolId}/course-attendance/sessions/${sessionId}/submit`,
      {}
    )
    .then((response) => mapCourseAttendanceSessionDetail(response.data))
}

export type TeacherCreateEvaluationInput = {
  classGroupId: string
  date: string
  description?: string
  periodId?: string
  status?: TeacherEvaluationStatus
  subjectLevelId: string
  title: string
  type: TeacherEvaluationType
  weight?: number
}

export type TeacherUpdateEvaluationInput = Partial<TeacherCreateEvaluationInput>

export async function createTeacherEvaluation(
  schoolId: string,
  input: TeacherCreateEvaluationInput
) {
  return apiClient
    .post<{
      data: ApiTeacherEvaluation
    }>(`/schools/${schoolId}/evaluations`, toCreateEvaluationPayload(input))
    .then((response) => response.data)
}

export async function updateTeacherEvaluation(
  schoolId: string,
  evaluationId: string,
  input: TeacherUpdateEvaluationInput
) {
  return apiClient
    .put<{
      data: ApiTeacherEvaluation
    }>(
      `/schools/${schoolId}/evaluations/${evaluationId}`,
      toUpdateEvaluationPayload(input)
    )
    .then((response) => response.data)
}

export async function saveTeacherEvaluationGrades(
  schoolId: string,
  evaluationId: string,
  grades: Array<{
    absent?: boolean
    comment?: string
    enrollmentId: string
    score: number | null
  }>
) {
  return apiClient
    .post<{
      data: unknown
    }>(`/schools/${schoolId}/evaluations/${evaluationId}/grades`, {
      grades: grades.map((grade) => ({
        absent: grade.absent,
        comment: grade.comment,
        score: grade.score,
        studentEnrollmentId: grade.enrollmentId,
      })),
    })
    .then((response) => response.data)
}

export async function saveTeacherAppreciations(
  schoolId: string,
  appreciations: Array<{
    comment?: string
    label: string
    periodId: string
    studentEnrollmentId: string
    subjectLevelId: string
  }>
) {
  return apiClient
    .post<{ data: TeacherAppreciation[] }>(
      `/schools/${schoolId}/evaluations/appreciations/batch`,
      {
        appreciations: appreciations.map((appreciation) => ({
          comment: appreciation.comment,
          label: appreciation.label,
          periodId: appreciation.periodId,
          studentEnrollmentId: appreciation.studentEnrollmentId,
          subjectLevelId: appreciation.subjectLevelId,
        })),
      }
    )
    .then((response) => response.data)
}

export async function publishTeacherEvaluation(
  schoolId: string,
  evaluationId: string
) {
  return apiClient
    .patch<{
      data: ApiTeacherEvaluation
    }>(`/schools/${schoolId}/evaluations/${evaluationId}/publish`, undefined)
    .then((response) => response.data)
}

export async function deleteTeacherEvaluation(
  schoolId: string,
  evaluationId: string
) {
  await apiClient.delete<void>(
    `/schools/${schoolId}/evaluations/${evaluationId}`
  )
}

function toCreateEvaluationPayload(input: TeacherCreateEvaluationInput) {
  return {
    date: input.date,
    description: input.description,
    classGroupId: input.classGroupId,
    periodId: input.periodId,
    status: input.status,
    subjectLevelId: input.subjectLevelId,
    title: input.title,
    type: input.type,
    weight: input.weight,
  }
}

function toUpdateEvaluationPayload(input: TeacherUpdateEvaluationInput) {
  return {
    ...(input.date ? { date: input.date } : {}),
    ...(input.description !== undefined
      ? { description: input.description }
      : {}),
    ...(input.title ? { title: input.title } : {}),
    ...(input.type ? { type: input.type } : {}),
    ...(input.weight !== undefined ? { weight: input.weight } : {}),
    ...(input.classGroupId ? { classGroupId: input.classGroupId } : {}),
    ...(input.periodId ? { periodId: input.periodId } : {}),
  }
}

type ApiCourseAttendanceSubjectLevel = {
  id: string
  subject: {
    code: string
    id: string
    name: string
  }
}

type ApiCourseAttendanceClassGroup = {
  code: string
  id: string
  name: string
}

type ApiCourseAttendanceSessionItem = {
  classGroup: ApiCourseAttendanceClassGroup
  counts: TeacherCourseAttendanceCounts | null
  date: string
  endTime: string
  scheduleSlotId: string | null
  sessionId: string | null
  startTime: string
  status: CourseAttendanceSessionStatus | null
  subjectLevel: ApiCourseAttendanceSubjectLevel
  submittedAt: string | null
}

type CourseAttendanceSessionsResponse = {
  data: { date: string; items: ApiCourseAttendanceSessionItem[] }
}

type ApiCourseAttendanceDetail = ApiCourseAttendanceSessionItem & {
  schoolId: string
  schoolYearId: string
  students: ApiCourseAttendanceStudent[]
}

type ApiCourseAttendanceStudent = TeacherCourseAttendanceStudent

type CourseAttendanceSessionDetailResponse = { data: ApiCourseAttendanceDetail }

function mapCourseAttendanceSessions(
  sessions: ApiCourseAttendanceSessionItem[]
): TeacherCourseAttendanceSessionSummary[] {
  return sessions
    .map((session) => mapCourseAttendanceSessionSummary(session))
    .filter((session) => Boolean(session.id))
}

function mapCourseAttendanceSessionDetail(
  session: ApiCourseAttendanceDetail
): TeacherCourseAttendanceSessionDetails {
  const summary = mapCourseAttendanceSessionSummary(session)
  return {
    ...summary,
    students: session.students,
  }
}

function mapCourseAttendanceSessionSummary(
  session: ApiCourseAttendanceSessionItem
): TeacherCourseAttendanceSessionSummary {
  const identity = resolveCourseAttendanceSessionIdentity(session)
  const classGroup = session.classGroup
  const subjectLevel = session.subjectLevel

  return {
    ...identity,
    classGroupCode: classGroup.code,
    classGroupId: classGroup.id,
    classGroupName: classGroup.name,
    counts: session.counts,
    date: session.date,
    endTime: session.endTime,
    startTime: session.startTime,
    status: session.status,
    subjectLevelId: subjectLevel.id,
    subjectName: subjectLevel.subject.name,
    submittedAt: session.submittedAt,
  }
}
