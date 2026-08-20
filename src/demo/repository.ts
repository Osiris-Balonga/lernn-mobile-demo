import {
  extractStrictCardQrToken,
  normalizePublicCardCode,
  sha256Hex,
} from "./crypto.ts"
import { demoDatabase } from "./fixtures.ts"
import {
  clearDemoSession,
  createDemoSession,
  getDemoSession,
} from "./session.ts"
import type {
  DemoAccount,
  DemoParentFixture,
  DemoPrincipalId,
  DemoRequest,
  DemoStudentFixture,
  DemoStudentId,
} from "./types.ts"
import { DemoRepositoryError } from "./types.ts"

const NOTIFICATION_READ_KEY_PREFIX = "lernn-mobile-demo:notifications-read:"
const PROFILE_KEY_PREFIX = "lernn-mobile-demo:profile:"
const PREFERENCES_KEY_PREFIX = "lernn-mobile-demo:preferences:"

type LoginBody = { email?: unknown; password?: unknown; rememberMe?: unknown }
type CardBody = { code?: unknown; token?: unknown }

export async function resolveStudentByPassword(
  email: string,
  password: string
): Promise<DemoStudentFixture | null> {
  const principal = await resolvePrincipalByPassword(email, password)
  return principal && principal.id in demoDatabase.students
    ? demoDatabase.students[principal.id as DemoStudentId]
    : null
}

export async function resolvePrincipalByPassword(
  email: string,
  password: string
): Promise<DemoStudentFixture | DemoParentFixture | null> {
  const normalizedEmail = email.trim().toLowerCase()
  const account = demoDatabase.accounts.find(
    (candidate) => candidate.email.toLowerCase() === normalizedEmail
  )
  if (!account) return null

  const passwordHash = await sha256Hex(password)
  return passwordHash === account.passwordHash
    ? getPrincipal(account.principalId)
    : null
}

export function resolveStudentByPublicCode(
  code: string
): DemoStudentFixture | null {
  const publicCode = normalizePublicCardCode(code)
  const credential = demoDatabase.credentials.find(
    (candidate) => candidate.publicCode === publicCode
  )
  return credential ? demoDatabase.students[credential.studentId] : null
}

export async function resolveStudentByQrToken(
  token: string
): Promise<DemoStudentFixture | null> {
  if (!/^[A-Za-z0-9_-]{43}$/.test(token)) return null
  const tokenHash = await sha256Hex(token)
  const credential = demoDatabase.credentials.find(
    (candidate) => candidate.qrTokenHash === tokenHash
  )
  return credential ? demoDatabase.students[credential.studentId] : null
}

export async function resolveStudentByQrValue(
  rawValue: string
): Promise<DemoStudentFixture | null> {
  const token = extractStrictCardQrToken(rawValue)
  return token ? resolveStudentByQrToken(token) : null
}

