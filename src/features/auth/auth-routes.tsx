import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import type { KeyboardEvent, ReactNode } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"
import {
  Bell,
  Check,
  ChevronRight,
  CloudOff,
  CreditCard,
  Eye,
  EyeOff,
  Keyboard,
  LockKeyhole,
  Loader2,
  LogOut,
  Mail,
  QrCode,
  RefreshCw,
  Smartphone,
  X,
} from "lucide-react"

import { MobileShellPlaceholder } from "@/App"
import { LernnLogo } from "@/components/brand"
import { ScannerCameraViewport } from "@/components/brand/scanner/scanner-camera-viewport"
import { ScannerScanFrame } from "@/components/brand/scanner/scanner-scan-frame"
import { resolveAvatarSrc } from "@/components/shared/person-avatar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { useQrScanner } from "@/hooks/use-qr-scanner"
import {
  cardCodeLogin,
  cardLogin,
  fetchMe,
  fetchProfiles,
  login,
  logout as logoutRequest,
} from "@/features/auth/api"
import type { CardLoginInput } from "@/features/auth/api"
import { parseCardLoginPayload } from "@/features/auth/card-login-payload"
import { getCredentialLoginErrorMessage } from "@/lib/login-error"
import {
  clearCachedAuthSession,
  getCachedMobileProfile,
  getProfileDisplayName,
  setCachedAuthUser,
  setCachedProfiles,
  setSelectedProfile,
} from "@/features/auth/session"
import type { AuthUser, UserProfile, UserRole } from "@/features/auth/types"
import { useCompanionSessions } from "@/features/companion/session-store"
import {
  ApiError,
  isApiNetworkOrTimeoutError,
  isUnauthorizedApiError,
  registerUnauthorizedHandler,
  setSchoolIdGetter,
} from "@/lib/api-client"
import { cn } from "@/lib/utils"
import { withAppBase } from "@/lib/route-base"
import { useOnlineStatus } from "@/network/online-status"
import { DemoAccountPicker } from "@/demo/demo-account-picker"
import * as m from "@/paraglide/messages"

type AppLocale = "fr" | "en"
type AuthStep =
  | "splash"
  | "credentials"
  | "qr"
  | "profiles"
  | "notifications"
  | "no-space"
const mobileProfileRoles = new Set<UserRole>([
  "PARENT",
  "STUDENT",
  "TEACHER",
  "OWNER",
  "DIRECTOR",
  "ADMIN",
  "STAFF",
])
const AUTH_REVALIDATION_RETRY_DELAYS = [800, 1800]

function isMobileProfile(profile: UserProfile) {
  return (
    Boolean(profile.schoolId) &&
    mobileProfileRoles.has(profile.role as UserRole)
  )
}

function isLoginAuthPath(path: string) {
  return (
    path === "/auth/login" ||
    path === "/auth/card-login" ||
    path === "/auth/card-code-login"
  )
}

function getRememberMeLabel(locale: AppLocale) {
  return locale === "en" ? "Stay signed in" : "Rester connecte"
}

export function LoginScreenRoute({
  initialStep,
  locale,
  returnTo,
}: {
  initialStep?: Extract<AuthStep, "credentials">
  locale: AppLocale
  returnTo?: string
}) {
  return (
    <MobileAuthScreen
      initialStep={initialStep}
      locale={locale}
      returnTo={returnTo}
    />
  )
}

