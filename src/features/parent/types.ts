export interface ParentDashboard {
  children: ParentChildSummary[]
  familyTotalBalance: number
}

export interface ParentChildSummary {
  enrollmentId: string
  identityId: string
  firstName: string
  lastName: string
  photoUrl: string | null
  classGroupCode: string
  classGroupName: string
  presenceToday: {
    status: "present" | "absent" | "late" | "unknown"
    entryTime: string | null
  }
  latestGrade: {
    score: number | null
    evaluationTitle: string
    date: string
  } | null
  balance: number
  periodAverage: number | null
  rank: number | null
  totalStudents: number
  cardStatus:
    | "PENDING"
    | "ACTIVE"
    | "LOST"
    | "REPLACED"
    | "REVOKED"
    | "EXPIRED"
    | null
  academicAccess: "LOCKED" | "GRANTED"
  cardAmountDue: number
}
