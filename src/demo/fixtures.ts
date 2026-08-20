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
  DemoParentFixture,
  DemoStudentFixture,
  DemoStudentId,
} from "./types"
import { getTeacherPhotoUrl } from "./teachers.ts"

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
  gradingScale: { min: 0; max: 10 | 20; passingGrade: 5 | 10 }
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
    gradingScale: { min: 0, max: 10, passingGrade: 5 },
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
        average: 8.4,
        coefficient: 6,
      },
      {
        code: "MAT",
        color: "#2563EB",
        name: "Mathématiques",
        teacher: "Estelle Ngoma",
        average: 8.8,
        coefficient: 5,
      },
      {
        code: "SCI",
        color: "#7C3AED",
        name: "Sciences",
        teacher: "Alain Boukaka",
        average: 8.1,
        coefficient: 2,
      },
      {
        code: "ECM",
        color: "#D97706",
        name: "Éducation civique et morale",
        teacher: "Marie Okemba",
        average: 8.6,
        coefficient: 2,
      },
      {
        code: "EPS",
        color: "#DC2626",
        name: "Éducation physique et sportive",
        teacher: "Junior Mpassi",
        average: 9.1,
        coefficient: 2,
      },
      {
        code: "ART",
        color: "#DB2777",
        name: "Activités artistiques et musique",
        teacher: "Nadine Mvouama",
        average: 8.9,
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
    gradingScale: { min: 0, max: 20, passingGrade: 10 },
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
        coefficient: 6,
      },
      {
        code: "MAT",
        color: "#2563EB",
        name: "Mathématiques",
        teacher: "Patrick Loufoua",
        average: 15.8,
        coefficient: 5,
      },
      {
        code: "SVT",
        color: "#059669",
        name: "Sciences de la vie et de la Terre",
        teacher: "Esther Mavoungou",
        average: 13.7,
        coefficient: 2,
      },
      {
        code: "HGE",
        color: "#D97706",
        name: "Histoire-Géographie",
        teacher: "Serge Kimbembe",
        average: 14.2,
        coefficient: 4,
      },
      {
        code: "ANG",
        color: "#7C3AED",
        name: "Anglais",
        teacher: "Grace Mayembo",
        average: 16.1,
        coefficient: 4,
      },
      {
        code: "PHY",
        color: "#0891B2",
        name: "Sciences physiques",
        teacher: "Armand Bakala",
        average: 13.9,
        coefficient: 2,
      },
      {
        code: "DES",
        color: "#EA580C",
        name: "Dessin",
        teacher: "Nadine Mvouama",
        average: 15.6,
        coefficient: 1,
      },
      {
        code: "MUS",
        color: "#C026D3",
        name: "Musique",
        teacher: "Cédric Mouanda",
        average: 16.4,
        coefficient: 1,
      },
      {
        code: "EPS",
        color: "#DC2626",
        name: "Éducation physique et sportive",
        teacher: "Junior Mpassi",
        average: 16.8,
        coefficient: 2,
      },
      {
        code: "ECM",
        color: "#92400E",
        name: "Éducation civique et morale",
        teacher: "Marie Okemba",
        average: 15.1,
        coefficient: 1,
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
    gradingScale: { min: 0, max: 20, passingGrade: 10 },
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
        coefficient: 3,
      },
      {
        code: "MAT",
        color: "#2563EB",
        name: "Mathématiques",
        teacher: "Lucien Moukoko",
        average: 16.8,
        coefficient: 4,
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
        coefficient: 5,
      },
      {
        code: "ANG",
        color: "#D97706",
        name: "Anglais",
        teacher: "Grace Mayembo",
        average: 16.2,
        coefficient: 3,
      },
      {
        code: "HGE",
        color: "#A16207",
        name: "Histoire-Géographie",
        teacher: "Serge Kimbembe",
        average: 14.8,
        coefficient: 3,
      },
      {
        code: "EPS",
        color: "#DC2626",
        name: "Éducation physique et sportive",
        teacher: "Junior Mpassi",
        average: 17.2,
        coefficient: 2,
      },
    ],
  },
]

