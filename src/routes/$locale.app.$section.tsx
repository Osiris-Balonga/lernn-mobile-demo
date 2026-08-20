import { createFileRoute, redirect } from "@tanstack/react-router"

import { AuthenticatedAppRoute } from "@/features/auth/auth-routes"

const appSections = new Set([
  "classes",
  "course-attendance",
  "evaluation-new",
  "evaluations",
  "gate-scanner",
  "grade-entry",
  "home",
  "notifications",
  "payments",
  "presence",
  "profile",
  "reports",
  "scan",
  "schedule",
  "subjects",
])

export const Route = createFileRoute("/$locale/app/$section")({
  beforeLoad: ({ params }) => {
    if (!appSections.has(params.section)) {
      throw redirect({
        to: "/$locale/app/$section",
        params: { locale: params.locale, section: "home" },
        replace: true,
      })
    }
  },
  component: AppSectionRoute,
})

function AppSectionRoute() {
  const { locale, section } = Route.useParams()
  return <AuthenticatedAppRoute locale={locale} section={section} />
}
