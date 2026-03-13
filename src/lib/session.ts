
export const SESSION_COOKIE = "cek_toko_session"
export const SESSION_MAX_AGE = 60 * 60 * 24 * 30 // 30 days

export type UserRole = "OWNER" | "PENJAGA" | "TIM_PENGECEK"

export type SessionUser = {
  id: string
  storeId: string
  name: string
  username: string
  role: UserRole
  storeValid: boolean
  validUntil: string | null
}

import { createHmac, timingSafeEqual } from "crypto"

const SECRET = process.env.SESSION_SECRET
const isProd = process.env.NODE_ENV === "production"
const isBuild = process.env.NEXT_PHASE === "phase-production-build"

if (!SECRET && isProd && !isBuild) {
  throw new Error("CRITICAL: SESSION_SECRET must be set in production environment")
}
const ACTUAL_SECRET = SECRET || "cektoko-fallback-secret-12345"

export function encodeSession(user: SessionUser): string {
  const payload = Buffer.from(JSON.stringify(user)).toString("base64")
  const signature = createHmac("sha256", ACTUAL_SECRET).update(payload).digest("base64")
  return `${payload}.${signature}`
}

export function decodeSession(token: string): SessionUser | null {
  try {
    const [payload, signature] = token.split(".")
    if (!payload || !signature) return null

    // Verify signature
    const expectedSignature = createHmac("sha256", ACTUAL_SECRET).update(payload).digest("base64")
    
    // Use timingSafeEqual to prevent timing attacks
    const isValid = timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    )

    if (!isValid) return null

    return JSON.parse(Buffer.from(payload, "base64").toString("utf-8"))
  } catch {
    return null
  }
}
