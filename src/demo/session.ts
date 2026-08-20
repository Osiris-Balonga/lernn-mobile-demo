import type { DemoAuthMethod, DemoSession, DemoStudentId } from "./types.ts"

export const DEMO_SESSION_KEY = "lernn-mobile-demo:session:v1"
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000

interface StorageLike {
  getItem(key: string): string | null
  removeItem(key: string): void
  setItem(key: string, value: string): void
}

function getBrowserStorage(kind: "local" | "session"): StorageLike | null {
  if (typeof window === "undefined") return null
  return kind === "local" ? window.localStorage : window.sessionStorage
}

export function createDemoSession(
  studentId: DemoStudentId,
  authMethod: DemoAuthMethod,
  remember = true,
  now = new Date()
): DemoSession {
  const session: DemoSession = {
    version: 1,
    studentId,
    authMethod,
    issuedAt: now.toISOString(),
    expiresAt: new Date(now.getTime() + SESSION_TTL_MS).toISOString(),
  }

  const preferred = getBrowserStorage(remember ? "local" : "session")
  const other = getBrowserStorage(remember ? "session" : "local")
  other?.removeItem(DEMO_SESSION_KEY)
  preferred?.setItem(DEMO_SESSION_KEY, JSON.stringify(session))
  return session
}

export function getDemoSession(now = new Date()): DemoSession | null {
  const local = getBrowserStorage("local")
  const session = getBrowserStorage("session")
  return readSession(local, now) ?? readSession(session, now)
}

export function clearDemoSession(): void {
  getBrowserStorage("local")?.removeItem(DEMO_SESSION_KEY)
  getBrowserStorage("session")?.removeItem(DEMO_SESSION_KEY)
}

function readSession(
  storage: StorageLike | null,
  now: Date
): DemoSession | null {
  if (!storage) return null
  const raw = storage.getItem(DEMO_SESSION_KEY)
  if (!raw) return null

  try {
    const value = JSON.parse(raw) as Partial<DemoSession>
    const validStudent = ["clara", "boris", "mireille"].includes(
      value.studentId ?? ""
    )
    const validMethod = ["password", "card-code", "card-qr"].includes(
      value.authMethod ?? ""
    )
    if (
      value.version !== 1 ||
      !validStudent ||
      !validMethod ||
      typeof value.issuedAt !== "string" ||
      typeof value.expiresAt !== "string" ||
      new Date(value.expiresAt).getTime() <= now.getTime()
    ) {
      storage.removeItem(DEMO_SESSION_KEY)
      return null
    }

    return value as DemoSession
  } catch {
    storage.removeItem(DEMO_SESSION_KEY)
    return null
  }
}
