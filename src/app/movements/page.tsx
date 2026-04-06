"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { getMovements } from "@/lib/firestore"
import { Movement } from "@/types"
import { SkeletonList } from "@/components/Skeleton"

export default function MovementsPage() {
  const { user } = useAuth()
  const [movements, setMovements] = useState<Movement[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      getMovements(user.uid)
        .then(res => setMovements(res.sort((a, b) => a.name.localeCompare(b.name))))
        .catch(console.error)
        .finally(() => setLoading(false))
    }
  }, [user])

  if (loading) {
    return <div className="w-full flex justify-center py-6"><SkeletonList count={6} /></div>
  }

  // Group by category
  const grouped = movements.reduce((acc, mv) => {
    if (!acc[mv.category]) acc[mv.category] = []
    acc[mv.category].push(mv)
    return acc
  }, {} as Record<string, Movement[]>)

  return (
    <div className="w-full pb-8">
      <div className="flex justify-between items-end mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight">Movements</h1>
      </div>

      <div className="flex flex-col gap-6 animate-stagger-in">
        {Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b)).map(([cat, mvs]) => (
          <div key={cat} className="card-depth overflow-hidden">
            <h2 className="bg-bg-tertiary px-4 py-2 text-sm font-bold uppercase tracking-wider text-text-secondary">{cat}</h2>
            <div className="divide-y divide-border">
              {mvs.map(m => (
                <div key={m.id} className="p-4 hover:bg-bg-secondary transition-colors">
                  <div className="font-medium text-lg">{m.name}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
