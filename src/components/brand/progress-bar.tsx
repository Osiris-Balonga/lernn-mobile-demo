import { cn } from "@/lib/utils"

export function getProgressColor(percent: number): string {
  if (percent >= 75) return "bg-brand"
  if (percent >= 50) return "bg-[#EAB308]"
  if (percent >= 25) return "bg-[#C76C17]"
  return "bg-[#CF4A22]"
}

export function ProgressBar({
  value,
  max = 100,
  className,
}: {
  value: number
  max?: number
  className?: string
}) {
  const percent = Math.min(100, (value / max) * 100)

  return (
    <div
      className={cn(
        "h-1.5 w-full overflow-hidden rounded-full bg-[#F0F2F1]",
        className
      )}
    >
      <div
        className={cn(
          "h-full rounded-full transition-[width] duration-600 ease-in-out",
          getProgressColor(percent)
        )}
        style={{ width: `${percent}%` }}
      />
    </div>
  )
}
