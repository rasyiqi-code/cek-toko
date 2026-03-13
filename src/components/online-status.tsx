"use client"

import { useLayoutEffect, useState } from "react"
import { cn } from "@/lib/utils"
import { Wifi, WifiOff } from "lucide-react"

export function OnlineStatus() {
  const [isOnline, setIsOnline] = useState(true)

  useLayoutEffect(() => {
    // Sync state from navigator before paint to avoid hydration mismatch.
    // This is the approved SSR pattern for client-only state initialization.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsOnline(navigator.onLine)

    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  return (
    <div className={cn(
      "fixed top-4 right-4 z-[100] flex items-center gap-2 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider backdrop-blur-md border shadow-sm transition-all duration-500",
      isOnline 
        ? "bg-green-500/10 text-green-600 border-green-200/50 opacity-0 pointer-events-none" 
        : "bg-destructive/10 text-destructive border-destructive/20 opacity-100 pointer-events-auto shadow-lg"
    )}>
      {isOnline ? (
        <><Wifi className="h-3 w-3" /> Online</>
      ) : (
        <><WifiOff className="h-3 w-3" /> Offline Mode</>
      )}
    </div>
  )
}
