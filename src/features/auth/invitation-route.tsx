import { useEffect, useState } from "react"
import { AlertTriangle, CheckCircle2, Loader2, School } from "lucide-react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"

import { LernnLogo } from "@/components/brand"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { ApiError, getApiErrorMessage } from "@/lib/api-client"

import { fetchProfiles } from "./api"
import {
  acceptInvitation,
  validateInvitation,
  type InvitationData,
} from "./invitations"
import { setCachedAuthUser, setCachedProfiles } from "./session"

export function MobileInvitationRoute({
  locale,
  token,
}: {
  locale: "fr" | "en"
  token: string
}) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const invitationQuery = useQuery({
    queryKey: ["invitation", token],
    queryFn: () => validateInvitation(token),
    retry: false,
  })
  const invitation = invitationQuery.data
  const [email, setEmail] = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [password, setPassword] = useState("")

  useEffect(() => {
    if (!invitation) return
    setEmail(invitation.email ?? "")
    setFirstName(invitation.firstName ?? "")
    setLastName(invitation.lastName ?? "")
  }, [invitation])

  const acceptMutation = useMutation({
    mutationFn: () =>
      acceptInvitation(token, {
        email: invitation?.type === "LINK" ? email.trim() : undefined,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        password,
      }),
    onSuccess: async (user) => {
      setCachedAuthUser(user)
      queryClient.setQueryData(["auth", "me"], user)
      const profiles = await queryClient.fetchQuery({
        queryKey: ["auth", "profiles"],
        queryFn: () => fetchProfiles("personal"),
      })
      setCachedProfiles(profiles)
      await navigate({
        to: "/$locale/app/$section",
        params: { locale, section: profiles.length ? "home" : "profile" },
        replace: true,
      })
    },
  })
  const canSubmit =
    Boolean(invitation) &&
    firstName.trim().length > 0 &&
    lastName.trim().length > 0 &&
    password.length >= 8 &&
    (invitation?.type !== "LINK" || email.includes("@"))

  return (
    <div className="min-h-svh bg-canvas-alt text-foreground">
      <div className="hidden min-h-svh items-center justify-center px-8 text-center 2xl:flex">
        <div className="flex max-w-sm flex-col items-center gap-5">
          <LernnLogo size={30} />
          <div className="grid size-14 place-items-center rounded-2xl bg-brand-soft text-brand-dark">
            <School />
          </div>
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-semibold tracking-normal">
              {locale === "en" ? "Mobile only" : "Disponible sur mobile"}
            </h1>
            <p className="text-sm leading-6 text-muted-foreground">
              {locale === "en"
                ? "Open this invitation from a mobile device."
                : "Ouvrez cette invitation depuis un telephone."}
            </p>
          </div>
        </div>
      </div>
      <main className="mobile-device-shell mx-auto flex min-h-svh w-full flex-col px-5 py-6 2xl:hidden">
        <header className="flex items-center justify-between">
          <LernnLogo size={22} />
          <Badge variant="secondary">
            {locale === "en" ? "Invitation" : "Invitation"}
          </Badge>
        </header>

        <section className="flex flex-1 flex-col justify-center gap-5 py-8">
          {invitationQuery.isLoading ? (
            <InvitationSkeleton />
          ) : invitation ? (
            <InvitationCard invitation={invitation} locale={locale} />
          ) : (
            <InvitationError error={invitationQuery.error} locale={locale} />
          )}

          {invitation && (
            <form
              className="flex flex-col gap-4"
              onSubmit={(event) => {
                event.preventDefault()
                if (canSubmit) acceptMutation.mutate()
              }}
            >
              <Card size="sm">
                <CardContent className="px-0">
                  <FieldGroup>
                    {invitation.type === "LINK" && (
                      <Field>
                        <FieldLabel>Email</FieldLabel>
                        <Input
                          autoComplete="email"
                          inputMode="email"
                          onChange={(event) => setEmail(event.target.value)}
                          required
                          type="email"
                          value={email}
                        />
                      </Field>
                    )}
                    <Field>
                      <FieldLabel>
                        {locale === "en" ? "First name" : "Prenom"}
                      </FieldLabel>
                      <Input
                        autoComplete="given-name"
                        onChange={(event) => setFirstName(event.target.value)}
                        required
                        value={firstName}
                      />
                    </Field>
                    <Field>
                      <FieldLabel>
                        {locale === "en" ? "Last name" : "Nom"}
                      </FieldLabel>
                      <Input
                        autoComplete="family-name"
                        onChange={(event) => setLastName(event.target.value)}
                        required
                        value={lastName}
                      />
                    </Field>
                    <Field>
                      <FieldLabel>
                        {locale === "en" ? "Password" : "Mot de passe"}
                      </FieldLabel>
                      <Input
                        autoComplete="new-password"
                        minLength={8}
                        onChange={(event) => setPassword(event.target.value)}
                        required
                        type="password"
                        value={password}
                      />
                      <FieldDescription>
                        {locale === "en"
                          ? "At least 8 characters."
                          : "Au moins 8 caracteres."}
                      </FieldDescription>
                    </Field>
                  </FieldGroup>
                </CardContent>
              </Card>
              {acceptMutation.error && (
                <p className="rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                  {formatInvitationError(acceptMutation.error, locale)}
                </p>
              )}
              <Button
                disabled={!canSubmit || acceptMutation.isPending}
                size="lg"
                type="submit"
              >
                {acceptMutation.isPending ? (
                  <Loader2 data-icon="inline-start" />
                ) : (
                  <CheckCircle2 data-icon="inline-start" />
                )}
                {locale === "en"
                  ? "Accept invitation"
                  : "Accepter l'invitation"}
              </Button>
            </form>
          )}
        </section>
      </main>
    </div>
  )
}

