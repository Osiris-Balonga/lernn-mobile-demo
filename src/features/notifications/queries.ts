import { queryOptions } from "@tanstack/react-query"

import { apiClient } from "@/lib/api-client"

export type NotificationType = "GRADE" | "PAYMENT" | "PRESENCE" | "SYSTEM"
export interface AppNotification {
  body: string
  createdAt: string
  data: Record<string, unknown> | null
  id: string
  readAt: string | null
  title: string
  type: NotificationType
}

export interface NotificationsPayload {
  data: AppNotification[]
  meta: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
}

export const notificationsQueryOptions = () =>
  queryOptions({
    queryKey: ["notifications", "list"],
    queryFn: () =>
      apiClient.get<NotificationsPayload>("/notifications", {
        params: { page: 1, pageSize: 30 },
      }),
    staleTime: 30_000,
  })

export const unreadNotificationsQueryOptions = () =>
  queryOptions({
    queryKey: ["notifications", "unread-count"],
    queryFn: () =>
      apiClient
        .get<{ data: { count: number } }>("/notifications/unread-count")
        .then((response) => response.data.count),
    staleTime: 30_000,
  })

export function markNotificationAsRead(notificationId: string) {
  return apiClient.patch<{ data: { success: boolean } }>(
    `/notifications/${notificationId}/read`,
    {}
  )
}

export function markAllNotificationsAsRead() {
  return apiClient.post<{ data: { count: number } }>(
    "/notifications/mark-all-read",
    undefined
  )
}
