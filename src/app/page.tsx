import Link from "next/link"
import Image from "next/image"
import { ArrowRight } from "lucide-react"
import { getCurrentUser } from "@/lib/actions/auth"

export default async function Home() {
  const user = await getCurrentUser()

  return (
    <div className="flex flex-col items-center justify-center min-h-full px-6 py-8 bg-background-light md:px-12">
      <div className="w-full max-w-sm md:max-w-5xl flex flex-col md:flex-row items-center justify-center text-center md:text-left md:gap-20 space-y-12 md:space-y-0 enter-rise">
        
        {/* Illustration Container - Left on Desktop */}
        <div className="relative w-full aspect-[4/5] max-w-[280px] md:max-w-[420px] bg-white rounded-[40px] shadow-soft overflow-hidden border border-muted/5 shrink-0 transition-all duration-500 hover:shadow-floating/5">
          <Image
            src="/landing-illustration.png"
            alt="CekToko Illustration"
            fill
            className="object-contain p-8 md:p-12"
            priority
          />
        </div>

        {/* Brand & Action Content - Right on Desktop */}
        <div className="flex flex-col items-center md:items-start space-y-8 md:space-y-10">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-6xl font-black tracking-tight text-text-main uppercase">
              CekToko
            </h1>
            <p className="text-[17px] md:text-xl font-medium text-muted max-w-[260px] md:max-w-[400px] leading-tight md:leading-snug">
              Pantau Stok & Omzet Warung Lebih Mudah & Profesional
            </p>
          </div>

          <div className="flex flex-col items-center md:items-start gap-4">
            <Link
              href={user ? "/dashboard" : "/login"}
              className="group relative flex items-center justify-center w-20 h-20 md:w-24 md:h-24 bg-primary text-white rounded-full shadow-floating transition-all hover:scale-105 active:scale-95"
            >
              <ArrowRight className="w-8 h-8 md:w-10 md:h-10 transition-transform group-hover:translate-x-1" />
            </Link>
            <span className="text-[10px] md:text-xs font-black text-primary uppercase tracking-[0.2em]">
              {user ? "KE DASHBOARD" : "MULAI SEKARANG"}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
