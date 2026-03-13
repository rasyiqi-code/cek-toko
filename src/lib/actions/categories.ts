"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { getCurrentUser } from "./auth"

export async function getCategories() {
  const user = await getCurrentUser()
  if (!user) return []

  return await prisma.category.findMany({
    where: { storeId: user.storeId },
    orderBy: { name: "asc" },
  })
}

export async function createCategory(name: string) {
  try {
    const user = await getCurrentUser()
    if (!user) return { success: false, error: "Unauthorized" }
    if (!user.storeValid) return { success: false, error: "Lisensi toko tidak valid atau berakhir." }

    await prisma.category.create({
      data: {
        name,
        storeId: user.storeId
      },
    })
    revalidatePath("/categories")
    return { success: true }
  } catch {
    return { success: false, error: "Gagal menambah kategori. Mungkin nama sudah ada." }
  }
}

export async function updateCategory(id: string, name: string) {
  try {
    const user = await getCurrentUser()
    if (!user) return { success: false, error: "Unauthorized" }
    if (!user.storeValid) return { success: false, error: "Lisensi toko tidak valid atau berakhir." }

    const existing = await prisma.category.findUnique({ where: { id } })
    if (!existing || existing.storeId !== user.storeId) {
      return { success: false, error: "Kategori tidak ditemukan." }
    }

    await prisma.category.update({
      where: { id },
      data: { name },
    })
    revalidatePath("/categories")
    return { success: true }
  } catch {
    return { success: false, error: "Gagal memperbarui kategori." }
  }
}

export async function deleteCategory(id: string) {
  try {
    const user = await getCurrentUser()
    if (!user) return { success: false, error: "Unauthorized" }
    if (!user.storeValid) return { success: false, error: "Lisensi toko tidak valid atau berakhir." }

    const existing = await prisma.category.findUnique({ where: { id } })
    if (!existing || existing.storeId !== user.storeId) {
      return { success: false, error: "Kategori tidak ditemukan." }
    }

    await prisma.category.delete({
      where: { id },
    })
    revalidatePath("/categories")
    return { success: true }
  } catch {
    return { success: false, error: "Gagal menghapus kategori. Pastikan tidak ada barang di kategori ini." }
  }
}
