import { useEffect, useRef } from "react"

// ─── Types ────────────────────────────────────────────────────────────────────

type SoundKey = "success" | "error" | "warning" | "click"

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * Preloads the four scanner WAV files and returns helpers to play them.
 * Falls back silently if the browser blocks audio.
 */
export function useScannerSounds() {
  const refs = useRef<Partial<Record<SoundKey, HTMLAudioElement>>>({})

  useEffect(() => {
    const sounds: SoundKey[] = ["success", "error", "warning", "click"]
    sounds.forEach((key) => {
      const audio = new Audio(`/sounds/${key}.wav`)
      audio.preload = "auto"
      audio.load()
      refs.current[key] = audio
    })
  }, [])

  function play(key: SoundKey) {
    const audio = refs.current[key]
    if (!audio) return
    audio.currentTime = 0
    audio.play().catch(() => {})
  }

  return {
    playSuccess: () => play("success"),
    playError: () => play("error"),
    playWarning: () => play("warning"),
    playClick: () => play("click"),
  }
}
