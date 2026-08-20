import type { AppNotification } from "../features/notifications/queries"
import type {
  ParentPaymentsSummary,
  PaymentListItem,
  StudentBalanceDetail,
} from "../features/parent/payments"
import type { ParentChildPresence } from "../features/parent/presence"
import type {
  AcademicPeriod,
  ChildReportCard,
  ParentChildSubjectGrades,
  ParentChildrenGrades,
  ParentReportSubjectAverage,
} from "../features/parent/report-cards"
import type { StudentSchedule } from "../features/student/normalizers"
import type { StudentDashboard } from "../features/student/types"
import type {
  DemoCardCredential,
  DemoDatabase,
  DemoEvaluation,
  DemoStudentFixture,
  DemoStudentId,
} from "./types"

const SCHOOL = {
  id: "demo-school-ndg01",
  code: "NDG01",
  name: "Ecole Notre-Dame de Grace",
  logoUrl: "/school-logos/notre-dame-de-grace.png",
  organizationId: "demo-organization-ndg",
  organizationName: "Notre-Dame de Grace",
} as const

const SCHOOL_YEAR_ID = "demo-school-year-2025-2026"
const PASSWORD_HASH =
  "45c40fa08e9588e9561ea7988dcbc8a412502bb113b470c04cba769efc038947"

type SubjectSeed = {
  code: string
  color: string
  name: string
  teacher: string
  average: number
  coefficient: number
}

type StudentSeed = {
  id: DemoStudentId
  firstName: string
  lastName: string
  email: string
  photoUrl: string
  publicCode: string
  qrTokenHash: string
  enrollmentNumber: string
  classCode: string
  className: string
  cycle: "Primaire" | "Collège" | "Lycée"
  rank: number
  totalStudents: number
  balance: number
  totalFees: number
  totalPaid: number
  presence: { present: number; absent: number; late: number }
  subjects: SubjectSeed[]
}

