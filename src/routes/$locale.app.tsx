import { createFileRoute, Outlet, redirect } from "@tanstack/react-router"

export const Route = createFileRoute("/$locale/app")({
  beforeLoad: ({ location, params }) => {
    const appPath = `/${params.locale}/app`
    const currentPath = location.pathname.replace(/\/+$/, "")

    if (currentPath === appPath) {
      throw redirect({
        to: "/$locale/app/$section",
        params: { locale: params.locale, section: "home" },
        replace: true,
      })
    }
  },
  component: Outlet,
})
