import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

function getGradeVariant(score: number, denom: number, passingGrade: number) {
  if (score >= denom * 0.7) return "grade-good" as const
  if (score >= passingGrade) return "grade-mid" as const
  return "grade-bad" as const
}

function formatDenom(value: number) {
  return Number.isInteger(value) ? value.toString() : value.toFixed(1)
}

export function GradeCell({
  value,
  denom = 20,
  passingGrade = denom / 2,
  className,
}: {
  value: number
  denom?: number
  passingGrade?: number
  className?: string
}) {
  return (
    <Badge
      variant={getGradeVariant(value, denom, passingGrade)}
      className={cn("text-sm", className)}
    >
      {value.toFixed(1)}
      <span className="text-[0.7em] font-medium opacity-65">
        /{formatDenom(denom)}
      </span>
    </Badge>
  )
}
