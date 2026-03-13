"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Plus, Search } from "lucide-react"
import { useSearchParams, useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { createProduct, deleteProduct, updateProduct, updateStock } from "@/lib/actions/products"
import { cn } from "@/lib/utils"
import { ProductCard } from "./product-card"
import { AddProductModal } from "./add-product-modal"
import { EditProductModal } from "./edit-product-modal"

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

interface Category {
  id: string
  name: string
}

type StockFilter = "all" | "low" | "empty"

interface AddProductPayload {
  name: string
  categoryId: string
  price: string
  buyPrice: string
  unit: string
  initialStock: number
}

export function ProductList({ initialProducts, categories, searchValue = "" }: { initialProducts: Product[], categories: Category[], searchValue?: string }) {
  const [products, setProducts] = useState(initialProducts)
  const [isAdding, setIsAdding] = useState(false)
  const [stockFilter, setStockFilter] = useState<StockFilter>("all")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(false)
  const searchParams = useSearchParams()
  const router = useRouter()

  // Drag-to-scroll + wheel-to-horizontal for desktop mouse
  const useDragScroll = () => {
    const ref = useRef<HTMLDivElement>(null)
    const onMouseDown = useCallback((e: React.MouseEvent) => {
      const el = ref.current
      if (!el) return
      let startX = e.pageX - el.offsetLeft
      let scrollLeft = el.scrollLeft
      const onMove = (ev: MouseEvent) => {
        el.scrollLeft = scrollLeft - (ev.pageX - el.offsetLeft - startX)
      }
      const onUp = () => {
        document.removeEventListener("mousemove", onMove)
        document.removeEventListener("mouseup", onUp)
      }
      document.addEventListener("mousemove", onMove)
      document.addEventListener("mouseup", onUp)
    }, [])
    useEffect(() => {
      const el = ref.current
      if (!el) return
      const handler = (e: WheelEvent) => {
        if (el.scrollWidth > el.clientWidth) {
          e.preventDefault()
          el.scrollLeft += e.deltaY
        }
      }
      el.addEventListener("wheel", handler, { passive: false })
      return () => el.removeEventListener("wheel", handler)
    }, [])
    return { ref, onMouseDown }
  }

  const stockScroll = useDragScroll()
  const catScroll = useDragScroll()

  useEffect(() => {
    if (searchParams.get("add") === "true") {
      setIsAdding(true)
    } else {
      setIsAdding(false)
    }
  }, [searchParams])

  const closeAdding = () => {
    setIsAdding(false)
    const params = new URLSearchParams(searchParams.toString())
    params.delete("add")
    router.replace(`/products?${params.toString()}`)
  }

  const filteredProducts = products.filter(p => {
    const bySearch = p.name.toLowerCase().includes(searchValue.toLowerCase()) || p.category.name.toLowerCase().includes(searchValue.toLowerCase())
    const quantity = p.stock?.quantity || 0
    const byStock = stockFilter === "all" ? true : stockFilter === "low" ? quantity > 0 && quantity <= 5 : quantity === 0
    const byCategory = categoryFilter === "all" ? true : p.categoryId === categoryFilter
    return bySearch && byStock && byCategory
  })

  const handleSave = async (formData: AddProductPayload) => {
    setLoading(true)
    const res = await createProduct({
      name: formData.name,
      categoryId: formData.categoryId,
      price: parseFloat(formData.price),
      buyPrice: parseFloat(formData.buyPrice),
      unit: formData.unit
    })
    if (res.success && res.product) {
      const createdProduct: Product = {
        id: res.product.id,
        name: res.product.name,
        price: res.product.price,
        buyPrice: res.product.buyPrice,
        unit: res.product.unit,
        categoryId: res.product.categoryId,
        category: categories.find((c) => c.id === formData.categoryId) || { name: "Tanpa kategori" },
        stock: { quantity: formData.initialStock },
      }
      setProducts([createdProduct, ...products])
      setIsAdding(false)
    } else alert(res.error)
    setLoading(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus barang ini?")) return
    setLoading(true)
    const res = await deleteProduct(id)
    if (res.success) setProducts(products.filter(item => item.id !== id))
    else alert(res.error)
    setLoading(false)
  }

  const handleEdit = async (id: string, data: { name: string; categoryId: string; price: string; buyPrice: string; unit: string; stock: number }) => {
    setLoading(true)
    const [prodRes, stockRes] = await Promise.all([
      updateProduct(id, {
        name: data.name,
        categoryId: data.categoryId,
        price: parseFloat(data.price),
        buyPrice: parseFloat(data.buyPrice),
        unit: data.unit,
      }),
      updateStock(id, data.stock),
    ])
    if (prodRes.success && stockRes.success) {
      setProducts(products.map(p => p.id === id ? {
        ...p,
        name: data.name,
        categoryId: data.categoryId,
        price: parseFloat(data.price),
        buyPrice: parseFloat(data.buyPrice),
        unit: data.unit,
        category: categories.find(c => c.id === data.categoryId) || p.category,
        stock: { quantity: data.stock },
      } : p))
      setEditingProduct(null)
    } else alert(prodRes.error || stockRes.error)
    setLoading(false)
  }

  return (
    <div className="flex flex-col space-y-3">
      <div className="px-4 pt-2">
        <div ref={catScroll.ref} onMouseDown={catScroll.onMouseDown} className="flex items-center gap-3 drag-scroll pb-2">
          {/* Highlighted Stock Status Group */}
          <div className="flex gap-1.5 p-1 bg-primary/10 rounded-full border border-primary/10 shrink-0">
            {(["all", "low", "empty"] as StockFilter[]).map((f) => (
              <button
                key={f}
                onClick={() => setStockFilter(f)}
                className={cn(
                  "shrink-0 px-4 py-1.5 rounded-full font-bold text-[10px] uppercase tracking-wider transition-all",
                  stockFilter === f ? "bg-primary text-white shadow-md scale-105" : "text-primary/60 hover:text-primary"
                )}
              >
                {f === "all" ? "Semua" : f === "low" ? "Menipis" : "Kosong"}
              </button>
            ))}
          </div>

          <div className="w-[1px] h-6 bg-muted/20 shrink-0" />

          <button
            onClick={() => setCategoryFilter("all")}
            className={cn(
              "shrink-0 px-4 py-1.5 rounded-full font-bold text-xs shadow-sm transition-all",
              categoryFilter === "all" ? "bg-text-main text-white" : "bg-surface text-muted border-2 border-transparent active:border-primary border-muted/5"
            )}
          >
            Semua Kategori
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategoryFilter(cat.id)}
              className={cn(
                "shrink-0 px-4 py-1.5 rounded-full font-bold text-xs shadow-sm transition-all",
                categoryFilter === cat.id ? "bg-text-main text-white" : "bg-surface text-muted border-2 border-transparent active:border-primary border-muted/5"
              )}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      <main className="flex-1 px-4 pb-20 pt-1">
        <div className="dashboard-grid">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} onDelete={handleDelete} onEdit={setEditingProduct} loading={loading} />
          ))}
          {filteredProducts.length === 0 && (
            <div className="py-12 text-center space-y-1.5 col-span-full">
              <p className="text-lg font-bold text-text-main">Barang tidak ditemukan</p>
              <p className="text-sm text-muted">Coba kata kunci lain atau tambah barang baru.</p>
            </div>
          )}
        </div>
      </main>

      {isAdding && <AddProductModal categories={categories} onClose={closeAdding} onSave={handleSave} loading={loading} />}
      {editingProduct && <EditProductModal product={editingProduct} categories={categories} onClose={() => setEditingProduct(null)} onSave={handleEdit} loading={loading} />}
    </div>
  )
}
