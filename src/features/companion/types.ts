export type CompanionActionType =
  | "COURSE_ATTENDANCE_ROUNDS"
  | "DOCUMENT_VERIFY"
  | "GATE_SCANNER"
  | "STUDENT_PHOTO"
  | "STUDENT_PHOTO_BATCH"

export type CompanionSessionMode = "single" | "batch" | "station"

export type CompanionSessionStatus =
  | "ACTIVE"
  | "BOUND"
  | "COMPLETED"
  | "EXPIRED"
  | "REVOKED"

export interface CompanionSession {
  id: string
  action: CompanionActionType
  mode: CompanionSessionMode
  status: CompanionSessionStatus
  schoolId: string | null
  organizationId: string | null
  targetType: string | null
  targetId: string | null
  scope: Record<string, unknown>
  expiresAt: string
  boundUserId: string | null
  boundAt: string | null
  revokedAt: string | null
  completedAt: string | null
  createdAt: string
  updatedAt: string
}

export type CompanionRouteState =
  | "expired"
  | "forbidden"
  | "invalid"
  | "loading"
  | "ready"
  | "unavailable"
  | "unauthenticated"
