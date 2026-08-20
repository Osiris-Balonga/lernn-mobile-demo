import { useEffect, useRef } from "react"
import type { ReactNode } from "react"
import { Camera, CameraOff } from "lucide-react"
import {
  Scanner,
  type IDetectedBarcode,
  type IScannerError,
  type IScannerHandle,
} from "@yudiel/react-qr-scanner"

import type { QrScannerHandle } from "@/hooks/use-qr-scanner"
import * as m from "@/paraglide/messages"

interface ScannerCameraViewportProps {
  scanner: QrScannerHandle
}

export function ScannerCameraViewport({ scanner }: ScannerCameraViewportProps) {
  const {
    enabled,
    errorMessage,
    markActive,
    markError,
    markUnsupported,
    onScan,
    state,
  } = scanner
  const scannerRef = useRef<IScannerHandle>(null)

  useEffect(() => {
    if (!enabled) return

    const handle = scannerRef.current
    if (!handle) return

    let cleanup: (() => void) | undefined

    const poll = window.setInterval(() => {
      const video = handle.getVideoElement()
      if (!video) return

      window.clearInterval(poll)

      const handlePlaying = () => markActive()
      video.addEventListener("playing", handlePlaying)

      if (!video.paused && !video.ended && video.readyState >= 3) {
        markActive()
      }

      cleanup = () => video.removeEventListener("playing", handlePlaying)
    }, 100)

    return () => {
      window.clearInterval(poll)
      cleanup?.()
    }
  }, [enabled, markActive])

  function handleScan(detectedCodes: IDetectedBarcode[]) {
    const code = detectedCodes[0]?.rawValue
    if (code) onScan(code)
  }

  function handleError(error: IScannerError) {
    if (
      error.kind === "no-camera" ||
      error.kind === "overconstrained" ||
      error.kind === "unsupported"
    ) {
      markUnsupported()
      return
    }

    markError(m.auth_card_login_camera_error())
  }

  return (
    <div className="absolute inset-0 bg-black">
      {enabled && (
        <div className="absolute inset-0 [&_svg]:!hidden [&_video]:!h-full [&_video]:!w-full [&_video]:!object-cover">
          <Scanner
            allowMultiple
            components={{
              finder: false,
              torch: false,
              zoom: false,
              onOff: false,
            }}
            constraints={{
              facingMode: { ideal: "environment" },
              height: { ideal: 720 },
              width: { ideal: 1280 },
            }}
            formats={["qr_code"]}
            onError={handleError}
            onScan={handleScan}
            ref={scannerRef}
            scanDelay={250}
            styles={{
              container: { width: "100%", height: "100%" },
              video: { width: "100%", height: "100%", objectFit: "cover" },
            }}
          />
        </div>
      )}

      {state === "requesting" && (
        <ScannerStatus
          icon={<Camera />}
          label={m.auth_card_login_camera_requesting()}
        />
      )}

      {state === "unsupported" && (
        <ScannerStatus
          icon={<CameraOff />}
          label={m.auth_card_login_camera_unsupported()}
        />
      )}

      {state === "error" && (
        <ScannerStatus
          icon={<Camera />}
          label={errorMessage ?? m.auth_card_login_camera_error()}
        />
      )}
    </div>
  )
}

function ScannerStatus({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black text-white">
      <div className="grid size-14 place-items-center rounded-full bg-white/10 text-white/60">
        {icon}
      </div>
      <p className="max-w-72 text-center text-sm text-white/65">{label}</p>
    </div>
  )
}
