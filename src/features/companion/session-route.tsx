import { useMemo } from "react"
import {
  AlertTriangle,
  CheckCircle2,
  Link2,
  Loader2,
  LogIn,
  QrCode,
  RefreshCw,
} from "lucide-react"
import { useMutation, useQuery } from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"

import { LernnLogo } from "@/components/brand"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { fetchMe } from "@/features/auth/api"
import {
  ApiError,
  getApiErrorMessage,
  isUnauthorizedApiError,
  setSchoolIdGetter,
} from "@/lib/api-client"
import { getLocale } from "@/paraglide/runtime"

import { bindCompanionSessionToken, fetchCompanionSessionByToken } from "./api"
import {
  companionCopy,
  formatCompanionExpiry,
  getCompanionActionDescription,
  getCompanionSessionTitle,
} from "./copy"
import {
  rememberCompanionSession,
  setSelectedCompanionSession,
} from "./session-store"
import type { CompanionRouteState, CompanionSession } from "./types"

export function CompanionSessionRoute({ token }: { token: string }) {
  const navigate = useNavigate()
  const locale = getLocale()
  const copy = companionCopy(locale)
  const sessionQuery = useQuery({
    queryKey: ["companion-session", token],
    queryFn: () => fetchCompanionSessionByToken(token),
    retry: false,
  })
  const meQuery = useQuery({
    queryKey: ["auth", "me"],
    queryFn: fetchMe,
    retry: false,
  })
  const routeState = useMemo(
    () => getCompanionRouteState(sessionQuery.error),
    [sessionQuery.error]
  )
  const authenticated = Boolean(meQuery.data)

  const bindMutation = useMutation({
    mutationFn: () => bindCompanionSessionToken(token),
    onSuccess: (session) => openSession(session),
  })

  function openSession(session: CompanionSession) {
    rememberCompanionSession(session)
    setSelectedCompanionSession(session.id)
    setSchoolIdGetter(() => null)
    void navigate({
      to: "/$locale/app/$section",
      params: { locale, section: "home" },
      replace: true,
    })
  }

  function signInToBind() {
    const returnTo = `/companion/${encodeURIComponent(token)}`
    window.location.assign(
      `/${locale}/login?step=credentials&returnTo=${encodeURIComponent(returnTo)}`
    )
  }

  return (
    <div className="min-h-svh bg-canvas-alt text-foreground">
      <div className="hidden min-h-svh items-center justify-center px-8 text-center 2xl:flex">
        <div className="flex max-w-sm flex-col items-center gap-5">
          <LernnLogo size={30} />
          <div className="grid size-14 place-items-center rounded-2xl bg-brand-soft text-brand-dark">
            <QrCode />
          </div>
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-semibold tracking-normal">
              {locale === "en" ? "Mobile only" : "Disponible sur mobile"}
            </h1>
            <p className="text-sm leading-6 text-muted-foreground">
              {locale === "en"
                ? "Open this link from a mobile device."
                : "Ouvrez ce lien depuis un telephone."}
            </p>
          </div>
        </div>
      </div>
      <main className="mobile-device-shell mx-auto flex min-h-svh w-full flex-col px-5 py-6 2xl:hidden">
        <header className="flex items-center justify-between">
          <LernnLogo size={22} />
          <Badge variant="secondary">{copy.companion}</Badge>
        </header>

        <section className="flex flex-1 flex-col justify-center gap-5 py-8">
          {sessionQuery.isLoading ? (
            <CompanionRouteSkeleton />
          ) : sessionQuery.data ? (
            <Card variant="dark">
              <CardContent className="flex flex-col gap-4 px-0">
                <div className="flex items-start gap-3">
                  <Badge className="size-9 p-0" variant="secondary">
                    <Link2 />
                  </Badge>
                  <div className="min-w-0 flex-1">
                    <h1 className="text-xl leading-tight font-semibold tracking-normal">
                      {getCompanionSessionTitle(sessionQuery.data)}
                    </h1>
                    <p className="mt-1 text-sm text-white/70">
                      {copy.companion}
                    </p>
                  </div>
                </div>
                <p className="text-sm leading-6 text-white/75">
                  {getCompanionActionDescription(sessionQuery.data.action)}
                </p>
                <Badge className="w-fit" variant="secondary">
                  {formatCompanionExpiry(sessionQuery.data, locale)}
                </Badge>
              </CardContent>
            </Card>
          ) : (
            <CompanionRouteMessage state={routeState} />
          )}

          {sessionQuery.data && (
            <div className="flex flex-col gap-3">
              <Card size="sm">
                <CardContent className="flex items-start gap-3 px-0">
                  <Badge className="size-8 p-0" variant="neutral">
                    <CheckCircle2 />
                  </Badge>
                  <p className="text-sm leading-6 text-muted-foreground">
                    {copy.bindDescription}
                  </p>
                </CardContent>
              </Card>
              <Button
                disabled={bindMutation.isPending || meQuery.isLoading}
                onClick={() => {
                  if (authenticated) {
                    bindMutation.mutate()
                    return
                  }
                  signInToBind()
                }}
                size="lg"
                type="button"
              >
                {bindMutation.isPending || meQuery.isLoading ? (
                  <Loader2 data-icon="inline-start" />
                ) : authenticated ? (
                  <Link2 data-icon="inline-start" />
                ) : (
                  <LogIn data-icon="inline-start" />
                )}
                {authenticated ? copy.bind : copy.loginToBind}
              </Button>
              {authenticated && (
                <Button
                  disabled={bindMutation.isPending}
                  onClick={() => openSession(sessionQuery.data)}
                  size="lg"
                  type="button"
                  variant="outline"
                >
                  <QrCode data-icon="inline-start" />
                  {copy.openTemporary}
                </Button>
              )}
            </div>
          )}

          {!sessionQuery.data && routeState === "unauthenticated" && (
            <Button onClick={signInToBind} size="lg" type="button">
              <LogIn data-icon="inline-start" />
              {copy.loginToBind}
            </Button>
          )}

          {bindMutation.isError && (
            <p className="rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive">
              {bindMutation.error instanceof ApiError
                ? getApiErrorMessage(bindMutation.error)
                : copy.unavailable}
            </p>
          )}
        </section>
      </main>
    </div>
  )
}

