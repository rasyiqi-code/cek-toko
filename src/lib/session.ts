
export const SESSION_COOKIE = "cek_toko_session"
export const SESSION_MAX_AGE = 60 * 60 * 24 * 30 // 30 days

export type UserRole = "OWNER" | "PENJAGA" | "TIM_PENGECEK"

export interface SessionUser {
  id: string
  storeId: string
  name: string
  username: string
  role: UserRole
  storeValid: boolean
  validUntil: string | null
}

export function encodeSession(user: SessionUser): string {
  return Buffer.from(JSON.stringify(user)).toString("base64")
}

export function decodeSession(token: string): SessionUser | null {
  try {
    return JSON.parse(Buffer.from(token, "base64").toString("utf-8"))
  } catch {
    return null
  }
}