export function AuthenticatedAppRoute({
  locale,
  section,
}: {
  locale: AppLocale
  section?: string
}) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const online = useOnlineStatus()
  const { selectedSession: activeCompanionSession } = useCompanionSessions()
  const revalidationPromiseRef = useRef<Promise<void> | null>(null)
  const [authRevalidationStatus, setAuthRevalidationStatus] = useState<
    "idle" | "checking" | "unavailable"
  >("idle")
  const [selectedProfile, setSelectedProfileState] =
    useState<UserProfile | null>(() => getCachedMobileProfile())

  const meQuery = useQuery({
    queryKey: ["auth", "me"],
    enabled: online,
    queryFn: fetchMe,
    retry: shouldRetryAuthRevalidation,
    retryDelay: getAuthRevalidationRetryDelay,
  })
  const profilesQuery = useQuery({
    queryKey: ["auth", "profiles"],
    enabled: online,
    queryFn: () => fetchProfiles(),
    retry: shouldRetryAuthRevalidation,
    retryDelay: getAuthRevalidationRetryDelay,
  })

  const confirmUnauthorizedAndRedirect = useCallback(async () => {
    if (revalidationPromiseRef.current) return revalidationPromiseRef.current

    const revalidationPromise = revalidateAuthSession()
      .then((result) => {
        if (result.status === "valid") {
          setAuthRevalidationStatus("idle")
          setCachedAuthUser(result.user)
          setCachedProfiles(result.profiles)
          queryClient.setQueryData(["auth", "me"], result.user)
          queryClient.setQueryData(["auth", "profiles"], result.profiles)
          return
        }

        if (result.status === "unavailable") {
          setAuthRevalidationStatus("unavailable")
          return
        }

        clearCachedAuthSession()
        setSchoolIdGetter(() => null)
        queryClient.clear()
        void navigate({
          to: "/$locale/login",
          params: { locale },
          replace: true,
        })
      })
      .finally(() => {
        revalidationPromiseRef.current = null
      })

    setAuthRevalidationStatus("checking")
    revalidationPromiseRef.current = revalidationPromise
    return revalidationPromise
  }, [locale, navigate, queryClient])

  useEffect(() => {
    return registerUnauthorizedHandler(({ path }) => {
      if (isLoginAuthPath(path)) {
        return
      }

      void confirmUnauthorizedAndRedirect()
    })
  }, [confirmUnauthorizedAndRedirect])

  useEffect(() => {
    if (!online) {
      setAuthRevalidationStatus("idle")
      return
    }

    const authErrors = [meQuery.error, profilesQuery.error].filter(Boolean)
    const hasUnauthorizedError = authErrors.some(isUnauthorizedApiError)
    const hasTransientError = authErrors.some(isTransientAuthRevalidationError)

    if (hasUnauthorizedError) {
      void confirmUnauthorizedAndRedirect()
      return
    }

    if (hasTransientError) {
      setAuthRevalidationStatus("unavailable")
      return
    }

    if (meQuery.isSuccess && profilesQuery.isSuccess) {
      setAuthRevalidationStatus("idle")
    }
  }, [
    confirmUnauthorizedAndRedirect,
    meQuery.error,
    meQuery.isSuccess,
    online,
    profilesQuery.error,
    profilesQuery.isSuccess,
  ])

  useEffect(() => {
    if (meQuery.data) {
      setCachedAuthUser(meQuery.data)
    }
  }, [meQuery.data])

  useEffect(() => {
    if (profilesQuery.data) {
      setCachedProfiles(profilesQuery.data)
    }
  }, [profilesQuery.data])

  const profiles = useMemo(() => profilesQuery.data ?? [], [profilesQuery.data])
  const authErrors = [meQuery.error, profilesQuery.error].filter(Boolean)
  const hasTransientAuthError = authErrors.some(
    isTransientAuthRevalidationError
  )
  const validSelectedProfile = useMemo(() => {
    if (!selectedProfile) return null
    return profiles.find((profile) => profile.id === selectedProfile.id) ?? null
  }, [profiles, selectedProfile])

  useEffect(() => {
    const schoolId = activeCompanionSession
      ? null
      : (validSelectedProfile?.schoolId ?? null)
    setSchoolIdGetter(() => schoolId)
  }, [activeCompanionSession, validSelectedProfile?.schoolId])

  if (
    online &&
    (meQuery.isLoading || profilesQuery.isLoading) &&
    !validSelectedProfile &&
    !activeCompanionSession
  ) {
    return <MobileLoadingScreen />
  }

  if (
    (!online ||
      hasTransientAuthError ||
      authRevalidationStatus === "unavailable") &&
    profiles.length === 0 &&
    !validSelectedProfile &&
    !activeCompanionSession
  ) {
    return <MobileAuthUnavailable />
  }

  if (activeCompanionSession) {
    return (
      <MobileShellPlaceholder
        activeCompanionSession={activeCompanionSession}
        initialSection={section}
        selectedProfile={validSelectedProfile}
      />
    )
  }

  if (section === "scan") {
    return (
      <MobileShellPlaceholder initialSection={section} selectedProfile={null} />
    )
  }

  if (!validSelectedProfile) {
    if (profiles.filter(isMobileProfile).length === 0) {
      return (
        <MobileShellPlaceholder
          initialSection={section}
          selectedProfile={null}
        />
      )
    }

    return (
      <MobileProfilePicker
        locale={locale}
        profiles={profiles}
        onSelect={(profile) => {
          setSelectedProfile(profile)
          setSelectedProfileState(profile)
          setSchoolIdGetter(() => profile.schoolId)
        }}
      />
    )
  }

  return (
    <MobileShellPlaceholder
      initialSection={section}
      selectedProfile={validSelectedProfile}
    />
  )
}

type AuthRevalidationResult =
  | { profiles: UserProfile[]; status: "valid"; user: AuthUser }
  | { error: unknown; status: "unavailable" }
  | { status: "unauthorized" }

async function revalidateAuthSession(): Promise<AuthRevalidationResult> {
  for (
    let attempt = 0;
    attempt <= AUTH_REVALIDATION_RETRY_DELAYS.length;
    attempt += 1
  ) {
    try {
      const user = await fetchMe()
      const profiles = await fetchProfiles()
      return { profiles, status: "valid", user }
    } catch (error) {
      if (isUnauthorizedApiError(error)) {
        return { status: "unauthorized" }
      }

      if (
        !isTransientAuthRevalidationError(error) ||
        attempt >= AUTH_REVALIDATION_RETRY_DELAYS.length
      ) {
        return { error, status: "unavailable" }
      }

      await wait(AUTH_REVALIDATION_RETRY_DELAYS[attempt])
    }
  }

  return { error: new Error("Auth revalidation failed"), status: "unavailable" }
}