export async function requestDemo<T>(request: DemoRequest): Promise<T> {
  await Promise.resolve()
  const { method, path, body, params } = request

  if (method === "POST" && path === "/auth/login") {
    const input = asObject(body) as LoginBody
    if (typeof input.email !== "string" || typeof input.password !== "string") {
      throw badRequest("Email et mot de passe requis")
    }

    const principal = await resolvePrincipalByPassword(
      input.email,
      input.password
    )
    if (!principal) throw unauthorized()
    createDemoSession(principal.id, "password", input.rememberMe !== false)
    return clone({
      data: principal.user,
      profileCount: 1,
      primaryProfile: "personal",
    }) as T
  }

  if (method === "POST" && path === "/auth/card-code-login") {
    const input = asObject(body) as CardBody
    if (typeof input.code !== "string") throw badRequest("Code carte requis")
    const student = resolveStudentByPublicCode(input.code)
    if (!student) throw unauthorized()
    createDemoSession(student.id, "card-code", true)
    return clone({ data: student.user }) as T
  }

  if (method === "POST" && path === "/auth/card-login") {
    const input = asObject(body) as CardBody
    if (typeof input.token !== "string") throw badRequest("QR carte requis")
    const student = await resolveStudentByQrToken(input.token)
    if (!student) throw unauthorized()
    createDemoSession(student.id, "card-qr", true)
    return clone({ data: student.user }) as T
  }

  if (method === "POST" && path === "/auth/logout") {
    clearDemoSession()
    return { data: { message: "Déconnexion effectuée" } } as T
  }

  const principal = getAuthenticatedPrincipal()

  if (method === "GET" && path === "/auth/me") {
    return clone({ data: principal.user }) as T
  }

  if (method === "GET" && path === "/auth/me/profiles") {
    return clone({ data: [principal.profile] }) as T
  }

  if (method === "GET" && path === "/users/profile") {
    return clone({ data: getMobileProfile(principal) }) as T
  }

  if (method === "PATCH" && path === "/users/profile") {
    const input = asObject(body)
    const allowed = Object.fromEntries(
      ["firstName", "lastName", "phone"].flatMap((key) =>
        key in input ? [[key, input[key]]] : []
      )
    )
    setStoredJson(`${PROFILE_KEY_PREFIX}${principal.id}`, {
      ...getProfileOverrides(principal.id),
      ...allowed,
    })
    return clone({ data: getMobileProfile(principal) }) as T
  }

  if (method === "POST" && path === "/users/profile/photo") {
    const file = body instanceof FormData ? body.get("photo") : null
    if (!(file instanceof File)) throw badRequest("Photo requise")
    const photoUrl = await fileToDataUrl(file)
    setStoredJson(`${PROFILE_KEY_PREFIX}${principal.id}`, {
      ...getProfileOverrides(principal.id),
      photoUrl,
    })
    return clone({ data: getMobileProfile(principal) }) as T
  }

  if (method === "DELETE" && path === "/users/profile/photo") {
    setStoredJson(`${PROFILE_KEY_PREFIX}${principal.id}`, {
      ...getProfileOverrides(principal.id),
      photoUrl: null,
    })
    return clone({ data: getMobileProfile(principal) }) as T
  }

  if (method === "GET" && path === "/users/preferences") {
    return clone({ data: getPreferences(principal.id) }) as T
  }

  if (method === "PATCH" && path === "/users/preferences") {
    const preferences = { ...getPreferences(principal.id), ...asObject(body) }
    setStoredJson(`${PREFERENCES_KEY_PREFIX}${principal.id}`, preferences)
    return clone({ data: preferences }) as T
  }

  if (method === "GET" && path.endsWith("/school-years/mobile")) {
    return clone({ data: principal.schoolYears }) as T
  }

  if (method === "GET" && path === "/notifications") {
    const notifications = notificationsFor(principal)
    return clone({
      data: notifications,
      meta: {
        page: 1,
        pageSize: 30,
        total: notifications.length,
        totalPages: 1,
      },
    }) as T
  }

  if (method === "GET" && path === "/notifications/unread-count") {
    const count = notificationsFor(principal).filter(
      (notification) => !notification.readAt
    ).length
    return { data: { count } } as T
  }

  const notificationReadMatch = path.match(/^\/notifications\/([^/]+)\/read$/)
  if (method === "PATCH" && notificationReadMatch) {
    const notificationId = decodeURIComponent(notificationReadMatch[1]!)
    const exists = principal.notifications.some(
      ({ id }) => id === notificationId
    )
    if (!exists) throw notFound("Notification de démonstration introuvable")
    rememberReadNotifications(principal.id, [notificationId])
    return { data: { success: true } } as T
  }

  if (method === "POST" && path === "/notifications/mark-all-read") {
    rememberReadNotifications(
      principal.id,
      principal.notifications.map(({ id }) => id)
    )
    return { data: { count: principal.notifications.length } } as T
  }

  if (isParent(principal)) {
    const children = principal.childIds.map(
      (studentId) => demoDatabase.students[studentId]
    )

    if (method === "GET" && path.endsWith("/dashboards/parent")) {
      return clone({ data: makeParentDashboard(children) }) as T
    }

    if (
      method === "GET" &&
      (path.endsWith("/evaluations/parent/children/upcoming") ||
        path.endsWith("/evaluations/parent/children/school-year"))
    ) {
      return clone({
        data: children.flatMap((child) => child.evaluations),
      }) as T
    }

    const parentSubjectMatch = path.match(
      /\/evaluations\/parent\/children\/([^/]+)\/subjects\/([^/]+)$/
    )
    if (method === "GET" && parentSubjectMatch) {
      const child = findChildByEnrollment(children, parentSubjectMatch[1]!)
      const periodId = stringParam(params?.periodId) ?? activePeriodId(child)
      const subjectLevelId = decodeURIComponent(parentSubjectMatch[2]!)
      const detail =
        child.subjectGradesByPeriod[`${subjectLevelId}:${periodId}`]
      if (!detail) throw notFound("Matière de démonstration introuvable")
      return clone({ data: detail }) as T
    }

    const parentReportsMatch = path.match(
      /\/evaluations\/parent\/children\/([^/]+)\/report-cards$/
    )
    if (method === "GET" && parentReportsMatch) {
      const child = findChildByEnrollment(children, parentReportsMatch[1]!)
      return clone({ data: child.reportCards }) as T
    }

    if (method === "GET" && path.endsWith("/evaluations/parent/children")) {
      const periodId =
        stringParam(params?.periodId) ?? activePeriodId(children[0]!)
      const template = children[0]!.gradesByPeriod[periodId]
      if (!template) throw notFound("Période de démonstration introuvable")
      return clone({
        data: {
          schoolYear: template.schoolYear,
          period: template.period,
          children: children.flatMap(
            (child) => child.gradesByPeriod[periodId]?.children ?? []
          ),
        },
      }) as T
    }

    const parentPresenceMatch = path.match(
      /\/presence\/parent\/children\/([^/]+)$/
    )
    if (method === "GET" && parentPresenceMatch) {
      const child = findChildByIdentity(children, parentPresenceMatch[1]!)
      return clone({ data: child.presence }) as T
    }

    const balanceMatch = path.match(
      /\/payments\/balance\/student-enrollments\/([^/]+)$/
    )
    if (method === "GET" && balanceMatch) {
      const child = findChildByEnrollment(children, balanceMatch[1]!)
      return clone({ data: child.payments.children[0]!.balance }) as T
    }

    if (method === "GET" && path.endsWith("/payments/parent/history")) {
      const payments = children.flatMap((child) => child.payments.payments)
      return clone({
        data: payments,
        meta: {
          total: payments.length,
          page: 1,
          pageSize: 50,
          totalPages: 1,
          timestamp: new Date().toISOString(),
        },
      }) as T
    }

    if (method === "GET" && /\/schedules\/class\/[^/]+$/.test(path)) {
      const enrollmentId = stringParam(params?.studentEnrollmentId)
      const classGroupId = decodeURIComponent(path.split("/").at(-1) ?? "")
      const child = enrollmentId
        ? findChildByEnrollment(children, enrollmentId)
        : children.find(
            (candidate) =>
              candidate.dashboard.info.classGroupId === classGroupId
          )
      if (!child) throw notFound("Élève de démonstration introuvable")
      return clone({ data: child.schedule }) as T
    }
  }

  const student = requireStudent(principal)

  if (method === "GET" && path.endsWith("/dashboards/student")) {
    return clone({ data: student.dashboard }) as T
  }

  const subjectMatch = path.match(
    /\/evaluations\/student\/me\/subjects\/([^/]+)$/
  )
  if (method === "GET" && subjectMatch) {
    const periodId = stringParam(params?.periodId) ?? activePeriodId(student)
    const key = `${decodeURIComponent(subjectMatch[1]!)}:${periodId}`
    const subject = student.subjectGradesByPeriod[key]
    if (!subject) throw notFound("Matière de démonstration introuvable")
    return clone({ data: subject }) as T
  }

  if (
    method === "GET" &&
    (path.endsWith("/evaluations/student/me/upcoming") ||
      path.endsWith("/evaluations/student/me/school-year"))
  ) {
    return clone({ data: student.evaluations }) as T
  }

  if (
    method === "GET" &&
    path.endsWith("/evaluations/student/me/report-cards")
  ) {
    return clone({ data: student.reportCards }) as T
  }

  if (method === "GET" && path.endsWith("/evaluations/student/me")) {
    const periodId = stringParam(params?.periodId) ?? activePeriodId(student)
    const grades = student.gradesByPeriod[periodId]
    if (!grades) throw notFound("Période de démonstration introuvable")
    return clone({ data: grades }) as T
  }

  if (method === "GET" && /\/schedules\/class\/[^/]+$/.test(path)) {
    return clone({ data: student.schedule }) as T
  }

  if (method === "GET" && path.endsWith("/presence/student/me")) {
    return clone({ data: student.presence }) as T
  }

  if (method === "GET" && path.endsWith("/payments/student/balance")) {
    return clone({ data: student.payments.children[0]!.balance }) as T
  }

  if (method === "GET" && path.endsWith("/payments/student/history")) {
    const payments = student.payments.payments
    return clone({
      data: payments,
      meta: {
        total: payments.length,
        page: 1,
        pageSize: 50,
        totalPages: 1,
        timestamp: new Date().toISOString(),
      },
    }) as T
  }

  throw notFound(`Route statique non disponible : ${method} ${path}`)
}

