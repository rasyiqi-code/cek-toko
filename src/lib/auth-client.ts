"use client"

import { set, get, del } from "idb-keyval"

const TOKEN_KEY = "auth_token"

export const saveToken = async (token: string) => {
  if (typeof window === 'undefined') return
  await set(TOKEN_KEY, token)
}

export const getToken = async () => {
  if (typeof window === 'undefined') return null
  return await get<string>(TOKEN_KEY)
}

export const clearToken = async () => {
  if (typeof window === 'undefined') return
  await del(TOKEN_KEY)
}

export const getClientUser = async () => {
  const token = await getToken()
  if (!token) return null
  try {
    const [payload] = token.split(".")
    if (!payload) return null
    return JSON.parse(Buffer.from(payload, "base64").toString("utf-8"))
  } catch {
    return null
  }
}
