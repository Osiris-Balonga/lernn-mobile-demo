export type GateEventType = "ENTRY" | "EXIT"
export type GateEventFlag =
  | "NORMAL"
  | "LATE"
  | "NO_ENTRY"
  | "DUPLICATE"
  | "AUTO_CLOSED"
export type CourseAttendanceStatus =
  | "ABSENT"
  | "EXCUSED"
  | "LATE"
  | "PENDING"
  | "PRESENT"

export interface PresenceStats {
  present: number
  absent: number
  late: number
  total: number
  exits: number
  presentPercentage: number
  latePercentage: number
}

export interface PresenceHistoryEvent {
  id: string
  type: GateEventType
  flag: GateEventFlag
  createdAt: string
  minutesLate: number | null
  durationMinutes: number | null
  location: string | null
  identityId: string
  schoolId: string
  classGroup: {
    id: string
    code: string
    name: string
  } | null
  person: {
    id: string
    firstName: string
    lastName: string
    photoUrl: string | null
  }
  justification: {
    id: string
    status: string
    reason: string
  } | null
}

export interface PresenceHistoryPayload {
  data: PresenceHistoryEvent[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface CourseAttendanceGateEvent {
  id: string
  type: GateEventType
  flag: GateEventFlag
  minutesLate: number | null
  location: string | null
  createdAt: string
}

export interface StudentCourseAttendanceItem {
  date: string
  attendanceId: string
  sessionId: string
  startTime: string
  endTime: string
  status: CourseAttendanceStatus
  lateMinutes: number | null
  note: string | null
  markedAt: string | null
  submittedAt: string | null
  subject: {
    id: string
    code: string | null
    name: string
    color: string | null
  }
  subjectLevel: {
    id: string
  }
  teacher: {
    id: string
    firstName: string | null
    lastName: string | null
    name: string | null
    photoUrl: string | null
  }
  classGroup: {
    id: string
    code: string
    name: string
  } | null
  gateContext: {
    entry: CourseAttendanceGateEvent | null
    exit: CourseAttendanceGateEvent | null
  }
}

export interface StudentCourseAttendancePayload {
  data: StudentCourseAttendanceItem[]
  byDate: Array<{
    date: string
    items: StudentCourseAttendanceItem[]
  }>
}
