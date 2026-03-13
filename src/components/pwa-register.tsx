"use client"

import { useEffect } from "react"

export function PwaRegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      const register = async () => {
        try {
          const registration = await navigator.serviceWorker.register("/sw.js")
          console.log("SW registered: ", registration)

          // Handle updates: if a new SW is waiting, force it to skip waiting
          registration.addEventListener("updatefound", () => {
            const newWorker = registration.installing
            if (newWorker) {
              newWorker.addEventListener("statechange", () => {
                if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
                  console.log("New SW found, asking to skip waiting...")
                  newWorker.postMessage({ type: "SKIP_WAITING" })
                }
              })
            }
          })
        } catch (error) {
          console.log("SW registration failed: ", error)
        }
      }

      // Reload the page when the new Service Worker takes over
      let refreshing = false
      navigator.serviceWorker.addEventListener("controllerchange", () => {
        if (!refreshing) {
          refreshing = true
          console.log("SW controller changed, reloading page...")
          window.location.reload()
        }
      })

      if (document.readyState === "complete") {
        register()
      } else {
        window.addEventListener("load", register)
        return () => window.removeEventListener("load", register)
      }
    }
  }, [])

  return null
}