const STUDENT_SEEDS: StudentSeed[] = [
  {
    id: "clara",
    firstName: "Clara",
    lastName: "Makaya",
    email: "clara.makaya.demo@ndg.lernn.local",
    photoUrl: "/student-photos/girl-01.png",
    publicCode: "NDG01-STU-0013",
    qrTokenHash:
      "cfe4de3392efdfeb0502702ac3b0c2c930eb417770b592592a35e7bb1827a04f",
    enrollmentNumber: "NDG-2025-013",
    classCode: "CE1-A",
    className: "Cours Élémentaire 1 A",
    cycle: "Primaire",
    rank: 3,
    totalStudents: 28,
    balance: 25_000,
    totalFees: 125_000,
    totalPaid: 100_000,
    presence: { present: 52, absent: 2, late: 3 },
    subjects: [
      {
        code: "FRA",
        color: "#00684A",
        name: "Français",
        teacher: "Marie Okemba",
        average: 16.5,
        coefficient: 3,
      },
      {
        code: "MAT",
        color: "#2563EB",
        name: "Mathématiques",
        teacher: "Estelle Ngoma",
        average: 17.2,
        coefficient: 3,
      },
      {
        code: "LEC",
        color: "#7C3AED",
        name: "Lecture",
        teacher: "Marie Okemba",
        average: 15.8,
        coefficient: 2,
      },
      {
        code: "EVE",
        color: "#D97706",
        name: "Éveil",
        teacher: "Alain Boukaka",
        average: 14.9,
        coefficient: 2,
      },
      {
        code: "EPS",
        color: "#DC2626",
        name: "Éducation physique",
        teacher: "Junior Mpassi",
        average: 18,
        coefficient: 1,
      },
    ],
  },
  {
    id: "boris",
    firstName: "Boris",
    lastName: "Mbemba",
    email: "boris.mbemba.demo@ndg.lernn.local",
    photoUrl: "/student-photos/boy-03.png",
    publicCode: "NDG01-STU-0501",
    qrTokenHash:
      "5d0cb5c29c908b156b364bbca3c68a8759b1d02b13e12b767002d4e58e754899",
    enrollmentNumber: "NDG-2025-501",
    classCode: "5E-A",
    className: "Cinquième A",
    cycle: "Collège",
    rank: 6,
    totalStudents: 31,
    balance: 75_000,
    totalFees: 150_000,
    totalPaid: 75_000,
    presence: { present: 48, absent: 4, late: 2 },
    subjects: [
      {
        code: "FRA",
        color: "#00684A",
        name: "Français",
        teacher: "Chantal Nkoua",
        average: 14.5,
        coefficient: 4,
      },
      {
        code: "MAT",
        color: "#2563EB",
        name: "Mathématiques",
        teacher: "Patrick Loufoua",
        average: 15.8,
        coefficient: 4,
      },
      {
        code: "SVT",
        color: "#059669",
        name: "Sciences de la vie et de la Terre",
        teacher: "Esther Mavoungou",
        average: 13.7,
        coefficient: 3,
      },
      {
        code: "HGE",
        color: "#D97706",
        name: "Histoire-Géographie",
        teacher: "Serge Kimbembe",
        average: 14.2,
        coefficient: 3,
      },
      {
        code: "ANG",
        color: "#7C3AED",
        name: "Anglais",
        teacher: "Grace Mayembo",
        average: 16.1,
        coefficient: 2,
      },
    ],
  },
  {
    id: "mireille",
    firstName: "Mireille",
    lastName: "Nsimba",
    email: "mireille.nsimba.demo@ndg.lernn.local",
    photoUrl: "/student-photos/girl-04.png",
    publicCode: "NDG01-STU-1201",
    qrTokenHash:
      "f8fdb43e66ce70db60c91c591485a466455e0b34acbe410126f8fc6911d0085b",
    enrollmentNumber: "NDG-2025-1201",
    classCode: "TERM-D",
    className: "Terminale D",
    cycle: "Lycée",
    rank: 4,
    totalStudents: 27,
    balance: 50_000,
    totalFees: 175_000,
    totalPaid: 125_000,
    presence: { present: 50, absent: 3, late: 1 },
    subjects: [
      {
        code: "PHI",
        color: "#7C3AED",
        name: "Philosophie",
        teacher: "Pauline Kodia",
        average: 15.4,
        coefficient: 4,
      },
      {
        code: "MAT",
        color: "#2563EB",
        name: "Mathématiques",
        teacher: "Lucien Moukoko",
        average: 16.8,
        coefficient: 5,
      },
      {
        code: "PHY",
        color: "#0891B2",
        name: "Physique-Chimie",
        teacher: "Armand Bakala",
        average: 15.9,
        coefficient: 5,
      },
      {
        code: "SVT",
        color: "#059669",
        name: "Sciences de la vie et de la Terre",
        teacher: "Esther Mavoungou",
        average: 14.6,
        coefficient: 4,
      },
      {
        code: "ANG",
        color: "#D97706",
        name: "Anglais",
        teacher: "Grace Mayembo",
        average: 16.2,
        coefficient: 2,
      },
    ],
  },
]

const today = startOfDay(new Date())
const schoolYearStart = shiftDays(today, -240)
const schoolYearEnd = shiftDays(today, 125)
const PERIODS: AcademicPeriod[] = [
  makePeriod(1, schoolYearStart, shiftDays(today, -150), "CLOSED"),
  makePeriod(2, shiftDays(today, -149), shiftDays(today, -60), "CLOSED"),
  makePeriod(3, shiftDays(today, -59), schoolYearEnd, "OPEN"),
]

const STUDENTS = Object.fromEntries(
  STUDENT_SEEDS.map((seed) => [seed.id, makeStudentFixture(seed)])
) as Record<DemoStudentId, DemoStudentFixture>

export const demoDatabase: DemoDatabase = {
  school: SCHOOL,
  credentials: STUDENT_SEEDS.map((seed) => ({
    studentId: seed.id,
    publicCode: seed.publicCode,
    qrTokenHash: seed.qrTokenHash,
  })),
  accounts: STUDENT_SEEDS.map((seed) => ({
    studentId: seed.id,
    email: seed.email,
    passwordHash: PASSWORD_HASH,
  })),
  students: STUDENTS,
}