const schoolYearStart = localDate(2025, 10, 1)
const schoolYearEnd = localDate(2026, 6, 30)
const PERIODS: AcademicPeriod[] = [
  makePeriod(1, localDate(2025, 10, 1), localDate(2025, 12, 22), "CLOSED"),
  makePeriod(2, localDate(2026, 1, 5), localDate(2026, 3, 23), "CLOSED"),
  makePeriod(3, localDate(2026, 4, 6), schoolYearEnd, "OPEN"),
]

const STUDENTS = Object.fromEntries(
  STUDENT_SEEDS.map((seed) => [seed.id, makeStudentFixture(seed)])
) as Record<DemoStudentId, DemoStudentFixture>

const PARENT = makeParentFixture(["clara", "boris"])

export const demoDatabase: DemoDatabase = {
  school: SCHOOL,
  credentials: STUDENT_SEEDS.map((seed) => ({
    studentId: seed.id,
    publicCode: seed.publicCode,
    qrTokenHash: seed.qrTokenHash,
  })),
  accounts: [
    ...STUDENT_SEEDS.map((seed) => ({
      principalId: seed.id,
      email: seed.email,
      passwordHash: PASSWORD_HASH,
    })),
    PARENT.account,
  ],
  parents: { [PARENT.id]: PARENT },
  students: STUDENTS,
}

export const DEMO_PASSWORD = "DemoLernn2026!"

