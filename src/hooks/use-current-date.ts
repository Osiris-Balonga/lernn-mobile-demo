import { useCallback, useEffect, useState } from "react"

export function getMsUntilNextLocalDay(now: Date) {
  const nextDay = new Date(now)
  nextDay.setHours(24, 0, 0, 0)
  return Math.max(1_000, nextDay.getTime() - now.getTime())
}

export function useCurrentDate() {
  const [currentDate, setCurrentDate] = useState(() => new Date())

  const refresh = useCallback(() => {
    setCurrentDate(new Date())
  }, [])

  useEffect(() => {
    let nextDayTimer: ReturnType<typeof window.setTimeout>

    const scheduleNextDay = () => {
      window.clearTimeout(nextDayTimer)
      const now = new Date()
      nextDayTimer = window.setTimeout(() => {
        refresh()
        scheduleNextDay()
      }, getMsUntilNextLocalDay(now))
    }
    const refreshWhenVisible = () => {
      if (document.visibilityState === "visible") refresh()
    }

    scheduleNextDay()
    window.addEventListener("focus", refresh)
    document.addEventListener("visibilitychange", refreshWhenVisible)

    return () => {
      window.clearTimeout(nextDayTimer)
      window.removeEventListener("focus", refresh)
      document.removeEventListener("visibilitychange", refreshWhenVisible)
    }
  }, [refresh])

  return currentDate
}