export const DEMO_PASSWORD = "DemoLernn2026!"

function makeStudentFixture(seed: StudentSeed): DemoStudentFixture {
  const identityId = `demo-identity-${seed.id}`
  const enrollmentId = `demo-enrollment-${seed.id}`
  const classGroupId = `demo-class-${seed.id}`
  const periodAverage = weightedAverage(seed.subjects)
  const card: DemoCardCredential = {
    studentId: seed.id,
    publicCode: seed.publicCode,
    qrTokenHash: seed.qrTokenHash,
  }
  const dashboard: StudentDashboard = {
    cardStatus: "ACTIVE",
    academicAccess: "GRANTED",
    cardAmountDue: 0,
    info: {
      identityId,
      enrollmentId,
      firstName: seed.firstName,
      lastName: seed.lastName,
      photoUrl: seed.photoUrl,
      classGroupId,
      classGroupCode: seed.classCode,
      classGroupName: seed.className,
      schoolYearLabel: "2025-2026",
    },
    grades: {
      periodAverage,
      rank: seed.rank,
      totalStudents: seed.totalStudents,
      subjectAverages: seed.subjects.map((subject) => ({
        subjectCode: subject.code,
        subjectColor: subject.color,
        subjectName: subject.name,
        average: subject.average,
      })),
    },
    subjects: seed.subjects.map((subject) => ({
      subjectCode: subject.code,
      subjectColor: subject.color,
      subjectName: subject.name,
      teacherName: subject.teacher,
    })),
    presence: seed.presence,
    balance: seed.balance,
  }

  const gradesByPeriod: Record<string, ParentChildrenGrades> = {}
  const subjectGradesByPeriod: Record<string, ParentChildSubjectGrades> = {}
  for (const [periodIndex, period] of PERIODS.entries()) {
    const subjectAverages = makeSubjectAverages(seed, periodIndex)
    gradesByPeriod[period.id] = {
      schoolYear: { id: SCHOOL_YEAR_ID, label: "2025-2026" },
      period,
      children: [
        {
          identityId,
          enrollmentId,
          firstName: seed.firstName,
          lastName: seed.lastName,
          photoUrl: seed.photoUrl,
          classGroup: {
            id: classGroupId,
            code: seed.classCode,
            name: seed.className,
          },
          periodAverage: round1(weightedAverageFromRows(subjectAverages)),
          rank: Math.min(
            seed.rank + Math.max(0, 2 - periodIndex),
            seed.totalStudents
          ),
          totalStudents: seed.totalStudents,
          classAverage: 12.8 + periodIndex * 0.2,
          gradingScale: { min: 0, max: 20, passingGrade: 10 },
          subjectAverages,
        },
      ],
    }

    for (const [subjectIndex, subject] of seed.subjects.entries()) {
      const subjectLevelId = subjectId(seed, subject)
      subjectGradesByPeriod[`${subjectLevelId}:${period.id}`] = {
        enrollmentId,
        identityId,
        firstName: seed.firstName,
        lastName: seed.lastName,
        subjectCode: subject.code,
        subjectColor: subject.color,
        subjectName: subject.name,
        coefficient: subject.coefficient,
        teacherName: subject.teacher,
        schoolYear: { id: SCHOOL_YEAR_ID, label: "2025-2026" },
        period,
        gradingScale: { min: 0, max: 20, passingGrade: 10 },
        grades: [
          makeGrade(seed, subject, periodIndex, subjectIndex, 0),
          makeGrade(seed, subject, periodIndex, subjectIndex, 1),
          makeGrade(seed, subject, periodIndex, subjectIndex, 2),
        ],
      }
    }
  }

  const reportCards = makeReportCards(seed, periodAverage)
  const schedule = makeSchedule(seed, classGroupId)
  const presence = makePresence(seed, identityId, enrollmentId, classGroupId)
  const payments = makePayments(seed, dashboard)
  const evaluations = makeEvaluations(seed, classGroupId)

  return {
    id: seed.id,
    account: {
      studentId: seed.id,
      email: seed.email,
      passwordHash: PASSWORD_HASH,
    },
    card,
    user: {
      id: `demo-user-${seed.id}`,
      email: seed.email,
      firstName: seed.firstName,
      lastName: seed.lastName,
      photoUrl: seed.photoUrl,
      role: "STUDENT",
      schoolAccess: [
        {
          schoolId: SCHOOL.id,
          schoolName: SCHOOL.name,
          organizationId: SCHOOL.organizationId,
          organizationName: SCHOOL.organizationName,
          role: "STUDENT",
        },
      ],
    },
    profile: {
      id: `demo-profile-${seed.id}`,
      type: "personal",
      role: "STUDENT",
      schoolId: SCHOOL.id,
      schoolName: SCHOOL.name,
      organizationId: SCHOOL.organizationId,
      label: `${seed.firstName} ${seed.lastName}`,
      icon: "graduation-cap",
      photoUrl: seed.photoUrl,
      schoolLogoUrl: SCHOOL.logoUrl,
      firstName: seed.firstName,
      lastName: seed.lastName,
      setupComplete: true,
      capabilities: ["dashboard.view"],
    },
    schoolYears: [
      {
        id: SCHOOL_YEAR_ID,
        label: "2025-2026",
        startDate: iso(schoolYearStart),
        endDate: iso(schoolYearEnd),
        isCurrent: true,
        status: "ACTIVE",
        origin: "DEMO",
        lockedAt: null,
        schoolId: SCHOOL.id,
        periods: PERIODS,
      },
    ],
    dashboard,
    gradesByPeriod,
    subjectGradesByPeriod,
    reportCards,
    schedule,
    presence,
    payments,
    evaluations,
    notifications: makeNotifications(seed),
  }
}

