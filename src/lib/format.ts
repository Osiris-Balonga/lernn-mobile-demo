import { getLocale } from "../paraglide/runtime.js"

type DateStyle = "short" | "medium" | "long" | "month-year"
type DateLocale = "fr" | "en"

const DATE_LOCALE_TAGS: Record<DateLocale, string> = {
  fr: "fr-FR",
  en: "en-US",
}

const DATE_FORMAT_OPTIONS: Record<DateStyle, Intl.DateTimeFormatOptions> = {
  short: { day: "numeric", month: "short" },
  medium: { day: "numeric", month: "short", year: "numeric" },
  long: { weekday: "long", day: "numeric", month: "long", year: "numeric" },
  "month-year": { month: "long", year: "numeric" },
}

export function fmtDate(
  date: Date | string,
  style: DateStyle = "medium",
  locale: DateLocale = getLocale()
): string {
  const value = typeof date === "string" ? new Date(date) : date
  return value.toLocaleDateString(
    DATE_LOCALE_TAGS[locale],
    DATE_FORMAT_OPTIONS[style]
  )
}

export function fmtMonthShort(
  date: Date | string,
  locale: DateLocale = getLocale()
) {
  const value = typeof date === "string" ? new Date(date) : date
  return value
    .toLocaleDateString(DATE_LOCALE_TAGS[locale], { month: "short" })
    .replace(".", "")
}

export function fmtRelativeTime(
  date: Date | string,
  locale: DateLocale = getLocale(),
  now: Date = new Date()
) {
  const value = typeof date === "string" ? new Date(date) : date
  const createdAtMs = value.getTime()
  if (!Number.isFinite(createdAtMs)) return ""

  const diffMs = Math.max(0, now.getTime() - createdAtMs)
  const minutes = Math.floor(diffMs / 60_000)
  if (minutes < 1) return locale === "fr" ? "maint." : "now"
  if (minutes < 60) return `${minutes} min`

  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h`

  const days = Math.floor(hours / 24)
  if (days === 1) return locale === "fr" ? "hier" : "yesterday"
  return locale === "fr" ? `${days} j` : `${days}d`
}

export function fmtTime(date: Date | string): string {
  const value = typeof date === "string" ? new Date(date) : date
  return value.toLocaleTimeString("fr-FR", {
    hour: "numeric",
    minute: "2-digit",
  })
}

export function fmtFCFA(amount: number): string {
  const formatted = fmtFCFANumber(amount)

  return `${formatted} FCFA`
}

export function fmtFCFANumber(amount: number): string {
  const formatted = new Intl.NumberFormat("fr-FR", {
    style: "decimal",
    maximumFractionDigits: 0,
  }).format(Math.abs(amount))

  return `${amount < 0 ? "-" : ""}${formatted}`
}

export function fmtCompactAmount(amount: number): string {
  const sign = amount < 0 ? "-" : ""
  const value = Math.abs(amount)

  if (value >= 1_000_000) {
    return `${sign}${formatCompactUnit(value / 1_000_000)}M`
  }

  if (value >= 1_000) {
    return `${sign}${formatCompactUnit(value / 1_000)}k`
  }

  return `${sign}${new Intl.NumberFormat("fr-FR", {
    maximumFractionDigits: 0,
  }).format(value)}`
}

export function fmtCompactFCFA(amount: number): string {
  return `${fmtCompactAmount(amount)} FCFA`
}

function formatCompactUnit(value: number): string {
  const maximumFractionDigits = value >= 10 ? 0 : 1

  return new Intl.NumberFormat("fr-FR", {
    maximumFractionDigits,
  }).format(value)
}

export function fmtPercent(value: number, decimals = 1): string {
  return `${value.toFixed(decimals).replace(".", ",")} %`
}

export function fmtWithUnit(value: number, unit: string, decimals = 1): string {
  return `${value.toFixed(decimals).replace(".", ",")}${unit}`
}

export function fmtOrdinal(value: number): string {
  return value === 1 ? "1er" : `${value}e`
}

export function fmtDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`
  const hours = Math.floor(minutes / 60)
  const remaining = minutes % 60
  return remaining === 0
    ? `${hours}h`
    : `${hours}h ${String(remaining).padStart(2, "0")}`
}
