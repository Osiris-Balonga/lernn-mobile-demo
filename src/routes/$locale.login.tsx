import { createFileRoute } from "@tanstack/react-router"

import { LoginScreenRoute } from "@/features/auth/auth-routes"

export const Route = createFileRoute("/$locale/login")({
  component: LoginRoute,
})

function LoginRoute() {
  const { locale } = Route.useParams()
  const searchParams =
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search)
      : null
  const initialStep =
    searchParams?.get("step") === "credentials" ? "credentials" : undefined
  const returnTo = searchParams?.get("returnTo") ?? undefined

  return (
    <LoginScreenRoute
      initialStep={initialStep}
      locale={locale}
      returnTo={returnTo}
    />
  )
}