function makeSubjectAverages(
  seed: StudentSeed,
  periodIndex: number
): ParentReportSubjectAverage[] {
  return seed.subjects.map((subject, subjectIndex) => ({
    subjectLevelId: subjectId(seed, subject),
    subjectCode: subject.code,
    subjectColor: subject.color,
    subjectName: subject.name,
    coefficient: subject.coefficient,
    average: round1(
      subject.average - (2 - periodIndex) * 0.4 + (subjectIndex % 2) * 0.2
    ),
    gradeCount: 3,
    min: 9 + (subjectIndex % 3),
    max: 17 + (subjectIndex % 2),
  }))
}

function makeGrade(
  seed: StudentSeed,
  subject: SubjectSeed,
  periodIndex: number,
  subjectIndex: number,
  gradeIndex: number
) {
  const score = clamp(
    round1(subject.average + (gradeIndex - 1) * 0.8 + periodIndex * 0.15),
    0,
    20
  )
  const date = shiftDays(
    today,
    -70 + periodIndex * 22 + subjectIndex * 2 + gradeIndex * 5
  )
  const types = ["HOMEWORK", "QUIZ", "EXAM"] as const
  return {
    evaluationId: `demo-grade-${seed.id}-${periodIndex}-${subject.code}-${gradeIndex}`,
    title:
      gradeIndex === 2
        ? `Composition de ${subject.name}`
        : `${types[gradeIndex]} ${subject.name}`,
    type: types[gradeIndex],
    date: iso(date),
    weight: gradeIndex === 2 ? 2 : 1,
    score,
    absent: false,
    comment:
      score >= 16 ? "Très bon travail" : score >= 14 ? "Bon travail" : null,
    classAverage: round1(11.8 + subjectIndex * 0.3),
  }
}

