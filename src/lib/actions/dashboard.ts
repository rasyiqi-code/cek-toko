"use server"

import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "./auth"

export async function getDashboardStats() {
  const user = await getCurrentUser()
  if (!user) throw new Error("Unauthorized")

  const [totalProducts, totalCategories, stocks, todayOpnames] = await Promise.all([
    prisma.product.count({ where: { storeId: user.storeId } }),
    prisma.category.count({ where: { storeId: user.storeId } }),
    prisma.stock.findMany({
      where: { product: { storeId: user.storeId } },
      include: { product: true }
    }),
    prisma.stockOpname.findMany({
      where: {
        product: { storeId: user.storeId },
        createdAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0))
        }
      }
    })
  ])

  const totalValue = stocks.reduce((acc: number, curr: (typeof stocks)[0]) => {
    return acc + (Number(curr.product.buyPrice) * curr.quantity)
  }, 0)

  // Get ALL opnames for this store only
  const allOpnames = await prisma.stockOpname.findMany({
    where: { product: { storeId: user.storeId } }
  })
  const totalAuditDiff = allOpnames.reduce((acc: number, curr: (typeof allOpnames)[0]) => acc + Number(curr.value), 0)

  const todayDifference = todayOpnames.reduce((acc: number, curr: (typeof todayOpnames)[0]) => acc + curr.difference, 0)
  const todayValueDiff = todayOpnames.reduce((acc: number, curr: (typeof todayOpnames)[0]) => acc + Number(curr.value), 0)

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
    where: { product: { storeId: user.storeId } },
    include: {
      product: true
    },
    orderBy: { createdAt: "desc" },
    take: 5
  })

  return opnames.map((op: (typeof opnames)[0]) => ({
    ...op,
    value: Number(op.value),
    product: op.product ? {
      ...op.product,
      price: Number(op.product.price),
      buyPrice: Number(op.product.buyPrice),
    } : null
  }))
}
