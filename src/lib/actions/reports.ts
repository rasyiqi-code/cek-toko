"use server"

import { prisma } from "@/lib/prisma"


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

  return categories.map((cat) => {
    const totalItems = cat.products.length
    const totalStock = cat.products.reduce((acc: number, p: (typeof cat.products)[0]) => acc + (p.stock?.quantity || 0), 0)
    
    const currentInventoryValue = cat.products.reduce((acc: number, p: (typeof cat.products)[0]) => acc + (Number(p.price) * (p.stock?.quantity || 0)), 0)
    
    const auditValue = cat.products.reduce((acc: number, p: (typeof cat.products)[0]) => {
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