function makeReportCards(
  seed: StudentSeed,
  average: number
): ChildReportCard[] {
  const periodCards = PERIODS.map((period, index) => ({
    id: `demo-report-${seed.id}-${period.code}`,
    code: `BUL-${seed.publicCode}-${period.code}`,
    kind: "PERIOD" as const,
    schoolYearId: SCHOOL_YEAR_ID,
    periodId: period.id,
    periodCode: period.code,
    periodName: period.name,
    periodAverage: round1(average - (2 - index) * 0.45),
    annualAverage: null,
    classAverage: round1(12.7 + index * 0.2),
    rank: Math.min(seed.rank + Math.max(0, 2 - index), seed.totalStudents),
    totalStudents: seed.totalStudents,
    generatedAt: iso(shiftDays(new Date(period.endDate), 2)),
  }))

  return [
    ...periodCards,
    {
      id: `demo-report-${seed.id}-final`,
      code: `BUL-${seed.publicCode}-FINAL`,
      kind: "FINAL",
      schoolYearId: SCHOOL_YEAR_ID,
      periodId: null,
      periodCode: null,
      periodName: null,
      periodAverage: null,
      annualAverage: average,
      classAverage: 12.9,
      rank: seed.rank,
      totalStudents: seed.totalStudents,
      generatedAt: iso(shiftDays(today, -1)),
    },
  ]
}

function makeSchedule(
  seed: StudentSeed,
  classGroupId: string
): StudentSchedule {
  const days = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"] as const
  const times = [
    ["07:30", "08:25"],
    ["08:30", "09:25"],
    ["09:45", "10:40"],
  ] as const
  const slots = days.flatMap((day, dayIndex) =>
    times.map(([startTime, endTime], timeIndex) => {
      const subject =
        seed.subjects[(dayIndex * 2 + timeIndex) % seed.subjects.length]!
      const [teacherFirstName, ...teacherLastName] = subject.teacher.split(" ")
      return {
        id: `demo-slot-${seed.id}-${day}-${timeIndex}`,
        dayOfWeek: day,
        startTime,
        endTime,
        classGroup: {
          id: classGroupId,
          code: seed.classCode,
          name: seed.className,
        },
        subjectLevel: {
          id: subjectId(seed, subject),
          subject: {
            id: `demo-subject-${subject.code.toLowerCase()}`,
            code: subject.code,
            name: subject.name,
          },
        },
        staffAssignment: {
          id: `demo-teacher-${seed.id}-${subject.code.toLowerCase()}`,
          identity: {
            firstName: teacherFirstName ?? null,
            lastName: teacherLastName.join(" ") || null,
          },
        },
      }
    })
  )

  return {
    classGroupId,
    classGroup: { code: seed.classCode, name: seed.className },
    scheduleStatus: "PUBLISHED",
    slots,
  }
}

