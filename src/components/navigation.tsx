"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Package, FileText, Boxes, ChevronLeft, UserCircle, LogOut, Users, Search, X, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { logout } from "@/lib/actions/auth"
import { clearToken } from "@/lib/auth-client"
import { getStoreSettings } from "@/lib/actions/settings"
import { useRouter } from "next/navigation"
import { useEffect, useState, useRef } from "react"

export function TopNav({ 
  title, 
  variant = "back", 
  backHref,
  rightAction,
  className,
  user,
  onSearch
}: { 
  title: string, 
  variant?: "greeting" | "back", 
  backHref?: string,
  rightAction?: React.ReactNode,
  className?: string,
  user?: any,
  onSearch?: (value: string) => void
}) {
  const router = useRouter()
  const [isSearchActive, setIsSearchActive] = useState(false)
  const [searchValue, setSearchValue] = useState("")
  const searchInputRef = useRef<HTMLInputElement>(null)
  const [storeName, setStoreName] = useState("CekToko")
  const [licenseInfo, setLicenseInfo] = useState<{
    licenseKey?: string,
    validUntil?: string | Date
  } | null>(null)

  useEffect(() => {
    const fetchSettings = async () => {
      const settings = await getStoreSettings()
      setStoreName(settings.storeName)
      setLicenseInfo({
        licenseKey: settings.licenseKey,
        validUntil: settings.validUntil
      })
    }
    fetchSettings()
  }, [])


  const handleLogout = async () => {
    if (!confirm("Keluar dari aplikasi?")) return
    await logout()
    await clearToken()
    router.push("/login")
    router.refresh()
  }

  useEffect(() => {
    if (isSearchActive && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [isSearchActive])

  const toggleSearch = () => {
    if (isSearchActive) {
      setSearchValue("")
      onSearch?.("")
    }
    setIsSearchActive(!isSearchActive)
  }

  return (
    <header className={cn(
      "sticky top-0 z-40 w-full bg-background-light/95 backdrop-blur-md border-b border-muted/5 flex items-center px-4 h-16 shrink-0 transition-all mb-4",
      className
    )}>
      {variant === "greeting" ? (
        <div className="flex w-full items-center justify-between">
          <div className="flex flex-col pt-0.5">
            <span className="text-[10px] font-black uppercase tracking-widest text-primary leading-none mb-1.5 opacity-80">CEKTOKO</span>
            <h1 className="text-xl font-black tracking-tight text-text-main leading-none">{title === "Dashboard Toko" ? storeName : title}</h1>
          </div>
          <div className="flex items-center gap-2">
            {licenseInfo?.validUntil && (
              (() => {
                const diff = new Date(licenseInfo.validUntil).getTime() - Date.now()
                const days = Math.ceil(diff / (1000 * 60 * 60 * 24))
                const isTrial = !licenseInfo.licenseKey || licenseInfo.licenseKey === "TRIAL-14D"
                
                if (isTrial && days <= 14) {
                  return (
                    <div className="px-2 py-0.5 mr-2 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center gap-1.5 shadow-sm">
                      <div className="size-1 rounded-full bg-amber-500 animate-pulse" />
                      <span className="text-[8px] font-black text-amber-600 uppercase tracking-tighter">
                        Trial: {days} Hari Lagi
                      </span>
                    </div>
                  )
                }
                
                if (days > 0) {
                  return (
                    <div className="px-2 py-0.5 mr-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-1.5 shadow-sm">
                      <div className="size-1 rounded-full bg-emerald-500" />
                      <span className="text-[8px] font-black text-emerald-600 uppercase tracking-tighter">
                        Premium
                      </span>
                    </div>
                  )
                }
                return null
              })()
            )}
            <button 
              onClick={() => router.push("/activate-license")}
              className="px-3 py-1.5 rounded-full bg-background-light text-[10px] font-bold text-muted hover:text-primary transition-all active:scale-95 border border-transparent hover:border-primary/20 flex items-center justify-center whitespace-nowrap active:bg-primary/10"
            >
              Kelola Lisensi
            </button>
            <button 
              onClick={handleLogout}
              className="size-10 rounded-full bg-background-light flex items-center justify-center text-muted hover:text-red-500 transition-all active:scale-95"
            >
              <LogOut className="size-5" />
            </button>
          </div>
        </div>
      ) : (
        <div className="flex w-full items-center h-full">
          {/* Left Slot: 1/5 width */}
          <div className="flex-1 basis-0 flex items-center">
            {!isSearchActive && backHref ? (
              <Link href={backHref} className="inline-flex items-center gap-1 text-primary active:opacity-70 transition-all">
                <ChevronLeft className="size-5 stroke-[3px]" />
                <span className="text-sm font-bold">Kembali</span>
              </Link>
            ) : null}
          </div>

          {/* Center Slot: 3/5 width */}
          <div className="flex-[3] flex justify-center items-center px-4 relative h-full">
            {isSearchActive ? (
              <div className="w-full flex items-center gap-2 animate-in fade-in zoom-in-95 duration-200">
                <div className="relative w-full">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchValue}
                    onChange={(e) => {
                      setSearchValue(e.target.value)
                      onSearch?.(e.target.value)
                    }}
                    onKeyDown={(e) => e.key === "Escape" && toggleSearch()}
                    placeholder="Cari..."
                    className="w-full h-10 pl-9 pr-4 bg-background-light border-2 border-primary/20 rounded-xl text-sm font-bold focus:border-primary focus:outline-none transition-all"
                  />
                </div>
                <button 
                  onClick={toggleSearch}
                  className="size-8 rounded-full bg-muted/10 flex items-center justify-center text-muted hover:text-text-main shrink-0"
                >
                  <X className="size-4" />
                </button>
              </div>
            ) : (
              <h1 className="text-[17px] font-black tracking-tight text-text-main text-center truncate">{title}</h1>
            )}
          </div>

          {/* Right Slot: 1/5 width */}
          <div className="flex-1 basis-0 flex justify-end items-center gap-2">
            {!isSearchActive && onSearch && (
              <button 
                onClick={toggleSearch}
                className="size-9 rounded-full bg-surface border border-muted/10 flex items-center justify-center shadow-soft text-muted hover:text-primary transition-all"
              >
                <Search className="size-4.5" />
              </button>
            )}
            {!isSearchActive && rightAction}
          </div>
        </div>
      )}

    </header>
  )
}

const getNavItems = (role: string) => {
  const items = [
    { href: "/dashboard", label: "Dashboard", icon: Home },
  ]

  if (role === "OWNER" || role === "TIM_PENGECEK") {
    items.push({ href: "/products", label: "Produk", icon: Package })
    items.push({ href: "/reports", label: "Laporan", icon: FileText })
  }

  if (role === "OWNER") {
    items.push({ href: "/categories", label: "Kategori", icon: Boxes })
    items.push({ href: "/users", label: "Pengguna", icon: Users })
  }

  return items
}

export function BottomNav({ user }: { user?: any }) {
  const pathname = usePathname()
  const role = user?.role || "PENJAGA"
  const navItems = getNavItems(role)

  const isAuthOrLicense = pathname.includes("/login") || 
                         pathname.includes("/register-store") || 
                         pathname.includes("/activate-license") || 
                         pathname === "/dashboard" ||
                         pathname === "/"

  if (isAuthOrLicense) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 w-full max-w-md mx-auto z-50 pointer-events-none px-4 pb-4 md:hidden">
      <nav className="pointer-events-auto flex items-center justify-around w-full bg-surface/90 backdrop-blur-xl h-16 px-4 shadow-floating rounded-[16px] border border-muted/10">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex flex-col items-center justify-center transition-all px-4 h-full",
                isActive ? "text-primary" : "text-muted hover:text-text-main"
              )}
            >
              <Icon className={cn("h-6 w-6", isActive ? "stroke-[2.5px]" : "stroke-[2px]")} />
              {isActive && <div className="absolute -bottom-1 size-1 rounded-full bg-primary" />}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}

