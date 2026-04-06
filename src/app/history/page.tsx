"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { getWorkouts, deleteWorkout, updateWorkoutEntries } from "@/lib/firestore"
import { Workout } from "@/types"
import { SkeletonList } from "@/components/Skeleton"
import { WorkoutList } from "@/components/WorkoutList"
import { CalendarDays, ChevronDown, ChevronUp, Trash2 } from "lucide-react"

export default function HistoryPage() {
  const { user } = useAuth()
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      getWorkouts(user.uid)
        .then(setWorkouts)
        .catch(console.error)
        .finally(() => setLoading(false))
    }
  }, [user])

  const toggleExpand = (id: string) => {
    setExpandedId(prev => prev === id ? null : id)
  }

  const handleDeleteWorkout = async (id: string) => {
    if (!user || !window.confirm("Are you sure you want to delete this entire workout?")) return
    
    // Optimistic
    setWorkouts(prev => prev.filter(w => w.id !== id))
    try {
      await deleteWorkout(user.uid, id)
    } catch (e) {
      console.error(e)
    }
  }

  const handleDeleteEntry = async (workoutId: string, entryId: string) => {
    if (!user) return
    const w = workouts.find(w => w.id === workoutId)
    if (!w) return

    const remaining = w.entries.filter(e => e.id !== entryId)
    
    // Optimistic
    if (remaining.length === 0) {
      setWorkouts(prev => prev.filter(wx => wx.id !== workoutId))
      await deleteWorkout(user.uid, workoutId)
    } else {
      setWorkouts(prev => prev.map(wx => wx.id === workoutId ? { ...wx, entries: remaining } : wx))
      await updateWorkoutEntries(user.uid, workoutId, remaining)
    }
  }

  if (loading) {
    return (
      <div className="w-full flex justify-center py-6">
        <SkeletonList count={4} />
      </div>
    )
  }

  if (workouts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center mt-24 text-text-tertiary">
        <CalendarDays className="w-16 h-16 mb-4 opacity-50" />
        <p>No past workouts found.</p>
      </div>
    )
  }

  return (
    <div className="w-full pb-8">
      <h1 className="text-3xl font-extrabold tracking-tight mb-8">History</h1>

      <div className="flex flex-col gap-4 animate-stagger-in">
        {workouts.map(workout => {
          const isExpanded = expandedId === workout.id
          const totalVolume = workout.entries.reduce((acc, e) => acc + (e.reps * e.weight), 0)
          
          return (
            <div key={workout.id} className="card-depth overflow-hidden transition-all duration-300">
              
              <div 
                className="p-4 flex cursor-pointer hover:bg-bg-tertiary/30 items-center justify-between"
                onClick={() => toggleExpand(workout.id)}
              >
                <div>
                  <h3 className="font-bold text-lg">{new Date(workout.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</h3>
                  <p className="text-sm text-text-tertiary mt-1">
                    {workout.entries.length} sets • {totalVolume} volume
                  </p>
                </div>
                
                <div className="flex items-center gap-2">
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleDeleteWorkout(workout.id) }}
                    className="p-2 text-danger hover:bg-danger/10 rounded-lg active:scale-90 opacity-0 group-hover:opacity-100 transition-opacity md:opacity-100"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                  {isExpanded ? <ChevronUp className="w-5 h-5 text-text-tertiary" /> : <ChevronDown className="w-5 h-5 text-text-tertiary" />}
                </div>
              </div>

              {isExpanded && (
                <div className="border-t border-border animate-slide-up bg-bg-secondary pt-4 px-2 pb-2">
                  <WorkoutList 
                    entries={workout.entries}
                    onDeleteEntry={async (eid) => handleDeleteEntry(workout.id, eid)}
                    onDuplicateEntry={async () => {}} // Not duplicating from history
                    readOnly={true} // Setting readOnly for history sets to keep MVP lean
                  />
                </div>
              )}

            </div>
          )
        })}
      </div>
    </div>
  )
}
