import { cn } from "@/lib/utils"
import type { ReactNode } from "react"

type FeeProgressRingProps = {
  value?: number
  total?: number
  percent?: number
  centerText?: ReactNode
  centerSubtext?: ReactNode
  children?: ReactNode
  size?: number
  thickness?: number
  className?: string
  centerClassName?: string
  trackClassName?: string
  progressClassName?: string
}

export function FeeProgressRing({
  value,
  total,
  percent,
  centerText,
  centerSubtext,
  children,
  size = 96,
  thickness = 6,
  className,
  centerClassName,
  trackClassName,
  progressClassName,
}: FeeProgressRingProps) {
  const computedPercent =
    percent ?? (total && total > 0 && value != null ? (value / total) * 100 : 0)
  const normalizedPercent = Math.max(0, Math.min(100, computedPercent))
  const radius = 50 - thickness / 2

  return (
    <div
      className={cn("relative grid shrink-0 place-items-center", className)}
      style={{ height: size, width: size }}
    >
      <svg
        aria-hidden="true"
        className="absolute inset-0 size-full -rotate-90"
        viewBox="0 0 100 100"
      >
        <circle
          className={cn("stroke-brand-soft", trackClassName)}
          cx="50"
          cy="50"
          fill="none"
          r={radius}
          strokeLinecap="round"
          strokeWidth={thickness}
        />
        <circle
          className={cn("stroke-brand", progressClassName)}
          cx="50"
          cy="50"
          fill="none"
          pathLength="100"
          r={radius}
          strokeDasharray={`${normalizedPercent} ${100 - normalizedPercent}`}
          strokeLinecap="round"
          strokeWidth={thickness}
        />
      </svg>
      {(children || centerText || centerSubtext) && (
        <div
          className={cn(
            "relative grid place-items-center text-center",
            centerClassName
          )}
        >
          {children ?? (
            <>
              {centerText ? <span>{centerText}</span> : null}
              {centerSubtext ? <span>{centerSubtext}</span> : null}
            </>
          )}
        </div>
      )}
    </div>
  )
}
