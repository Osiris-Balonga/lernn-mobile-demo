import { queryOptions } from "@tanstack/react-query"

import { apiClient } from "@/lib/api-client"

export interface MobileAcademicPeriod {
  id: string
  code: string
  name: string
  type: string
  sequence: number
  startDate: string
  endDate: string
  status: string
  closedAt: string | null
  closedById: string | null
  schoolYearId: string
}

export interface MobileSchoolYear {
  id: string
  label: string
  startDate: string
  endDate: string
  isCurrent: boolean
  status: string
  origin: string
  lockedAt: string | null
  schoolId: string
  periods: MobileAcademicPeriod[]
}

export const mobileSchoolYearsQueryOptions = (schoolId: string) =>
  queryOptions({
    queryKey: ["mobile", "school-years", schoolId],
    queryFn: () =>
      apiClient
        .get<{
          data: MobileSchoolYear[]
        }>(`/schools/${schoolId}/school-years/mobile`)
        .then((response) => response.data),
    staleTime: 10 * 60_000,
  })
