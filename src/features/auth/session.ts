import type { AuthUser, MobileWorkspace, UserProfile } from "./types"

const AUTH_USER_KEY = "lernn-mobile-demo:auth-user"
const CACHED_PROFILES_KEY = "lernn-mobile-demo:cached-profiles"
const SELECTED_PROFILE_KEY = "lernn-mobile-demo:selected-profile"

export function getSelectedProfile(): UserProfile | null {
  if (typeof window === "undefined") return null

  return readJsonFromLocalStorage<UserProfile>(SELECTED_PROFILE_KEY)
}

export function setSelectedProfile(profile: UserProfile) {
  if (typeof window === "undefined") return

  window.localStorage.setItem(SELECTED_PROFILE_KEY, JSON.stringify(profile))
  rememberProfile(profile)
}

export function clearSelectedProfile() {
  if (typeof window === "undefined") return

  window.localStorage.removeItem(SELECTED_PROFILE_KEY)
}

export function getCachedAuthUser(): AuthUser | null {
  if (typeof window === "undefined") return null

  return readJsonFromLocalStorage<AuthUser>(AUTH_USER_KEY)
}

export function setCachedAuthUser(user: AuthUser) {
  if (typeof window === "undefined") return

  window.localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user))
}

export function getCachedProfiles(): UserProfile[] {
  if (typeof window === "undefined") return []

  const profiles = readJsonFromLocalStorage<UserProfile[]>(CACHED_PROFILES_KEY)
  return Array.isArray(profiles) ? profiles : []
}

export function setCachedProfiles(profiles: UserProfile[]) {
  if (typeof window === "undefined") return

  window.localStorage.setItem(CACHED_PROFILES_KEY, JSON.stringify(profiles))
}

export function clearCachedAuthSession() {
  if (typeof window === "undefined") return

  window.localStorage.removeItem(AUTH_USER_KEY)
  window.localStorage.removeItem(CACHED_PROFILES_KEY)
  window.localStorage.removeItem(SELECTED_PROFILE_KEY)
}

export function getCachedMobileProfile(): UserProfile | null {
  const selectedProfile = getSelectedProfile()
  if (selectedProfile?.schoolId) return selectedProfile

  const mobileProfiles = getCachedProfiles().filter(isMobileProfile)
  if (mobileProfiles.length === 1 && mobileProfiles[0].schoolId) {
    return mobileProfiles[0]
  }

  return null
}

export function getWorkspaceForProfile(
  profile: UserProfile | null
): MobileWorkspace | null {
  if (!profile) return null

  if (profile.role === "PARENT") {
    return "parent"
  }

  if (profile.role === "STUDENT") {
    return "student"
  }

  if (profile.role === "TEACHER") {
    return "teacher"
  }

  if (
    profile.role === "OWNER" ||
    profile.role === "DIRECTOR" ||
    profile.role === "ADMIN" ||
    profile.role === "STAFF"
  ) {
    return "companion"
  }

  return null
}

export function getProfileDisplayName(profile: UserProfile | null) {
  if (!profile) return ""
  return [profile.firstName, profile.lastName].filter(Boolean).join(" ").trim()
}

function rememberProfile(profile: UserProfile) {
  const profiles = getCachedProfiles()
  const nextProfiles = [
    profile,
    ...profiles.filter((cachedProfile) => cachedProfile.id !== profile.id),
  ]
  setCachedProfiles(nextProfiles)
}

function readJsonFromLocalStorage<T>(key: string): T | null {
  const raw = window.localStorage.getItem(key)
  if (!raw) return null

  try {
    return JSON.parse(raw) as T
  } catch {
    window.localStorage.removeItem(key)
    return null
  }
}

function isMobileProfile(profile: UserProfile) {
  return (
    Boolean(profile.schoolId) &&
    (profile.role === "PARENT" ||
      profile.role === "STUDENT" ||
      profile.role === "TEACHER" ||
      profile.role === "OWNER" ||
      profile.role === "DIRECTOR" ||
      profile.role === "ADMIN" ||
      profile.role === "STAFF")
  )
}
