"use client"

import { useState, useEffect } from "react"
import { login } from "@/lib/actions/auth"
import { saveToken } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"
import { Boxes, Lock, User, Loader2 } from "lucide-react"

export default function LoginPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [isRegistered, setIsRegistered] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (localStorage.getItem("cek_toko_is_registered") === "true") {
      setIsRegistered(true)
    }
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const res = await login(username, password)
      if (res.success) {
        if (res.token) await saveToken(res.token)
        router.push("/dashboard")
        router.refresh()
      } else {
        setError(res.error || "Login gagal")
      }
    } catch (err) {
      setError("Terjadi kesalahan sistem")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 bg-background-light">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center text-center">
          <div className="size-16 rounded-2xl bg-primary flex items-center justify-center mb-6 shadow-lg shadow-primary/20">
            <Boxes className="text-white h-10 w-10" />
          </div>
          <h1 className="text-4xl font-black tracking-tighter text-text-main uppercase">CekToko</h1>
          <p className="text-muted font-medium mt-1">Sistem Cek Stok Warung Madura</p>
        </div>

        <form onSubmit={handleLogin} className="mt-8 space-y-4">
          <div className="space-y-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-muted" />
              </div>
              <Input
                type="text"
                placeholder="Username"
                required
                className="h-14 pl-12 rounded-2xl border-2 border-muted/20 focus:border-primary transition-all bg-surface"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-muted" />
              </div>
              <Input
                type="password"
                placeholder="Password"
                required
                className="h-14 pl-12 rounded-2xl border-2 border-muted/20 focus:border-primary transition-all bg-surface"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm font-bold text-center">
              {error}
            </div>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-14 rounded-2xl text-lg font-black tracking-tight shadow-lg shadow-primary/20 active:scale-[0.98] transition-all"
          >
            {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : "Masuk Sekarang"}
          </Button>
        </form>

        {!isRegistered && (
          <div className="space-y-4">
            <p className="text-center text-xs text-muted font-medium">
              Belum punya akun toko?
            </p>
            <Button
              variant="outline"
              onClick={() => router.push("/register-store")}
              className="w-full h-14 rounded-2xl border-2 border-primary/20 text-primary font-bold hover:bg-primary/5 transition-all"
            >
              Daftarkan Toko Baru
            </Button>
          </div>
        )}

        <p className="text-center text-xs text-muted font-medium pt-4">
          Hubungi pemilik toko jika Anda lupa akun.
        </p>
      </div>
    </div>
  )
}