function makePresence(
  seed: StudentSeed,
  identityId: string,
  enrollmentId: string,
  classGroupId: string
): ParentChildPresence {
  const classDays = Array.from({ length: 18 }, (_, index) =>
    iso(shiftDays(startOfMonth(today), index + 1))
  ).filter((date) => ![0, 6].includes(new Date(date).getDay()))
  const history = classDays.slice(0, 12).flatMap((date, index) => {
    const isLate = index === 3 || index === 9
    const entryAt = withTime(new Date(date), isLate ? 8 : 7, isLate ? 9 : 38)
    const exitAt = withTime(new Date(date), 15, 35)
    const common = {
      identityId,
      schoolId: SCHOOL.id,
      classGroup: {
        id: classGroupId,
        code: seed.classCode,
        name: seed.className,
      },
      person: {
        id: identityId,
        firstName: seed.firstName,
        lastName: seed.lastName,
        photoUrl: seed.photoUrl,
      },
      justification: null,
    }
    return [
      {
        ...common,
        id: `demo-entry-${seed.id}-${index}`,
        type: "ENTRY" as const,
        flag: isLate ? ("LATE" as const) : ("NORMAL" as const),
        createdAt: entryAt.toISOString(),
        minutesLate: isLate ? 9 : null,
        durationMinutes: null,
        location: "Portail principal",
      },
      {
        ...common,
        id: `demo-exit-${seed.id}-${index}`,
        type: "EXIT" as const,
        flag: "NORMAL" as const,
        createdAt: exitAt.toISOString(),
        minutesLate: null,
        durationMinutes: Math.round(
          (exitAt.getTime() - entryAt.getTime()) / 60_000
        ),
        location: "Portail principal",
      },
    ]
  })

  const courseItems = classDays.slice(0, 10).map((date, index) => {
    const subject = seed.subjects[index % seed.subjects.length]!
    const [firstName, ...lastNameParts] = subject.teacher.split(" ")
    return {
      date,
      attendanceId: `demo-attendance-${seed.id}-${index}`,
      sessionId: `demo-course-session-${seed.id}-${index}`,
      startTime: "09:45",
      endTime: "10:40",
      status:
        index === 7
          ? ("ABSENT" as const)
          : index === 4
            ? ("LATE" as const)
            : ("PRESENT" as const),
      lateMinutes: index === 4 ? 6 : null,
      note: index === 7 ? "Absence justifiée par la famille" : null,
      markedAt: withTime(new Date(date), 10, 0).toISOString(),
      submittedAt: withTime(new Date(date), 11, 0).toISOString(),
      subject: {
        id: `demo-subject-${subject.code.toLowerCase()}`,
        code: subject.code,
        name: subject.name,
        color: subject.color,
      },
      subjectLevel: { id: subjectId(seed, subject) },
      teacher: {
        id: `demo-teacher-${seed.id}-${subject.code.toLowerCase()}`,
        firstName: firstName ?? null,
        lastName: lastNameParts.join(" ") || null,
        name: subject.teacher,
        photoUrl: null,
      },
      classGroup: {
        id: classGroupId,
        code: seed.classCode,
        name: seed.className,
      },
      gateContext: { entry: null, exit: null },
    }
  })

  return {
    child: {
      identityId,
      firstName: seed.firstName,
      lastName: seed.lastName,
      photoUrl: seed.photoUrl,
      enrollmentId,
      classGroup: {
        id: classGroupId,
        code: seed.classCode,
        name: seed.className,
      },
    },
    range: {
      startDate: iso(startOfMonth(today)),
      endDate: iso(endOfMonth(today)),
    },
    stats: {
      attendanceRate: round1(
        (seed.presence.present /
          (seed.presence.present + seed.presence.absent)) *
          100
      ),
      totalDays: seed.presence.present + seed.presence.absent,
      presentDays: seed.presence.present,
      lateDays: seed.presence.late,
      classDays,
    },
    history: {
      data: history,
      total: history.length,
      page: 1,
      pageSize: 60,
      totalPages: 1,
    },
    courseAttendance: {
      data: courseItems,
      byDate: courseItems.map((item) => ({ date: item.date, items: [item] })),
    },
    plannedAbsences: [
      {
        id: `demo-planned-${seed.id}`,
        date: iso(shiftDays(today, 8)),
        reason: "FAMILY",
        note: "Rendez-vous familial",
        status: "ACKNOWLEDGED",
        createdAt: shiftDays(today, -2).toISOString(),
      },
    ],
  }
}

