import type { StudentDashboard } from "./types.ts"

export type StudentScheduleDay =
  | "FRIDAY"
  | "MONDAY"
  | "SATURDAY"
  | "THURSDAY"
  | "TUESDAY"
  | "WEDNESDAY"

export interface StudentScheduleSlot {
  id: string
  dayOfWeek: StudentScheduleDay
  startTime: string
  endTime: string
  classGroup: { id: string; code: string; name: string }
  subjectLevel: {
    id: string
    subject: {
      id: string
      code: string
      name: string
    }
  }
  staffAssignment: {
    id: string
    identity: {
      firstName: string | null
      lastName: string | null
    }
  }
}

export interface StudentSchedule {
  classGroupId: string
  classGroup: { code: string; name: string }
  scheduleStatus: "DRAFT" | "PUBLISHED" | null
  slots: StudentScheduleSlot[]
}

export type ApiStudentDashboard = StudentDashboard
export type ApiStudentSchedule = StudentSchedule

export function normalizeStudentDashboard(
  dashboard: ApiStudentDashboard
): StudentDashboard {
  return dashboard
}

export function normalizeStudentSchedule(
  schedule: ApiStudentSchedule
): StudentSchedule {
  return schedule
}
