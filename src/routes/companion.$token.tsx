import { createFileRoute } from "@tanstack/react-router"

import { CompanionSessionRoute } from "@/features/companion/session-route"

export const Route = createFileRoute("/companion/$token")({
  component: CompanionTokenRoute,
})

function CompanionTokenRoute() {
  const { token } = Route.useParams()
  return <CompanionSessionRoute token={token} />
}
