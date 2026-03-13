"use server"

import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "./auth"

export async function getDashboardStats() {
  const user = await getCurrentUser()
  if (!user) throw new Error("Unauthorized")

  const [totalProducts, totalCategories, stocks, todayOpnames] = await Promise.all([
    prisma.product.count({ where: { storeId: user.storeId } as any }),
    prisma.category.count({ where: { storeId: user.storeId } as any }),
    prisma.stock.findMany({
      where: { product: { storeId: user.storeId } } as any,
      include: { product: true }
    }),
    prisma.stockOpname.findMany({
      where: {
        product: { storeId: user.storeId },
        createdAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0))
        }
      } as any
    })
  ])

  const totalValue = stocks.reduce((acc: number, curr: any) => {
    return acc + (Number((curr as any).product.buyPrice) * curr.quantity)
  }, 0)

  // Get ALL opnames for this store only
  const allOpnames = await prisma.stockOpname.findMany({
    where: { product: { storeId: user.storeId } } as any
  })
  const totalAuditDiff = allOpnames.reduce((acc: number, curr: any) => acc + Number(curr.value), 0)

  const todayDifference = todayOpnames.reduce((acc: number, curr: any) => acc + curr.difference, 0)
  const todayValueDiff = todayOpnames.reduce((acc: number, curr: any) => acc + Number(curr.value), 0)

  return {
    totalProducts,
    totalCategories,
    totalValue,
    todayOpnamesCount: todayOpnames.length,
    todayDifference,
    todayValueDiff,
    totalAuditDiff,
    storeValid: user.storeValid
  }
}

export async function getRecentActivity() {
  const user = await getCurrentUser()
  if (!user) return []

  const opnames = await prisma.stockOpname.findMany({
    where: { product: { storeId: user.storeId } } as any,
    include: {
      product: true
    } as any,
    orderBy: { createdAt: "desc" },
    take: 5
  })

  return opnames.map(op => ({
    ...op,
    value: Number(op.value),
    product: (op as any).product ? {
      ...(op as any).product,
      price: Number((op as any).product.price),
      buyPrice: Number((op as any).product.buyPrice),
    } : null
  }))
}