function InvitationCard({
  invitation,
  locale,
}: {
  invitation: InvitationData
  locale: "fr" | "en"
}) {
  return (
    <Card variant="dark">
      <CardContent className="flex flex-col gap-4 px-0">
        <div className="flex items-start gap-3">
          <Badge className="size-9 p-0" variant="secondary">
            <School />
          </Badge>
          <div className="min-w-0 flex-1">
            <h1 className="text-xl leading-tight font-semibold tracking-normal">
              {invitation.schoolName}
            </h1>
            <p className="mt-1 text-sm text-white/70">
              {invitation.organizationName}
            </p>
          </div>
        </div>
        <p className="text-sm leading-6 text-white/75">
          {locale === "en"
            ? "Complete the form to link this school to your Lernn account."
            : "Completez le formulaire pour rattacher cette ecole a votre compte Lernn."}
        </p>
        <Badge className="w-fit" variant="secondary">
          {getInvitationRoleLabel(invitation.assignedRole, locale)}
        </Badge>
      </CardContent>
    </Card>
  )
}

function InvitationSkeleton() {
  return (
    <Card size="sm">
      <CardContent className="flex flex-col gap-3 px-0">
        <Skeleton className="h-5 w-2/3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </CardContent>
    </Card>
  )
}

function InvitationError({
  error,
  locale,
}: {
  error: unknown
  locale: "fr" | "en"
}) {
  return (
    <Card size="sm">
      <CardContent className="flex items-start gap-3 px-0">
        <Badge className="size-8 p-0" variant="destructive">
          <AlertTriangle />
        </Badge>
        <div className="min-w-0">
          <div className="text-sm font-semibold">
            {locale === "en"
              ? "Invitation unavailable"
              : "Invitation indisponible"}
          </div>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            {formatInvitationError(error, locale)}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

function formatInvitationError(error: unknown, locale: "fr" | "en") {
  if (error instanceof ApiError) {
    return getApiErrorMessage(error)
  }

  return locale === "en"
    ? "Unable to load this invitation."
    : "Impossible de charger cette invitation."
}

function getInvitationRoleLabel(role: string, locale: "fr" | "en") {
  if (role === "PARENT") return locale === "en" ? "Parent" : "Parent"
  if (role === "STUDENT") return locale === "en" ? "Student" : "Eleve"
  if (role === "TEACHER") return locale === "en" ? "Teacher" : "Professeur"
  return role
}
