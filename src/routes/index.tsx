import { createFileRoute, redirect } from "@tanstack/react-router"

import { getLocale } from "@/paraglide/runtime"

export const Route = createFileRoute("/")({
  beforeLoad: () => {
    throw redirect({
      to: "/$locale/app/$section",
      params: { locale: getLocale(), section: "home" },
      replace: true,
    })
  },
})
