import { apiClient } from "@/lib/api-client"

import type { CompanionSession } from "./types"

export function fetchCompanionSessionByToken(token: string) {
  return apiClient.get<CompanionSession>(
    `/companion-sessions/token/${encodeURIComponent(token)}`
  )
}

export function bindCompanionSessionToken(token: string) {
  return apiClient.post<CompanionSession>(
    `/companion-sessions/token/${encodeURIComponent(token)}/bind`
  )
}
