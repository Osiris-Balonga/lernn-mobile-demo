import { Card } from "@/components/ui/card"
import { ProgressBar } from "@/components/brand/progress-bar"
import { cn } from "@/lib/utils"
import type { LucideIcon } from "lucide-react"

export function KpiCard({
  label,
  value,
  icon: Icon,
  trend,
  progress,
  className,
}: {
  label: string
  value: string | number
  icon?: LucideIcon
  trend?: { value: string; up: boolean }
  progress?: number
  className?: string
}) {
  return (
    <Card className={cn("flex flex-col p-4", className)}>
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-medium text-text-secondary">{label}</p>
          <p className="font-mono text-2xl font-semibold text-foreground tabular-nums">
            {value}
          </p>
        </div>
        {Icon && (
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-soft">
            <Icon className="h-4 w-4 text-brand-dark" />
          </div>
        )}
      </div>
      <div className="mt-auto pt-2">
        {trend && (
          <p
            className={cn(
              "mb-1 text-xs font-medium",
              trend.up ? "text-[#00684A]" : "text-[#CF4A22]"
            )}
          >
            {trend.up ? "▲" : "▼"} {trend.value}
          </p>
        )}
        {progress != null && <ProgressBar value={progress} />}
      </div>
    </Card>
  )
}
