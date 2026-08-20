import { useCallback, useEffect, useRef, useState } from "react"
import { ArrowLeft, Keyboard, QrCode, X } from "lucide-react"

import { ScannerCameraViewport } from "@/components/brand/scanner/scanner-camera-viewport"
import { ScannerScanFrame } from "@/components/brand/scanner/scanner-scan-frame"
import { Button } from "@/components/ui/button"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useQrScanner } from "@/hooks/use-qr-scanner"

import { companionCopy } from "./copy"
import { extractCompanionToken } from "./parse"

export function CompanionQrScannerPage({
  locale,
  onBack,
}: {
  locale: "fr" | "en"
  onBack: () => void
}) {
  const copy = companionCopy(locale)
  const scanLocked = useRef(false)
  const [manualToken, setManualToken] = useState("")
  const [manualOpen, setManualOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const openCompanionSession = useCallback((token: string) => {
    window.location.assign(`/companion/${encodeURIComponent(token)}`)
  }, [])

  const handleScan = useCallback(
    (rawText: string) => {
      if (scanLocked.current) return

      scanLocked.current = true
      const token = extractCompanionToken(rawText)
      if (!token) {
        setError(
          locale === "en"
            ? "This QR code is not a companion session."
            : "Ce QR code n'est pas une session compagnon."
        )
        window.setTimeout(() => {
          scanLocked.current = false
        }, 1800)
        return
      }

      setError(null)
      openCompanionSession(token)
    },
    [locale, openCompanionSession]
  )

  const scanner = useQrScanner({
    enabled: !manualOpen,
    onScan: handleScan,
  })

  useEffect(() => {
    if (!manualOpen) {
      setManualToken("")
      setError(null)
      scanLocked.current = false
    }
  }, [manualOpen])

  function submitManualToken() {
    const token = extractCompanionToken(manualToken)
    if (!token) {
      setError(
        locale === "en"
          ? "Paste a companion link or token."
          : "Collez un lien ou token compagnon."
      )
      return
    }

    openCompanionSession(token)
  }

  return (
    <main className="relative h-svh overflow-hidden bg-black text-white">
      <ScannerCameraViewport scanner={scanner} />
      <ScannerScanFrame isActive={scanner.state === "active" && !manualOpen} />

      <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between bg-gradient-to-b from-black/75 to-transparent px-4 pt-[max(env(safe-area-inset-top),1rem)] pb-4">
        <Button
          aria-label={locale === "en" ? "Back" : "Retour"}
          className="rounded-full bg-white/10 text-white"
          onClick={onBack}
          size="icon-lg"
          type="button"
          variant="ghost"
        >
          <X data-icon="icon" />
        </Button>
        <span className="rounded-full bg-black/45 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm">
          {copy.scanCompanionQr}
        </span>
        <div className="size-9" />
      </div>

      <div className="pointer-events-none absolute inset-x-6 bottom-28 z-10 flex flex-col items-center gap-3">
        <p className="rounded-full bg-black/50 px-4 py-2 text-center text-sm text-white/80 backdrop-blur-sm">
          {error ?? copy.scanHint}
        </p>
      </div>

      {manualOpen && (
        <div className="absolute inset-x-4 bottom-24 z-20 rounded-2xl border border-white/10 bg-background p-4 text-foreground shadow-2xl">
          <FieldGroup>
            <Field>
              <FieldLabel>
                {locale === "en" ? "Companion link" : "Lien compagnon"}
              </FieldLabel>
              <Input
                autoFocus
                onChange={(event) => setManualToken(event.target.value)}
                placeholder="/companion/..."
                value={manualToken}
              />
            </Field>
            {error && <p className="text-xs text-destructive">{error}</p>}
          </FieldGroup>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <Button
              onClick={() => setManualOpen(false)}
              type="button"
              variant="outline"
            >
              <ArrowLeft data-icon="inline-start" />
              {locale === "en" ? "Scan" : "Scanner"}
            </Button>
            <Button onClick={submitManualToken} type="button">
              {locale === "en" ? "Open" : "Ouvrir"}
            </Button>
          </div>
        </div>
      )}

      <div className="absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/80 to-transparent px-5 pt-10 pb-[max(env(safe-area-inset-bottom),1.5rem)]">
        <Button
          className="w-full bg-white/10 text-white hover:bg-white/15"
          onClick={() => {
            setManualOpen((value) => !value)
            setError(null)
          }}
          size="lg"
          type="button"
          variant="ghost"
        >
          {manualOpen ? (
            <QrCode data-icon="inline-start" />
          ) : (
            <Keyboard data-icon="inline-start" />
          )}
          {manualOpen
            ? locale === "en"
              ? "Use camera"
              : "Utiliser la caméra"
            : locale === "en"
              ? "Enter manually"
              : "Saisir manuellement"}
        </Button>
      </div>
    </main>
  )
}
