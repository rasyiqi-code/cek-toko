import { getCategories } from "@/lib/actions/categories"
import { CategoryList } from "./category-list"
import { TopNav } from "@/components/navigation"
import { Plus } from "lucide-react"
import Link from "next/link"
import { Suspense } from "react"

export default async function CategoriesPage() {
  const categories = await getCategories()

  return (
    <div className="space-y-1 pb-16">
      <TopNav 
        title="Kategori Barang"
        rightAction={
          <Link href="/categories?add=true" className="size-9 rounded-full bg-primary/10 flex items-center justify-center text-primary active:scale-90 transition-all">
            <Plus className="size-5" />
          </Link>
        }
      />
      <div className="px-4 pt-3 pb-2">
        <p className="text-sm font-medium text-muted leading-relaxed">Atur kelompok produk agar pencarian dan pengecekan lebih cepat.</p>
      </div>

      <div className="px-4">
        <Suspense fallback={<div className="h-20 animate-pulse bg-surface rounded-2xl" />}>
          <CategoryList initialCategories={categories} />
        </Suspense>
      </div>
    </div>
  )
}
