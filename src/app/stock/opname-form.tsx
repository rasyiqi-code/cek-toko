"use client"

import { useState, useEffect } from "react"
import { Minus, Plus, ArrowRight, HelpCircle, User } from "lucide-react"
import { Input } from "@/components/ui/input"
import { createStockOpname } from "@/lib/actions/stock"
import { cn } from "@/lib/utils"
import { TopNav } from "@/components/navigation"

interface Product {
  id: string
  name: string
  categoryId: string
  buyPrice: number | string | { toString: () => string }
  stock: { quantity: number } | null
}

interface Category {
  id: string
  name: string
}

interface User {
  id: string
  name: string
  role: string
}

export function StockOpnameForm({ products, categories, users }: { products: Product[], categories: Category[], users: any[] }) {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null)
  const [opnameData, setOpnameData] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [currentPosition, setCurrentPosition] = useState(0)
  const [guardianName, setGuardianName] = useState("")
  const [started, setStarted] = useState(false)
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem("cek_toko_last_guardian")
    if (saved) {
      setGuardianName(saved)
      setStarted(true)
    }
    setIsHydrated(true)
  }, [])

  const guardians = users.filter(u => u.role === "OWNER" || u.role === "TIM_PENGECEK")

  const filteredProducts = products.filter(p => {
    const matchesCategory = selectedCategoryId ? p.categoryId === selectedCategoryId : true
    return matchesCategory
  })

  const safePosition = Math.min(currentPosition, Math.max(filteredProducts.length - 1, 0))
  const currentProduct = filteredProducts[safePosition]
  const stockNow = currentProduct?.stock?.quantity || 0
  const currentNew = currentProduct ? opnameData[currentProduct.id] ?? "" : ""
  const progressWidth = filteredProducts.length === 0 ? 0 : Math.max(((safePosition + 1) / filteredProducts.length) * 100, 6)

  const handleSave = async () => {
    if (!currentProduct || currentNew === "") return
    setLoading(true)
    const res = await createStockOpname({ productId: currentProduct.id, stockNew: parseInt(currentNew), guardianName })
    if (res.success) {
      if (safePosition < filteredProducts.length - 1) setCurrentPosition(safePosition + 1)
    } else alert(res.error)
    setLoading(false)
  }

  return (
    <div className="flex flex-col">
      <TopNav
        title="Cek Stok Barang"
        backHref="/dashboard"
        rightAction={
          isHydrated && started ? (
            <button
              onClick={() => {
                setStarted(false)
                localStorage.removeItem("cek_toko_last_guardian")
              }}
              className="text-[10px] font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-full flex items-center gap-1 active:scale-95 transition-all"
            >
              <User className="size-3" />
              {guardianName}
            </button>
          ) : (
            <HelpCircle className="size-5 text-muted hover:text-primary transition-colors cursor-pointer" />
          )
        }
      />

      {!started ? (
        <main className="flex-1 flex flex-col items-center justify-center px-6 pb-20">
          <div className="w-full max-w-sm space-y-6 text-center">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <User className="h-10 w-10 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-text-main">Siapa Petugasnya?</h2>
              <p className="text-sm text-muted mt-1">Pilih nama petugas yang sedang mengecek.</p>
            </div>

            <div className="grid grid-cols-2 gap-3 max-h-[240px] overflow-y-auto no-scrollbar py-1">
              {guardians.length > 0 ? (
                guardians.map(g => (
                  <button
                    key={g.id}
                    onClick={() => {
                      setGuardianName(g.name)
                      setStarted(true)
                      localStorage.setItem("cek_toko_last_guardian", g.name)
                    }}
                    className={cn(
                      "flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all active:scale-95",
                      guardianName === g.name
                        ? "bg-primary/10 border-primary text-primary"
                        : "bg-surface border-transparent text-muted hover:border-muted/20"
                    )}
                  >
                    <div className={cn("size-10 rounded-full flex items-center justify-center mb-2", guardianName === g.name ? "bg-primary text-white" : "bg-muted/10 text-muted")}>
                      <User className="size-5" />
                    </div>
                    <span className="text-xs font-bold truncate w-full px-1">{g.name}</span>
                  </button>
                ))
              ) : (
                <div className="col-span-2 py-4 text-center">
                  <p className="text-sm text-muted">Belum ada petugas (Owner/Tim Pengecek).</p>
                </div>
              )}
            </div>
          </div>
        </main>
      ) : (
        <>
          {/* Progress & Category Filter */}
          <div className="flex flex-col gap-2 p-4 pt-4 shrink-0">
            <div className="flex justify-between items-center mb-0.5 gap-2">
              <p className="text-sm font-semibold text-text-main">Barang {filteredProducts.length === 0 ? 0 : safePosition + 1} dari {filteredProducts.length}</p>
              <span className="text-xs font-medium text-muted truncate">Kategori: {selectedCategoryId ? categories.find(c => c.id === selectedCategoryId)?.name : "Semua"}</span>
            </div>
            <div className="h-2.5 rounded-full bg-[#E8DFD5] overflow-hidden">
              <div className="h-full rounded-full bg-accent-success transition-all duration-500 ease-out" style={{ width: `${progressWidth}%` }} />
            </div>

            <div className="flex gap-1.5 overflow-x-auto no-scrollbar py-1 mt-1 px-4 -mx-4">
              {[{ id: null, name: "Semua" }, ...categories].map(cat => (
                <button
                  key={cat.id}
                  onClick={() => { setSelectedCategoryId(cat.id); setCurrentPosition(0); }}
                  className={cn(
                    "shrink-0 px-3.5 py-1 rounded-full font-bold text-xs shadow-sm transition-all",
                    selectedCategoryId === cat.id ? "bg-primary text-white" : "bg-surface text-muted"
                  )}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Main Content */}
          <main className="flex-1 flex flex-col items-center justify-center px-4 pb-20 relative w-full">
            {currentProduct ? (
              <>
                <div className="w-full max-w-xl bg-surface rounded-[24px] shadow-soft p-6 flex flex-col md:flex-row items-center gap-6 transform transition-all duration-300 border border-muted/5">
                  <div className="w-40 h-40 bg-background-light rounded-[20px] flex items-center justify-center overflow-hidden border-2 border-primary/10 shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      alt={currentProduct.name}
                      className="w-full h-full object-cover mix-blend-multiply"
                      src={getProductImage(currentProduct.name)}
                    />
                  </div>
                  <div className="text-center md:text-left space-y-2 flex-1">
                    <h2 className="text-2xl font-black leading-tight tracking-tight">Berapa sisa <span className="text-primary">{currentProduct.name}</span>?</h2>
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                      <p className="text-muted font-bold text-sm bg-muted/5 px-3 py-1 rounded-full">Stok Lama: {stockNow}</p>
                      <p className="text-sm font-black text-primary bg-primary/5 px-3 py-1 rounded-full">Modal: Rp {Number(currentProduct.buyPrice).toLocaleString("id-ID")}</p>
                    </div>
                    <p className="text-[10px] font-bold text-muted uppercase tracking-widest mt-4">Masukkan Stok Baru</p>
                  </div>
                </div>

                <div className="w-full max-w-sm flex items-center justify-between mt-8 px-2">
                  <button
                    className="w-[56px] h-[56px] rounded-full bg-surface shadow-soft flex items-center justify-center text-primary border-2 border-transparent hover:border-primary/20 active:bg-primary/10 active:scale-95 transition-all"
                    onClick={() => {
                      const val = currentNew === "" ? stockNow : parseInt(currentNew)
                      setOpnameData({ ...opnameData, [currentProduct.id]: String(Math.max(0, val - 1)) })
                    }}
                  >
                    <Minus className="h-6 w-6 font-bold" />
                  </button>

                  <div className="flex-1 text-center">
                    <Input
                      type="number"
                      className="bg-transparent border-0 text-center text-[52px] font-bold leading-none tracking-tighter text-text-main shadow-none focus-visible:ring-0"
                      value={currentNew}
                      placeholder={String(stockNow)}
                      onChange={(e) => setOpnameData({ ...opnameData, [currentProduct.id]: e.target.value })}
                    />
                  </div>

                  <button
                    className="w-[56px] h-[56px] rounded-full bg-primary shadow-soft flex items-center justify-center text-white active:scale-95 transition-all"
                    onClick={() => {
                      const val = currentNew === "" ? stockNow : parseInt(currentNew)
                      setOpnameData({ ...opnameData, [currentProduct.id]: String(val + 1) })
                    }}
                  >
                    <Plus className="h-6 w-6 font-bold" />
                  </button>
                </div>

                <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-background-light via-background-light to-transparent pb-6 flex justify-center z-40">
                  <button
                    className="w-full max-w-md h-[54px] bg-primary text-white text-base font-bold rounded-full shadow-lg active:scale-[0.98] transition-all pointer-events-auto flex items-center justify-center gap-2"
                    onClick={handleSave}
                    disabled={loading || currentNew === ""}
                  >
                    <span>{loading ? "Menyimpan..." : "Lanjut Gaskeun"}</span>
                    <ArrowRight className="h-5 w-5" />
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center py-20">
                <p className="text-xl font-bold text-text-main">Semua beres!</p>
                <p className="text-muted">Tidak ada lagi barang untuk kategori ini.</p>
              </div>
            )}
          </main>
        </>
      )}
    </div>
  )
}

function getProductImage(name: string) {
  const value = name.toLowerCase()
  if (value.includes("kopi")) return "https://lh3.googleusercontent.com/aida-public/AB6AXuB8qGiKHELMBF60DIGcbGHK9RGcd0lvqAQ5_uLYEG130tQ5W-ETd2v0gPvJNpm6E1L6v7dWQGDOlxibJ6PA_CXeaMAOHjDx-_db7w2lJz-Nke1lI0TdtAGEIpg2lueVV2oTdTcQHe9aXGPzRX8iDAqEhg2Fe1vKFqzKKtEmWDpmRAMDS0kQN-xMDZ7NTY4YbzUGLwzWu_qdIqv4CRYmfgrg09ttG5ixKpHf6R9DWn02Vp7MyKeuZl56GJLRsTJMoO7svvIaAtAFK30"
  if (value.includes("indomie") || value.includes("mie")) return "https://lh3.googleusercontent.com/aida-public/AB6AXuDV-0jVrFGbHJyHC02ITUa2Ju0txz4-YMFuT-4r9cmLk7ZQnFkCgxMmIp0yRF2yBXXufRyXJE-3AWlnDuibp403P4TF1L1rkmSMoOsgQp9Q7emvd0zErFWBr5-PY3jx_h87I3p-rBN60z2WBylCeBUrNNl20aD0dk2WKfjxge4xVzlQKQFD0qhvxeCtnE-VhOiFlFCY55wdya6GO0NjRPruKX8ndsFP5O39lT2_L7j9nHSWN_1dIchN-Tu0wv15V6f5TRZTWszZejk"
  if (value.includes("aqua") || value.includes("air")) return "https://lh3.googleusercontent.com/aida-public/AB6AXuCK10wY2xIOaL67GvLtsTsaszrGG_X1jQdOPMzseWq5EJMa7PP5tWjXNAdD3hYMS_QKmqg3iwa2PlJApXnOnehyYjfF2xTzOBoCcpj7BIofS4Neoocpv7RMl1--xNgkdDlcqlPTTDmmpoDhCDYbMXawLXHuAPa1N8b8py_lO4HKmcpxCPOrFp9FOpatoMNdMLIzfLfHGp3rJQ7QQQlGOkSj_vXOw-6RntvFHVVttnHgPEI9VIcIdOSNHpwWNYTZZVoja8R0cerTVeU"
  if (value.includes("rokok") || value.includes("gudang garam")) return "https://lh3.googleusercontent.com/aida-public/AB6AXuBdi0Sb-EHREN7a0YxIBTaTWK4zsvXMNT8eLAZOcPHJmpvNJFAKZm-z4fi0P5iLvYNXbOZjwV79b8xKlOkyHvlQNyDdtIARDZZarC9b8EMkPJRLr0O-TVsrKGA3idJcrPLpem4b2RyXAWxR76qPUxiqHeu8jt-c_rGF_QX4Yz-3-o8XLo2I82uQb-P2fIwx6XL1-QjmZpVVKT734HOEfJLie38LzIunyJcG1so7-kjQlQT7JA3ynHgRAdgwbpAzLL5TgQPeFuyScFE"
  return "https://lh3.googleusercontent.com/aida-public/AB6AXuDUIzr0_pmXYmEB-93MbLkQ_CplTP1BMGlZvbVMIDzKboTWOXUShue32XUrUVIQTO_xTWB5FQwRfNNc06ej4IqvfoBYH8hJtXzol2Y9a-zXwF40nnAosxeiwzqW_R6L0FUNkbcDtbQ9cWK_KxS-wVlMgjgQDEkUCJigzeaCxy2V-3j0Fdn4tsJblbetJBWzBBaA3jGphhYFlHXtmNm8sGuXRsVEwSf0QqC18IrVYfmW2HkZLPc4QbwmPI9WHFhvTabwQ8mKDhWOwQA"
}
