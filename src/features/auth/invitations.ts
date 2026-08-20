import { apiClient } from "@/lib/api-client"

import type { AuthUser } from "./types"

export interface InvitationData {
  type: "EMAIL" | "LINK"
  email: string | null
  firstName: string | null
  lastName: string | null
  assignedRole: string
  schoolName: string
  organizationName: string
  invitedBy: {
    firstName: string | null
    lastName: string | null
    email: string
    role: string | null
  }
}

export interface AcceptInvitationInput {
  email?: string
  firstName: string
  lastName: string
  password: string
}

export function validateInvitation(token: string) {
  return apiClient
    .get<{
      data: InvitationData
    }>(`/invitations/${encodeURIComponent(token)}/validate`)
    .then((response) => response.data)
}

export function acceptInvitation(token: string, input: AcceptInvitationInput) {
  const path =
    input.email === undefined
      ? `/invitations/${encodeURIComponent(token)}/accept`
      : `/invitations/${encodeURIComponent(token)}/accept-link`

  return apiClient
    .post<{ data: AuthUser }>(path, input)
    .then((response) => response.data)
}
