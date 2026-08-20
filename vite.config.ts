import path from "path"
import { paraglideVitePlugin } from "@inlang/paraglide-js"
import { TanStackRouterVite } from "@tanstack/router-plugin/vite"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

const githubPagesBase = "/lernn-mobile-demo/"

function vendorChunk(id: string) {
  const normalizedId = id.replaceAll("\\", "/")
  if (!normalizedId.includes("/node_modules/")) return undefined
  if (
    normalizedId.includes("/react/") ||
    normalizedId.includes("/react-dom/")
  ) {
    return "vendor-react"
  }
  if (normalizedId.includes("/@tanstack/")) return "vendor-tanstack"
  if (
    normalizedId.includes("/radix-ui/") ||
    normalizedId.includes("/@radix-ui/")
  ) {
    return "vendor-radix"
  }
  if (normalizedId.includes("/recharts/")) return "vendor-charts"
  if (normalizedId.includes("/lucide-react/")) return "vendor-icons"
  return undefined
}

// https://vite.dev/config/
export default defineConfig(({ command, isPreview }) => {
  const base = command === "build" || isPreview ? githubPagesBase : "/"

  return {
    base,
    build: {
      rollupOptions: {
        output: {
          manualChunks: vendorChunk,
        },
      },
    },
    server: {
      port: 7610,
      strictPort: true,
    },
    preview: {
      port: 7610,
      strictPort: true,
    },
    plugins: [
      TanStackRouterVite({
        routesDirectory: "./src/routes",
        generatedRouteTree: "./src/routeTree.gen.ts",
      }),
      react(),
      paraglideVitePlugin({
        project: "./project.inlang",
        outdir: "./src/paraglide",
        strategy: ["url", "baseLocale"],
        urlPatterns: [
          {
            pattern: ":protocol://:domain(.*)::port?/:path(.*)?",
            localized: [
              ["en", ":protocol://:domain(.*)::port?/en/:path(.*)?"],
              ["fr", ":protocol://:domain(.*)::port?/fr/:path(.*)?"],
            ],
          },
        ],
      }),
      tailwindcss(),
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  }
})
