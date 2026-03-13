"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { registerStore } from "@/lib/actions/auth"
import { Loader2 } from "lucide-react"

export default function RegisterStorePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError("")

    const formData = new FormData(e.currentTarget)
    const storeName = formData.get("storeName") as string
    const adminName = formData.get("adminName") as string
    const username = formData.get("username") as string
    const password = formData.get("password") as string

    const res = await registerStore({ storeName, adminName, username, password })
    if (res.success) {
      localStorage.setItem("cek_toko_is_registered", "true")
      router.push("/login?registered=true")
    } else {
      setError(res.error || "Gagal mendaftar")
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0c10] text-white flex items-center justify-center p-6 font-spline">
      <div className="w-full max-w-[400px] animate-in fade-in zoom-in-95 duration-500">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-black tracking-tighter bg-gradient-to-br from-white to-slate-400 bg-clip-text text-transparent uppercase">
            CekToko
          </h1>
          <p className="text-slate-500 text-sm mt-1 font-medium italic">Daftarkan toko Madura Anda sekarang</p>
        </div>

        <div className="bg-slate-900/40 backdrop-blur-xl border border-white/5 p-6 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 size-32 bg-emerald-500/5 rounded-full -mr-16 -mt-16 blur-3xl" />
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Nama Toko</label>
              <input
                required
                name="storeName"
                placeholder="Contoh: Toko Barokah"
                className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/50 transition-all placeholder:text-slate-800"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Nama Pemilik</label>
              <input
                required
                name="adminName"
                placeholder="Nama lengkap Anda"
                className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/50 transition-all placeholder:text-slate-800"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Username</label>
                <input
                  required
                  name="username"
                  placeholder="admin"
                  className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/50 transition-all placeholder:text-slate-800"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Password</label>
                <input
                  required
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/50 transition-all placeholder:text-slate-800"
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-[11px] font-bold p-3 rounded-xl text-center">
                {error}
              </div>
            )}

            <button
              disabled={loading}
              className="w-full bg-white text-black hover:bg-slate-200 py-3.5 rounded-2xl font-black text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2 active:scale-[0.98] mt-2"
            >
              {loading ? <Loader2 className="size-4 animate-spin" /> : "Daftar Sekarang"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-slate-500 text-xs font-medium">
              Sudah punya toko?{" "}
              <button 
                onClick={() => router.push("/login")}
                className="text-emerald-400 font-black hover:underline transition-all"
              >
                Login di sini
              </button>
            </p>
          </div>
        </div>
        
        <p className="text-center text-slate-600 text-[9px] mt-8 font-medium italic">
          Dengan mendaftar, Anda menyetujui ketentuan layanan kami.
        </p>
      </div>
    </div>
  )
}
