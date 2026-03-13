"use client"

import { useLayoutEffect, useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { WifiOff, RefreshCw, CheckCircle2 } from "lucide-react"
import { useSync } from "@/lib/hooks/use-sync"

export function OnlineStatus() {
  const [isOnline, setIsOnline] = useState(true)
  const { queue } = useSync()
  const [isClient, setIsClient] = useState(false)
  const [showSyncSuccess, setShowSyncSuccess] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  // Track sync completion
  const [prevQueueLength, setPrevQueueLength] = useState(0)
  useEffect(() => {
    if (prevQueueLength > 0 && queue.length === 0 && isOnline) {
      setShowSyncSuccess(true)
      const timer = setTimeout(() => setShowSyncSuccess(false), 3000)
      return () => clearTimeout(timer)
    }
    setPrevQueueLength(queue.length)
  }, [queue.length, isOnline, prevQueueLength])

  useLayoutEffect(() => {
    if (typeof navigator !== "undefined") {
      setIsOnline(navigator.onLine)
    }

    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  if (!isClient) return null

  const hasPending = queue.length > 0

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col items-end gap-2 pointer-events-none">
      {/* Offline Indicator */}
      <div className={cn(
        "flex items-center gap-2 rounded-full px-3 py-1.5 text-[10px] font-black uppercase tracking-widest backdrop-blur-md border shadow-lg transition-all duration-500 transform",
        !isOnline 
          ? "bg-red-500 text-white border-red-600 translate-y-0 opacity-100 pointer-events-auto"
          : "translate-y-[-20%] opacity-0"
      )}>
        <WifiOff className="h-3 w-3" />
        Offline
      </div>

      {/* Syncing Indicator */}
      {hasPending && isOnline && (
        <div className="flex items-center gap-2 rounded-full px-3 py-1.5 text-[10px] font-black uppercase tracking-widest bg-slate-900 text-white border border-slate-800 backdrop-blur-md shadow-lg pointer-events-auto animate-in fade-in slide-in-from-right-4">
          <RefreshCw className="h-3 w-3 animate-spin" />
          Sinkronisasi {queue.length} Item...
        </div>
      )}

      {/* Sync Success Indicator */}
      {showSyncSuccess && (
        <div className="flex items-center gap-2 rounded-full px-3 py-1.5 text-[10px] font-black uppercase tracking-widest bg-emerald-500 text-white border border-emerald-600 backdrop-blur-md shadow-lg pointer-events-auto animate-in fade-in slide-in-from-right-4 duration-500">
          <CheckCircle2 className="h-3 w-3" />
          Sync Selesai
        </div>
      )}
    </div>
  )
}
