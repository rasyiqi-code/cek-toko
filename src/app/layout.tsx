import type { Metadata, Viewport } from "next"
import { Spline_Sans, Geist_Mono } from "next/font/google"
import "./globals.css"
import { BottomNav, Sidebar } from "@/components/navigation"

const splineSans = Spline_Sans({
  variable: "--font-spline-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "CekToko - Sistem Cek Stok Warung Madura",
  description: "Aplikasi Cek Stok Warung Madura Offline-First",
  manifest: "/manifest.json",
  icons: {
    icon: "/icon.png",
    shortcut: "/favicon.png",
    apple: "/icon.png",
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#f96b06",
}

import { Toaster } from "sonner"
import { QueryProvider } from "@/components/providers"
import { OnlineStatus } from "@/components/online-status"
import { SyncManager } from "@/components/sync-manager"
import { PwaRegister } from "@/components/pwa-register"
import { getCurrentUser } from "@/lib/actions/auth"

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const user = await getCurrentUser()

  return (
    <html lang="id" suppressHydrationWarning>
      <body className={`${splineSans.variable} ${geistMono.variable} antialiased bg-background-light dark:bg-background-dark text-text-main`}>
        <Toaster position="top-center" richColors />
        <QueryProvider>
          <PwaRegister />
          <OnlineStatus />
          <SyncManager />
          <div className="flex h-screen w-full bg-[#d8d2c7] overflow-hidden justify-center fixed inset-0">
            <div className="flex-1 flex lg:p-6 md:p-4 p-0 md:gap-6 gap-0 h-full w-full overflow-hidden">
              <Sidebar user={user} />
              <div className="flex-1 flex h-full overflow-hidden">
                <div className="w-full h-full bg-background-light md:rounded-[24px] md:shadow-soft md:border md:border-muted/5 flex flex-col overflow-hidden relative">
                  <main className="scroll-area w-full h-full relative">
                    {children}
                  </main>
                  <BottomNav user={user} />
                </div>
              </div>
            </div>
          </div>
        </QueryProvider>
      </body>
    </html>
  )
}
