import { queryOptions } from "@tanstack/react-query"

import { apiClient } from "@/lib/api-client"
import type { ParentChildSummary, ParentDashboard } from "./types"

export type ApiParentChildSummary = Omit<
  ParentChildSummary,
  "enrollmentId" | "identityId"
> & {
  studentEnrollmentId: string
  studentId: string
}

type ApiParentDashboard = Omit<ParentDashboard, "children"> & {
  children: ApiParentChildSummary[]
}

export const parentDashboardQueryOptions = (
  schoolId: string,
  periodId?: string
) =>
  queryOptions({
    queryKey: ["parent", "dashboard", schoolId, periodId ?? "current"],
    queryFn: () =>
      apiClient
        .get<{ data: ApiParentDashboard }>(
          `/schools/${schoolId}/dashboards/parent`,
          {
            params: periodId ? { periodId } : undefined,
          }
        )
        .then((response) => ({
          ...response.data,
          children: response.data.children.map(normalizeParentChild),
        })),
    staleTime: 60_000,
  })

export function normalizeParentChild(
  child: ApiParentChildSummary
): ParentChildSummary {
  const { studentEnrollmentId, studentId, ...summary } = child

  return {
    ...summary,
    enrollmentId: studentEnrollmentId,
    identityId: studentId,
  }
}
