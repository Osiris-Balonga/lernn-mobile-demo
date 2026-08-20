export interface TeacherDashboard {
  info: {
    staffAssignmentId: string
    firstName: string | null
    lastName: string | null
    photoUrl: string | null
    schoolYear: { id: string; label: string }
    period: {
      id: string
      code: string
      name: string
      startDate: string
      endDate: string
    }
  }
  summary: {
    classCount: number
    totalStudents: number
    evaluationsToPublish: number
    missingGrades: number
    pendingAppreciations: number
    todayCourseCount: number
  }
  classes: TeacherClassSummary[]
  pendingTasks: TeacherPendingTask[]
  todayCourses: TeacherTodayCourse[]
}

export interface TeacherClassSummary {
  classGroupId: string
  classGroupCode: string
  classGroupName: string
  subjectLevelId: string
  subjectColor?: string | null
  subjectName: string
  enrollmentCount: number
  missingGrades: number
  pendingAppreciations: number
  lastEvaluation: {
    id: string
    title: string
    status: "DRAFT" | "PUBLISHED"
    date: string
    gradeCount: number
    totalStudents: number
  } | null
}

export interface TeacherPendingTask {
  kind: "grades" | "appreciations"
  classGroupId: string
  classGroupCode: string
  classGroupName: string
  subjectLevelId: string
  subjectColor?: string | null
  subjectName: string
  evaluationId: string | null
  label: string
  count: number
  dueDate: string | null
}

export interface TeacherTodayCourse {
  id: string
  dayOfWeek:
    | "MONDAY"
    | "TUESDAY"
    | "WEDNESDAY"
    | "THURSDAY"
    | "FRIDAY"
    | "SATURDAY"
  startTime: string
  endTime: string
  classGroupId: string
  classGroupCode: string
  classGroupName: string
  subjectLevelId: string
  subjectColor?: string | null
  subjectName: string
}

export type TeacherEvaluationStatus = "DRAFT" | "PUBLISHED"
export type TeacherEvaluationType = EvaluationType

export interface TeacherEvaluation {
  id: string
  title: string
  type: TeacherEvaluationType
  date: string
  description: string | null
  weight: number
  status: TeacherEvaluationStatus
  classGroupId: string
  subjectLevelId: string
  periodId: string
  gradeCount: number
  classGroup?: { id: string; code: string | null; name: string } | null
  subjectLevel?: {
    id: string
    subject: {
      color?: string | null
      code: string | null
      id: string
      name: string
    }
  } | null
  period?: { id: string; code: string; name: string } | null
}

export interface TeacherGradeGridStudent {
  enrollmentId: string
  studentNumber: string
  studentName: string
  photoUrl: string | null
  grade: number | null
  status: "absent" | "present"
  comment: string | null
}

export interface TeacherEvaluationGradeGrid {
  evaluationId: string
  evaluationName: string
  subjectName: string
  periodName: string
  date: string
  maxScore: number
  passingGrade: number
  coefficient: number
  status: TeacherEvaluationStatus
  className: string
  totalStudents: number
  gradesEntered: number
  presentCount: number
  absentCount: number
  missingCount: number
  classAverage: number | null
  students: TeacherGradeGridStudent[]
}

export interface TeacherClassGradeGridStudent {
  studentEnrollmentId: string
  studentId: string
  firstName: string
  lastName: string
  photoUrl: string | null
}

export interface TeacherClassGradeGrid {
  classGroupId: string
  subjectLevelId: string
  periodId: string
  students: TeacherClassGradeGridStudent[]
}

export interface TeacherAppreciation {
  id: string
  studentEnrollmentId: string
  studentName: string
  label: string
  comment: string | null
}

export interface TeacherScheduleSlot {
  id: string
  dayOfWeek: TeacherTodayCourse["dayOfWeek"]
  startTime: string
  endTime: string
  classGroup: {
    id: string
    code: string | null
    name: string
  }
  subjectLevel: {
    id: string
    subject: {
      color?: string | null
      id: string
      code: string | null
      name: string
    }
  }
  staffAssignment: {
    id: string
    identity: {
      firstName: string | null
      lastName: string | null
      photoUrl?: string | null
    }
  }
}

export interface TeacherSchedule {
  staffAssignmentId: string
  staffAssignment: {
    identity: { firstName: string | null; lastName: string | null }
  }
  scheduleStatus: "DRAFT" | "PUBLISHED" | null
  slots: TeacherScheduleSlot[]
}

export type CourseAttendanceStatus =
  | "PENDING"
  | "PRESENT"
  | "ABSENT"
  | "LATE"
  | "EXCUSED"

export type CourseAttendanceSessionStatus = "DRAFT" | "SUBMITTED" | "LOCKED"

export interface TeacherCourseAttendanceGateEvent {
  id: string
  type: GateEventType
  flag: GateEventFlag | null
  minutesLate: number | null
  createdAt: string
}

export interface TeacherCourseAttendancePortalContext {
  currentStatus: string | null
  entry: TeacherCourseAttendanceGateEvent | null
  entryStatus: string | null
  exit: TeacherCourseAttendanceGateEvent | null
  exitStatus: string | null
  lastEntryAt: string | null
  lastExitAt: string | null
  lastScanAt: string | null
  lastScanType: GateEventType | null
  source: string
}

export interface TeacherCourseAttendanceCounts {
  absent: number
  excused: number
  late: number
  pending: number
  present: number
  total: number
}

export interface TeacherCourseAttendanceSessionSummary {
  id: string
  classGroupCode: string
  classGroupId: string
  classGroupName: string
  counts: TeacherCourseAttendanceCounts | null
  date: string
  endTime: string
  scheduleSlotId: string | null
  sessionId: string | null
  startTime: string
  status: CourseAttendanceSessionStatus | null
  subjectLevelId: string
  subjectName: string
  submittedAt: string | null
}

export interface TeacherCourseAttendanceStudent {
  attendanceId: string
  enrollmentId: string
  firstName: string
  lastName: string
  lateMinutes: number | null
  identityId: string
  markedAt: string | null
  note: string | null
  photoUrl: string | null
  portalContext: TeacherCourseAttendancePortalContext
  status: CourseAttendanceStatus
  studentName: string
  studentNumber: string | null
}

export interface TeacherCourseAttendanceSessionDetails extends TeacherCourseAttendanceSessionSummary {
  students: TeacherCourseAttendanceStudent[]
}
import type { EvaluationType } from "@/features/evaluations/types"
import type { GateEventFlag, GateEventType } from "@/features/presence/types"
