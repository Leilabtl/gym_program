"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { WorkoutForm } from "@/components/WorkoutForm"
import { WorkoutList } from "@/components/WorkoutList"
import { SkeletonList } from "@/components/Skeleton"
import { getTodayWorkout, createWorkout, addEntryToWorkout, updateWorkoutEntries, completeWorkout } from "@/lib/firestore"
import { Workout, WorkoutEntry } from "@/types"
import { CheckCircle2, Dumbbell } from "lucide-react"

export default function Home() {
  const { user } = useAuth()
  const [workout, setWorkout] = useState<Workout | null>(null)
  const [loading, setLoading] = useState(true)
  const [finishing, setFinishing] = useState(false)
  const [showToast, setShowToast] = useState(false)
  
  // Undo state - simplified for MVP.

  useEffect(() => {
    if (!user) return
    let isMounted = true

    const loadData = async () => {
      try {
        const today = await getTodayWorkout(user.uid)
        if (isMounted) setWorkout(today)
      } catch (e) {
        console.error(e)
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    loadData()
    return () => { isMounted = false }
  }, [user])

  const handleLogSet = async (newEntry: Omit<WorkoutEntry, "id" | "createdAt">) => {
    if (!user) return

    const entryWithMeta: WorkoutEntry = {
      ...newEntry,
      id: crypto.randomUUID(),
      createdAt: Date.now(),
    }

    let currentWorkoutId = workout?.id

    // Optimistic UI update
    setWorkout(prev => {
      if (prev) {
        return { ...prev, entries: [...prev.entries, entryWithMeta] }
      }
      return {
        id: "temp",
        date: new Date().toISOString().slice(0, 10),
        entries: [entryWithMeta],
        createdAt: Date.now(),
        completed: false
      }
    })

    if (!currentWorkoutId) {
      // Create new workout in background
      currentWorkoutId = await createWorkout(user.uid, {
        date: new Date().toISOString().slice(0, 10),
        entries: [],
        createdAt: Date.now(),
        completed: false
      })
      
      setWorkout(prev => prev ? { ...prev, id: currentWorkoutId as string } : null)
    }

    await addEntryToWorkout(user.uid, currentWorkoutId, entryWithMeta)
  }

  const handleDeleteEntry = async (entryId: string) => {
    if (!user || !workout) return

    const entries = workout.entries
    const updated = entries.filter(e => e.id !== entryId)
    // Optimistic
    setWorkout({ ...workout, entries: updated })

    if (updated.length === 0) {
      // Just keep it empty locally, we'll prune it later if needed or on DB side.
      await updateWorkoutEntries(user.uid, workout.id, [])
    } else {
      await updateWorkoutEntries(user.uid, workout.id, updated)
    }

    // Since this is a simple log, we'll skip the complex temporary undo buffer here to stick to MVP.
  }

  const handleDuplicateEntry = async (entry: WorkoutEntry) => {
    await handleLogSet({
      movementName: entry.movementName,
      reps: entry.reps,
      weight: entry.weight,
      unit: entry.unit,
      notes: entry.notes
    })
  }

  const handleUpdateEntry = async (id: string, updates: Partial<WorkoutEntry>) => {
    if (!user || !workout) return
    const updated = workout.entries.map(e => e.id === id ? { ...e, ...updates } : e)
    setWorkout({ ...workout, entries: updated })
    await updateWorkoutEntries(user.uid, workout.id, updated)
  }

  const handleDeleteMovement = async (movementName: string) => {
    if (!user || !workout) return

    // Undo over confirmation (Optimistic approach)
    const originalEntries = [...workout.entries]
    const updated = originalEntries.filter(e => e.movementName !== movementName)
    
    setWorkout({ ...workout, entries: updated })
    await updateWorkoutEntries(user.uid, workout.id, updated)
    
    // Simplification for MVP: We just delete it.
  }

  const handleFinish = async () => {
    if (!user || !workout || workout.entries.length === 0) return
    setFinishing(true)
    try {
      await completeWorkout(user.uid, workout.id)
      setShowToast(true)
      setTimeout(() => setShowToast(false), 3000)
    } finally {
      setFinishing(false)
    }
  }

  if (loading) {
    return (
      <div className="w-full flex justify-center py-6">
        <SkeletonList count={2} />
      </div>
    )
  }

  const lastEntry = workout?.entries && workout.entries.length > 0
    ? workout.entries[workout.entries.length - 1]
    : null;

  const totalVolume = workout?.entries.reduce((acc, e) => acc + (e.reps * e.weight), 0) || 0
  const totalSets = workout?.entries.length || 0

  return (
    <div className="w-full pb-8 flex flex-col items-center">
      
      {/* Header Summary */}
      <header className="w-full flex justify-between items-end mb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Today</h1>
          <p className="text-text-tertiary text-sm mt-1 font-medium">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
          </p>
        </div>
        {totalSets > 0 && (
          <div className="text-right animate-fade-in">
            <span className="text-accent font-bold text-lg">{totalSets} sets</span>
            <p className="text-text-tertiary text-xs">{totalVolume} volume</p>
          </div>
        )}
      </header>

      {/* Main Form */}
      <WorkoutForm onLogSet={handleLogSet} lastEntry={lastEntry} />

      {/* List of sets */}
      {workout && workout.entries.length > 0 ? (
        <>
          <WorkoutList 
            entries={workout.entries} 
            onDeleteEntry={handleDeleteEntry}
            onDuplicateEntry={handleDuplicateEntry}
            onUpdateEntry={handleUpdateEntry}
            onDeleteMovement={handleDeleteMovement}
          />

          {!workout.completed && (
            <button
              onClick={handleFinish}
              disabled={finishing}
              className="mt-4 w-full card-depth bg-bg-secondary hover:bg-success/10 text-success border-success/30 font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-colors duration-300"
            >
              {finishing ? (
                <div className="w-5 h-5 border-2 border-success/30 border-t-success rounded-full animate-spin"></div>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  Finish Workout
                </>
              )}
            </button>
          )}

          {workout.completed && (
            <div className="mt-4 w-full bg-success/10 text-success/80 border border-success/20 font-bold py-4 rounded-xl flex items-center justify-center gap-2">
              <CheckCircle2 className="w-5 h-5" />
              Workout Complete
            </div>
          )}
        </>
      ) : (
        <div className="mt-8 flex flex-col items-center justify-center text-text-tertiary opacity-70 animate-fade-in">
          <Dumbbell className="w-16 h-16 mb-4 opacity-50 stroke-1" />
          <p>No sets logged yet.</p>
          <p className="text-sm">Start typing a movement above to begin.</p>
        </div>
      )}

      {/* Finish Toast */}
      {showToast && (
        <div className="fixed top-6 left-4 right-4 z-50 animate-slide-up flex justify-center">
          <div className="bg-success text-white px-6 py-3 rounded-xl shadow-lg font-bold flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5" />
            Workout saved! Great job.
          </div>
        </div>
      )}

    </div>
  )
}
