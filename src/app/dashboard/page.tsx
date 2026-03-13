import { getDashboardStats } from "@/lib/actions/dashboard"
import { Package, ShieldCheck, Warehouse, AlertTriangle, TrendingUp, TrendingDown, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { TopNav } from "@/components/navigation"
import { getCurrentUser } from "@/lib/actions/auth"
import { redirect } from "next/navigation"

export default async function DashboardPage() {
  const user = await getCurrentUser()
  if (!user) redirect("/login")
  
  const stats = await getDashboardStats()

  const cards = [
    { 
      title: "Stok Menipis", 
      value: `${Math.max(Math.abs(stats.todayDifference), 0)} Barang`, 
      icon: AlertTriangle, 
      color: "text-primary",
      bg: "bg-primary/10"
    },
    { 
      title: "Barang Masuk", 
      value: stats.todayOpnamesCount.toLocaleString(), 
      icon: Warehouse, 
      color: "text-accent-success",
      bg: "bg-accent-success/10"
    },
    { 
      title: "Total Produk", 
      value: stats.totalProducts.toLocaleString(), 
      icon: Package, 
      color: "text-primary",
      bg: "bg-primary/10"
    },
    { 
      title: "Status Toko", 
      value: stats.todayDifference < 0 ? "Waspada" : "Aman", 
      icon: ShieldCheck, 
      color: "text-accent-success",
      bg: "bg-accent-success/10"
    },
  ]

  const summaryCards = [
    {
      label: "Total Nilai Modal",
      value: stats.totalValue,
      icon: <Warehouse className="size-4" />,
      color: "text-primary",
      bg: "bg-primary/5"
    },
    {
      label: "Selisih Audit",
      value: stats.totalAuditDiff,
      icon: stats.totalAuditDiff >= 0 ? <TrendingUp className="size-4" /> : <TrendingDown className="size-4" />,
      color: stats.totalAuditDiff >= 0 ? "text-accent-success" : "text-red-500",
      bg: stats.totalAuditDiff >= 0 ? "bg-accent-success/5" : "bg-red-50"
    }
  ]

  return (
    <div className="flex flex-col min-h-full relative">
      <TopNav title="Dashboard Toko" variant="greeting" user={user} />

      <div className="flex-1 pb-24">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 px-4 mt-5">
          {cards.map((stat, i) => (
            <button 
              key={i}
              className="flex flex-col justify-between h-[102px] bg-surface rounded-2xl p-3 shadow-soft text-left w-full border-2 border-transparent focus:outline-none focus:border-primary active:scale-95 transition-all"
            >
              <div className={cn("flex items-center justify-center size-8 rounded-full mb-1.5", stat.bg, stat.color)}>
                <stat.icon className="h-4.5 w-4.5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-muted leading-tight mb-1">{stat.title}</p>
                <p className="text-lg font-extrabold text-text-main leading-none">{stat.value}</p>
              </div>
            </button>
          ))}
        </div>

        {/* Report Summary Section */}
        <section className="mt-8 px-4">
          <div className="flex items-center justify-between mb-4 px-1">
            <h3 className="text-sm font-black uppercase tracking-widest text-text-main opacity-80">Ringkasan Laporan</h3>
            <Link href="/reports" className="text-[10px] font-black uppercase tracking-widest text-primary hover:opacity-80">Daftar Lengkap</Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {summaryCards.map((item, idx) => (
              <div key={idx} className="bg-surface rounded-3xl p-5 shadow-soft border border-muted/5 flex items-center gap-4">
                <div className={cn("size-12 rounded-2xl flex items-center justify-center shrink-0", item.bg, item.color)}>
                  {item.icon}
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted opacity-60 mb-0.5">{item.label}</span>
                  <p className={cn("text-xl font-black tracking-tight", item.color)}>
                    Rp {item.value.toLocaleString("id-ID")}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 p-5 bg-text-main rounded-[32px] text-white flex items-center justify-between overflow-hidden relative group">
            <div className="relative z-10">
              <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">Status Keuangan</p>
              <h4 className="text-lg font-black tracking-tight">Stok Anda Bernilai <span className="text-primary">Aset Aman</span></h4>
              <p className="text-[11px] font-bold opacity-70 mt-1 max-w-[200px]">Total modal tertanam di rak saat ini mencapai Rp {stats.totalValue.toLocaleString("id-ID")}</p>
            </div>
            <div className="size-20 bg-primary/20 rounded-full blur-3xl absolute -right-4 -top-4" />
            <div className="size-16 bg-white/5 rounded-full flex items-center justify-center relative z-10 border border-white/10 group-hover:scale-110 transition-transform">
              <Sparkles className="size-8 text-primary shadow-glow" />
            </div>
          </div>
        </section>
      </div>

      {/* CTA Button */}
      <div className="sticky md:fixed bottom-0 md:bottom-10 right-0 p-4 md:p-0 md:right-10 z-50 mt-auto pointer-events-none">
        <div className="hidden md:block absolute -inset-4 bg-background-light/20 blur-2xl rounded-full -z-10" />
        <Link 
          href="/stock"
          className="w-full md:w-[64px] h-[56px] md:h-[64px] bg-primary text-white rounded-full flex items-center justify-center gap-2 shadow-floating hover:shadow-2xl hover:-translate-y-1 text-lg font-extrabold active:scale-[0.98] transition-all pointer-events-auto"
        >
          <span className="text-2xl">📝</span>
          <span className="md:hidden">Mulai Cek Stok</span>
        </Link>
      </div>
      
      {/* Mobile Gradient Overlay */}
      <div className="sticky bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background-light via-background-light/40 to-transparent z-40 -mt-24 pointer-events-none md:hidden" />
    </div>
  )
}
