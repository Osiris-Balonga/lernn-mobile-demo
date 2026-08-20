import type {
  TeacherCourseAttendanceSessionSummary,
  TeacherSchedule,
  TeacherScheduleSlot,
} from "./types"

type ApiTeacherScheduleSlot = {
  classGroup: {
    code: string
    id: string
    name: string
  }
  dayOfWeek: TeacherScheduleSlot["dayOfWeek"]
  endTime: string
  id: string
  startTime: string
  subjectLevel: {
    id: string
    subject: {
      code: string
      id: string
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

export type ApiTeacherSchedule = {
  scheduleStatus: TeacherSchedule["scheduleStatus"]
  slots: ApiTeacherScheduleSlot[]
  staffAssignment: TeacherSchedule["staffAssignment"]
  staffAssignmentId: string
}

export function normalizeTeacherSchedule(
  schedule: ApiTeacherSchedule
): TeacherSchedule {
  return {
    ...schedule,
    slots: schedule.slots,
  }
}

export function resolveCourseAttendanceSessionIdentity(session: {
  scheduleSlotId?: string | null
  sessionId: string | null
}): Pick<
  TeacherCourseAttendanceSessionSummary,
  "id" | "scheduleSlotId" | "sessionId"
> {
  const scheduleSlotId = session.scheduleSlotId ?? null
  const id = session.sessionId ?? scheduleSlotId

  if (!id) {
    throw new Error("COURSE_ATTENDANCE_SESSION_ID_REQUIRED")
  }

  return {
    id,
    scheduleSlotId,
    sessionId: session.sessionId,
  }
}