export function Sidebar({ user }: { user?: any }) {
  const pathname = usePathname()
  const role = user?.role || "PENJAGA"
  const navItems = getNavItems(role)

  const isAuthOrLicense = pathname.includes("/login") || 
                         pathname.includes("/register-store") || 
                         pathname.includes("/activate-license")

  if (isAuthOrLicense) return null

  return (
    <aside className="hidden w-72 flex-col rounded-[1.5rem] border border-muted/10 bg-surface/80 p-6 shadow-soft backdrop-blur-xl md:flex sticky top-6 bottom-6 h-[calc(100dvh-3rem)] dark:bg-slate-900/80 shrink-0">
      <div className="mb-10 flex items-center px-4">
        <div className="size-12 rounded-2xl bg-primary flex items-center justify-center mr-4">
          <Boxes className="text-white h-7 w-7" />
        </div>
        <h1 className="text-2xl font-black tracking-tighter text-text-main uppercase">CekToko</h1>
      </div>
      <nav className="flex-1 space-y-3">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center gap-4 rounded-2xl px-5 py-4 text-base font-black transition-all",
                isActive
                  ? "bg-primary text-white shadow-lg"
                  : "text-muted hover:bg-background-light hover:text-text-main"
              )}
            >
              <Icon className={cn("h-6 w-6 transition-transform group-hover:scale-110", isActive && "stroke-[3px]")} />
              <span className="tracking-tight">{item.label}</span>
            </Link>
          )
        })}
      </nav>
      <div className="mt-8 p-6 bg-primary/5 rounded-[32px] border border-primary/10 relative overflow-hidden group">
        <div className="absolute top-0 right-0 size-20 bg-primary/10 rounded-full -mr-10 -mt-10 group-hover:scale-110 transition-transform" />
        <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-2">Akun Aktif</p>
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl bg-primary text-white flex items-center justify-center font-black">
            {user?.name?.[0] || "?"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-black text-text-main truncate">{user?.name || "User"}</p>
            <p className="text-[10px] font-bold text-muted uppercase tracking-wider">{user?.role || "PENGGUNA"}</p>
          </div>
        </div>
        <button 
          onClick={async () => {
            if (!confirm("Keluar dari aplikasi?")) return
            await logout()
            await clearToken()
            window.location.href = "/login"
          }}
          className="w-full mt-4 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-black text-red-500 hover:bg-red-500/10 transition-all border border-red-500/20"
        >
          <LogOut className="size-4" />
          Logout
        </button>
      </div>
    </aside>
  )
}
