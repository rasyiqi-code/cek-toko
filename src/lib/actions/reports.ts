"use server"

import { prisma } from "@/lib/prisma"

interface CategoryProduct {
  price: any
  buyPrice: any
  stock: { quantity: number } | null
  opnames: { value: any }[]
}

interface CategoryData {
  id: string
  name: string
  products: CategoryProduct[]
}

export async function getCategoryReports() {
  const categories = await prisma.category.findMany({
    include: {
      products: {
        include: { 
          stock: true,
          opnames: {
            orderBy: { createdAt: "desc" },
            take: 1
          }
        }
      }
    }
  })

  return categories.map((cat: any) => {
    const totalItems = cat.products.length
    const totalStock = cat.products.reduce((acc: number, p: any) => acc + (p.stock?.quantity || 0), 0)
    
    const currentInventoryValue = cat.products.reduce((acc: number, p: any) => acc + (Number(p.price) * (p.stock?.quantity || 0)), 0)
    
    const auditValue = cat.products.reduce((acc: number, p: any) => {
      const latestOpname = p.opnames?.[0]
      return acc + (latestOpname ? Number(latestOpname.value) : 0)
    }, 0)

    return {
      id: cat.id,
      name: cat.name,
      totalItems,
      totalStock,
      totalValue: currentInventoryValue,
      auditValue
    }
  })
}

export async function getStockDetails() {
  const products = await prisma.product.findMany({
    include: {
      category: true,
      stock: true
    },
    orderBy: { name: "asc" }
  })
  return products.map(p => ({
    ...p,
    price: Number(p.price),
    buyPrice: Number(p.buyPrice),
    category: p.category ? { ...p.category } : null,
    stock: p.stock ? { ...p.stock } : null
  }))
}
