export interface StudentDashboard {
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
  info: {
    identityId: string
    enrollmentId: string
    firstName: string
    lastName: string
    photoUrl: string | null
    classGroupId: string
    classGroupCode: string
    classGroupName: string
    schoolYearLabel: string
  }
  grades: {
    periodAverage: number | null
    rank: number | null
    totalStudents: number
    subjectAverages: Array<{
      subjectCode: string
      subjectColor?: string | null
      subjectName: string
      average: number | null
    }>
  }
  subjects: Array<{
    subjectCode: string
    subjectColor?: string | null
    subjectName: string
    teacherName: string | null
  }>
  presence: {
    present: number
    absent: number
    late: number
  }
  balance: number
}
