import { queryOptions } from "@tanstack/react-query"

import { apiClient } from "@/lib/api-client"
import type { PresenceHistoryPayload, PresenceStats } from "./types"

export interface PresenceHistoryOptions {
  page?: number
  pageSize?: number
  startDate?: string
  endDate?: string
  type?: "ENTRY" | "EXIT"
  classGroupId?: string
  identityId?: string
}

export const presenceHistoryQueryOptions = (
  schoolId: string,
  options: PresenceHistoryOptions = {}
) =>
  queryOptions({
    queryKey: ["presence", "history", schoolId, options],
    queryFn: () =>
      apiClient.get<PresenceHistoryPayload>(
        `/schools/${schoolId}/presence/history`,
        {
          params: {
            page: options.page ?? 1,
            pageSize: options.pageSize ?? 20,
            startDate: options.startDate,
            endDate: options.endDate,
            type: options.type,
            classGroupId: options.classGroupId,
            identityId: options.identityId,
          },
        }
      ),
    staleTime: 120_000,
  })

export const identityPresenceStatsQueryOptions = (
  schoolId: string,
  identityId: string,
  startDate?: string,
  endDate?: string
) =>
  queryOptions({
    queryKey: [
      "presence",
      "identity",
      identityId,
      "stats",
      schoolId,
      startDate,
      endDate,
    ],
    queryFn: () =>
      apiClient
        .get<{ data: PresenceStats }>(
          `/schools/${schoolId}/presence/identities/${identityId}/stats`,
          {
            params: { startDate, endDate },
          }
        )
        .then((response) => response.data),
    staleTime: 120_000,
  })