export function listDemoAccounts(): Array<
  Pick<DemoAccount, "email" | "principalId">
> {
  return demoDatabase.accounts.map(({ email, principalId }) => ({
    email,
    principalId,
  }))
}

type DemoPrincipal = DemoStudentFixture | DemoParentFixture

function getPrincipal(principalId: DemoPrincipalId): DemoPrincipal | null {
  if (principalId in demoDatabase.students) {
    return demoDatabase.students[principalId as DemoStudentId]
  }
  return demoDatabase.parents[principalId as keyof typeof demoDatabase.parents]
}

function getAuthenticatedPrincipal(): DemoPrincipal {
  const session = getDemoSession()
  if (!session) throw unauthorized()
  const principal = getPrincipal(session.principalId)
  if (!principal) {
    clearDemoSession()
    throw unauthorized()
  }
  return principal
}

function isParent(principal: DemoPrincipal): principal is DemoParentFixture {
  return principal.id === "parent-makaya"
}

function requireStudent(principal: DemoPrincipal): DemoStudentFixture {
  if (isParent(principal)) throw forbidden()
  return principal
}

function notificationsFor(principal: DemoPrincipal) {
  const readIds = readNotificationIds(principal.id)
  return principal.notifications.map((notification) =>
    readIds.has(notification.id) && !notification.readAt
      ? { ...notification, readAt: new Date().toISOString() }
      : notification
  )
}

