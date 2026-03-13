import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { SESSION_COOKIE, decodeSession } from "./lib/session"

export function proxy(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE)?.value
  const url = request.nextUrl.clone()
  const { pathname } = url

  // 1. Allowed public routes
  const publicRoutes = ["/login", "/register-store"]
  
  if (!token) {
    if (publicRoutes.includes(pathname) || pathname.startsWith("/_next") || pathname.startsWith("/api") || pathname === "/favicon.ico") {
      return NextResponse.next()
    }
    url.pathname = "/login"
    return NextResponse.redirect(url)
  }

  // 2. Redirect to dashboard if logged in and trying to access login/register
  if (token && publicRoutes.includes(pathname)) {
    url.pathname = "/dashboard"
    return NextResponse.redirect(url)
  }

  // 3. License & Role protection
  if (token) {
    try {
      // Use shared decodeSession utility
      const decoded = decodeSession(token)
      if (!decoded) throw new Error("Invalid session")

      const role = decoded.role
      const isStoreValid = decoded.storeValid
      const validUntil = decoded.validUntil

      // Real-time Expiration Check
      const now = new Date()
      const isExpired = validUntil ? new Date(validUntil) < now : true
      const effectiveValid = isStoreValid && !isExpired

      // A. License Check: If license invalid or expired, redirect to activate-license
      // Except for activate-license page itself
      if (!effectiveValid && pathname !== "/activate-license") {
        url.pathname = "/activate-license"
        return NextResponse.redirect(url)
      }

      // B. Allow access to activate-license even if valid (to manage license)
      // Removed the auto-redirect to dashboard here.

      // C. Role-based protection (only if license is valid or it's activate-license)
      if (effectiveValid) {
        // Owner-only routes
        const ownerRoutes = ["/categories", "/users"]
        if (ownerRoutes.some(route => pathname.startsWith(route)) && role !== "OWNER") {
          url.pathname = "/dashboard"
          return NextResponse.redirect(url)
        }

        // Owner or Tim Pengecek routes
        const auditRoutes = ["/stock", "/reports"]
        if (auditRoutes.some(route => pathname.startsWith(route)) && (role !== "OWNER" && role !== "TIM_PENGECEK")) {
          url.pathname = "/dashboard"
          return NextResponse.redirect(url)
        }
        
        // Penjaga can only access Dashboard
        if (role === "PENJAGA" && (pathname !== "/dashboard" && pathname !== "/")) {
          url.pathname = "/dashboard"
          return NextResponse.redirect(url)
        }
      }

    } catch (e) {
      console.error("Proxy session parse error", e)
      const response = NextResponse.redirect(new URL("/login", request.url))
      response.cookies.delete(SESSION_COOKIE)
      return response
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - manifest.json (PWA manifest)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|manifest.json).*)",
  ],
}
