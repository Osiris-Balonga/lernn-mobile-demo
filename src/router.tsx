import { createRouter } from "@tanstack/react-router"
import type { QueryClient } from "@tanstack/react-query"

import { routeTree } from "@/routeTree.gen"

export function createAppRouter(queryClient: QueryClient) {
  return createRouter({
    basepath: import.meta.env.BASE_URL.replace(/\/$/, "") || "/",
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreload: "intent",
    defaultPreloadStaleTime: 0,
  })
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof createAppRouter>
  }
}
