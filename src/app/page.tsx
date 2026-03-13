import Link from "next/link"
import Image from "next/image"
import { ArrowRight } from "lucide-react"
import { getCurrentUser } from "@/lib/actions/auth"

export default async function Home() {
  const user = await getCurrentUser()

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] px-6 py-12 bg-background-light">
      <div className="w-full max-w-md flex flex-col items-center text-center space-y-12 enter-rise">
        {/* Illustration Container */}
        <div className="relative w-full aspect-square max-w-[320px] bg-white rounded-[40px] shadow-premium overflow-hidden border border-muted/10 p-4">
          <Image
            src="/landing-illustration.png"
            alt="CekToko Illustration"
            fill
            className="object-contain p-4"
            priority
          />
        </div>

        {/* Text Content */}
        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight text-text-main">
            CekToko
          </h1>
          <p className="text-lg text-text-muted max-w-[280px] mx-auto leading-relaxed">
            Pantau Stok & Omzet Warung Lebih Mudah & Profesional
          </p>
        </div>

        {/* Action Button */}
        <div className="pt-8">
          <Link
            href={user ? "/dashboard" : "/login"}
            className="group relative flex items-center justify-center w-16 h-16 bg-[#2d3e40] text-white rounded-full shadow-lg transition-all hover:scale-110 hover:shadow-xl active:scale-95"
          >
            <ArrowRight className="w-6 h-6 transition-transform group-hover:translate-x-1" />
          </Link>
          <p className="mt-4 text-sm font-medium text-text-muted uppercase tracking-widest">
            {user ? "Ke Dashboard" : "Mulai Sekarang"}
          </p>
        </div>
      </div>
    </div>
  )
}
