import { queryOptions } from "@tanstack/react-query"

import { apiClient } from "@/lib/api-client"
import type {
  PresenceHistoryPayload,
  StudentCourseAttendancePayload,
} from "@/features/presence/types"

export interface ParentChildPresence {
  child: {
    identityId: string
    firstName: string
    lastName: string
    photoUrl: string | null
    enrollmentId: string | null
    classGroup: { id: string; code: string; name: string } | null
  }
  range: {
    startDate: string
    endDate: string
  }
  stats: {
    attendanceRate: number
    totalDays: number
    presentDays: number
    lateDays: number
    classDays: string[]
  }
  history: PresenceHistoryPayload
  courseAttendance?: StudentCourseAttendancePayload
  plannedAbsences: Array<{
    id: string
    date: string
    reason: "SICK" | "FAMILY" | "OTHER"
    note: string | null
    status: "PENDING" | "ACKNOWLEDGED"
    createdAt: string
  }>
}

export type ReportAbsenceReason = "FAMILY" | "OTHER" | "SICK"
export type ParentPresenceJustificationReason =
  | "FAMILY"
  | "MEDICAL"
  | "OTHER"
  | "TRANSPORT"

export interface ReportAbsenceInput {
  date: string
  note?: string
  reason: ReportAbsenceReason
  studentEnrollmentId: string
}

export interface SubmitParentPresenceJustificationInput {
  note?: string
  reason: ParentPresenceJustificationReason
}

export function reportParentAbsence(
  schoolId: string,
  input: ReportAbsenceInput
) {
  return apiClient.post<{
    data: ParentChildPresence["plannedAbsences"][number]
  }>(`/schools/${schoolId}/dashboards/parent/report-absence`, input)
}

export function submitParentPresenceJustification(
  schoolId: string,
  eventId: string,
  input: SubmitParentPresenceJustificationInput
) {
  return apiClient.post<{
    data: ParentChildPresence["history"]["data"][number]["justification"]
  }>(`/schools/${schoolId}/presence/${eventId}/justify`, input)
}

export const parentChildPresenceQueryOptions = (
  schoolId: string,
  identityId: string,
  startDate?: string,
  endDate?: string
) =>
  queryOptions({
    queryKey: [
      "parent",
      "children",
      identityId,
      "presence",
      schoolId,
      startDate,
      endDate,
    ],
    queryFn: () =>
      apiClient
        .get<{ data: ParentChildPresence }>(
          `/schools/${schoolId}/presence/parent/children/${identityId}`,
          {
            params: {
              startDate,
              endDate,
              page: 1,
              pageSize: 60,
            },
          }
        )
        .then((response) => response.data),
    staleTime: 60_000,
  })
