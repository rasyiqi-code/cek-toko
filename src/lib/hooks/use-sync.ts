"use client"

import { useEffect, useState, useCallback } from "react"
import { get, set, update } from "idb-keyval"
import { getToken } from "@/lib/auth-client"

export interface PendingAction {
  id: string
  type: string
  payload: Record<string, unknown>
  timestamp: number
  retryCount?: number
}

const MAX_RETRIES = 5

export function useSync() {
  const [queue, setQueue] = useState<PendingAction[]>([])
  const [isOffline, setIsOffline] = useState(typeof navigator !== 'undefined' ? !navigator.onLine : false)
  const [isSyncing, setIsSyncing] = useState(false)

  useEffect(() => {
    const handleOnline = () => setIsOffline(false)
    const handleOffline = () => setIsOffline(true)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const loadQueue = useCallback(async () => {
    const storedQueue = await get<PendingAction[]>("sync_queue") || []
    setQueue(storedQueue)
  }, [])

  useEffect(() => {
    loadQueue()
  }, [loadQueue])

  const addToQueue = async (type: string, payload: Record<string, unknown>) => {
    const newAction: PendingAction = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      payload,
      timestamp: Date.now(),
      retryCount: 0
    }
    await update("sync_queue", (val: PendingAction[] | undefined) => [...(val || []), newAction])
    setQueue(prev => [...prev, newAction])
    return newAction.id
  }

  const syncQueue = useCallback(async (processAction: (action: PendingAction, token: string | null) => Promise<boolean>) => {
    if (isSyncing) return
    
    const currentQueue = await get<PendingAction[]>("sync_queue") || []
    if (currentQueue.length === 0) return

    setIsSyncing(true)
    try {
      const token = (await getToken()) || null
      const remaining: PendingAction[] = []
      
      for (const action of currentQueue) {
        if (typeof navigator !== 'undefined' && !navigator.onLine) {
          remaining.push(action)
          continue
        }

        // Drop actions that failed too many times
        if ((action.retryCount || 0) >= MAX_RETRIES) {
          console.error(`[Sync] Giving up on action ${action.id} after ${MAX_RETRIES} attempts.`, action)
          continue
        }

        const success = await processAction(action, token)
        if (!success) {
          remaining.push({ ...action, retryCount: (action.retryCount || 0) + 1 })
        }
      }

      await set("sync_queue", remaining)
      setQueue(remaining)
    } finally {
      setIsSyncing(false)
    }
  }, [isSyncing])

  return { queue, addToQueue, syncQueue, isOffline, isSyncing }
}
