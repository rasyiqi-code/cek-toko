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
      if (settings.success && settings.licenseKey !== null || (settings.validUntil && new Date(settings.validUntil) > new Date())) {
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
      // Need to re-login to update session with storeValid: true
      // Or we can just redirect if the session cookie is updated by the server action
      // Server actions update cookies, but middleware might still have the old value cached in the browser session?
      // Actually cookie update in server action will be seen by subsequent requests.
      // A simple reload or redirect should work.
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
    <div className="min-h-screen bg-[#0a0c10] text-white flex items-center justify-center p-6 font-spline">
      <div className="w-full max-w-[400px] animate-in fade-in zoom-in-95 duration-500">
        <div className="text-center mb-6">
          <div className="size-14 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-[0_0_20px_rgba(245,158,11,0.1)]">
            <svg className="size-7 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 15v2m0 0v2m0-2h2m-2 0H10m11 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-black tracking-tight bg-gradient-to-br from-white to-slate-400 bg-clip-text text-transparent">Lisensi Diperlukan</h1>
          <p className="text-slate-500 text-sm mt-1 font-medium italic">Sistem langganan toko Anda tidak aktif</p>
        </div>

        <div className="bg-slate-900/40 backdrop-blur-xl border border-white/5 p-6 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 size-32 bg-blue-500/5 rounded-full -mr-16 -mt-16 blur-3xl text-center" />
          
          <div className="mb-6 p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
            <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
              Silakan hubungi admin untuk mendapatkan kode lisensi. Lisensi berlaku sesuai paket yang Anda pilih.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Kode Lisensi</label>
              <input
                required
                name="licenseKey"
                placeholder="KEY-XXXX-XXXX"
                className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-3.5 text-center font-mono text-base tracking-[0.2em] focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500/50 transition-all placeholder:text-slate-800 selection:bg-amber-500/30"
              />
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-[11px] font-bold p-3 rounded-xl text-center animate-in shake duration-300">
                {error}
              </div>
            )}

            <button
              disabled={loading}
              className="w-full bg-white text-black hover:bg-slate-200 py-3.5 rounded-2xl font-black text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2 active:scale-[0.98] shadow-lg shadow-white/5"
            >
              {loading ? <Loader2 className="size-4 animate-spin" /> : "Aktifkan Sekarang"}
            </button>
          </form>

          <div className="mt-4">
             <button
               type="button"
               disabled={loading}
               onClick={handleClaimTrial}
               className="w-full bg-amber-500/5 text-amber-500 hover:bg-amber-500/10 border border-amber-500/20 py-3.5 rounded-2xl font-black text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2 active:scale-[0.98]"
             >
               {loading ? <Loader2 className="size-4 animate-spin" /> : "Mulai Uji Coba 14 Hari"}
             </button>
             <p className="text-[9px] text-slate-600 text-center mt-3 px-4 italic font-medium">
               *Hanya berlaku 1x untuk toko yang belum pernah aktif.
             </p>
          </div>

          <div className="mt-6 pt-6 border-t border-white/5 flex flex-col items-center gap-4 relative z-10">
             {isValid ? (
               <button 
                 onClick={() => router.push("/dashboard")}
                 className="text-slate-400 hover:text-white font-bold transition-all text-xs flex items-center gap-2 group px-4 py-2 rounded-xl hover:bg-white/5 active:scale-95"
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
                  className="text-slate-500 hover:text-white transition-colors text-xs font-bold px-4 py-2 rounded-xl hover:bg-white/5 active:scale-95"
                >
                  Logout dan ganti akun
                </button>
             )}
          </div>
        </div>
        
        <div className="mt-8 text-center animate-in slide-in-from-bottom-2 duration-700 delay-300">
             <p className="text-slate-600 text-[10px] font-black uppercase tracking-[0.2em] mb-4">Hubungi Admin</p>
             <div className="flex justify-center gap-8">
                <span className="text-emerald-500/80 text-xs font-black uppercase tracking-widest cursor-pointer hover:text-emerald-400 transition-colors">WhatsApp</span>
                <span className="text-blue-500/80 text-xs font-black uppercase tracking-widest cursor-pointer hover:text-blue-400 transition-colors">Telegram</span>
             </div>
        </div>
      </div>
    </div>
  )
}
