"use server" 

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { getCurrentUser } from "./auth"

export async function getStockOpnames() {
  const user = await getCurrentUser()
  if (!user) return []

  const opnames = await prisma.stockOpname.findMany({
    where: {
      product: { storeId: user.storeId }
    },
    include: {
      product: {
        include: { category: true }
      }
    },
    orderBy: { createdAt: "desc" },
    take: 50
  })

  return opnames.map(op => ({
    ...op,
    value: Number(op.value),
    product: op.product ? {
      ...op.product,
      price: Number(op.product.price),
      buyPrice: Number(op.product.buyPrice),
    } : null
  }))
}

export async function createStockOpname(data: {
  productId: string
  stockNew: number
  guardianName: string
}) {
  try {
    const user = await getCurrentUser()
    if (!user) return { success: false, error: "Unauthorized" }
    if (!user.storeValid) return { success: false, error: "Lisensi toko tidak valid atau berakhir." }

    const product = await prisma.product.findUnique({
      where: { id: data.productId },
      include: { stock: true }
    })

    if (!product || product.storeId !== user.storeId) {
      throw new Error("Barang tidak ditemukan")
    }

    const stockOld = product.stock?.quantity || 0
    const difference = data.stockNew - stockOld
    const buyPrice = Number(product.buyPrice) || 0
    const value = buyPrice * difference

    // Use transaction to ensure both opname and stock update
    await prisma.$transaction([
      prisma.stockOpname.create({
        data: {
          productId: data.productId,
          checkerName: user.name || "Sistem",
          guardianName: data.guardianName,
          stockOld,
          stockNew: data.stockNew,
          difference,
          value,
        }
      }),
      prisma.stock.update({
        where: { productId: data.productId },
        data: { quantity: data.stockNew }
      })
    ])

    revalidatePath("/stock")
    revalidatePath("/dashboard")
    return { success: true }
  } catch (error) {
    console.error(error)
    return { success: false, error: "Gagal menyimpan hasil cek." }
  }
}
