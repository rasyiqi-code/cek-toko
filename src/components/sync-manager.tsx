"use client"

import { useEffect, useCallback } from "react"
import { useSync } from "@/lib/hooks/use-sync"
import { createStockOpname } from "@/lib/actions/stock"
import { createCategory } from "@/lib/actions/categories"
import { createProduct } from "@/lib/actions/products"

interface SyncAction {
  type: string
  payload: Record<string, unknown>
}

export function SyncManager() {
  const { queue, syncQueue, isOffline } = useSync()

  const processAction = useCallback(async (action: SyncAction) => {
    try {
      if (action.type === "CREATE_STOCK_OPNAME") {
        const res = await createStockOpname(action.payload as Parameters<typeof createStockOpname>[0])
        return res.success
      }
      if (action.type === "CREATE_CATEGORY") {
        const res = await createCategory((action.payload as { name: string }).name)
        return res.success
      }
      if (action.type === "CREATE_PRODUCT") {
        const res = await createProduct(action.payload as Parameters<typeof createProduct>[0])
        return res.success
      }
      return true // Unknown action, drop it
    } catch (e) {
      console.error("Sync error:", e)
      return false
    }
  }, [])

  useEffect(() => {
    if (!isOffline && queue.length > 0) {
      syncQueue(processAction)
    }
  }, [isOffline, queue.length, syncQueue, processAction])

  return null
}
