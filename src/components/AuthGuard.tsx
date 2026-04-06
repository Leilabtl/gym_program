"use client"

import { ReactNode, useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"

export function AuthGuard({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!loading) {
      if (!user && pathname !== "/login") {
        router.replace("/login")
      } else if (user && pathname === "/login") {
        router.replace("/")
      }
    }
  }, [user, loading, pathname, router])

  if (loading) {
    return (
      <div className="flex h-[80vh] w-full items-center justify-center">
        <div className="w-8 h-8 rounded-full border-4 border-accent border-t-transparent animate-spin"></div>
      </div>
    )
  }

  // If not logged in and not on login page, don't render children (avoid flash)
  if (!user && pathname !== "/login") {
    return null;
  }

  return <>{children}</>
}
