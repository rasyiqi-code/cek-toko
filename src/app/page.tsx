import Link from "next/link"
import Image from "next/image"
import { ArrowRight } from "lucide-react"
import { getCurrentUser } from "@/lib/actions/auth"

export default async function Home() {
  const user = await getCurrentUser()

  return (
    <div className="flex flex-col items-center justify-center min-h-full px-6 py-6 bg-[#faf9f6]">
      <div className="w-full max-w-sm flex flex-col items-center text-center space-y-10 mb-8 enter-rise">
        {/* Illustration Container */}
        <div className="relative w-full aspect-[4/5] max-w-[280px] bg-white rounded-[40px] shadow-premium-flat overflow-hidden border border-muted/5">
          <Image
            src="/landing-illustration.png"
            alt="CekToko Illustration"
            fill
            className="object-contain p-8"
            priority
          />
        </div>

        {/* Text Content */}
        <div className="space-y-4">
          <h1 className="text-4xl font-black tracking-tight text-[#1a2123] uppercase">
            CekToko
          </h1>
          <p className="text-[17px] font-medium text-[#4a5559] max-w-[260px] mx-auto leading-tight">
            Pantau Stok & Omzet Warung Lebih Mudah & Profesional
          </p>
        </div>

        {/* Action Button */}
        <div className="flex flex-col items-center gap-4">
          <Link
            href={user ? "/dashboard" : "/login"}
            className="group relative flex items-center justify-center w-20 h-20 bg-[#2d3e40] text-white rounded-full shadow-floating transition-all hover:scale-105 active:scale-95"
          >
            <ArrowRight className="w-8 h-8 transition-transform group-hover:translate-x-1" />
          </Link>
          <span className="text-[10px] font-black text-[#4a5559]/60 uppercase tracking-[0.2em]">
            {user ? "KE DASHBOARD" : "MULAI SEKARANG"}
          </span>
        </div>
      </div>
    </div>
  )
}
