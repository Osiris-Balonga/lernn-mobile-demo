import { createFileRoute, redirect } from "@tanstack/react-router"

export const Route = createFileRoute("/$locale/")({
  beforeLoad: ({ params }) => {
    throw redirect({
      to: "/$locale/app/$section",
      params: { locale: params.locale, section: "home" },
      replace: true,
    })
  },
})