function makePayments(
  seed: StudentSeed,
  dashboard: StudentDashboard
): ParentPaymentsSummary {
  const enrollmentId = dashboard.info.enrollmentId
  const installments = [
    {
      id: `demo-installment-${seed.id}-1`,
      sequence: 1,
      dueDate: iso(shiftDays(today, -120)),
      amount: Math.round(seed.totalFees * 0.5),
      paidAmount: Math.round(seed.totalFees * 0.5),
      remainingAmount: 0,
      status: "PAID" as const,
    },
    {
      id: `demo-installment-${seed.id}-2`,
      sequence: 2,
      dueDate: iso(shiftDays(today, -15)),
      amount: seed.totalFees - Math.round(seed.totalFees * 0.5),
      paidAmount: seed.totalPaid - Math.round(seed.totalFees * 0.5),
      remainingAmount: seed.balance,
      status: seed.balance ? ("PARTIAL" as const) : ("PAID" as const),
    },
  ]
  const balance: StudentBalanceDetail = {
    enrollmentId,
    studentName: `${seed.lastName} ${seed.firstName}`,
    totalFees: seed.totalFees,
    totalPaid: seed.totalPaid,
    balance: seed.balance,
    breakdown: [
      {
        feeType: "TUITION",
        feeLabel: "Frais de scolarité",
        totalAmount: seed.totalFees,
        paidAmount: seed.totalPaid,
        remainingAmount: seed.balance,
        installments,
      },
    ],
  }
  const payments: PaymentListItem[] = [
    makePayment(
      seed,
      enrollmentId,
      1,
      installments[0]!.paidAmount,
      "MOBILE_MONEY",
      -118
    ),
    makePayment(
      seed,
      enrollmentId,
      2,
      Math.max(10_000, installments[1]!.paidAmount),
      "CASH",
      -24
    ),
  ]
  const child = {
    academicAccess: dashboard.academicAccess,
    enrollmentId,
    identityId: dashboard.info.identityId,
    firstName: seed.firstName,
    lastName: seed.lastName,
    photoUrl: seed.photoUrl,
    classGroupCode: seed.classCode,
    classGroupName: seed.className,
    presenceToday: { entryTime: "07:38", status: "present" as const },
    latestGrade: {
      score: seed.subjects[0]!.average,
      evaluationTitle: `Devoir de ${seed.subjects[0]!.name}`,
      date: iso(shiftDays(today, -3)),
    },
    balance: seed.balance,
    periodAverage: dashboard.grades.periodAverage,
    rank: seed.rank,
    totalStudents: seed.totalStudents,
    cardStatus: dashboard.cardStatus,
    cardAmountDue: 0,
  }

  return {
    children: [
      {
        child,
        balance,
        payments,
        paymentHistoryAvailable: true,
        tuitionBalance: seed.balance,
        tuitionPaid: seed.totalPaid,
        tuitionTotalFees: seed.totalFees,
      },
    ],
    totalFees: seed.totalFees,
    totalPaid: seed.totalPaid,
    totalBalance: seed.balance,
    tuitionBalance: seed.balance,
    tuitionPaid: seed.totalPaid,
    tuitionTotalFees: seed.totalFees,
    payments,
    paymentHistoryAvailable: true,
  }
}

function makePayment(
  seed: StudentSeed,
  enrollmentId: string,
  index: number,
  amount: number,
  method: "CASH" | "MOBILE_MONEY",
  dayOffset: number
): PaymentListItem {
  return {
    id: `demo-payment-${seed.id}-${index}`,
    amount,
    method,
    reference: `DEMO-${seed.publicCode}-${index}`,
    enrollmentId,
    schoolId: SCHOOL.id,
    receivedById: "demo-school-cashier",
    receipt: {
      id: `demo-receipt-${seed.id}-${index}`,
      code: `REC-${seed.publicCode}-${index}`,
    },
    allocations: [
      {
        id: `demo-allocation-${seed.id}-${index}`,
        chargeInstallmentId: `demo-installment-${seed.id}-${index}`,
        amount,
        feeLabel: "Frais de scolarité",
      },
    ],
    createdAt: shiftDays(today, dayOffset).toISOString(),
    enrollment: {
      person: {
        id: `demo-identity-${seed.id}`,
        firstName: seed.firstName,
        lastName: seed.lastName,
        photoUrl: seed.photoUrl,
      },
      classGroup: {
        id: `demo-class-${seed.id}`,
        code: seed.classCode,
        name: seed.className,
      },
    },
  }
}

function makeEvaluations(
  seed: StudentSeed,
  classGroupId: string
): DemoEvaluation[] {
  const offsets = [-14, -5, 1, 3, 6, 12]
  const types = [
    "HOMEWORK",
    "QUIZ",
    "ORAL",
    "PROJECT",
    "EXAM",
    "HOMEWORK",
  ] as const
  return offsets.map((offset, index) => {
    const subject = seed.subjects[index % seed.subjects.length]!
    return {
      id: `demo-evaluation-${seed.id}-${index}`,
      title:
        index === 4
          ? `Composition de ${subject.name}`
          : `Évaluation de ${subject.name}`,
      type: types[index],
      date: iso(shiftDays(today, offset)),
      gradeCount: offset < 0 ? 1 : 0,
      periodId: PERIODS[2]!.id,
      classGroup: {
        id: classGroupId,
        code: seed.classCode,
        name: seed.className,
      },
      subjectLevel: {
        subject: {
          id: `demo-subject-${subject.code.toLowerCase()}`,
          code: subject.code,
          color: subject.color,
          name: subject.name,
        },
      },
    }
  })
}