function makeStudentFixture(seed: StudentSeed): DemoStudentFixture {
  const identityId = `demo-identity-${seed.id}`
  const enrollmentId = `demo-enrollment-${seed.id}`
  const classGroupId = `demo-class-${seed.id}`
  const subjectAveragesByPeriod = PERIODS.map((_, periodIndex) =>
    makeSubjectAverages(seed, periodIndex)
  )
  const periodAverages = subjectAveragesByPeriod.map((rows) =>
    round1(weightedAverageFromRows(rows))
  )
  const annualAverage = round1(
    periodAverages.reduce((sum, average) => sum + average, 0) /
      periodAverages.length
  )
  const currentPeriodAverage = round1(
    weightedAverageFromRows(subjectAveragesByPeriod[2]!)
  )
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
      periodAverage: currentPeriodAverage,
      rank: seed.rank,
      totalStudents: seed.totalStudents,
      subjectAverages: subjectAveragesByPeriod[2]!.map((subject) => ({
        subjectCode: subject.subjectCode,
        subjectColor: subject.subjectColor,
        subjectName: subject.subjectName,
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
    const subjectAverages = subjectAveragesByPeriod[periodIndex]!
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
          classAverage: classAverageFor(seed, periodIndex),
          gradingScale: seed.gradingScale,
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
        gradingScale: seed.gradingScale,
        grades: [
          makeGrade(seed, subject, periodIndex, subjectIndex, 0),
          makeGrade(seed, subject, periodIndex, subjectIndex, 1),
          makeGrade(seed, subject, periodIndex, subjectIndex, 2),
          makeGrade(seed, subject, periodIndex, subjectIndex, 3),
        ],
      }
    }
  }

  const reportCards = makeReportCards(
    seed,
    annualAverage,
    subjectAveragesByPeriod
  )
  const schedule = makeSchedule(seed, classGroupId)
  const presence = makePresence(seed, identityId, enrollmentId, classGroupId)
  const payments = makePayments(seed, dashboard)
  const evaluations = makeEvaluations(seed, classGroupId, subjectGradesByPeriod)

  return {
    id: seed.id,
    account: {
      principalId: seed.id,
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
  return seed.subjects.map((subject, subjectIndex) => {
    const grades = [0, 1, 2, 3].map((gradeIndex) =>
      makeGrade(seed, subject, periodIndex, subjectIndex, gradeIndex)
    )
    const scoredGrades = grades.filter((grade) => grade.score !== null)
    const average = round1(
      scoredGrades.reduce(
        (sum, grade) => sum + (grade.score ?? 0) * grade.weight,
        0
      ) / scoredGrades.reduce((sum, grade) => sum + grade.weight, 0)
    )
    const scores = scoredGrades.map((grade) => grade.score ?? 0)

    return {
      subjectLevelId: subjectId(seed, subject),
      subjectCode: subject.code,
      subjectColor: subject.color,
      subjectName: subject.name,
      coefficient: subject.coefficient,
      average,
      gradeCount: grades.length,
      min: Math.min(...scores),
      max: Math.max(...scores),
    }
  })
}

function makeGrade(
  seed: StudentSeed,
  subject: SubjectSeed,
  periodIndex: number,
  subjectIndex: number,
  gradeIndex: number
) {
  const targetAverage = periodSubjectAverage(seed, subject, periodIndex)
  const scoreOffsets = [-0.8, 0.4, 0.3, 0] as const
  const absent =
    seed.id === "boris" &&
    periodIndex === 1 &&
    subject.code === "HGE" &&
    gradeIndex === 0
  const score = absent
    ? 0
    : clamp(
        round1(targetAverage + scoreOffsets[gradeIndex]!),
        0,
        seed.gradingScale.max
      )
  const date = evaluationDate(
    periodIndex,
    gradeIndex,
    subjectIndex,
    seed.classCode === "TERM-D"
  )
  const types = ["HOMEWORK", "HOMEWORK", "EXAM", "EXAM"] as const
  const weights = [1, 1, 2, 3] as const
  const titles = [
    `Devoir régulier 1 de ${subject.name}`,
    `Devoir régulier 2 de ${subject.name}`,
    `Devoir départemental de ${subject.name}`,
    `Composition de ${subject.name}`,
  ] as const
  return {
    evaluationId: `demo-grade-${seed.id}-${periodIndex}-${subject.code}-${gradeIndex}`,
    title: titles[gradeIndex],
    type: types[gradeIndex],
    date: iso(date),
    weight: weights[gradeIndex],
    score,
    absent,
    comment: absent
      ? "Absent"
      : score >= seed.gradingScale.max * 0.8
        ? "Très bon travail"
        : score >= seed.gradingScale.max * 0.7
          ? "Bon travail"
          : null,
    classAverage: clamp(
      round1(classAverageFor(seed, periodIndex) + (subjectIndex % 3) * 0.2),
      0,
      seed.gradingScale.max
    ),
  }
}

function makeReportCards(
  seed: StudentSeed,
  average: number,
  subjectAveragesByPeriod: ParentReportSubjectAverage[][]
): ChildReportCard[] {
  const periodCards = PERIODS.map((period, index) => ({
    id: `demo-report-${seed.id}-${period.code}`,
    code: `BUL-${seed.publicCode}-${period.code}`,
    kind: "PERIOD" as const,
    schoolYearId: SCHOOL_YEAR_ID,
    periodId: period.id,
    periodCode: period.code,
    periodName: period.name,
    periodAverage: round1(
      weightedAverageFromRows(subjectAveragesByPeriod[index]!)
    ),
    annualAverage: null,
    classAverage: classAverageFor(seed, index),
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
      classAverage: classAverageFor(seed, 2),
      rank: seed.rank,
      totalStudents: seed.totalStudents,
      generatedAt: iso(localDate(2026, 6, 30)),
    },
  ]
}

function makeSchedule(
  seed: StudentSeed,
  classGroupId: string
): StudentSchedule {
  const weekdays = [
    "MONDAY",
    "TUESDAY",
    "WEDNESDAY",
    "THURSDAY",
    "FRIDAY",
  ] as const
  const days =
    seed.classCode === "TERM-D"
      ? ([...weekdays, "SATURDAY"] as const)
      : weekdays
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
            photoUrl: getTeacherPhotoUrl(subject.teacher),
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
  const classDays = Array.from({ length: 25 }, (_, index) =>
    iso(shiftDays(localDate(2026, 5, 1), index))
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
        photoUrl: getTeacherPhotoUrl(subject.teacher),
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
      startDate: iso(localDate(2026, 5, 1)),
      endDate: iso(localDate(2026, 5, 31)),
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
        date: iso(localDate(2026, 6, 2)),
        reason: "FAMILY",
        note: "Rendez-vous familial",
        status: "ACKNOWLEDGED",
        createdAt: localDate(2026, 5, 16).toISOString(),
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
      dueDate: iso(localDate(2025, 10, 31)),
      amount: Math.round(seed.totalFees * 0.5),
      paidAmount: Math.round(seed.totalFees * 0.5),
      remainingAmount: 0,
      status: "PAID" as const,
    },
    {
      id: `demo-installment-${seed.id}-2`,
      sequence: 2,
      dueDate: iso(localDate(2026, 1, 31)),
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
      localDate(2025, 11, 3)
    ),
    makePayment(
      seed,
      enrollmentId,
      2,
      Math.max(10_000, installments[1]!.paidAmount),
      "CASH",
      localDate(2026, 1, 20)
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
      date: iso(localDate(2026, 5, 15)),
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
  createdAt: Date
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
    createdAt: withTime(createdAt, 10, 30).toISOString(),
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
  classGroupId: string,
  subjectGradesByPeriod: Record<string, ParentChildSubjectGrades>
): DemoEvaluation[] {
  return Object.values(subjectGradesByPeriod).flatMap((detail) =>
    detail.grades.map((grade) => ({
      id: grade.evaluationId,
      title: grade.title,
      type: grade.type,
      date: grade.date,
      gradeCount: 1,
      periodId: detail.period.id,
      classGroup: {
        id: classGroupId,
        code: seed.classCode,
        name: seed.className,
      },
      subjectLevel: {
        subject: {
          id: `demo-subject-${detail.subjectCode.toLowerCase()}`,
          code: detail.subjectCode,
          color: detail.subjectColor ?? "#00684A",
          name: detail.subjectName,
        },
      },
    }))
  )
}

function makeParentFixture(childIds: DemoStudentId[]): DemoParentFixture {
  const id = "parent-makaya" as const
  const email = "sandrine.makaya.demo@ndg.lernn.local"
  const children = childIds.map((childId) => STUDENTS[childId])

  return {
    id,
    account: { principalId: id, email, passwordHash: PASSWORD_HASH },
    childIds,
    user: {
      id: "demo-user-parent-makaya",
      email,
      firstName: "Sandrine",
      lastName: "Makaya",
      photoUrl: null,
      role: "PARENT",
      schoolAccess: [
        {
          schoolId: SCHOOL.id,
          schoolName: SCHOOL.name,
          organizationId: SCHOOL.organizationId,
          organizationName: SCHOOL.organizationName,
          role: "PARENT",
        },
      ],
    },
    profile: {
      id: "demo-profile-parent-makaya",
      type: "personal",
      role: "PARENT",
      schoolId: SCHOOL.id,
      schoolName: SCHOOL.name,
      organizationId: SCHOOL.organizationId,
      label: "Sandrine Makaya",
      icon: "users",
      photoUrl: null,
      schoolLogoUrl: SCHOOL.logoUrl,
      firstName: "Sandrine",
      lastName: "Makaya",
      setupComplete: true,
      capabilities: ["dashboard.view"],
    },
    schoolYears: children[0]?.schoolYears ?? [],
    notifications: children
      .flatMap((child) => child.notifications)
      .sort(
        (left, right) =>
          new Date(right.createdAt).getTime() -
          new Date(left.createdAt).getTime()
      ),
  }
}

function makeNotifications(seed: StudentSeed): AppNotification[] {
  const subject = seed.subjects[0]!
  return [
    {
      id: `demo-notification-${seed.id}-grade`,
      type: "GRADE",
      title: "Nouvelle note publiée",
      body: `${subject.name} : ${subject.average.toFixed(1)}/${seed.gradingScale.max}`,
      data: { section: "reports" },
      readAt: null,
      createdAt: localDate(2026, 5, 21).toISOString(),
    },
    {
      id: `demo-notification-${seed.id}-evaluation`,
      type: "SYSTEM",
      title: "Évaluation à venir",
      body: `${seed.subjects[1]!.name}, le 17 juin`,
      data: { section: "evaluations" },
      readAt: null,
      createdAt: localDate(2026, 5, 19).toISOString(),
    },
    {
      id: `demo-notification-${seed.id}-payment`,
      type: "PAYMENT",
      title: "Paiement enregistré",
      body: `Un règlement de ${formatAmount(Math.min(seed.totalPaid, 75_000))} a été reçu.`,
      data: { section: "payments" },
      readAt: localDate(2026, 5, 14).toISOString(),
      createdAt: localDate(2026, 5, 13).toISOString(),
    },
    {
      id: `demo-notification-${seed.id}-presence`,
      type: "PRESENCE",
      title: "Entrée enregistrée",
      body: "Passage au portail principal à 07:38.",
      data: { section: "presence" },
      readAt: localDate(2026, 5, 11).toISOString(),
      createdAt: localDate(2026, 5, 11).toISOString(),
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

function weightedAverageFromRows(rows: ParentReportSubjectAverage[]): number {
  const total = rows.reduce(
    (sum, row) => sum + (row.average ?? 0) * row.coefficient,
    0
  )
  const coefficients = rows.reduce((sum, row) => sum + row.coefficient, 0)
  return total / coefficients
}

function periodSubjectAverage(
  seed: StudentSeed,
  subject: SubjectSeed,
  periodIndex: number
): number {
  const progression = [-0.4, 0, 0.4] as const
  return clamp(
    round1(subject.average + progression[periodIndex]!),
    seed.gradingScale.min,
    seed.gradingScale.max
  )
}

function classAverageFor(seed: StudentSeed, periodIndex: number): number {
  const base = seed.gradingScale.max === 10 ? 6.7 : 12.7
  return round1(base + periodIndex * 0.2)
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

function shiftDays(value: Date, days: number): Date {
  const date = new Date(value)
  date.setDate(date.getDate() + days)
  return date
}

function evaluationDate(
  periodIndex: number,
  gradeIndex: number,
  subjectIndex: number,
  allowSaturday: boolean
): Date {
  const months = [
    [2025, 10, 12],
    [2026, 1, 3],
    [2026, 4, 6],
  ] as const
  const [year, regularMonth, compositionMonth] = months[periodIndex]!
  const month =
    gradeIndex === 0
      ? regularMonth
      : gradeIndex === 1 || gradeIndex === 2
        ? regularMonth + 1
        : compositionMonth
  const day =
    gradeIndex === 0
      ? 7 + ((subjectIndex * 3) % 18)
      : gradeIndex === 1
        ? 4 + ((subjectIndex * 3 + 1) % 9)
        : gradeIndex === 2
          ? 14 + ((subjectIndex * 5 + 2) % 11)
          : 5 + ((subjectIndex * 7 + 4) % 17)
  const date = localDate(year, month, day)

  while (date.getDay() === 0 || (!allowSaturday && date.getDay() === 6)) {
    date.setDate(date.getDate() + 1)
  }
  return date
}

function localDate(year: number, month: number, day: number): Date {
  return new Date(year, month - 1, day, 12, 0, 0, 0)
}

function withTime(value: Date, hours: number, minutes: number): Date {
  const date = new Date(value)
  date.setHours(hours, minutes, 0, 0)
  return date
}

function iso(value: Date): string {
  const date = startOfDay(value)
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${date.getFullYear()}-${month}-${day}`
}
