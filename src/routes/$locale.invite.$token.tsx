import { createFileRoute } from "@tanstack/react-router"

import { MobileInvitationRoute } from "@/features/auth/invitation-route"

export const Route = createFileRoute("/$locale/invite/$token")({
  component: InvitationTokenRoute,
})

function InvitationTokenRoute() {
  const { locale, token } = Route.useParams()
  return <MobileInvitationRoute locale={locale} token={token} />
}
