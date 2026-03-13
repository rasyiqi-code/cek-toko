"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { getCurrentUser } from "./auth"

export async function getProducts() {
  const user = await getCurrentUser()
  if (!user) return []

  const products = await prisma.product.findMany({
    where: { storeId: user.storeId },
    include: {
      category: true,
      stock: true,
    },
    orderBy: { createdAt: "desc" },
  })
  return products.map((p) => ({
    ...p,
    price: Number(p.price),
    buyPrice: Number(p.buyPrice),
  }))
}

export async function createProduct(data: {
  name: string
  categoryId: string
  price: number
  buyPrice: number
  unit: string
}) {
  try {
    const user = await getCurrentUser()
    if (!user) return { success: false, error: "Unauthorized" }
    if (!user.storeValid) return { success: false, error: "Lisensi toko tidak valid atau berakhir." }

    const product = await prisma.product.create({
      data: {
        ...data,
        storeId: user.storeId,
        stock: {
          create: { quantity: 0 }
        }
      },
    })
    revalidatePath("/products")
    return { success: true, product: { ...product, price: Number(product.price), buyPrice: Number(product.buyPrice) } }
  } catch (e) {
    console.error(e)
    return { success: false, error: "Gagal menambah barang." }
  }
}

export async function updateProduct(id: string, data: {
  name: string
  categoryId: string
  price: number
  buyPrice: number
  unit: string
}) {
  try {
    const user = await getCurrentUser()
    if (!user) return { success: false, error: "Unauthorized" }
    if (!user.storeValid) return { success: false, error: "Lisensi toko tidak valid atau berakhir." }

    // Check ownership
    const existing = await prisma.product.findUnique({ where: { id } })
    if (!existing || existing.storeId !== user.storeId) {
      return { success: false, error: "Barang tidak ditemukan." }
    }

    await prisma.product.update({
      where: { id },
      data,
    })
    revalidatePath("/products")
    return { success: true }
  } catch {
    return { success: false, error: "Gagal memperbarui barang." }
  }
}

export async function deleteProduct(id: string) {
  try {
    const user = await getCurrentUser()
    if (!user) return { success: false, error: "Unauthorized" }
    if (!user.storeValid) return { success: false, error: "Lisensi toko tidak valid atau berakhir." }

    const existing = await prisma.product.findUnique({ where: { id } })
    if (!existing || existing.storeId !== user.storeId) {
      return { success: false, error: "Barang tidak ditemukan." }
    }

    // Delete stock first if it exists
    await prisma.stock.deleteMany({ where: { productId: id } })
    await prisma.product.delete({
      where: { id },
    })
    revalidatePath("/products")
    return { success: true }
  } catch {
    return { success: false, error: "Gagal menghapus barang." }
  }
}

export async function updateStock(productId: string, quantity: number) {
  try {
    const user = await getCurrentUser()
    if (!user) return { success: false, error: "Unauthorized" }
    if (!user.storeValid) return { success: false, error: "Lisensi toko tidak valid atau berakhir." }

    const existing = await prisma.product.findUnique({ where: { id: productId } })
    if (!existing || existing.storeId !== user.storeId) {
      return { success: false, error: "Barang tidak ditemukan." }
    }

    await prisma.stock.update({
      where: { productId },
      data: { quantity },
    })
    revalidatePath("/products")
    return { success: true }
  } catch {
    return { success: false, error: "Gagal memperbarui stok." }
  }
}