function shouldRetryAuthRevalidation(failureCount: number, error: unknown) {
  return (
    failureCount <= AUTH_REVALIDATION_RETRY_DELAYS.length &&
    isTransientAuthRevalidationError(error)
  )
}

function getAuthRevalidationRetryDelay(attemptIndex: number) {
  return (
    AUTH_REVALIDATION_RETRY_DELAYS[
      Math.min(attemptIndex, AUTH_REVALIDATION_RETRY_DELAYS.length - 1)
    ] ?? AUTH_REVALIDATION_RETRY_DELAYS[0]
  )
}

function isTransientAuthRevalidationError(error: unknown) {
  if (isApiNetworkOrTimeoutError(error)) return true

  if (error instanceof ApiError) {
    return error.status === 408 || error.status === 429 || error.status >= 500
  }

  return false
}

function wait(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms))
}

function MobileAuthScreen({
  initialStep,
  locale,
  returnTo,
}: {
  initialStep?: Extract<AuthStep, "credentials">
  locale: AppLocale
  returnTo?: string
}) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [authStep, setAuthStep] = useState<AuthStep>(initialStep ?? "splash")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [profiles, setProfiles] = useState<UserProfile[] | null>(null)
  const [pendingProfile, setPendingProfile] = useState<UserProfile | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [cardError, setCardError] = useState<string | null>(null)
  const online = useOnlineStatus()

  useEffect(() => {
    if (!online) return

    let cancelled = false

    async function resumeExistingSession() {
      try {
        const user = await fetchMe()
        const nextProfiles = await fetchProfiles()
        if (cancelled) return

        setCachedAuthUser(user)
        setCachedProfiles(nextProfiles)
        queryClient.setQueryData(["auth", "me"], user)
        queryClient.setQueryData(["auth", "profiles"], nextProfiles)

        const safeReturnTo = getSafeAuthReturnTo(returnTo)
        if (safeReturnTo) {
          window.location.assign(safeReturnTo)
          return
        }

        const mobileProfiles = nextProfiles.filter(isMobileProfile)
        if (mobileProfiles.length === 0) {
          await navigate({
            to: "/$locale/app/$section",
            params: {
              locale,
              section: "profile",
            },
            replace: true,
          })
          return
        }

        const cachedProfile = getCachedMobileProfile()
        const preferredProfile = cachedProfile
          ? mobileProfiles.find((profile) => profile.id === cachedProfile.id)
          : null
        const nextProfile =
          preferredProfile ??
          (mobileProfiles.length === 1 ? mobileProfiles[0] : null)

        if (nextProfile?.schoolId) {
          setSelectedProfile(nextProfile)
          setSchoolIdGetter(() => nextProfile.schoolId)
          await navigate({
            to: "/$locale/app/$section",
            params: {
              locale,
              section: "home",
            },
            replace: true,
          })
          return
        }

        if (mobileProfiles.length > 1) {
          setProfiles(nextProfiles)
          setAuthStep("profiles")
        }
      } catch (error) {
        if (cancelled || isUnauthorizedApiError(error)) return
      }
    }

    void resumeExistingSession()

    return () => {
      cancelled = true
    }
  }, [locale, navigate, online, queryClient, returnTo])

  useEffect(() => {
    return registerUnauthorizedHandler(({ path }) => {
      if (isLoginAuthPath(path)) {
        return
      }

      clearCachedAuthSession()
      void navigate({
        to: "/$locale/login",
        params: { locale },
        replace: true,
      })
    })
  }, [locale, navigate])

  useEffect(() => {
    if (initialStep === "credentials") {
      setAuthStep((currentStep) =>
        currentStep === "splash" ? "credentials" : currentStep
      )
    }
  }, [initialStep])

  async function handleAuthenticatedUser(user: AuthUser) {
    setCachedAuthUser(user)
    queryClient.setQueryData(["auth", "me"], user)
    const nextProfiles = await queryClient.fetchQuery({
      queryKey: ["auth", "profiles"],
      queryFn: () => fetchProfiles(),
    })
    setCachedProfiles(nextProfiles)

    const safeReturnTo = getSafeAuthReturnTo(returnTo)
    if (safeReturnTo) {
      window.location.assign(safeReturnTo)
      return
    }

    const mobileProfiles = nextProfiles.filter(isMobileProfile)

    if (mobileProfiles.length === 0) {
      await navigate({
        to: "/$locale/app/$section",
        params: {
          locale,
          section: "profile",
        },
        replace: true,
      })
      return
    }

    if (mobileProfiles.length === 1) {
      prepareProfile(mobileProfiles[0])
      return
    }

    setProfiles(nextProfiles)
    setAuthStep("profiles")
  }

  const loginMutation = useMutation({
    mutationFn: login,
    onSuccess: async (response) => {
      await handleAuthenticatedUser(response.data)
    },
    onError: (error) => {
      setFormError(getCredentialLoginErrorMessage(error, m.auth_login_error()))
    },
  })

  const cardLoginMutation = useMutation({
    mutationFn: cardLogin,
    onSuccess: async (response) => {
      setCardError(null)
      setFormError(null)
      await handleAuthenticatedUser(response.data)
    },
    onError: () => {
      setCardError(m.auth_card_login_invalid_qr())
    },
  })

  const cardCodeLoginMutation = useMutation({
    mutationFn: cardCodeLogin,
    onSuccess: async (response) => {
      setCardError(null)
      setFormError(null)
      await handleAuthenticatedUser(response.data)
    },
    onError: () => {
      setCardError(m.auth_card_login_manual_payload_required())
    },
  })

  function prepareProfile(profile: UserProfile) {
    if (!profile.schoolId) {
      setFormError(m.auth_profile_without_school())
      return
    }

    if (!shouldShowNotificationOnboarding(profile)) {
      void selectProfile(profile)
      return
    }

    setPendingProfile(profile)
    setAuthStep("notifications")
  }

  async function selectProfile(profile: UserProfile) {
    setSelectedProfile(profile)
    setSchoolIdGetter(() => profile.schoolId)
    await navigate({
      to: "/$locale/app/$section",
      params: {
        locale,
        section: "home",
      },
      replace: true,
    })
  }

  if (authStep === "profiles" && profiles) {
    return (
      <MobileProfilePicker
        error={formError}
        locale={locale}
        profiles={profiles}
        onSelect={(profile) => {
          setFormError(null)
          prepareProfile(profile)
        }}
      />
    )
  }

  if (authStep === "notifications" && pendingProfile) {
    return (
      <NotificationPermissionScreen
        locale={locale}
        onContinue={() => void selectProfile(pendingProfile)}
        profile={pendingProfile}
      />
    )
  }

  if (authStep === "no-space") {
    return (
      <NoSpaceScreen
        locale={locale}
        onRetry={() => {
          setProfiles(null)
          setAuthStep("credentials")
        }}
      />
    )
  }

  if (authStep === "qr") {
    return (
      <CardLoginScanner
        error={cardError}
        isPending={
          cardLoginMutation.isPending || cardCodeLoginMutation.isPending
        }
        onBack={() => {
          setCardError(null)
          setAuthStep("credentials")
        }}
        onCardCode={(code) => {
          setCardError(null)
          cardCodeLoginMutation.mutate({ code })
        }}
        onCardPayload={(payload) => {
          setCardError(null)
          cardLoginMutation.mutate(payload)
        }}
        onError={setCardError}
      />
    )
  }

  if (authStep === "splash") {
    return (
      <SplashScreen
        credentialsHref={withAppBase(`/${locale}/login?step=credentials`)}
        onContinue={() => setAuthStep("credentials")}
      />
    )
  }

  return (
    <MobileAuthFrame>
      <section className="flex flex-1 flex-col justify-center gap-7">
        <div className="flex flex-col gap-5">
          <LernnLogo className="self-start" size={22} />
          <div className="flex flex-col gap-1.5">
            <h1 className="text-2xl font-semibold tracking-normal">
              {m.auth_login_title()}
            </h1>
            <p className="text-sm leading-6 text-muted-foreground">
              {m.auth_login_description()}
            </p>
          </div>
        </div>

        <DemoAccountPicker
          onSelect={(credentials) => {
            setEmail(credentials.email)
            setPassword(credentials.password)
            setFormError(null)
          }}
        />

        <form
          className="flex flex-col gap-4"
          onSubmit={(event) => {
            event.preventDefault()
            setFormError(null)
            loginMutation.mutate({ email, password, rememberMe })
          }}
        >
          <FieldGroup>
            <Field data-invalid={!!formError}>
              <FieldLabel htmlFor="email">{m.auth_email_label()}</FieldLabel>
              <InputGroup className="h-11 rounded-xl bg-background">
                <InputGroupAddon>
                  <Mail />
                </InputGroupAddon>
                <InputGroupInput
                  aria-invalid={!!formError}
                  autoComplete="email"
                  className="h-10 text-base"
                  id="email"
                  inputMode="email"
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="mariam.bencheikh@gmail.com"
                  required
                  type="email"
                  value={email}
                />
              </InputGroup>
            </Field>
            <Field data-invalid={!!formError}>
              <FieldLabel htmlFor="password">
                {m.auth_password_label()}
              </FieldLabel>
              <InputGroup className="h-11 rounded-xl bg-background">
                <InputGroupAddon>
                  <LockKeyhole />
                </InputGroupAddon>
                <InputGroupInput
                  aria-invalid={!!formError}
                  autoComplete="current-password"
                  className="h-10 text-base"
                  id="password"
                  minLength={8}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  type={showPassword ? "text" : "password"}
                  value={password}
                />
                <InputGroupAddon align="inline-end">
                  <InputGroupButton
                    aria-label={
                      showPassword
                        ? m.auth_hide_password()
                        : m.auth_show_password()
                    }
                    onClick={() => setShowPassword((value) => !value)}
                    size="icon-sm"
                    type="button"
                  >
                    {showPassword ? (
                      <EyeOff data-icon="icon" />
                    ) : (
                      <Eye data-icon="icon" />
                    )}
                  </InputGroupButton>
                </InputGroupAddon>
              </InputGroup>
              <FieldDescription>{m.auth_password_hint()}</FieldDescription>
              <FieldError>{formError}</FieldError>
            </Field>
          </FieldGroup>

          <div className="-mt-2 flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
            <label
              className="flex min-w-0 flex-1 basis-36 items-center gap-2 text-sm font-medium"
              htmlFor="remember-me"
            >
              <Checkbox
                checked={rememberMe}
                id="remember-me"
                onCheckedChange={(checked) => setRememberMe(checked === true)}
              />
              <span>{getRememberMeLabel(locale)}</span>
            </label>
            <Button
              className="shrink-0"
              onClick={() =>
                setFormError(
                  locale === "fr"
                    ? "La réinitialisation est désactivée dans la démo. Choisissez un compte de démonstration ci-dessous."
                    : "Password reset is disabled in the demo. Choose a demo account below."
                )
              }
              size="sm"
              type="button"
              variant="ghost"
            >
              {m.auth_forgot_password()}
            </Button>
          </div>

          <Button disabled={loginMutation.isPending} size="lg" type="submit">
            {loginMutation.isPending && (
              <Loader2 className="animate-spin" data-icon="inline-start" />
            )}
            {m.auth_login_action()}
          </Button>
        </form>

        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <Separator className="flex-1" />
          <span>{m.auth_or()}</span>
          <Separator className="flex-1" />
        </div>

        <Button
          onClick={() => {
            setFormError(null)
            setCardError(null)
            setAuthStep("qr")
          }}
          size="lg"
          type="button"
          variant="outline"
        >
          <QrCode data-icon="inline-start" />
          {m.auth_card_login_action()}
        </Button>
      </section>

      <p className="pb-[env(safe-area-inset-bottom)] text-center text-xs text-muted-foreground">
        {m.auth_invitation_hint()}
      </p>
    </MobileAuthFrame>
  )
}