function getMobileProfile(principal: DemoPrincipal) {
  const overrides = getProfileOverrides(principal.id)
  return {
    id: principal.user.id,
    email: principal.account.email,
    firstName: principal.user.firstName ?? null,
    lastName: principal.user.lastName ?? null,
    phone: null,
    photoUrl: principal.user.photoUrl ?? null,
    ...overrides,
  }
}

function getProfileOverrides(
  principalId: DemoPrincipalId
): Record<string, unknown> {
  return getStoredJson(`${PROFILE_KEY_PREFIX}${principalId}`) ?? {}
}

function getPreferences(principalId: DemoPrincipalId) {
  return (
    getStoredJson(`${PREFERENCES_KEY_PREFIX}${principalId}`) ?? {
      grades: { email: false, push: true },
      payments: { email: false, push: true },
      presence: { email: false, push: true },
      system: { email: false, push: true },
      quietHoursDays: null,
      quietHoursEnd: null,
      quietHoursStart: null,
    }
  )
}

function getStoredJson(key: string): Record<string, unknown> | null {
  if (typeof window === "undefined") return null
  const raw = window.localStorage.getItem(key)
  if (!raw) return null
  try {
    const value = JSON.parse(raw) as unknown
    return typeof value === "object" && value !== null
      ? (value as Record<string, unknown>)
      : null
  } catch {
    return null
  }
}

