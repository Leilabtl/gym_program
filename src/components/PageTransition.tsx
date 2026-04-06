"use client"

import { ReactNode } from "react"
import { usePathname } from "next/navigation"

export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  
  // A robust implementation would use framer-motion here for direction aware slides based on path indices.
  // Given constraints, we'll use a simple CSS animation that respects `prefers-reduced-motion`.
  
  return (
    <div key={pathname} className="animate-fade-in w-full pb-24 h-full">
      {children}
    </div>
  )
}