function getSafeAuthReturnTo(returnTo: string | undefined) {
  if (!returnTo || typeof window === "undefined") return null

  try {
    const url = new URL(returnTo, window.location.origin)
    if (url.origin !== window.location.origin) return null

    const nextPath = `${url.pathname}${url.search}${url.hash}`
    return nextPath.startsWith("/companion/") ? nextPath : null
  } catch {
    return returnTo.startsWith("/companion/") ? returnTo : null
  }
}

function MobileProfilePicker({
  error,
  locale,
  onSelect,
  profiles,
}: {
  error?: string | null
  locale: AppLocale
  onSelect: (profile: UserProfile) => void
  profiles: UserProfile[]
}) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const mobileProfiles = profiles.filter(isMobileProfile)
  const logoutMutation = useMutation({
    mutationFn: logoutRequest,
    onSettled: () => {
      clearCachedAuthSession()
      setSchoolIdGetter(() => null)
      queryClient.clear()
      void navigate({
        to: "/$locale/login",
        params: { locale },
        replace: true,
      })
    },
  })

  return (
    <MobileAuthFrame muted>
      <header className="flex items-center justify-between">
        <LernnLogo size={20} />
      </header>

      <section className="flex flex-1 flex-col gap-5 py-5">
        <div className="flex flex-col gap-2">
          <h1 className="text-xl font-semibold tracking-normal">
            {m.auth_profiles_title()}
          </h1>
          <p className="text-sm leading-6 text-muted-foreground">
            {m.auth_profiles_description()}
          </p>
        </div>

        {mobileProfiles.length === 0 ? (
          <NoSpacePanel />
        ) : (
          <div className="flex flex-col gap-3">
            {mobileProfiles.map((profile) => (
              <ProfileCard
                key={profile.id}
                onClick={() => onSelect(profile)}
                profile={profile}
              />
            ))}
          </div>
        )}
        {error && (
          <p className="rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2 text-xs text-destructive">
            {error}
          </p>
        )}
      </section>

      <footer className="pb-[env(safe-area-inset-bottom)]">
        <Button
          className="w-full"
          disabled={logoutMutation.isPending}
          onClick={() => logoutMutation.mutate()}
          size="lg"
          type="button"
          variant="outline"
        >
          {logoutMutation.isPending ? (
            <Loader2 data-icon="inline-start" />
          ) : (
            <LogOut data-icon="inline-start" />
          )}
          {m.mobile_profile_logout()}
        </Button>
      </footer>
    </MobileAuthFrame>
  )
}

