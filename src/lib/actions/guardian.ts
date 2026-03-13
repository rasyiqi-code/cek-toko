"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function getActiveGuardianDuty() {
  return await prisma.guardianDuty.findFirst({
    where: { active: true },
    orderBy: { startDate: "desc" }
  })
}

export async function getGuardianDuties() {
  return await prisma.guardianDuty.findMany({
    orderBy: { startDate: "desc" },
    take: 50
  })
}

export async function setGuardianDuty(userId: string, userName: string) {
  try {
    // 1. Deactivate current active duty
    await prisma.guardianDuty.updateMany({
      where: { active: true },
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