function CompanionRouteSkeleton() {
  return (
    <Card size="sm">
      <CardContent className="flex flex-col gap-3 px-0">
        <Skeleton className="h-5 w-2/3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-8 w-28" />
      </CardContent>
    </Card>
  )
}

function CompanionRouteMessage({ state }: { state: CompanionRouteState }) {
  const locale = getLocale()

  return (
    <Card size="sm">
      <CardContent className="flex items-start gap-3 px-0">
        <Badge
          className="size-8 p-0"
          variant={state === "unavailable" ? "warning" : "destructive"}
        >
          {state === "unavailable" ? <RefreshCw /> : <AlertTriangle />}
        </Badge>
        <div className="min-w-0">
          <div className="text-sm font-semibold">
            {locale === "en" ? "Companion session" : "Session compagnon"}
          </div>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            {getRouteStateMessage(state, locale)}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

function getCompanionRouteState(error: unknown): CompanionRouteState {
  if (!error) return "ready"
  if (isUnauthorizedApiError(error)) return "unauthenticated"

  if (error instanceof ApiError) {
    if (error.status === 403) return "forbidden"
    if (error.status === 404) return "invalid"
    if (error.status === 410) return "expired"
  }

  return "unavailable"
}

function getRouteStateMessage(state: CompanionRouteState, locale: "fr" | "en") {
  const copy = companionCopy(locale)

  switch (state) {
    case "expired":
    case "invalid":
      return copy.invalid
    case "forbidden":
      return copy.forbidden
    case "unauthenticated":
      return locale === "en"
        ? "Sign in before linking this session."
        : "Connectez-vous avant de lier cette session."
    case "unavailable":
      return copy.unavailable
    default:
      return copy.loading
  }
}
