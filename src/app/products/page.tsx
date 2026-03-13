"use client"

import { getProducts } from "@/lib/actions/products"
import { getCategories } from "@/lib/actions/categories"
import { ProductList } from "./product-list"
import { TopNav } from "@/components/navigation"
import { Plus } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"

interface Product {
  id: string
  name: string
  categoryId: string
  price: number | string | { toString: () => string }
  buyPrice: number | string | { toString: () => string }
  unit: string
  category: { name: string }
  stock: { quantity: number } | null
}

interface Category {
  id: string
  name: string
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function init() {
      const p = await getProducts()
      const c = await getCategories()
      setProducts(p)
      setCategories(c)
      setLoading(false)
    }
    init()
  }, [])

  return (
    <div className="space-y-1 pb-16">
      <TopNav 
        title="Daftar Barang" 
        onSearch={(val) => setSearch(val)}
        rightAction={
          <div className="flex items-center gap-1.5">
            <Link href="/products?add=true" className="size-9 rounded-full bg-primary/10 flex items-center justify-center text-primary active:scale-90 transition-all">
              <Plus className="size-5" />
            </Link>
          </div>
        } 
      />
      <div className="px-4 pt-4 pb-1 md:text-center">
        <p className="text-[13px] font-medium text-muted leading-tight opacity-70 italic">Kelola stok, harga, dan kategori barang.</p>
      </div>
      
      {loading ? (
        <div className="h-40 animate-pulse bg-surface rounded-2xl mx-4 mt-4" />
      ) : (
        <ProductList initialProducts={products} categories={categories} searchValue={search} />
      )}
    </div>
  )
}