function setStoredJson(key: string, value: unknown) {
  if (typeof window === "undefined") return
  window.localStorage.setItem(key, JSON.stringify(value))
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.addEventListener("load", () => resolve(String(reader.result)))
    reader.addEventListener("error", () => reject(reader.error))
    reader.readAsDataURL(file)
  })
}

function readNotificationIds(principalId: DemoPrincipalId): Set<string> {
  if (typeof window === "undefined") return new Set()
  const raw = window.localStorage.getItem(
    `${NOTIFICATION_READ_KEY_PREFIX}${principalId}`
  )
  if (!raw) return new Set()
  try {
    const ids = JSON.parse(raw) as unknown
    return new Set(
      Array.isArray(ids) ? ids.filter((id) => typeof id === "string") : []
    )
  } catch {
    return new Set()
  }
}

function rememberReadNotifications(
  principalId: DemoPrincipalId,
  notificationIds: string[]
) {
  if (typeof window === "undefined") return
  const ids = readNotificationIds(principalId)
  for (const id of notificationIds) ids.add(id)
  window.localStorage.setItem(
    `${NOTIFICATION_READ_KEY_PREFIX}${principalId}`,
    JSON.stringify([...ids])
  )
}

function activePeriodId(student: DemoStudentFixture): string {
  const periods = student.schoolYears[0]?.periods ?? []
  return (
    periods.find((period) => period.status === "OPEN")?.id ?? periods[0]!.id
  )
}

function makeParentDashboard(children: DemoStudentFixture[]) {
  return {
    children: children.map((student) => {
      const child = student.payments.children[0]!.child
      return {
        ...child,
        studentEnrollmentId: child.enrollmentId,
        studentId: child.identityId,
        enrollmentId: undefined,
        identityId: undefined,
      }
    }),
    familyTotalBalance: children.reduce(
      (sum, student) => sum + student.payments.totalBalance,
      0
    ),
  }
}

function findChildByEnrollment(
  children: DemoStudentFixture[],
  rawEnrollmentId: string
): DemoStudentFixture {
  const enrollmentId = decodeURIComponent(rawEnrollmentId)
  const child = children.find(
    (student) => student.dashboard.info.enrollmentId === enrollmentId
  )
  if (!child) throw notFound("Élève de démonstration introuvable")
  return child
}

function findChildByIdentity(
  children: DemoStudentFixture[],
  rawIdentityId: string
): DemoStudentFixture {
  const identityId = decodeURIComponent(rawIdentityId)
  const child = children.find(
    (student) => student.dashboard.info.identityId === identityId
  )
  if (!child) throw notFound("Élève de démonstration introuvable")
  return child
}

function asObject(value: unknown): Record<string, unknown> {
  return typeof value === "object" && value !== null
    ? (value as Record<string, unknown>)
    : {}
}

function stringParam(value: unknown): string | null {
  return typeof value === "string" && value ? value : null
}

function clone<T>(value: T): T {
  return structuredClone(value)
}

function unauthorized() {
  return new DemoRepositoryError(
    401,
    "UNAUTHORIZED",
    "Session de démonstration invalide"
  )
}

function forbidden() {
  return new DemoRepositoryError(
    403,
    "FORBIDDEN",
    "Cette route n'est pas disponible pour ce profil de démonstration"
  )
}

function badRequest(message: string) {
  return new DemoRepositoryError(400, "BAD_REQUEST", message)
}

function notFound(message: string) {
  return new DemoRepositoryError(404, "NOT_FOUND", message)
}
