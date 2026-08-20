import { useCallback, useRef, useState } from "react"
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  Keyboard,
  Loader2,
  X,
} from "lucide-react"
import { useMutation } from "@tanstack/react-query"

import { ScannerCameraViewport } from "@/components/brand/scanner/scanner-camera-viewport"
import { ScannerScanFrame } from "@/components/brand/scanner/scanner-scan-frame"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useQrScanner } from "@/hooks/use-qr-scanner"
import { apiClient, getApiErrorMessage } from "@/lib/api-client"
import { extractCardToken } from "./parse"

type ScanMode = "entry" | "exit"
type GateResult = {
  person: { firstName: string; lastName: string; photoUrl?: string | null }
  classGroup?: { code: string; name: string } | null
  isLate?: boolean
  noEntryRecorded?: boolean
}

export function CompanionGateScannerPage({
  locale,
  onBack,
  schoolId,
}: {
  locale: "fr" | "en"
  onBack: () => void
  schoolId: string
}) {
  const locked = useRef(false)
  const [mode, setMode] = useState<ScanMode>("entry")
  const [manualOpen, setManualOpen] = useState(false)
  const [manualToken, setManualToken] = useState("")
  const [result, setResult] = useState<GateResult | null>(null)

  const mutation = useMutation({
    mutationFn: ({ token, scanMode }: { token: string; scanMode: ScanMode }) =>
      apiClient
        .post<{ data: GateResult }>(
          `/schools/${schoolId}/presence/${scanMode}`,
          {
            cardToken: token,
            location: "MOBILE_FIELD",
          }
        )
        .then((response) => response.data),
    onSuccess: (value) => {
      setResult(value)
      setManualToken("")
      window.setTimeout(() => {
        locked.current = false
        setResult(null)
      }, 1800)
    },
    onError: () => {
      window.setTimeout(() => {
        locked.current = false
      }, 1800)
    },
  })

  const submit = useCallback(
    (rawValue: string) => {
      if (locked.current || mutation.isPending) return
      const token = extractCardToken(rawValue)
      if (!token) return
      locked.current = true
      mutation.mutate({ token, scanMode: mode })
    },
    [mode, mutation]
  )

  const scanner = useQrScanner({ enabled: !manualOpen, onScan: submit })
  const copy = gateCopy(locale)
  const error = mutation.error
  const errorText = error ? getApiErrorMessage(error) : null

  return (
    <main className="relative h-svh overflow-hidden bg-black text-white">
      <ScannerCameraViewport scanner={scanner} />
      <ScannerScanFrame isActive={scanner.state === "active" && !manualOpen} />

      <div className="absolute inset-x-0 top-0 z-20 flex items-center justify-between bg-gradient-to-b from-black/80 to-transparent px-4 pt-[max(env(safe-area-inset-top),1rem)] pb-10">
        <Button
          aria-label={copy.back}
          className="rounded-full bg-white/10 text-white"
          onClick={onBack}
          size="icon-lg"
          variant="ghost"
        >
          <X />
        </Button>
        <div className="rounded-full bg-black/55 p-1 backdrop-blur-sm">
          <Button
            className={mode === "entry" ? "bg-white text-black" : "text-white"}
            onClick={() => setMode("entry")}
            size="sm"
            variant="ghost"
          >
            <ArrowDownToLine /> {copy.entry}
          </Button>
          <Button
            className={mode === "exit" ? "bg-white text-black" : "text-white"}
            onClick={() => setMode("exit")}
            size="sm"
            variant="ghost"
          >
            <ArrowUpFromLine /> {copy.exit}
          </Button>
        </div>
        <div className="size-10" />
      </div>

      <div className="pointer-events-none absolute inset-x-5 bottom-28 z-20 flex justify-center">
        <div className="max-w-sm rounded-2xl bg-black/65 px-5 py-3 text-center backdrop-blur-sm">
          {mutation.isPending ? (
            <p className="flex items-center gap-2">
              <Loader2 className="animate-spin" /> {copy.saving}
            </p>
          ) : result ? (
            <div>
              <p className="font-semibold">
                {result.person.firstName} {result.person.lastName}
              </p>
              <p className="text-sm text-white/70">
                {result.classGroup?.name ?? copy.saved}
              </p>
            </div>
          ) : errorText ? (
            <p className="text-sm text-red-200">{errorText}</p>
          ) : (
            <p className="text-sm text-white/75">{copy.hint}</p>
          )}
        </div>
      </div>

      {manualOpen && (
        <div className="absolute inset-x-4 bottom-24 z-30 rounded-2xl bg-background p-4 text-foreground shadow-2xl">
          <Input
            autoFocus
            onChange={(event) => setManualToken(event.target.value)}
            onKeyDown={(event) => event.key === "Enter" && submit(manualToken)}
            placeholder={copy.cardCode}
            value={manualToken}
          />
          <Button className="mt-3 w-full" onClick={() => submit(manualToken)}>
            {copy.validate}
          </Button>
        </div>
      )}

      <div className="absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-black/85 to-transparent px-5 pt-10 pb-[max(env(safe-area-inset-bottom),1.5rem)]">
        <Button
          className="w-full bg-white/10 text-white"
          onClick={() => setManualOpen((value) => !value)}
          size="lg"
          variant="ghost"
        >
          <Keyboard /> {manualOpen ? copy.camera : copy.manual}
        </Button>
      </div>
    </main>
  )
}

function gateCopy(locale: "fr" | "en") {
  return locale === "en"
    ? {
        back: "Back",
        entry: "Entry",
        exit: "Exit",
        hint: "Scan a Lernn card",
        saving: "Saving…",
        saved: "Recorded",
        genericError: "Unable to record this scan.",
        cardCode: "Card code",
        validate: "Validate",
        manual: "Enter manually",
        camera: "Use camera",
      }
    : {
        back: "Retour",
        entry: "Entrée",
        exit: "Sortie",
        hint: "Scannez une carte Lernn",
        saving: "Enregistrement…",
        saved: "Enregistré",
        genericError: "Impossible d'enregistrer ce scan.",
        cardCode: "Code de la carte",
        validate: "Valider",
        manual: "Saisir manuellement",
        camera: "Utiliser la caméra",
      }
}
