"use client"

import { useEffect, useMemo, useState } from "react"
import { Trophy, Sparkles, CircleCheckBig } from "lucide-react"
import { TopNav } from "@/components/navigation"
import Link from "next/link"
import { cn } from "@/lib/utils"

function mapEmoji(name: string) {
  const val = name.toLowerCase()
  if (val.includes("mie") || val.includes("indomie")) return "🍜"
  if (val.includes("kopi")) return "☕"
  if (val.includes("rokok")) return "🚬"
  if (val.includes("aqua")) return "💧"
  return "📦"
}

function CountUp({ target }: { target: number }) {
  const [value, setValue] = useState(0)
  useEffect(() => {
    let start = 0
    const duration = 1000
    const step = (timestamp: number) => {
      if (!start) start = timestamp
      const progress = Math.min((timestamp - start) / duration, 1)
      setValue(Math.floor(progress * target))
      if (progress < 1) window.requestAnimationFrame(step)
    }
    window.requestAnimationFrame(step)
  }, [target])
  return <span>{value.toLocaleString("id-ID")}</span>
}

interface CategoryReport {
  id: string
  name: string
  auditValue: number
}

interface StockDetail {
  id: string
  name: string
  stock: { quantity: number } | null
}

interface StockOpname {
  id: string
  productId: string
  stockOld: number
  stockNew: number
  difference: number
  value: any
  checkerName?: string
  guardianName: string
  createdAt: any
  product: {
    name: string
    category: { name: string }
  }
}

