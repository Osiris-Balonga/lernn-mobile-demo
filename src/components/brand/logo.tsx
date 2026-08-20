import { cn } from "@/lib/utils"
import { withAppBase } from "@/lib/route-base"

export function LernnLogo({
  inverted = false,
  compact = false,
  size = 22,
  className,
}: {
  inverted?: boolean
  /** Render "L." instead of "Lernn." — for collapsed sidebar */
  compact?: boolean
  size?: number
  className?: string
}) {
  const src = withAppBase(
    compact
      ? inverted
        ? "/logo-dark-short.png"
        : "/logo-short.png"
      : inverted
        ? "/logo.png"
        : "/logo-dark.png"
  )

  return (
    <img
      src={src}
      alt="Lernn"
      className={cn("inline-block shrink-0 object-contain", className)}
      style={{ height: size, width: "auto" }}
    />
  )
}