function MobileAuthUnavailable() {
  return (
    <MobileAuthFrame muted>
      <section className="flex flex-1 flex-col justify-center px-4">
        <div className="flex flex-col items-center gap-5 text-center">
          <div className="grid size-16 place-items-center rounded-full bg-muted text-muted-foreground">
            <CloudOff />
          </div>
          <div className="flex flex-col gap-2">
            <h1 className="text-xl font-semibold tracking-normal">
              {m.mobile_dashboard_error_title()}
            </h1>
            <p className="max-w-80 text-sm leading-6 text-muted-foreground">
              {m.mobile_dashboard_error_description()}
            </p>
          </div>
        </div>
      </section>
    </MobileAuthFrame>
  )
}

function ProfileCard({
  onClick,
  profile,
}: {
  onClick: () => void
  profile: UserProfile
}) {
  const displayName = getProfileDisplayName(profile)
  const roleLabel = getMobileProfileRoleLabel(profile.role)
  const photoUrl = resolveAvatarSrc(profile.photoUrl)

  return (
    <Card
      className="cursor-pointer rounded-2xl border-border bg-card shadow-sm"
      onClick={onClick}
      size="sm"
    >
      <CardContent className="flex items-center gap-3 px-0">
        <Avatar className="size-12" size="lg">
          {photoUrl && (
            <AvatarImage alt={displayName || profile.label} src={photoUrl} />
          )}
          <AvatarFallback className="bg-brand-soft text-brand-dark">
            {getInitials(displayName || profile.label)}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 items-center gap-2">
            <div className="truncate text-sm font-semibold">
              {displayName || profile.label}
            </div>
            <Badge variant={getMobileProfileBadgeVariant(profile.role)}>
              {roleLabel}
            </Badge>
          </div>
          <div className="mt-1 truncate text-xs text-muted-foreground">
            {profile.schoolName ?? m.auth_school_pending()}
          </div>
        </div>
        <ChevronRight className="text-muted-foreground" />
      </CardContent>
    </Card>
  )
}

