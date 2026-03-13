"use client"

import { Trash2, Package2, Pencil } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface Product {
  id: string
  name: string
  price: number | string | { toString: () => string }
  buyPrice: number | string | { toString: () => string }
  unit: string
  categoryId: string
  category: { name: string }
  stock: { quantity: number } | null
}

export function ProductCard({ 
  product, 
  onDelete, 
  onEdit,
  loading 
}: { 
  product: Product, 
  onDelete: (id: string) => void,
  onEdit: (product: Product) => void,
  loading: boolean
}) {
  const stockQuantity = product.stock?.quantity || 0
  const isLowStock = stockQuantity > 0 && stockQuantity <= 5
  const isEmpty = stockQuantity === 0
  const imageUrl = getProductImage(product.name)

  return (
    <Card 
      className={cn(
        "w-full flex items-center bg-surface dark:bg-slate-800 p-2.5 rounded-lg border-2 border-transparent hover:border-primary/50 active:border-primary active:bg-primary/5 transition-all shadow-soft text-left group",
        isEmpty && "opacity-60"
      )}
    >
      <div className="w-14 h-14 rounded-md bg-background-light dark:bg-slate-700 flex items-center justify-center shrink-0 overflow-hidden">
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imageUrl} alt={product.name} className="w-full h-full object-cover mix-blend-multiply dark:mix-blend-normal" />
        ) : (
          <Package2 className="h-6 w-6 text-primary" />
        )}
      </div>
      <div className="ml-3 flex-1 min-w-0">
        <h3 className={cn(
          "text-base font-bold text-text-main dark:text-slate-100 leading-tight truncate",
          isEmpty && "line-through decoration-muted"
        )}>
          {product.name}
        </h3>
        <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
          <span className="text-[10px] font-bold text-muted">Modal: Rp {Number(product.buyPrice).toLocaleString("id-ID")}</span>
          <span className="text-[10px] text-muted/40">•</span>
          <span className="text-[10px] font-bold text-primary">Jual: Rp {Number(product.price).toLocaleString("id-ID")}</span>
        </div>
      </div>
      <div className="text-right pl-2 shrink-0">
        <div className={cn(
          "text-[10px] font-bold uppercase tracking-wider mb-1 px-2 py-0.5 rounded-full inline-block",
          isEmpty ? "text-red-500 bg-red-500/10" : isLowStock ? "text-primary bg-primary/10" : "text-muted bg-background-light"
        )}>
          {isEmpty ? "Habis" : isLowStock ? "Menipis" : "Sisa"}
        </div>
        <div className={cn(
          "text-lg font-black px-2.5 py-0.5 rounded-full block",
          isEmpty ? "text-red-500" : isLowStock ? "text-primary" : "text-accent-success bg-accent-success/10"
        )}>
          {stockQuantity}
        </div>
        <div className="flex items-center gap-1 mt-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-7 w-7"
            onClick={() => onEdit(product)}
            disabled={loading}
          >
            <Pencil className="h-4 w-4 text-muted" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-7 w-7"
            onClick={() => onDelete(product.id)}
            disabled={loading}
          >
            <Trash2 className="h-4 w-4 text-red-400" />
          </Button>
        </div>
      </div>
    </Card>
  )
}

function getProductImage(name: string) {
  const value = name.toLowerCase()
  if (value.includes("kopi")) return "https://lh3.googleusercontent.com/aida-public/AB6AXuB8qGiKHELMBF60DIGcbGHK9RGcd0lvqAQ5_uLYEG130tQ5W-ETd2v0gPvJNpm6E1L6v7dWQGDOlxibJ6PA_CXeaMAOHjDx-_db7w2lJz-Nke1lI0TdtAGEIpg2lueVV2oTdTcQHe9aXGPzRX8iDAqEhg2Fe1vKFqzKKtEmWDpmRAMDS0kQN-xMDZ7NTY4YbzUGLwzWu_qdIqv4CRYmfgrg09ttG5ixKpHf6R9DWn02Vp7MyKeuZl56GJLRsTJMoO7svvIaAtAFK30"
  if (value.includes("indomie") || value.includes("mie")) return "https://lh3.googleusercontent.com/aida-public/AB6AXuDV-0jVrFGbHJyHC02ITUa2Ju0txz4-YMFuT-4r9cmLk7ZQnFkCgxMmIp0yRF2yBXXufRyXJE-3AWlnDuibp403P4TF1L1rkmSMoOsgQp9Q7emvd0zErFWBr5-PY3jx_h87I3p-rBN60z2WBylCeBUrNNl20aD0dk2WKfjxge4xVzlQKQFD0qhvxeCtnE-VhOiFlFCY55wdya6GO0NjRPruKX8ndsFP5O39lT2_L7j9nHSWN_1dIchN-Tu0wv15V6f5TRZTWszZejk"
  if (value.includes("aqua") || value.includes("air")) return "https://lh3.googleusercontent.com/aida-public/AB6AXuCK10wY2xIOaL67GvLtsTsaszrGG_X1jQdOPMzseWq5EJMa7PP5tWjXNAdD3hYMS_QKmqg3iwa2PlJApXnOnehyYjfF2xTzOBoCcpj7BIofS4Neoocpv7RMl1--xNgkdDlcqlPTTDmmpoDhCDYbMXawLXHuAPa1N8b8py_lO4HKmcpxCPOrFp9FOpatoMNdMLIzfLfHGp3rJQ7QQQlGOkSj_vXOw-6RntvFHVVttnHgPEI9VIcIdOSNHpwWNYTZZVoja8R0cerTVeU"
  if (value.includes("rokok") || value.includes("gudang garam")) return "https://lh3.googleusercontent.com/aida-public/AB6AXuBdi0Sb-EHREN7a0YxIBTaTWK4zsvXMNT8eLAZOcPHJmpvNJFAKZm-z4fi0P5iLvYNXbOZjwV79b8xKlOkyHvlQNyDdtIARDZZarC9b8EMkPJRLr0O-TVsrKGA3idJcrPLpem4b2RyXAWxR76qPUxiqHeu8jt-c_rGF_QX4Yz-3-o8XLo2I82uQb-P2fIwx6XL1-QjmZpVVKT734HOEfJLie38LzIunyJcG1so7-kjQlQT7JA3ynHgRAdgwbpAzLL5TgQPeFuyScFE"
  return null
}