export function ReportView({
  categoryReports,
  stockDetails,
  stockOpnames,
  activeGuardian
}: {
  categoryReports: CategoryReport[],
  stockDetails: StockDetail[],
  stockOpnames: StockOpname[],
  activeGuardian?: any
}) {
  const totalAuditResult = categoryReports.reduce((acc, cat) => acc + cat.auditValue, 0)

  const topProducts = useMemo(() => {
    return [...stockDetails]
      .sort((a, b) => (b.stock?.quantity || 0) - (a.stock?.quantity || 0))
      .slice(0, 3)
  }, [stockDetails])

  return (
    <div className="flex flex-col min-h-full relative pb-24">
      <TopNav title="Laporan Cek Barang" backHref="/dashboard" />

      <div className="flex-1 px-4">
        <div className="flex flex-col items-center text-center mb-6">
          <div className="relative mb-4 flex h-32 w-32 items-center justify-center rounded-full bg-surface shadow-soft">
            <Trophy className="relative z-10 h-12 w-12 text-primary" />
            <Sparkles className="absolute right-4 top-4 h-5 w-5 text-accent-success" />
            <Sparkles className="absolute bottom-6 left-4 h-4 w-4 text-primary" />
          </div>
          <h2 className="text-[24px] font-extrabold leading-tight tracking-tight text-text-main">
            {totalAuditResult >= 0 ? "Toko Aman!" : "Aduh, Kurang!"} <br />
            {totalAuditResult >= 0 ? "Barang Sesuai" : "Ada Selisih Kurang"}
          </h2>
          <p className="mt-1.5 text-sm font-medium text-muted">Rekapan dari {categoryReports.length} kategori barang.</p>
        </div>

        <div className="grid grid-cols-1 gap-3 mb-8">
          <div className={cn(
            "rounded-[32px] p-6 shadow-soft flex flex-col items-center gap-1 border-2 relative overflow-hidden",
            totalAuditResult >= 0 ? "bg-accent-success/5 border-accent-success/20" : "bg-red-50 border-red-100"
          )}>
            {activeGuardian && (
              <div className="mb-4 bg-surface/50 border border-muted/10 px-4 py-2 rounded-[20px] flex flex-col items-center gap-1 shadow-inner">
                <div className="flex items-center gap-1.5">
                  <div className="size-1.5 rounded-full bg-accent-success animate-pulse" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-text-main">
                    Penjaga: <span className="text-primary">{activeGuardian.userName}</span>
                  </p>
                </div>
                <p className="text-[9px] font-bold text-muted/60">
                  Mulai Jaga: {new Date(activeGuardian.startDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>
            )}
            <p className="text-[10px] font-black uppercase tracking-widest text-muted">Total Selisih Uang (Semua Barang)</p>
            <p className={cn(
              "text-3xl font-black tracking-tighter",
              totalAuditResult >= 0 ? "text-accent-success" : "text-red-500"
            )}>
              Rp <CountUp target={Math.abs(totalAuditResult)} />
              {totalAuditResult < 0 && <span className="ml-1">-</span>}
            </p>
            <p className="text-[10px] font-bold text-muted mt-1 opacity-70">Dihitung dari Harga Modal</p>
          </div>
        </div>

        <div className="space-y-4 mb-8">
          <h3 className="text-lg font-extrabold text-text-main px-1">Rekap Per Kategori</h3>
          <div className="grid grid-cols-2 gap-3">
            {categoryReports.map((cat) => (
              <div key={cat.id} className="bg-surface rounded-2xl p-4 shadow-soft border border-muted/10 relative overflow-hidden">
                <div className={cn(
                  "absolute top-0 right-0 w-1.5 h-full",
                  cat.auditValue >= 0 ? "bg-accent-success/30" : "bg-red-500/30"
                )} />
                <p className="text-[9px] font-black uppercase text-muted mb-1 truncate">{cat.name}</p>
                <p className={cn(
                  "text-sm font-black",
                  cat.auditValue >= 0 ? "text-accent-success" : "text-red-500"
                )}>
                  {cat.auditValue < 0 ? "-" : ""}Rp {Math.abs(cat.auditValue).toLocaleString("id-ID")}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="text-lg font-extrabold text-text-main px-1">Aktivitas Terakhir</h3>
          <div className="bg-surface rounded-2xl shadow-soft overflow-hidden border border-muted/10 divide-y divide-muted/5">
            {stockOpnames.length > 0 ? (
              stockOpnames.map((opname) => (
                <div key={opname.id} className="p-4 flex flex-col gap-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="bg-primary/5 border border-primary/10 px-3 py-1.5 rounded-full flex items-center gap-2">
                      <div className="size-1.5 rounded-full bg-primary animate-pulse" />
                      <p className="text-[10px] font-extrabold text-primary uppercase tracking-wider">
                        Dicek oleh: {opname.checkerName || opname.guardianName} • {new Date(opname.createdAt).toLocaleTimeString("id-ID", { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <div className={cn(
                      "px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider",
                      opname.difference === 0 ? "bg-slate-100 text-slate-500" :
                        opname.difference > 0 ? "bg-accent-success/10 text-accent-success" : "bg-red-50 text-red-500"
                    )}>
                      {opname.difference === 0 ? "Sesuai" : opname.difference > 0 ? `+${opname.difference}` : opname.difference}
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-bold text-text-main">{opname.product.name}</p>
                  </div>

                  <div className="grid grid-cols-3 gap-2 bg-background-light/50 p-2.5 rounded-xl border border-muted/5">
                    <div className="flex flex-col">
                      <span className="text-[8px] font-black uppercase text-muted leading-tight">Stok Lama</span>
                      <span className="text-sm font-extrabold text-text-main">{opname.stockOld}</span>
                    </div>
                    <div className="flex flex-col border-l border-muted/10 pl-2">
                      <span className="text-[8px] font-black uppercase text-muted leading-tight">Stok Baru</span>
                      <span className="text-sm font-extrabold text-text-main">{opname.stockNew}</span>
                    </div>
                    <div className="flex flex-col border-l border-muted/10 pl-2">
                      <span className="text-[8px] font-black uppercase text-muted leading-tight">Nilai Selisih</span>
                      <span className={cn(
                        "text-sm font-extrabold",
                        Number(opname.value) >= 0 ? "text-accent-success" : "text-red-500"
                      )}>
                        {Number(opname.value) < 0 ? "-" : ""}Rp {Math.abs(Number(opname.value)).toLocaleString("id-ID")}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center">
                <p className="text-sm text-muted">Belum ada aktivitas hari ini.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 w-full p-4 bg-gradient-to-t from-background-light via-background-light to-transparent pointer-events-none flex justify-center z-50">
        <Link
          href="/dashboard"
          className="w-full max-w-md h-[56px] bg-primary text-white text-base font-extrabold rounded-full shadow-lg active:scale-[0.98] transition-all pointer-events-auto flex items-center justify-center gap-2"
        >
          <CircleCheckBig className="h-5 w-5" />
          <span>Selesai</span>
        </Link>
      </div>
    </div>
  )
}
