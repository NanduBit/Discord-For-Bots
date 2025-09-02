"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { usePathname, useRouter } from "next/navigation"

type Props = {
  children: React.ReactNode
}

/**
 * AuthGate
 * - Allows all access if a token exists in localStorage.
 * - Skips guard on /login.
 * - Redirects unauthenticated users to /login.
 */
export default function AuthGate({ children }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const [allowed, setAllowed] = useState(false)

  useEffect(() => {
    // Skip guard for the login page
    if (pathname?.startsWith("/login")) {
      setAllowed(true)
      return
    }

    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null

    if (token && token.trim().length > 0) {
      setAllowed(true)
    } else {
      // Redirect unauthenticated users
      router.replace("/login")
    }
  }, [pathname, router])

  // Show nothing while deciding (prevents flicker)
  if (!allowed) return null
  return <>{children}</>
}
