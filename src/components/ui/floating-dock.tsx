import { useEffect, useState, useRef } from "react"
import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface FloatingDockProps {
  /** Whether the dock should be visible */
  visible: boolean
  /** Primary content (e.g. pending indicator + buttons) */
  children: ReactNode
  /** Optional status message that replaces children with a slide animation */
  statusContent?: ReactNode | null
  /** Optional hint shown below the dock content */
  hint?: ReactNode | null
  className?: string
}

/**
 * Reusable floating dock with enter/exit animation and content swap.
 *
 * When `statusContent` is provided, the primary `children` slide out upward
 * and `statusContent` slides in from below. Children stay in the DOM (invisible)
 * so the dock keeps a stable width throughout the transition.
 */
export function FloatingDock({
  visible: shouldBeVisible,
  children,
  statusContent,
  hint,
  className,
}: FloatingDockProps) {
  // ─── Mount / visibility animation ────────────────────────────
  const [mounted, setMounted] = useState(false)
  const [visible, setVisible] = useState(false)
  const exitTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  useEffect(() => {
    if (shouldBeVisible) {
      clearTimeout(exitTimer.current)
      setMounted(true)
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setVisible(true))
      })
    } else {
      setVisible(false)
      exitTimer.current = setTimeout(() => setMounted(false), 300)
    }
    return () => clearTimeout(exitTimer.current)
  }, [shouldBeVisible])

  // ─── Content swap animation ──────────────────────────────────
  const showStatus = !!statusContent
  const [displayStatus, setDisplayStatus] = useState(showStatus)
  const [contentVisible, setContentVisible] = useState(true)
  const swapTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  // Cache status content so it stays visible during exit animation
  const lastStatusRef = useRef<ReactNode>(null)
  if (statusContent) lastStatusRef.current = statusContent

  useEffect(() => {
    clearTimeout(swapTimer.current)
    if (showStatus && !displayStatus) {
      // Fade out current content, then swap
      setContentVisible(false)
      swapTimer.current = setTimeout(() => {
        setDisplayStatus(true)
        requestAnimationFrame(() => {
          requestAnimationFrame(() => setContentVisible(true))
        })
      }, 200)
    } else if (!showStatus && displayStatus) {
      // Fade out status, then swap back
      setContentVisible(false)
      swapTimer.current = setTimeout(() => {
        setDisplayStatus(false)
        requestAnimationFrame(() => {
          requestAnimationFrame(() => setContentVisible(true))
        })
      }, 200)
    } else {
      // Direct match — ensure visible
      setDisplayStatus(showStatus)
      setContentVisible(true)
    }
    return () => clearTimeout(swapTimer.current)
  }, [showStatus, displayStatus])

  if (!mounted) return null

  return (
    <div
      className={cn(
        "fixed bottom-4 left-1/2 z-50 -translate-x-1/2 overflow-hidden rounded-xl border border-border bg-card shadow-lg transition-all duration-300",
        visible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0",
        className
      )}
    >
      {/* Grid overlay: children always present for sizing, status overlays */}
      <div className="grid">
        {/* Main content — always in DOM for stable dimensions */}
        <div
          className={cn(
            "col-start-1 row-start-1 flex items-center gap-3 px-4 py-2.5 transition-all duration-200",
            displayStatus
              ? "invisible"
              : contentVisible
                ? "translate-y-0 opacity-100"
                : "translate-y-2 opacity-0"
          )}
        >
          {children}
        </div>

        {/* Status overlay — centered on the same grid cell */}
        {displayStatus && (
          <div
            className={cn(
              "col-start-1 row-start-1 flex items-center justify-center gap-3 px-4 py-2.5 transition-all duration-200",
              contentVisible
                ? "translate-y-0 opacity-100"
                : "translate-y-2 opacity-0"
            )}
          >
            {lastStatusRef.current}
          </div>
        )}
      </div>

      {/* Optional hint below content */}
      {hint && !displayStatus && (
        <div className="border-t border-border px-4 py-1.5 text-center text-[11px] text-amber-600 dark:text-amber-400">
          {hint}
        </div>
      )}
    </div>
  )
}
