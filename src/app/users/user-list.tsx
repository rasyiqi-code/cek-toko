"use client"

import { useState, useEffect } from "react"
import { Plus, Trash2, User, ShieldCheck, ShieldAlert, Shield, Loader2, X, ShieldPlus, CheckCircle2 } from "lucide-react"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { createUser, deleteUser } from "@/lib/actions/auth"
import type { UserRole } from "@/lib/session"
import { setGuardianDuty } from "@/lib/actions/guardian"
import { cn } from "@/lib/utils"
import { TopNav } from "@/components/navigation"

interface UserData {
  id: string
  name: string
  username: string
  role: string
}

export function UserList({ initialUsers, initialActiveGuardian }: { initialUsers: UserData[], initialActiveGuardian: any }) {
  const [users, setUsers] = useState(initialUsers)
  const [activeGuardian, setActiveGuardian] = useState(initialActiveGuardian)
  const [isAdding, setIsAdding] = useState(false)
  const [loading, setLoading] = useState(false)
  const [pressingId, setPressingId] = useState<string | null>(null)
  const [pressTimer, setPressTimer] = useState<NodeJS.Timeout | null>(null)

  // Form state
  const [name, setName] = useState("")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState<UserRole>("PENJAGA") // Note: The actual type value is still PENJAGA (database), but UI will show it as PENJAGA or updated label if needed. 
  const searchParams = useSearchParams()
  const router = useRouter()

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
    router.replace(`/users?${params.toString()}`)
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const res = await createUser({ name, username, password, role })
    if (res.success) {
      setUsers([...users, { id: Math.random().toString(), name, username, role }].sort((a, b) => a.username.localeCompare(b.username)))
      setIsAdding(false)
      setName("")
      setUsername("")
      setPassword("")
    } else {
      alert(res.error)
    }
    setLoading(false)
  }

  const startDeletePress = (id: string, username: string) => {
    if (loading) return
    setPressingId(id)
    const timer = setTimeout(() => {
      handleDelete(id, username)
      setPressingId(null)
    }, 1500)
    setPressTimer(timer)
  }

  const cancelDeletePress = () => {
    if (pressTimer) clearTimeout(pressTimer)
    setPressTimer(null)
    setPressingId(null)
  }

  const handleDelete = async (id: string, username: string) => {
    setLoading(true)
    const res = await deleteUser(id)
    if (res.success) {
      setUsers(users.filter(u => u.id !== id))
    } else {
      alert(res.error)
    }
    setLoading(false)
  }

  const handleSetGuardianAction = async (userId: string, userName: string) => {
    if (!confirm(`Jadikan "${userName}" sebagai Penanggung Jawab Toko saat ini?`)) return
    setLoading(true)
    const res = await setGuardianDuty(userId, userName)
    if (res.success) {
      setActiveGuardian({ userId, userName, startDate: new Date() })
      router.refresh()
    } else {
      alert(res.error)
    }
    setLoading(false)
  }

  return (
    <div className="flex flex-col space-y-1">

      <div className="px-4 pt-4 pb-12">
        <div className="dashboard-grid">
          {users.map((user) => (
            <Card key={user.id} className="p-4 bg-surface border-2 border-transparent hover:border-primary/20 transition-all flex items-center gap-4 relative">
              <div className={cn(
                "size-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm",
                user.role === "OWNER" ? "bg-primary/10 text-primary" :
                  user.role === "TIM_PENGECEK" ? "bg-accent-success/10 text-accent-success" :
                    "bg-muted/10 text-muted"
              )}>
                {user.role === "OWNER" ? <ShieldCheck className="size-6" /> :
                  user.role === "TIM_PENGECEK" ? <Shield className="size-6" /> :
                    <User className="size-6" />}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-black text-text-main truncate">{user.name}</h3>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-muted">@{user.username}</span>
                  <span className="size-1 rounded-full bg-muted/30" />
                  <span className={cn(
                    "text-[10px] font-black uppercase tracking-widest",
                    user.role === "OWNER" ? "text-primary" :
                      user.role === "TIM_PENGECEK" ? "text-accent-success" :
                        "text-muted"
                  )}>{user.role}</span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-3 min-w-[40px]">
                {user.role !== "OWNER" && (
                  <div className="relative">
                    <button
                      onMouseDown={() => startDeletePress(user.id, user.username)}
                      onMouseUp={cancelDeletePress}
                      onMouseLeave={cancelDeletePress}
                      onTouchStart={() => startDeletePress(user.id, user.username)}
                      onTouchEnd={cancelDeletePress}
                      disabled={loading}
                      className={cn(
                        "size-8 flex items-center justify-center rounded-xl transition-all duration-300",
                        pressingId === user.id 
                          ? "bg-red-500 text-white scale-125 shadow-lg animate-pulse" 
                          : "text-muted/20 hover:text-red-400 hover:bg-red-50/50"
                      )}
                    >
                      <Trash2 className={cn("size-4", pressingId === user.id ? "animate-bounce" : "")} />
                    </button>
                    {pressingId === user.id && (
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-red-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded uppercase whitespace-nowrap animate-bounce">
                        Tahan...
                      </div>
                    )}
                  </div>
                )}
                
                {activeGuardian?.userId === user.id ? (
                  <div className="size-9 flex items-center justify-center bg-accent-success/10 text-accent-success rounded-xl border border-accent-success/20 shadow-inner" title="Penanggung Jawab Aktif">
                    <CheckCircle2 className="size-5 animate-in zoom-in duration-300" />
                  </div>
                ) : (
                  user.role !== "OWNER" && (
                    <button
                      onClick={() => handleSetGuardianAction(user.id, user.name)}
                      disabled={loading}
                      className="size-9 flex items-center justify-center rounded-xl text-primary/40 hover:text-primary hover:bg-primary/5 active:scale-95 transition-all border border-transparent hover:border-primary/10"
                      title="Jadikan Penanggung Jawab"
                    >
                      <ShieldPlus className="size-5" />
                    </button>
                  )
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Modal Overlay handles Add button logic now */}

      {/* Add User Modal-ish Overlay */}
      {isAdding && (
        <div className="fixed inset-0 z-[100] bg-background-dark/40 backdrop-blur-sm flex items-end md:items-center justify-center p-4">
          <div className="w-full max-w-md bg-surface rounded-[40px] md:rounded-[32px] p-6 shadow-2xl animate-in fade-in slide-in-from-bottom-8 duration-300">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-black tracking-tight text-text-main">Tambah User Baru</h2>
              <button
                onClick={closeAdding}
                className="size-10 rounded-full bg-background-light flex items-center justify-center text-muted hover:text-text-main transition-colors"
              >
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-muted ml-1">Nama Lengkap</label>
                <Input
                  placeholder="Misal: Rasyiqi"
                  required
                  className="h-12 rounded-xl border-2 border-muted/20 focus:border-primary transition-all font-bold"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-muted ml-1">Username</label>
                <Input
                  placeholder="username_baru"
                  required
                  className="h-12 rounded-xl border-2 border-muted/20 focus:border-primary transition-all font-bold"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-muted ml-1">Password</label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  required
                  className="h-12 rounded-xl border-2 border-muted/20 focus:border-primary transition-all font-bold"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-muted ml-1">Role</label>
                <div className="grid grid-cols-3 gap-2">
                  {(["PENJAGA", "TIM_PENGECEK", "OWNER"] as UserRole[]).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRole(r)}
                      className={cn(
                        "py-2.5 rounded-xl text-[10px] font-black transition-all border-2",
                        role === r ? "bg-primary border-primary text-white shadow-md shadow-primary/20" : "bg-background-light border-transparent text-muted hover:border-muted/20"
                      )}
                    >
                      {r === "TIM_PENGECEK" ? "PENGECEK" : r === "PENJAGA" ? "PENGGUNA" : r}
                    </button>
                  ))}
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-14 mt-4 rounded-2xl text-lg font-black tracking-tight"
              >
                {loading ? <Loader2 className="size-6 animate-spin" /> : "Simpan User"}
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