function getMobileProfileRoleLabel(role: string) {
  if (role === "STUDENT") {
    return m.mobile_workspace_student()
  }

  if (role === "TEACHER") {
    return m.mobile_workspace_teacher()
  }

  return m.mobile_workspace_parent()
}

function getMobileProfileBadgeVariant(
  role: string
): React.ComponentProps<typeof Badge>["variant"] {
  if (role === "STUDENT") return "student"
  if (role === "TEACHER") return "teacher"
  return "parent"
}

function SplashScreen({
  credentialsHref,
  onContinue,
}: {
  credentialsHref: string
  onContinue: () => void
}) {
  return (
    <MobileAuthFrame dark>
      <section className="relative flex flex-1 flex-col items-center justify-center overflow-hidden text-center text-white">
        <div className="pointer-events-none absolute -top-32 -right-48 size-[30rem] rounded-full bg-primary/20 blur-3xl" />
        <div className="relative z-10 flex flex-col items-center gap-5 px-8">
          <LernnLogo inverted size={48} />
          <p className="max-w-72 text-base leading-7 font-medium text-white/75">
            {m.auth_splash_tagline()}
          </p>
        </div>
        <footer className="absolute right-6 bottom-9 left-6 z-20 flex flex-col gap-2 pb-[env(safe-area-inset-bottom)]">
          <Button
            asChild
            className="w-full touch-manipulation"
            onClick={onContinue}
            size="lg"
          >
            <a href={credentialsHref}>{m.auth_login_action()}</a>
          </Button>
          <p className="text-center text-xs text-white/55">
            {m.auth_splash_methods()}
          </p>
        </footer>
      </section>
    </MobileAuthFrame>
  )
}

function CardLoginScanner({
  error,
  isPending,
  onBack,
  onCardCode,
  onCardPayload,
  onError,
}: {
  error: string | null
  isPending: boolean
  onBack: () => void
  onCardCode: (code: string) => void
  onCardPayload: (payload: CardLoginInput) => void
  onError: (message: string | null) => void
}) {
  const scanLocked = useRef(false)
  const [manualOpen, setManualOpen] = useState(false)
  const [manualCode, setManualCode] = useState("")

  const handleScan = useCallback(
    (rawText: string) => {
      if (scanLocked.current || isPending) return

      scanLocked.current = true
      const payload = parseCardLoginPayload(rawText)

      if (!payload) {
        onError(m.auth_card_login_invalid_qr())
        window.setTimeout(() => {
          scanLocked.current = false
        }, 1800)
        return
      }

      onError(null)
      onCardPayload(payload)
    },
    [isPending, onCardPayload, onError]
  )

  useEffect(() => {
    if (!isPending) {
      scanLocked.current = false
    }
  }, [isPending])

  const scanner = useQrScanner({
    onScan: handleScan,
    enabled: !isPending && !manualOpen,
  })

  function handleManualSubmit() {
    const code = normalizeCardCode(manualCode)

    if (!code) {
      onError(m.auth_card_login_manual_payload_required())
      return
    }

    setManualOpen(false)
    setManualCode("")
    onError(null)
    onCardCode(code)
  }

  return (
    <div className="min-h-svh bg-black text-white">
      <div className="hidden min-h-svh items-center justify-center px-8 text-center 2xl:flex">
        <div className="flex max-w-sm flex-col items-center gap-5">
          <LernnLogo inverted size={30} />
          <div className="grid size-14 place-items-center rounded-2xl bg-white/10 text-white/70">
            <Smartphone />
          </div>
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-semibold tracking-normal">
              {m.app_desktop_title()}
            </h1>
            <p className="text-sm leading-6 text-white/60">
              {m.app_desktop_description()}
            </p>
          </div>
        </div>
      </div>

      <main className="mobile-device-shell relative mx-auto h-svh w-full overflow-hidden bg-black 2xl:hidden">
        <ScannerCameraViewport scanner={scanner} />
        <ScannerScanFrame isActive={scanner.state === "active" && !isPending} />

        <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between bg-gradient-to-b from-black/70 to-transparent px-4 pt-[max(env(safe-area-inset-top),1rem)] pb-4">
          <Button
            aria-label={m.auth_back()}
            className="rounded-full bg-white/10 text-white"
            onClick={onBack}
            size="icon-lg"
            type="button"
            variant="ghost"
          >
            <X data-icon="icon" />
          </Button>
          <span className="rounded-full bg-black/40 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm">
            {m.auth_card_login_title()}
          </span>
          <div className="size-9" />
        </div>

        <div className="pointer-events-none absolute inset-x-6 bottom-24 z-10 flex flex-col items-center gap-3">
          <p className="rounded-full bg-black/45 px-4 py-2 text-center text-sm text-white/75 backdrop-blur-sm">
            {isPending
              ? m.auth_card_login_processing()
              : m.auth_card_login_description()}
          </p>
          {error && !manualOpen && (
            <p className="rounded-xl border border-destructive/30 bg-destructive/20 px-3 py-2 text-center text-xs text-white backdrop-blur-sm">
              {error}
            </p>
          )}
        </div>

        <div className="absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/75 to-transparent px-5 pt-10 pb-[max(env(safe-area-inset-bottom),1.5rem)]">
          <Button
            className="w-full"
            onClick={() => {
              onError(null)
              setManualOpen(true)
            }}
            size="lg"
            type="button"
          >
            <Keyboard data-icon="inline-start" />
            {m.auth_card_login_pending_action()}
          </Button>
        </div>

        <CardLoginManualDrawer
          code={manualCode}
          error={error}
          isPending={isPending}
          onCodeChange={setManualCode}
          onOpenChange={(open) => {
            setManualOpen(open)
            if (!open) setManualCode("")
          }}
          onSubmit={handleManualSubmit}
          open={manualOpen}
        />
      </main>
    </div>
  )
}

