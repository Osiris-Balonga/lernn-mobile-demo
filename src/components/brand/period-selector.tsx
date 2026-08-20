import { cn } from "@/lib/utils"

export function PeriodSelector({
  value,
  onChange,
  options = ["T1", "T2", "T3"],
  renderLabel,
  className,
}: {
  value: string
  onChange: (value: string) => void
  options?: string[]
  /** Custom label renderer. Falls back to displaying the raw option value. */
  renderLabel?: (value: string) => string
  className?: string
}) {
  return (
    <div
      className={cn(
        "inline-flex gap-1 rounded-full bg-[#F0F2F1] p-1",
        className
      )}
    >
      {options.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => onChange(option)}
          className={cn(
            "rounded-full px-4 py-1.5 text-[13px] font-semibold transition-all duration-150",
            value === option ? "bg-brand text-brand-on" : "text-text-secondary"
          )}
        >
          {renderLabel ? renderLabel(option) : option}
        </button>
      ))}
    </div>
  )
}
