import { getUsers } from "@/lib/actions/auth"
import { getActiveGuardianDuty } from "@/lib/actions/guardian"
import { UserList } from "./user-list"
import { TopNav } from "@/components/navigation"
import { Plus } from "lucide-react"
import Link from "next/link"
import { Suspense } from "react"

export default async function UsersPage() {
  const users = await getUsers()
  const activeGuardian = await getActiveGuardianDuty()
  
  return (
    <div className="space-y-1 pb-16">
      <TopNav 
        title="Daftar Pengguna" 
        rightAction={
          <Link href="/users?add=true" className="size-9 rounded-full bg-primary/10 flex items-center justify-center text-primary active:scale-90 transition-all">
            <Plus className="size-5" />
          </Link>
        }
      />
      <div className="px-4 pt-3 pb-2">
        <p className="text-sm font-medium text-muted leading-relaxed">Kelola akses owner, tim pengecek, dan pengguna toko.</p>
      </div>
      <Suspense fallback={<div className="h-40 animate-pulse bg-surface rounded-2xl mx-4" />}>
        <UserList initialUsers={users as any} initialActiveGuardian={activeGuardian} />
      </Suspense>
    </div>
  )
}