function CardLoginManualDrawer({
  code,
  error,
  isPending,
  onCodeChange,
  onOpenChange,
  onSubmit,
  open,
}: {
  code: string
  error: string | null
  isPending: boolean
  onCodeChange: (code: string) => void
  onOpenChange: (open: boolean) => void
  onSubmit: () => void
  open: boolean
}) {
  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter" && code.trim() && !isPending) {
      event.preventDefault()
      onSubmit()
    }
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>{m.auth_card_login_manual_title()}</DrawerTitle>
          <DrawerDescription>
            {m.auth_card_login_manual_description()}
          </DrawerDescription>
        </DrawerHeader>
        <div className="overflow-y-auto px-4 pb-2">
          <FieldGroup>
            <Field data-invalid={!!error}>
              <FieldLabel htmlFor="card-login-code">
                {m.auth_card_login_manual_label()}
              </FieldLabel>
              <InputGroup className="h-11 rounded-xl bg-background">
                <InputGroupAddon>
                  <CreditCard />
                </InputGroupAddon>
                <InputGroupInput
                  autoCapitalize="characters"
                  autoFocus
                  className="h-10 text-base"
                  id="card-login-code"
                  onChange={(event) => onCodeChange(event.target.value)}
                  onKeyDown={handleKeyDown}
                  value={code}
                />
              </InputGroup>
              <FieldError>{error}</FieldError>
            </Field>
          </FieldGroup>
        </div>
        <DrawerFooter className="flex-row justify-end gap-2 pt-4">
          <Button
            disabled={isPending}
            onClick={() => onOpenChange(false)}
            type="button"
            variant="outline"
          >
            {m.mobile_cancel()}
          </Button>
          <Button
            disabled={isPending || !code.trim()}
            onClick={onSubmit}
            type="button"
          >
            {isPending && <Loader2 data-icon="inline-start" />}
            {m.auth_card_login_manual_submit()}
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

function normalizeCardCode(code: string) {
  return code.trim().toUpperCase().replace(/\s+/g, "")
}

function MobileLoadingScreen() {
  return (
    <MobileAuthFrame muted>
      <section className="flex flex-1 flex-col gap-5 py-6">
        <Skeleton className="h-8 w-24" />
        <div className="flex flex-col gap-2">
          <Skeleton className="h-8 w-52" />
          <Skeleton className="h-4 w-72" />
        </div>
        <div className="flex flex-col gap-3">
          <Skeleton className="h-20 w-full rounded-2xl" />
          <Skeleton className="h-20 w-full rounded-2xl" />
          <Skeleton className="h-20 w-full rounded-2xl" />
        </div>
      </section>
    </MobileAuthFrame>
  )
}