function makeNotifications(seed: StudentSeed): AppNotification[] {
  const subject = seed.subjects[0]!
  return [
    {
      id: `demo-notification-${seed.id}-grade`,
      type: "GRADE",
      title: "Nouvelle note publiée",
      body: `${subject.name} : ${subject.average.toFixed(1)}/20`,
      data: { section: "reports" },
      readAt: null,
      createdAt: shiftDays(today, -1).toISOString(),
    },
    {
      id: `demo-notification-${seed.id}-evaluation`,
      type: "SYSTEM",
      title: "Évaluation à venir",
      body: `${seed.subjects[1]!.name}, dans 3 jours`,
      data: { section: "evaluations" },
      readAt: null,
      createdAt: shiftDays(today, -2).toISOString(),
    },
    {
      id: `demo-notification-${seed.id}-payment`,
      type: "PAYMENT",
      title: "Paiement enregistré",
      body: `Un règlement de ${formatAmount(Math.min(seed.totalPaid, 75_000))} a été reçu.`,
      data: { section: "payments" },
      readAt: shiftDays(today, -4).toISOString(),
      createdAt: shiftDays(today, -5).toISOString(),
    },
    {
      id: `demo-notification-${seed.id}-presence`,
      type: "PRESENCE",
      title: "Entrée enregistrée",
      body: "Passage au portail principal à 07:38.",
      data: { section: "presence" },
      readAt: shiftDays(today, -7).toISOString(),
      createdAt: shiftDays(today, -7).toISOString(),
    },
  ]
}

function makePeriod(
  sequence: number,
  startDate: Date,
  endDate: Date,
  status: "CLOSED" | "OPEN"
): AcademicPeriod {
  return {
    id: `demo-period-t${sequence}`,
    code: `T${sequence}`,
    name: `Trimestre ${sequence}`,
    type: "TRIMESTER",
    sequence,
    startDate: iso(startDate),
    endDate: iso(endDate),
    status,
    closedAt: status === "CLOSED" ? shiftDays(endDate, 2).toISOString() : null,
    closedById: status === "CLOSED" ? "demo-school-director" : null,
    schoolYearId: SCHOOL_YEAR_ID,
  }
}

function subjectId(seed: StudentSeed, subject: SubjectSeed): string {
  return `demo-subject-level-${seed.id}-${subject.code.toLowerCase()}`
}

function weightedAverage(subjects: SubjectSeed[]): number {
  const total = subjects.reduce(
    (sum, subject) => sum + subject.average * subject.coefficient,
    0
  )
  const coefficients = subjects.reduce(
    (sum, subject) => sum + subject.coefficient,
    0
  )
  return round1(total / coefficients)
}

function weightedAverageFromRows(rows: ParentReportSubjectAverage[]): number {
  const total = rows.reduce(
    (sum, row) => sum + (row.average ?? 0) * row.coefficient,
    0
  )
  const coefficients = rows.reduce((sum, row) => sum + row.coefficient, 0)
  return total / coefficients
}

function formatAmount(amount: number): string {
  return `${new Intl.NumberFormat("fr-FR").format(amount)} FCFA`
}

function round1(value: number): number {
  return Math.round(value * 10) / 10
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

function startOfDay(value: Date): Date {
  const date = new Date(value)
  date.setHours(0, 0, 0, 0)
  return date
}

function startOfMonth(value: Date): Date {
  return new Date(value.getFullYear(), value.getMonth(), 1)
}

function endOfMonth(value: Date): Date {
  return new Date(value.getFullYear(), value.getMonth() + 1, 0)
}

function shiftDays(value: Date, days: number): Date {
  const date = new Date(value)
  date.setDate(date.getDate() + days)
  return date
}

function withTime(value: Date, hours: number, minutes: number): Date {
  const date = new Date(value)
  date.setHours(hours, minutes, 0, 0)
  return date
}

function iso(value: Date): string {
  return startOfDay(value).toISOString().slice(0, 10)
}
