import type { AuthUser, UserProfile } from "../features/auth/types"
import type { AppNotification } from "../features/notifications/queries"
import type { ParentPaymentsSummary } from "../features/parent/payments"
import type { ParentChildPresence } from "../features/parent/presence"
import type {
  ChildReportCard,
  ParentChildSubjectGrades,
  ParentChildrenGrades,
} from "../features/parent/report-cards"
import type { MobileSchoolYear } from "../features/school-years"
import type { StudentSchedule } from "../features/student/normalizers"
import type { StudentDashboard } from "../features/student/types"

export type DemoStudentId = "clara" | "boris" | "mireille"

export type DemoAuthMethod = "card-code" | "card-qr" | "password"

export interface DemoSession {
  version: 1
  studentId: DemoStudentId
  authMethod: DemoAuthMethod
  issuedAt: string
  expiresAt: string
}

export interface DemoCardCredential {
  studentId: DemoStudentId
  publicCode: string
  qrTokenHash: string
}

export interface DemoAccount {
  studentId: DemoStudentId
  email: string
  passwordHash: string
}

export interface DemoEvaluation {
  classGroup: { code: string; id: string; name: string }
  date: string
  gradeCount: number
  id: string
  periodId: string | null
  subjectLevel: {
    subject: {
      code: string
      color: string
      id: string
      name: string
    }
  }
  title: string
  type: "EXAM" | "HOMEWORK" | "ORAL" | "PROJECT" | "QUIZ"
}

export interface DemoStudentFixture {
  id: DemoStudentId
  account: DemoAccount
  card: DemoCardCredential
  user: AuthUser
  profile: UserProfile
  schoolYears: MobileSchoolYear[]
  dashboard: StudentDashboard
  gradesByPeriod: Record<string, ParentChildrenGrades>
  subjectGradesByPeriod: Record<string, ParentChildSubjectGrades>
  reportCards: ChildReportCard[]
  schedule: StudentSchedule
  presence: ParentChildPresence
  payments: ParentPaymentsSummary
  evaluations: DemoEvaluation[]
  notifications: AppNotification[]
}

export interface DemoDatabase {
  school: {
    id: string
    code: string
    name: string
    logoUrl: string
    organizationId: string
    organizationName: string
  }
  credentials: DemoCardCredential[]
  accounts: DemoAccount[]
  students: Record<DemoStudentId, DemoStudentFixture>
}

export interface DemoRequest {
  method: "DELETE" | "GET" | "PATCH" | "POST" | "PUT"
  path: string
  body?: unknown
  params?: Record<string, unknown>
}

export class DemoRepositoryError extends Error {
  readonly status: number
  readonly code: string

  constructor(status: number, code: string, message: string) {
    super(message)
    this.name = "DemoRepositoryError"
    this.status = status
    this.code = code
  }
}
