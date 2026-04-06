"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Activity, ClipboardList, Dumbbell, BarChart2, Settings } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"

const TABS = [
  { id: "/", label: "Workout", icon: Activity },
  { id: "/templates", label: "Templates", icon: ClipboardList },
  { id: "/movements", label: "Movements", icon: Dumbbell },
  { id: "/history", label: "History", icon: BarChart2 },
  { id: "/settings", label: "Settings", icon: Settings },
]

export function BottomNav() {
  const pathname = usePathname()
  const { user } = useAuth()

  // Hide on login page or if not logged in
  if (!user || pathname === "/login") return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center w-full">
      <nav className="w-full max-w-lg bg-glass-bg backdrop-blur-xl border-t border-border flex justify-around items-center pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] px-2 shadow-card-lg">
        {TABS.map((tab) => {
          const isActive = pathname === tab.id
          const Icon = tab.icon

          return (
            <Link
              key={tab.id}
              href={tab.id}
              className={`relative flex flex-col items-center justify-center w-16 h-14 rounded-xl transition-all duration-300 ease-spring active:scale-90 ${
                isActive ? "text-accent scale-105" : "text-text-tertiary hover:text-accent/70"
              }`}
            >
              <Icon
                className={`w-6 h-6 transition-transform duration-300 ${
                  isActive ? "drop-shadow-[0_2px_4px_rgba(59,130,246,0.3)] animate-pulse-ring" : ""
                }`}
                strokeWidth={isActive ? 2.5 : 2}
              />
              <span className="text-[10px] uppercase font-bold tracking-widest mt-1">
                {tab.label}
              </span>
              {isActive && (
                <div className="absolute -bottom-1.5 w-1 h-1 rounded-full bg-accent drop-shadow-[0_0_2px_rgba(59,130,246,0.8)]" />
              )}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
