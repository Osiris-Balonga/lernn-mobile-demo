import { useEffect, useState } from "react"

function isBrowserOnline() {
  if (typeof navigator === "undefined") return true
  return navigator.onLine
}

export function useOnlineStatus() {
  const [online, setOnline] = useState(() => isBrowserOnline())

  useEffect(() => {
    function updateOnlineStatus() {
      setOnline(isBrowserOnline())
    }

    window.addEventListener("online", updateOnlineStatus)
    window.addEventListener("offline", updateOnlineStatus)
    updateOnlineStatus()

    return () => {
      window.removeEventListener("online", updateOnlineStatus)
      window.removeEventListener("offline", updateOnlineStatus)
    }
  }, [])

  return online
}
