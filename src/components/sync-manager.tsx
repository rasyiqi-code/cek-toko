"use client"

import { useEffect, useCallback } from "react"
import { useSync } from "@/lib/hooks/use-sync"
import { createStockOpname } from "@/lib/actions/stock"
import { createCategory, updateCategory, deleteCategory } from "@/lib/actions/categories"
import { createProduct, updateProduct, updateStock, deleteProduct } from "@/lib/actions/products"

interface SyncAction {
  type: string
  payload: Record<string, unknown>
}

import { toast } from "sonner"

export function SyncManager() {
  const { queue, syncQueue, isOffline, isSyncing } = useSync()

  // Notify when sync starts
  useEffect(() => {
     if (isSyncing) {
        toast.loading("Menyingkronkan data ke awan...", { id: "sync-progress" })
     } else {
        toast.dismiss("sync-progress")
     }
  }, [isSyncing])

  const processAction = useCallback(async (action: SyncAction, token: string | null) => {
    try {
      // In a real scenario, we might want to pass the token to the server action
      // if it's called via an API endpoint. For Server Actions, they rely on cookies.
      // For cross-platform support, we'll eventually move these to fetch() calls with token headers.
      
      if (action.type === "CREATE_STOCK_OPNAME") {
        const res = await createStockOpname(action.payload as Parameters<typeof createStockOpname>[0])
        return res.success
      }
      if (action.type === "CREATE_CATEGORY") {
        const res = await createCategory((action.payload as { name: string }).name)
        return res.success
      }
      if (action.type === "UPDATE_CATEGORY") {
        const p = action.payload as { id: string, name: string }
        const res = await updateCategory(p.id, p.name)
        return res.success
      }
      if (action.type === "DELETE_CATEGORY") {
        const res = await deleteCategory((action.payload as { id: string }).id)
        return res.success
      }
      if (action.type === "CREATE_PRODUCT") {
        const res = await createProduct(action.payload as Parameters<typeof createProduct>[0])
        return res.success
      }
      if (action.type === "UPDATE_PRODUCT") {
        const p = action.payload as any
        const [prodRes, stockRes] = await Promise.all([
          updateProduct(p.id, {
            name: p.name,
            categoryId: p.categoryId,
            price: parseFloat(p.price),
            buyPrice: parseFloat(p.buyPrice),
            unit: p.unit,
          }),
          updateStock(p.id, p.stock),
        ])
        return prodRes.success && stockRes.success
      }
      if (action.type === "DELETE_PRODUCT") {
        const res = await deleteProduct((action.payload as { id: string }).id)
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
