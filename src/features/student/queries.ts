import { queryOptions } from "@tanstack/react-query"

import { apiClient } from "@/lib/api-client"
import type { ParentChildPresence } from "@/features/parent/presence"
import type {
  ChildReportCard,
  ParentChildSubjectGrades,
  ParentChildrenGrades,
} from "@/features/parent/report-cards"
import { normalizeParentChildrenGrades } from "@/features/parent/report-card-utils"
import type {
  ParentPaymentsSummary,
  PaymentListItem,
  StudentBalanceDetail,
} from "@/features/parent/payments"
import { getTuitionBalanceTotals } from "@/features/parent/payments"
import {
  normalizeStudentDashboard,
  normalizeStudentSchedule,
} from "./normalizers"
import type { ApiStudentDashboard, ApiStudentSchedule } from "./normalizers"
import type { StudentDashboard } from "./types"

export type {
  StudentSchedule,
  StudentScheduleDay,
  StudentScheduleSlot,
} from "./normalizers"

export const studentDashboardQueryOptions = (
  schoolId: string,
  periodId?: string
) =>
  queryOptions({
    queryKey: ["student", "dashboard", schoolId, periodId ?? "current"],
    queryFn: () =>
      apiClient
        .get<{ data: ApiStudentDashboard }>(
          `/schools/${schoolId}/dashboards/student`,
          {
            params: periodId ? { periodId } : undefined,
          }
        )
        .then((response) => normalizeStudentDashboard(response.data)),
    staleTime: 60_000,
  })

interface ApiPaginatedResponse<T> {
  data: T[]
  meta: {
    total: number
    page: number
    pageSize: number
    totalPages: number
    timestamp: string
  }
}

export const studentChildrenGradesQueryOptions = (
  schoolId: string,
  periodId?: string,
  schoolYearId?: string
) =>
  queryOptions({
    queryKey: [
      "student",
      "grades",
      schoolId,
      periodId ?? "active",
      schoolYearId ?? "current",
    ],
    queryFn: () =>
      apiClient
        .get<{ data: ParentChildrenGrades }>(
          `/schools/${schoolId}/evaluations/student/me`,
          {
            params:
              periodId || schoolYearId
                ? {
                    ...(periodId ? { periodId } : {}),
                    ...(schoolYearId ? { schoolYearId } : {}),
                  }
                : undefined,
          }
        )
        .then((response) => normalizeParentChildrenGrades(response.data)),
    staleTime: 120_000,
  })

export const studentSubjectGradesQueryOptions = (
  schoolId: string,
  subjectLevelId: string,
  periodId: string
) =>
  queryOptions({
    queryKey: ["student", "subjects", subjectLevelId, periodId, schoolId],
    queryFn: () =>
      apiClient
        .get<{
          data: ParentChildSubjectGrades
        }>(
          `/schools/${schoolId}/evaluations/student/me/subjects/${subjectLevelId}`,
          { params: { periodId } }
        )
        .then((response) => response.data),
    staleTime: 120_000,
  })

export const studentReportCardsQueryOptions = (schoolId: string) =>
  queryOptions({
    queryKey: ["student", "report-cards", schoolId],
    queryFn: () =>
      apiClient
        .get<{
          data: ChildReportCard[]
        }>(`/schools/${schoolId}/evaluations/student/me/report-cards`)
        .then((response) => response.data),
    staleTime: 300_000,
  })

export const studentPresenceQueryOptions = (
  schoolId: string,
  startDate?: string,
  endDate?: string
) =>
  queryOptions({
    queryKey: ["student", "presence", schoolId, startDate, endDate],
    queryFn: () =>
      apiClient
        .get<{
          data: ParentChildPresence
        }>(`/schools/${schoolId}/presence/student/me`, {
          params: { startDate, endDate, page: 1, pageSize: 60 },
        })
        .then((response) => response.data),
    staleTime: 60_000,
  })

export const studentScheduleQueryOptions = (
  schoolId: string,
  classGroupId: string | undefined,
  studentEnrollmentId?: string
) =>
  queryOptions({
    queryKey: [
      "student",
      "schedule",
      schoolId,
      classGroupId ?? "none",
      studentEnrollmentId ?? "self",
    ],
    queryFn: () =>
      apiClient
        .get<{
          data: ApiStudentSchedule
        }>(`/schools/${schoolId}/schedules/class/${classGroupId}`, {
          params: studentEnrollmentId ? { studentEnrollmentId } : undefined,
        })
        .then((response) => normalizeStudentSchedule(response.data)),
    staleTime: 300_000,
  })

export const studentPaymentsSummaryQueryOptions = (
  schoolId: string,
  dashboard: StudentDashboard | undefined,
  schoolYearId?: string
) =>
  queryOptions({
    queryKey: [
      "student",
      "payments",
      schoolId,
      dashboard?.info.enrollmentId,
      schoolYearId ?? "current",
    ],
    queryFn: async () => {
      if (!dashboard) throw new Error("Student dashboard is required")
      const [balance, history] = await Promise.all([
        apiClient
          .get<{
            data: StudentBalanceDetail
          }>(`/schools/${schoolId}/payments/student/balance`, {
            params: schoolYearId ? { schoolYearId } : undefined,
          })
          .then((response) => response.data),
        apiClient
          .get<ApiPaginatedResponse<PaymentListItem>>(
            `/schools/${schoolId}/payments/student/history`,
            {
              params: {
                page: 1,
                pageSize: 50,
                ...(schoolYearId ? { schoolYearId } : {}),
              },
            }
          )
          .catch(() => null),
      ])
      const payments = history?.data ?? []
      const child = {
        academicAccess: dashboard.academicAccess,
        enrollmentId: dashboard.info.enrollmentId,
        identityId: dashboard.info.identityId,
        firstName: dashboard.info.firstName,
        lastName: dashboard.info.lastName,
        photoUrl: dashboard.info.photoUrl,
        classGroupCode: dashboard.info.classGroupCode,
        classGroupName: dashboard.info.classGroupName,
        presenceToday: { entryTime: null, status: "absent" as const },
        latestGrade: null,
        balance: balance.balance,
        periodAverage: dashboard.grades.periodAverage,
        rank: dashboard.grades.rank,
        totalStudents: dashboard.grades.totalStudents,
        cardAmountDue: dashboard.cardAmountDue,
        cardStatus: dashboard.cardStatus,
      }
      const tuitionTotals = getTuitionBalanceTotals(balance)
      return {
        children: [
          {
            child,
            balance,
            payments,
            paymentHistoryAvailable: Boolean(history),
            ...tuitionTotals,
          },
        ],
        totalFees: balance.totalFees,
        totalPaid: balance.totalPaid,
        totalBalance: balance.balance,
        ...tuitionTotals,
        payments,
        paymentHistoryAvailable: Boolean(history),
      } satisfies ParentPaymentsSummary
    },
    staleTime: 60_000,
  })
