import { useEffect, useState } from "react"

import type { CompanionSession } from "./types"

const COMPANION_SESSIONS_KEY = "lernn-mobile:companion-sessions"
const SELECTED_COMPANION_SESSION_KEY = "lernn-mobile:selected-companion-session"
const COMPANION_SESSIONS_EVENT = "lernn-mobile:companion-sessions-changed"

export function getStoredCompanionSessions(): CompanionSession[] {
  if (typeof window === "undefined") return []

  const sessions = readJson<CompanionSession[]>(COMPANION_SESSIONS_KEY)
  const activeSessions = Array.isArray(sessions)
    ? sessions.filter((session) => !isExpiredCompanionSession(session))
    : []

  if (sessions && activeSessions.length !== sessions.length) {
    writeCompanionSessions(activeSessions)
  }

  return activeSessions
}

export function rememberCompanionSession(session: CompanionSession) {
  if (typeof window === "undefined") return

  const sessions = getStoredCompanionSessions()
  writeCompanionSessions([
    session,
    ...sessions.filter((storedSession) => storedSession.id !== session.id),
  ])
}

export function removeCompanionSession(sessionId: string) {
  if (typeof window === "undefined") return

  writeCompanionSessions(
    getStoredCompanionSessions().filter((session) => session.id !== sessionId)
  )

  if (
    window.localStorage.getItem(SELECTED_COMPANION_SESSION_KEY) === sessionId
  ) {
    clearSelectedCompanionSession()
  }
}

export function getSelectedCompanionSession(): CompanionSession | null {
  if (typeof window === "undefined") return null

  const selectedId = window.localStorage.getItem(SELECTED_COMPANION_SESSION_KEY)
  if (!selectedId) return null

  return (
    getStoredCompanionSessions().find((session) => session.id === selectedId) ??
    null
  )
}

export function setSelectedCompanionSession(sessionId: string) {
  if (typeof window === "undefined") return

  window.localStorage.setItem(SELECTED_COMPANION_SESSION_KEY, sessionId)
  notifyCompanionSessionsChanged()
}

export function clearSelectedCompanionSession() {
  if (typeof window === "undefined") return

  window.localStorage.removeItem(SELECTED_COMPANION_SESSION_KEY)
  notifyCompanionSessionsChanged()
}

export function useCompanionSessions() {
  const [sessions, setSessions] = useState(() => getStoredCompanionSessions())
  const [selectedSession, setSelectedSession] = useState(() =>
    getSelectedCompanionSession()
  )

  useEffect(() => {
    function syncSessions() {
      setSessions(getStoredCompanionSessions())
      setSelectedSession(getSelectedCompanionSession())
    }

    window.addEventListener("storage", syncSessions)
    window.addEventListener(COMPANION_SESSIONS_EVENT, syncSessions)

    return () => {
      window.removeEventListener("storage", syncSessions)
      window.removeEventListener(COMPANION_SESSIONS_EVENT, syncSessions)
    }
  }, [])

  return { selectedSession, sessions }
}

function writeCompanionSessions(sessions: CompanionSession[]) {
  window.localStorage.setItem(COMPANION_SESSIONS_KEY, JSON.stringify(sessions))
  notifyCompanionSessionsChanged()
}

function notifyCompanionSessionsChanged() {
  window.dispatchEvent(new Event(COMPANION_SESSIONS_EVENT))
}

function isExpiredCompanionSession(session: CompanionSession) {
  if (!session.expiresAt) return false

  const expiresAt = Date.parse(session.expiresAt)
  return Number.isFinite(expiresAt) && expiresAt <= Date.now()
}

function readJson<T>(key: string): T | null {
  const raw = window.localStorage.getItem(key)
  if (!raw) return null

  try {
    return JSON.parse(raw) as T
  } catch {
    window.localStorage.removeItem(key)
    return null
  }
}