function NotificationPermissionScreen({
  onContinue,
  profile,
}: {
  locale: AppLocale
  onContinue: () => void
  profile: UserProfile
}) {
  const displayName = getProfileDisplayName(profile) || profile.label
  const handleAllowNotifications = () => {
    rememberNotificationOnboarding(profile)
    requestNotificationPermission()
    onContinue()
  }
  const handleContinue = () => {
    rememberNotificationOnboarding(profile)
    onContinue()
  }

  return (
    <MobileAuthFrame>
      <header className="flex justify-end pt-2">
        <Button
          onClick={handleContinue}
          size="sm"
          type="button"
          variant="ghost"
        >
          {m.auth_skip()}
        </Button>
      </header>
      <section className="flex flex-1 flex-col items-center justify-center gap-6 px-4 text-center">
        <div className="relative grid size-22 place-items-center rounded-full bg-brand-soft text-brand-dark">
          <span className="relative grid place-items-center">
            <Bell className="size-7" />
            <span className="absolute -top-1 -right-1 size-3 rounded-full border-2 border-brand-soft bg-destructive" />
          </span>
        </div>
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold tracking-normal">
            {m.auth_notifications_title()}
          </h1>
          <p className="max-w-80 text-sm leading-6 text-muted-foreground">
            {m.auth_notifications_description({ name: displayName })}
          </p>
        </div>
        <ul className="flex flex-col gap-2 text-left text-sm">
          {[
            m.auth_notifications_presence(),
            m.auth_notifications_grades(),
            m.auth_notifications_payments(),
          ].map((label) => (
            <li className="flex items-center gap-2" key={label}>
              <Check className="text-brand-dark" />
              {label}
            </li>
          ))}
        </ul>
      </section>
      <footer className="flex flex-col gap-2 pb-[env(safe-area-inset-bottom)]">
        <Button onClick={handleAllowNotifications} size="lg" type="button">
          {m.auth_notifications_allow()}
        </Button>
        <Button
          onClick={handleContinue}
          size="lg"
          type="button"
          variant="ghost"
        >
          {m.auth_later()}
        </Button>
      </footer>
    </MobileAuthFrame>
  )
}

function requestNotificationPermission() {
  if (typeof Notification === "undefined") return
  if (Notification.permission !== "default") return

  void Notification.requestPermission().catch(() => undefined)
}

function shouldShowNotificationOnboarding(profile: UserProfile) {
  if (typeof window === "undefined") return true
  if (
    typeof Notification !== "undefined" &&
    Notification.permission !== "default"
  ) {
    return false
  }
  return localStorage.getItem(getNotificationOnboardingKey(profile)) !== "done"
}

function rememberNotificationOnboarding(profile: UserProfile) {
  if (typeof window === "undefined") return
  localStorage.setItem(getNotificationOnboardingKey(profile), "done")
}

function getNotificationOnboardingKey(profile: UserProfile) {
  return `lernn-mobile-demo:notification-onboarding:${profile.schoolId ?? "school"}:${profile.id}`
}

function NoSpaceScreen({
  onRetry,
}: {
  locale: AppLocale
  onRetry: () => void
}) {
  return (
    <MobileAuthFrame>
      <header className="pt-2">
        <LernnLogo size={22} />
      </header>
      <section className="flex flex-1 flex-col justify-center px-4">
        <NoSpacePanel
          action={
            <Button onClick={onRetry} type="button" variant="outline">
              <RefreshCw data-icon="inline-start" />
              {m.auth_retry()}
            </Button>
          }
        />
      </section>
      <footer className="pb-[env(safe-area-inset-bottom)]">
        <Button
          className="w-full"
          onClick={onRetry}
          type="button"
          variant="ghost"
        >
          {m.auth_back_to_login()}
        </Button>
      </footer>
    </MobileAuthFrame>
  )
}

function NoSpacePanel({ action }: { action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-5 text-center">
      <div className="grid size-16 place-items-center rounded-full bg-brand-soft text-brand-dark">
        <Smartphone />
      </div>
      <div className="flex flex-col gap-2">
        <h1 className="text-xl font-semibold tracking-normal">
          {m.auth_no_profile_title()}
        </h1>
        <p className="max-w-80 text-sm leading-6 text-muted-foreground">
          {m.auth_no_profile_description()}
        </p>
      </div>
      {action}
    </div>
  )
}

function MobileAuthFrame({
  children,
  dark = false,
  muted = false,
}: {
  children: ReactNode
  dark?: boolean
  muted?: boolean
}) {
  return (
    <div
      className={cn(
        "min-h-svh text-foreground",
        dark ? "bg-hero-bg" : muted ? "bg-canvas-alt" : "bg-background"
      )}
    >
      <div className="hidden min-h-svh items-center justify-center px-8 text-center 2xl:flex">
        <div className="flex max-w-sm flex-col items-center gap-5">
          <LernnLogo size={30} />
          <div className="grid size-14 place-items-center rounded-2xl bg-brand-soft text-brand-dark">
            <Smartphone />
          </div>
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-semibold tracking-normal">
              {m.app_desktop_title()}
            </h1>
            <p className="text-sm leading-6 text-muted-foreground">
              {m.app_desktop_description()}
            </p>
          </div>
        </div>
      </div>
      <main
        className={cn(
          "mobile-device-shell mx-auto flex min-h-svh w-full flex-col 2xl:hidden",
          dark ? "bg-hero-bg p-0" : "px-5 py-6"
        )}
      >
        {children}
      </main>
    </div>
  )
}

function getInitials(value: string) {
  return value
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
}
