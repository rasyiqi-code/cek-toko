"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { getCurrentUser } from "./auth"
import { SESSION_COOKIE, SESSION_MAX_AGE, encodeSession } from "@/lib/session"
import { cookies } from "next/headers"

export async function getStoreSettings() {
  try {
    const user = await getCurrentUser()
    if (!user) throw new Error("Unauthorized")

    let settings = await (prisma as any).storeProfile.findUnique({
      where: { storeId: user.storeId }
    })
    
    if (!settings) {
      settings = await (prisma as any).storeProfile.create({
        data: {
          storeId: user.storeId,
          storeName: "CekToko"
        }
      })
    }

    const store = await (prisma as any).store.findUnique({
      where: { id: user.storeId },
      select: { licenseKey: true, validUntil: true }
    })
    
    return {
      ...settings,
      licenseKey: store?.licenseKey,
      validUntil: store?.validUntil
    }
  } catch (error) {
    console.error("Failed to fetch store settings:", error)
    return { storeName: "CekToko" }
  }
}


export async function activateLicense(licenseKey: string) {
  try {
    const user = await getCurrentUser()
    if (!user) return { success: false, error: "Unauthorized" }

    // External Verification Integration
    const response = await fetch('https://crediblemark.com/api/public/verify-license', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        key: licenseKey, 
        productSlug: "warung-madura-store-checker", 
        machineId: user.storeId 
      })
    })
    
    const apiData = await response.json()
    
    if (!apiData.valid) {
      return { success: false, error: apiData.message || "Lisensi tidak valid." }
    }

    let validUntil: Date
    
    if (apiData.license?.expiresAt) {
      validUntil = new Date(apiData.license.expiresAt)
    } else if (apiData.license && apiData.license.expiresAt === null) {
      // Lifetime license: set to very far in the future
      validUntil = new Date("2099-12-31T23:59:59Z")
    } else {
      // Fallback to keyword-based duration if API doesn't provide specific expiry
      let durationInDays = apiData.durationInDays || 0
      if (!durationInDays) {
          if (licenseKey.includes("-1Y-")) durationInDays = 365
          else if (licenseKey.includes("-1M-")) durationInDays = 30
          else durationInDays = 14
      }
      validUntil = new Date(Date.now() + durationInDays * 24 * 60 * 60 * 1000)
    }

    await (prisma as any).store.update({
      where: { id: user.storeId },
      data: {
        licenseKey,
        isValid: true,
        validUntil
      }
    })

    // Update session cookie to reflect changes immediately
    const updatedUser = {
        ...user,
        storeValid: true,
        validUntil: validUntil.toISOString()
    }
    
    const cookieStore = await cookies()
    cookieStore.set(SESSION_COOKIE, encodeSession(updatedUser), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: SESSION_MAX_AGE,
      path: "/",
    })

    revalidatePath("/")
    return { success: true, validUntil }
  } catch (e) {
    console.error(e)
    return { success: false, error: "Gagal mengaktifkan lisensi." }
  }
}

export async function claimTrial() {
  try {
    const user = await getCurrentUser()
    if (!user) return { success: false, error: "Unauthorized" }

    const store = await (prisma as any).store.findUnique({
      where: { id: user.storeId }
    })

    if (!store) return { success: false, error: "Toko tidak ditemukan" }
    
    // Eligibility check: only if never had a license key and currently invalid
    if (store.licenseKey) {
      return { success: false, error: "Uji coba hanya untuk pengguna baru." }
    }

    if (store.isValid) {
        return { success: false, error: "Toko Anda sudah aktif." }
    }

    const durationInDays = 14
    const now = new Date()
    const validUntil = new Date(now.getTime() + durationInDays * 24 * 60 * 60 * 1000)

    await (prisma as any).store.update({
      where: { id: user.storeId },
      data: {
        isValid: true,
        validUntil,
        licenseKey: "TRIAL-14D" // Marker for trial
      }
    })

    // Update session cookie for trial too
    const updatedUser = {
        ...user,
        storeValid: true,
        validUntil: validUntil.toISOString()
    }
    
    const cookieStore = await cookies()
    cookieStore.set(SESSION_COOKIE, encodeSession(updatedUser), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: SESSION_MAX_AGE,
      path: "/",
    })

    revalidatePath("/")
    return { success: true, validUntil }
  } catch (e) {
    console.error(e)
    return { success: false, error: "Gagal memulai uji coba." }
  }
}
