"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { activateLicense, claimTrial, getStoreSettings } from "@/lib/actions/settings"
import { logout } from "@/lib/actions/auth"
import Link from "next/link"
import { Loader2, ChevronLeft } from "lucide-react"

export default function ActivateLicensePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [isValid, setIsValid] = useState(false)

  useEffect(() => {
    async function checkStatus() {
      const settings = await getStoreSettings()
      if (settings.success && (settings.licenseKey !== null || (settings.validUntil && new Date(settings.validUntil) > new Date()))) {
        setIsValid(true)
      }
    }
    checkStatus()
  }, [])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError("")

    const formData = new FormData(e.currentTarget)
    const key = formData.get("licenseKey") as string

    const res = await activateLicense(key)
    if (res.success) {
      window.location.href = "/dashboard"
    } else {
      setError(res.error || "Lisensi tidak valid")
      setLoading(false)
    }
  }

  async function handleClaimTrial() {
    setLoading(true)
    setError("")

    const res = await claimTrial()
    if (res.success) {
      window.location.href = "/dashboard"
    } else {
      setError(res.error || "Gagal mengaktifkan uji coba")
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f4f2ee] text-slate-900 flex items-center justify-center p-6 font-spline">
      <div className="w-full max-w-[400px] animate-in fade-in zoom-in-95 duration-500">
        <div className="text-center mb-6">
          <div className="size-14 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-[0_4px_12px_rgba(245,158,11,0.15)] transition-transform hover:scale-110 duration-300">
            <svg className="size-7 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 15v2m0 0v2m0-2h2m-2 0H10m11 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-black tracking-tight bg-gradient-to-br from-slate-900 to-slate-600 bg-clip-text text-transparent">Lisensi Diperlukan</h1>
          <p className="text-slate-500 text-sm mt-1 font-medium italic">Sistem langganan toko Anda tidak aktif</p>
        </div>

        <div className="bg-white/80 backdrop-blur-xl border border-white p-6 rounded-[2.5rem] shadow-xl shadow-slate-200/50 relative overflow-hidden">
          <div className="absolute top-0 right-0 size-32 bg-amber-500/[0.03] rounded-full -mr-16 -mt-16 blur-3xl text-center" />
          
          <div className="mb-6 p-4 bg-slate-50/50 border border-slate-100 rounded-2xl">
            <p className="text-[11px] text-slate-500 leading-relaxed font-semibold text-center italic">
              Silakan hubungi admin untuk mendapatkan kode lisensi. Lisensi berlaku sesuai paket yang Anda pilih.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Kode Lisensi</label>
              <input
                required
                name="licenseKey"
                placeholder="KEY-XXXX-XXXX"
                className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3.5 text-center font-mono text-base tracking-[0.2em] focus:outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500/50 transition-all placeholder:text-slate-300 text-slate-900 selection:bg-amber-100 shadow-inner shadow-slate-50"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-100 text-red-500 text-[11px] font-bold p-3 rounded-xl text-center animate-in shake duration-300">
                {error}
              </div>
            )}

            <button
              disabled={loading}
              className="w-full bg-slate-900 text-white hover:bg-slate-800 py-3.5 rounded-2xl font-black text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2 active:scale-[0.98] shadow-lg shadow-slate-300"
            >
              {loading ? <Loader2 className="size-4 animate-spin" /> : "Aktifkan Sekarang"}
            </button>
          </form>

          <div className="mt-4">
             <button
               type="button"
               disabled={loading}
               onClick={handleClaimTrial}
               className="w-full bg-amber-50 text-amber-600 hover:bg-amber-100 border border-amber-200 py-3.5 rounded-2xl font-black text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2 active:scale-[0.98]"
             >
               {loading ? <Loader2 className="size-4 animate-spin" /> : "Mulai Uji Coba 14 Hari"}
             </button>
             <p className="text-[9px] text-slate-400 text-center mt-3 px-4 italic font-medium uppercase tracking-tight">
               *Hanya berlaku 1x untuk toko yang belum pernah aktif.
             </p>
          </div>

          <div className="mt-6 pt-6 border-t border-slate-100 flex flex-col items-center gap-4 relative z-10">
             {isValid ? (
               <button 
                 onClick={() => router.push("/dashboard")}
                 className="text-slate-400 hover:text-slate-900 font-bold transition-all text-xs flex items-center gap-2 group px-4 py-2 rounded-xl hover:bg-slate-50 active:scale-95"
               >
                 <ChevronLeft className="size-4 group-hover:-translate-x-1 transition-transform" />
                 Kembali ke Dashboard
               </button>
             ) : (
                <button 
                  onClick={async () => {
                      await logout()
                      router.push("/login")
                  }}
                  className="text-slate-400 hover:text-red-500 transition-colors text-xs font-bold px-4 py-2 rounded-xl hover:bg-red-50 active:scale-95"
                >
                  Logout dan ganti akun
                </button>
             )}
          </div>
        </div>
        
        <div className="mt-8 text-center animate-in slide-in-from-bottom-2 duration-700 delay-300">
             <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-4">Hubungi Admin</p>
             <div className="flex justify-center gap-8">
                <a 
                  href="https://wa.me/6285183131249" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-emerald-600 text-xs font-black uppercase tracking-widest cursor-pointer hover:text-emerald-500 transition-colors px-2 py-1 rounded-lg hover:bg-emerald-50"
                >
                  WhatsApp
                </a>
                <a 
                  href="https://t.me/crediblemark" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 text-xs font-black uppercase tracking-widest cursor-pointer hover:text-blue-500 transition-colors px-2 py-1 rounded-lg hover:bg-blue-50"
                >
                  Telegram
                </a>
             </div>
        </div>
      </div>
    </div>
  )
}
