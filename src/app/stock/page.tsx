import { getProducts } from "@/lib/actions/products"
import { getCategories } from "@/lib/actions/categories"
import { getUsers } from "@/lib/actions/auth"
import { StockOpnameForm } from "@/app/stock/opname-form"

export default async function StockPage() {
  const [products, categories, users] = await Promise.all([
    getProducts(),
    getCategories(),
    getUsers(),
  ])

  return <StockOpnameForm products={products} categories={categories} users={users} />
}
