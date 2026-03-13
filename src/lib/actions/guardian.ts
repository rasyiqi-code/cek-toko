"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { getCurrentUser } from "./auth"

export async function getActiveGuardianDuty() {
  const user = await getCurrentUser()
  if (!user) return null

  return await prisma.guardianDuty.findFirst({
    where: { 
      active: true,
      storeId: user.storeId
    },
    orderBy: { startDate: "desc" }
  })
}

export async function getGuardianDuties() {
  const user = await getCurrentUser()
  if (!user) return []

  return await prisma.guardianDuty.findMany({
    where: { storeId: user.storeId },
    orderBy: { startDate: "desc" },
    take: 50
  })
}

export async function setGuardianDuty(userId: string, userName: string) {
  try {
    const user = await getCurrentUser()
    if (!user) return { success: false, error: "Unauthorized" }

    // 1. Deactivate current active duty for this store
    await prisma.guardianDuty.updateMany({
      where: { 
        active: true,
        storeId: user.storeId
      },
      data: { 
        active: false,
        endDate: new Date()
      }
    })

    // 2. Create new active duty
    await prisma.guardianDuty.create({
      data: {
        userId,
        userName,
        storeId: user.storeId,
        startDate: new Date(),
        active: true
      }
    })

    revalidatePath("/reports")
    revalidatePath("/dashboard")
    revalidatePath("/")
    
    return { success: true }
  } catch (error) {
    console.error("Failed to set guardian duty:", error)
    return { success: false, error: "Gagal mengatur penjaga toko." }
  }
}
