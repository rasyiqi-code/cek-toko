"use client"

import { useState, useEffect } from "react"
import { Pencil, Trash2, X, Check, FolderKanban } from "lucide-react"
import { useSync } from "@/lib/hooks/use-sync"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { createCategory, updateCategory, deleteCategory } from "@/lib/actions/categories"
import { Card, CardContent } from "@/components/ui/card"

interface Category {
  id: string
  name: string
}

export function CategoryList({ initialCategories }: { initialCategories: Category[] }) {
  const [categories, setCategories] = useState(initialCategories)
  const [isAdding, setIsAdding] = useState(false)
  const [newName, setNewName] = useState("")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState("")
  const [loading, setLoading] = useState(false)
  const searchParams = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    if (searchParams.get("add") === "true") {
      const timerId = setTimeout(() => setIsAdding(true), 0)
      return () => clearTimeout(timerId)
    } else {
      const timerId = setTimeout(() => setIsAdding(false), 0)
      return () => clearTimeout(timerId)
    }
  }, [searchParams])

  const closeAdding = () => {
    setIsAdding(false)
    const params = new URLSearchParams(searchParams.toString())
    params.delete("add")
    router.replace(`/categories?${params.toString()}`)
  }

  const { addToQueue, isOffline } = useSync()

  const handleAdd = async () => {
    if (!newName.trim()) return
    setLoading(true)
    const label = newName.trim()

    if (isOffline) {
      const tempId = `temp-${Date.now()}`
      setCategories([{ id: tempId, name: label }, ...categories])
      await addToQueue("CREATE_CATEGORY", { name: label })
      setNewName("")
      setIsAdding(false)
      setLoading(false)
      return
    }

    const res = await createCategory(label)
    if (res.success) {
      setCategories([{ id: crypto.randomUUID(), name: label }, ...categories])
      setNewName("")
      setIsAdding(false)
    } else {
      alert(res.error)
    }
    setLoading(false)
  }

  const handleUpdate = async (id: string) => {
    if (!editName.trim()) return
    setLoading(true)
    const label = editName.trim()

    if (isOffline || id.startsWith("temp-")) {
      setCategories(categories.map((cat) => (cat.id === id ? { ...cat, name: label } : cat)))
      if (!id.startsWith("temp-")) {
        await addToQueue("UPDATE_CATEGORY", { id, name: label })
      }
      setEditingId(null)
      setEditName("")
      setLoading(false)
      return
    }

    const res = await updateCategory(id, label)
    if (res.success) {
      setCategories(categories.map((cat) => (cat.id === id ? { ...cat, name: label } : cat)))
      setEditingId(null)
      setEditName("")
    } else {
      alert(res.error)
    }
    setLoading(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus kategori ini?")) return
    setLoading(true)

    if (isOffline || id.startsWith("temp-")) {
      setCategories(categories.filter((cat) => cat.id !== id))
      if (!id.startsWith("temp-")) {
        await addToQueue("DELETE_CATEGORY", { id })
      }
      setLoading(false)
      return
    }

    const res = await deleteCategory(id)
    if (res.success) {
      setCategories(categories.filter((cat) => cat.id !== id))
    } else {
      alert(res.error)
    }
    setLoading(false)
  }

  return (
    <div className="space-y-4">
      {isAdding && (
        <Card className="enter-pop border-[#f2d8bf] bg-[#fff6ea]">
          <CardContent className="space-y-3 p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-[#9f9284]">Nama Kategori</p>
            <div className="flex gap-2">
              <Input
                placeholder="Contoh: Minuman"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              />
              <Button onClick={handleAdd} disabled={loading} size="icon">
                <Check className="h-4 w-4" />
              </Button>
              <Button onClick={closeAdding} variant="outline" size="icon">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="dashboard-grid">
        {categories.map((cat, index) => (
          <Card key={cat.id} className={`glass enter-pop ${index < 4 ? `stagger-${index + 1}` : ""}`}>
            <CardContent className="flex items-center justify-between p-4">
              {editingId === cat.id ? (
                <div className="flex w-full gap-2">
                  <Input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleUpdate(cat.id)}
                    autoFocus
                  />
                  <Button onClick={() => handleUpdate(cat.id)} size="icon" disabled={loading}>
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button onClick={() => setEditingId(null)} variant="outline" size="icon">
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <>
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="rounded-xl bg-[#fdf2e4] p-2 text-[#f97316]">
                      <FolderKanban className="h-4 w-4" />
                    </div>
                    <span className="truncate text-sm font-black text-[#4a3b32]">{cat.name}</span>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setEditingId(cat.id)
                        setEditName(cat.name)
                      }}
                    >
                      <Pencil className="h-4 w-4 text-[#8f8174]" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(cat.id)}>
                      <Trash2 className="h-4 w-4 text-[#e96562]" />
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

    </div>
  )
}
