import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import test from "node:test"

import {
  extractStrictCardQrToken,
  normalizePublicCardCode,
} from "../src/demo/crypto.ts"
import { demoDatabase, DEMO_PASSWORD } from "../src/demo/fixtures.ts"
import {
  listDemoAccounts,
  requestDemo,
  resolveStudentByPassword,
  resolveStudentByPublicCode,
  resolveStudentByQrToken,
} from "../src/demo/repository.ts"
import { DEMO_SESSION_KEY } from "../src/demo/session.ts"
import { DemoRepositoryError } from "../src/demo/types.ts"

class MemoryStorage {
  #items = new Map()

  getItem(key) {
    return this.#items.get(key) ?? null
  }

  removeItem(key) {
    this.#items.delete(key)
  }

  setItem(key, value) {
    this.#items.set(key, String(value))
  }
}

function installBrowserStorage() {
  const localStorage = new MemoryStorage()
  const sessionStorage = new MemoryStorage()
  globalThis.window = { localStorage, sessionStorage }
  return { localStorage, sessionStorage }
}

test("publishes exactly the three student demo accounts used by the picker", () => {
  assert.deepEqual(listDemoAccounts(), [
    { studentId: "clara", email: "clara.makaya.demo@ndg.lernn.local" },
    { studentId: "boris", email: "boris.mbemba.demo@ndg.lernn.local" },
    { studentId: "mireille", email: "mireille.nsimba.demo@ndg.lernn.local" },
  ])
})

test("authenticates every demo account and rejects a wrong password", async () => {
  for (const account of demoDatabase.accounts) {
    const student = await resolveStudentByPassword(account.email, DEMO_PASSWORD)
    assert.equal(student?.id, account.studentId)
  }

  assert.equal(
    await resolveStudentByPassword(
      "clara.makaya.demo@ndg.lernn.local",
      "mot-de-passe-incorrect"
    ),
    null
  )
})

test("normalizes manual card codes and maps all three printed cards", () => {
  assert.equal(normalizePublicCardCode(" ndg01-stu-0013 "), "NDG01-STU-0013")
  assert.equal(resolveStudentByPublicCode("ndg01-stu-0013")?.id, "clara")
  assert.equal(resolveStudentByPublicCode("NDG01-STU-0501")?.id, "boris")
  assert.equal(resolveStudentByPublicCode("NDG01-STU-1201")?.id, "mireille")
  assert.equal(resolveStudentByPublicCode("NDG01-STU-9999"), null)
})

test("accepts only the strict opaque Lernn QR envelope", async () => {
  const syntheticToken = "A".repeat(43)
  assert.equal(
    extractStrictCardQrToken(`lernn://card-login?v=1&t=${syntheticToken}`),
    syntheticToken
  )
  assert.equal(
    extractStrictCardQrToken(`lernn://card-login?v=2&t=${syntheticToken}`),
    null
  )
  assert.equal(
    extractStrictCardQrToken(
      `lernn://card-login?v=1&t=${syntheticToken}&schoolId=forbidden`
    ),
    null
  )
  assert.equal(extractStrictCardQrToken("NDG01-STU-0013"), null)
  assert.equal(await resolveStudentByQrToken(syntheticToken), null)

  for (const credential of demoDatabase.credentials) {
    assert.match(credential.qrTokenHash, /^[a-f0-9]{64}$/)
  }
})

test("serves auth and complete student endpoints from the local repository", async () => {
  const { localStorage } = installBrowserStorage()
  const login = await requestDemo({
    method: "POST",
    path: "/auth/login",
    body: {
      email: "boris.mbemba.demo@ndg.lernn.local",
      password: DEMO_PASSWORD,
      rememberMe: true,
    },
  })
  assert.equal(login.data.firstName, "Boris")
  assert.ok(localStorage.getItem(DEMO_SESSION_KEY))

  const paths = [
    "/auth/me",
    "/auth/me/profiles",
    "/schools/demo-school-ndg01/school-years/mobile",
    "/schools/demo-school-ndg01/dashboards/student",
    "/schools/demo-school-ndg01/evaluations/student/me",
    "/schools/demo-school-ndg01/evaluations/student/me/report-cards",
    "/schools/demo-school-ndg01/evaluations/student/me/upcoming",
    "/schools/demo-school-ndg01/schedules/class/demo-class-boris",
    "/schools/demo-school-ndg01/presence/student/me",
    "/schools/demo-school-ndg01/payments/student/balance",
    "/schools/demo-school-ndg01/payments/student/history",
    "/notifications",
    "/notifications/unread-count",
    "/users/profile",
    "/users/preferences",
  ]

  for (const path of paths) {
    const response = await requestDemo({ method: "GET", path })
    assert.ok(response, path)
  }

  await requestDemo({ method: "POST", path: "/auth/logout" })
  assert.equal(localStorage.getItem(DEMO_SESSION_KEY), null)
  await assert.rejects(
    requestDemo({ method: "GET", path: "/auth/me" }),
    (error) => error instanceof DemoRepositoryError && error.status === 401
  )
})

test("the API client contains no network fetch implementation", async () => {
  const source = await readFile(
    new URL("../src/lib/api-client.ts", import.meta.url),
    "utf8"
  )
  assert.doesNotMatch(source, /\bfetch\s*\(/)
  assert.match(source, /requestDemo/)
})
