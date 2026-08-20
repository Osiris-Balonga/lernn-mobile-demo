import { useCallback, useEffect, useState } from "react"

export type QrScannerState =
  | "idle"
  | "requesting"
  | "active"
  | "error"
  | "unsupported"

interface UseQrScannerOptions {
  onScan: (rawText: string) => void
  enabled?: boolean
}

export interface QrScannerHandle {
  state: QrScannerState
  errorMessage: string | null
  enabled: boolean
  onScan: (rawText: string) => void
  markActive: () => void
  markError: (message: string) => void
  markUnsupported: () => void
}

export function useQrScanner({
  onScan,
  enabled = true,
}: UseQrScannerOptions): QrScannerHandle {
  const [state, setState] = useState<QrScannerState>("idle")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    if (enabled) {
      setState("requesting")
      setErrorMessage(null)
      return
    }

    setState("idle")
  }, [enabled])

  const markActive = useCallback(() => {
    setState((current) => (current === "active" ? current : "active"))
  }, [])

  const markError = useCallback((message: string) => {
    setErrorMessage(message)
    setState("error")
  }, [])

  const markUnsupported = useCallback(() => {
    setState("unsupported")
  }, [])

  return {
    state,
    errorMessage,
    enabled,
    onScan,
    markActive,
    markError,
    markUnsupported,
  }
}
