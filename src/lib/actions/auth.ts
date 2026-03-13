"use server"

import { cookies } from "next/headers"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

import { decodeSession, SESSION_COOKIE, SESSION_MAX_AGE, encodeSession } from "@/lib/session"
import type { SessionUser, UserRole } from "@/lib/session"

export async function getCurrentUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE)?.value
  if (!token) return null
  
  return decodeSession(token)
}

export async function login(username: string, password: string) {
  try {
    const user = await (prisma.user as any).findFirst({
      where: { username },
      include: { store: true }
    })
    if (!user) return { success: false, error: "Username tidak ditemukan" }

    const valid = await bcrypt.compare(password, user.password)
    if (!valid) return { success: false, error: "Password salah" }

    // License Check
    const now = new Date()
    const store = (user as any).store
    const isLicenseExpired = store?.validUntil && new Date(store.validUntil) < now
    const storeValid = store?.isValid && !isLicenseExpired

    const session: SessionUser = {
      id: user.id,
      storeId: (user as any).storeId,
      name: user.name,
      username: user.username,
      role: user.role as UserRole,
      storeValid: !!storeValid,
      validUntil: store?.validUntil ? new Date(store.validUntil).toISOString() : null
    }

    const token = encodeSession(session)
    const cookieStore = await cookies()
    cookieStore.set(SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: SESSION_MAX_AGE,
      path: "/",
    })

    return { success: true, user: session, token }
  } catch (e) {
    console.error(e)
    return { success: false, error: "Gagal login" }
  }
}

export async function logout() {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE)
}

export async function registerStore(data: {
  storeName: string
  adminName: string
  username: string
  password: string
}) {
  try {
    const existing = await prisma.user.findFirst({ where: { username: data.username } })
    if (existing) return { success: false, error: "Username sudah dipakai" }

    const hashed = await bcrypt.hash(data.password, 10)

    const trialDuration = 14 * 24 * 60 * 60 * 1000 // 14 days
    const validUntil = new Date(Date.now() + trialDuration)

    const result = await prisma.$transaction(async (tx: any) => {
      const store = await tx.store.create({
        data: {
          name: data.storeName,
          isValid: true, // Auto trial
          validUntil,
          licenseKey: "TRIAL-14D",
          profile: {
            create: {
              storeName: data.storeName
            }
          }
        }
      })

      const user = await tx.user.create({
        data: {
          storeId: store.id,
          name: data.adminName,
          username: data.username,
          password: hashed,
          role: "OWNER"
        }
      })

      return { store, user }
    })

    const session: SessionUser = {
      id: result.user.id,
      storeId: result.store.id,
      name: result.user.name,
      username: result.user.username,
      role: result.user.role as UserRole,
      storeValid: true,
      validUntil: validUntil.toISOString()
    }

    const token = encodeSession(session)
    const cookieStore = await cookies()
    cookieStore.set(SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: SESSION_MAX_AGE,
      path: "/",
    })

    return { success: true, storeId: result.store.id, token }
  } catch (e) {
    console.error(e)
    return { success: false, error: "Gagal registrasi toko" }
  }
}

export async function getUsers() {
  const currentUser = await getCurrentUser()
  if (!currentUser) return []

  return await (prisma.user as any).findMany({
    where: { storeId: currentUser.storeId },
    select: { id: true, name: true, username: true, role: true },
    orderBy: { username: "asc" },
  })
}

export async function createUser(data: {
  name: string
  username: string
  password: string
  role: UserRole
}) {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser) return { success: false, error: "Unauthorized" }

    const existing = await (prisma.user as any).findFirst({
      where: {
        username: data.username,
        storeId: currentUser.storeId
      } as any
    })
    if (existing) return { success: false, error: "Username sudah dipakai di toko ini" }

    const hashed = await bcrypt.hash(data.password, 10)
    await (prisma.user as any).create({
      data: {
        storeId: currentUser.storeId,
        name: data.name,
        username: data.username,
        password: hashed,
        role: data.role
      } as any,
    })
    return { success: true }
  } catch {
    return { success: false, error: "Gagal membuat user" }
  }
}

export async function deleteUser(id: string) {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser) return { success: false, error: "Unauthorized" }

    const user = await (prisma.user as any).findUnique({ where: { id } })
    if (!user || (user as any).storeId !== currentUser.storeId) {
      return { success: false, error: "User tidak ditemukan" }
    }

    if ((user as any).role === "OWNER") {
      const ownerCount = await (prisma.user as any).count({
        where: { storeId: currentUser.storeId, role: "OWNER" } as any
      })
      if (ownerCount <= 1) return { success: false, error: "Tidak bisa hapus Owner terakhir" }
    }
    await prisma.user.delete({ where: { id } })
    return { success: true }
  } catch {
    return { success: false, error: "Gagal menghapus user" }
  }
}
