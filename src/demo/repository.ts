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
  const normalizedEmail = email.trim().toLowerCase()
  const account = demoDatabase.accounts.find(
    (candidate) => candidate.email.toLowerCase() === normalizedEmail
  )
  if (!account) return null

  const passwordHash = await sha256Hex(password)
  return passwordHash === account.passwordHash
    ? demoDatabase.students[account.studentId]
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

    const student = await resolveStudentByPassword(input.email, input.password)
    if (!student) throw unauthorized()
    createDemoSession(student.id, "password", input.rememberMe !== false)
    return clone({
      data: student.user,
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

  const student = getAuthenticatedStudent()

  if (method === "GET" && path === "/auth/me") {
    return clone({ data: student.user }) as T
  }

  if (method === "GET" && path === "/auth/me/profiles") {
    return clone({ data: [student.profile] }) as T
  }

  if (method === "GET" && path === "/users/profile") {
    return clone({ data: getMobileProfile(student) }) as T
  }

  if (method === "PATCH" && path === "/users/profile") {
    const input = asObject(body)
    const allowed = Object.fromEntries(
      ["firstName", "lastName", "phone"].flatMap((key) =>
        key in input ? [[key, input[key]]] : []
      )
    )
    setStoredJson(`${PROFILE_KEY_PREFIX}${student.id}`, {
      ...getProfileOverrides(student.id),
      ...allowed,
    })
    return clone({ data: getMobileProfile(student) }) as T
  }

  if (method === "POST" && path === "/users/profile/photo") {
    const file = body instanceof FormData ? body.get("photo") : null
    if (!(file instanceof File)) throw badRequest("Photo requise")
    const photoUrl = await fileToDataUrl(file)
    setStoredJson(`${PROFILE_KEY_PREFIX}${student.id}`, {
      ...getProfileOverrides(student.id),
      photoUrl,
    })
    return clone({ data: getMobileProfile(student) }) as T
  }

  if (method === "DELETE" && path === "/users/profile/photo") {
    setStoredJson(`${PROFILE_KEY_PREFIX}${student.id}`, {
      ...getProfileOverrides(student.id),
      photoUrl: null,
    })
    return clone({ data: getMobileProfile(student) }) as T
  }

  if (method === "GET" && path === "/users/preferences") {
    return clone({ data: getPreferences(student.id) }) as T
  }

  if (method === "PATCH" && path === "/users/preferences") {
    const preferences = { ...getPreferences(student.id), ...asObject(body) }
    setStoredJson(`${PREFERENCES_KEY_PREFIX}${student.id}`, preferences)
    return clone({ data: preferences }) as T
  }

  if (method === "GET" && path.endsWith("/school-years/mobile")) {
    return clone({ data: student.schoolYears }) as T
  }

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

  if (method === "GET" && path === "/notifications") {
    const notifications = notificationsFor(student)
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
    const count = notificationsFor(student).filter(
      (notification) => !notification.readAt
    ).length
    return { data: { count } } as T
  }

  const notificationReadMatch = path.match(/^\/notifications\/([^/]+)\/read$/)
  if (method === "PATCH" && notificationReadMatch) {
    const notificationId = decodeURIComponent(notificationReadMatch[1]!)
    const exists = student.notifications.some(({ id }) => id === notificationId)
    if (!exists) throw notFound("Notification de démonstration introuvable")
    rememberReadNotifications(student.id, [notificationId])
    return { data: { success: true } } as T
  }

  if (method === "POST" && path === "/notifications/mark-all-read") {
    rememberReadNotifications(
      student.id,
      student.notifications.map(({ id }) => id)
    )
    return { data: { count: student.notifications.length } } as T
  }

  throw notFound(`Route statique non disponible : ${method} ${path}`)
}

export function listDemoAccounts(): Array<
  Pick<DemoAccount, "email" | "studentId">
> {
  return demoDatabase.accounts.map(({ email, studentId }) => ({
    email,
    studentId,
  }))
}

function getAuthenticatedStudent(): DemoStudentFixture {
  const session = getDemoSession()
  if (!session) throw unauthorized()
  const student = demoDatabase.students[session.studentId]
  if (!student) {
    clearDemoSession()
    throw unauthorized()
  }
  return student
}

function notificationsFor(student: DemoStudentFixture) {
  const readIds = readNotificationIds(student.id)
  return student.notifications.map((notification) =>
    readIds.has(notification.id) && !notification.readAt
      ? { ...notification, readAt: new Date().toISOString() }
      : notification
  )
}

function getMobileProfile(student: DemoStudentFixture) {
  const overrides = getProfileOverrides(student.id)
  return {
    id: student.user.id,
    email: student.account.email,
    firstName: student.user.firstName ?? null,
    lastName: student.user.lastName ?? null,
    phone: null,
    photoUrl: student.user.photoUrl ?? null,
    ...overrides,
  }
}

function getProfileOverrides(
  studentId: DemoStudentId
): Record<string, unknown> {
  return getStoredJson(`${PROFILE_KEY_PREFIX}${studentId}`) ?? {}
}

function getPreferences(studentId: DemoStudentId) {
  return (
    getStoredJson(`${PREFERENCES_KEY_PREFIX}${studentId}`) ?? {
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

function readNotificationIds(studentId: DemoStudentId): Set<string> {
  if (typeof window === "undefined") return new Set()
  const raw = window.localStorage.getItem(
    `${NOTIFICATION_READ_KEY_PREFIX}${studentId}`
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
  studentId: DemoStudentId,
  notificationIds: string[]
) {
  if (typeof window === "undefined") return
  const ids = readNotificationIds(studentId)
  for (const id of notificationIds) ids.add(id)
  window.localStorage.setItem(
    `${NOTIFICATION_READ_KEY_PREFIX}${studentId}`,
    JSON.stringify([...ids])
  )
}

function activePeriodId(student: DemoStudentFixture): string {
  const periods = student.schoolYears[0]?.periods ?? []
  return (
    periods.find((period) => period.status === "OPEN")?.id ?? periods[0]!.id
  )
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

function badRequest(message: string) {
  return new DemoRepositoryError(400, "BAD_REQUEST", message)
}

function notFound(message: string) {
  return new DemoRepositoryError(404, "NOT_FOUND", message)
}
