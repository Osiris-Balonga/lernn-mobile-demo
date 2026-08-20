export type UserRole =
  | "SUPER_ADMIN"
  | "OWNER"
  | "DIRECTOR"
  | "ADMIN"
  | "TEACHER"
  | "STAFF"
  | "PARENT"
  | "STUDENT"

export interface AuthUser {
  id: string
  email?: string | null
  firstName?: string | null
  lastName?: string | null
  photoUrl?: string | null
  role?: UserRole
  schoolAccess?: Array<{
    schoolId: string
    schoolName: string
    organizationId: string
    organizationName?: string
    role: UserRole
  }>
}

export interface UserProfile {
  id: string
  type: "management" | "personal"
  role: UserRole
  schoolId: string | null
  schoolName: string | null
  organizationId: string | null
  label: string
  icon: string
  photoUrl: string | null
  schoolLogoUrl: string | null
  firstName: string | null
  lastName: string | null
  setupComplete: boolean
  capabilities?: string[]
}

export interface LoginResponse {
  data: AuthUser
  token?: string
  profileCount?: number
  primaryProfile?: "management" | "personal"
}

export type MobileWorkspace = "parent" | "student" | "teacher" | "companion"
