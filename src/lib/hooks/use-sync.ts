"use client"

import { useEffect, useState, useCallback } from "react"
import { get, set, update } from "idb-keyval"

interface PendingAction {
  id: string
  type: string
  payload: Record<string, unknown>
  timestamp: number
}

export function useSync() {
  const [queue, setQueue] = useState<PendingAction[]>([])

  const loadQueue = useCallback(async () => {
    const storedQueue = await get<PendingAction[]>("sync_queue") || []
    setQueue(storedQueue)
  }, [])

  useEffect(() => {
    const init = async () => {
      await loadQueue()
    }
    init()
  }, [loadQueue])

  const addToQueue = async (type: string, payload: Record<string, unknown>) => {
    const newAction: PendingAction = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      payload,
      timestamp: Date.now()
    }
    await update("sync_queue", (val: PendingAction[] | undefined) => [...(val || []), newAction])
    setQueue(prev => [...prev, newAction])
    return newAction.id
  }

  const syncQueue = useCallback(async (processAction: (action: PendingAction) => Promise<boolean>) => {
    const currentQueue = await get<PendingAction[]>("sync_queue") || []
    if (currentQueue.length === 0) return

    const remaining: PendingAction[] = []
    for (const action of currentQueue) {
      const success = await processAction(action)
      if (!success) remaining.push(action)
    }

    await set("sync_queue", remaining)
    setQueue(remaining)
  }, [])

  return { queue, addToQueue, syncQueue, isOffline: typeof navigator !== 'undefined' ? !navigator.onLine : false }
}
