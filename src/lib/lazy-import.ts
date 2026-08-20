const CHUNK_RELOAD_PREFIX = "lernn-mobile:chunk-reload:"

export function isLazyChunkLoadError(error: unknown) {
  if (!(error instanceof Error)) return false

  return /chunkloaderror|failed to fetch dynamically imported module|importing a module script failed|loading chunk \d+ failed/i.test(
    `${error.name} ${error.message}`
  )
}

export async function importWithChunkReload<T>(
  chunkKey: string,
  importer: () => Promise<T>
): Promise<T> {
  const marker = `${CHUNK_RELOAD_PREFIX}${chunkKey}`

  try {
    const module = await importer()
    window.sessionStorage.removeItem(marker)
    return module
  } catch (error) {
    if (
      isLazyChunkLoadError(error) &&
      window.sessionStorage.getItem(marker) !== "attempted"
    ) {
      window.sessionStorage.setItem(marker, "attempted")
      window.location.reload()
      return new Promise<T>(() => undefined)
    }

    throw error
  }
}
