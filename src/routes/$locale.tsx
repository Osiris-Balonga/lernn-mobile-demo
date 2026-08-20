import { createFileRoute, redirect } from "@tanstack/react-router"

import { getLocale, isLocale, setLocale } from "@/paraglide/runtime"
import { LocaleLayout } from "@/router-views"

export const Route = createFileRoute("/$locale")({
  params: {
    parse: ({ locale }) => {
      if (!isLocale(locale)) {
        throw redirect({ to: "/$locale/login", params: { locale: "fr" } })
      }
      return { locale }
    },
    stringify: ({ locale }) => ({ locale }),
  },
  beforeLoad: ({ params }) => {
    if (params.locale !== getLocale()) {
      setLocale(params.locale, { reload: false })
    }
    document.documentElement.setAttribute("lang", params.locale)
  },
  component: LocaleLayout,
})
