const configuredBase = import.meta.env.BASE_URL.replace(/\/$/, "")

export const appBasePath = configuredBase || "/"

export function withAppBase(path: string) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`
  return configuredBase ? `${configuredBase}${normalizedPath}` : normalizedPath
}

export function withoutAppBase(path: string) {
  if (!configuredBase) return path
  return path.startsWith(configuredBase)
    ? path.slice(configuredBase.length) || "/"
    : path
}
