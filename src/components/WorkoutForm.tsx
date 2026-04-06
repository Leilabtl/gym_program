"use client"

import { useState, useEffect, useRef } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { useSettings } from "@/contexts/SettingsContext"
import { getMovements } from "@/lib/firestore"
import { Movement, WorkoutEntry } from "@/types"
import { CopyPlus, Plus } from "lucide-react"

interface WorkoutFormProps {
  onLogSet: (entry: Omit<WorkoutEntry, "id" | "createdAt">) => Promise<void>;
  lastEntry: WorkoutEntry | null;
}

export function WorkoutForm({ onLogSet, lastEntry }: WorkoutFormProps) {
  const { user } = useAuth()
  const { settings } = useSettings()
  const [movements, setMovements] = useState<Movement[]>([])
  
  const [movementName, setMovementName] = useState("")
  const [reps, setReps] = useState<string>("")
  const [weight, setWeight] = useState<string>("")
  
  const [showAutocomplete, setShowAutocomplete] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (user) {
      getMovements(user.uid).then(setMovements).catch(console.error)
    }
  }, [user])

  // Smart defaults logic could optionally pre-fill if lastEntry changes, 
  // but we prefer to stick to manual input with "Repeat Last Set" button.
  
  const filteredMovements = movements
    .filter(m => m.name.toLowerCase().includes(movementName.toLowerCase()))
    .slice(0, 8)

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!movementName || !reps || !weight || isSubmitting) return

    setIsSubmitting(true)
    try {
      await onLogSet({
        movementName,
        reps: parseInt(reps),
        weight: parseFloat(weight),
        unit: settings.unit,
      })
      
      // Keep movement name, keep weight/reps for fast duplicate logging
      inputRef.current?.focus()
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRepeatLast = async () => {
    if (!lastEntry || isSubmitting) return
    setIsSubmitting(true)
    try {
      await onLogSet({
        movementName: lastEntry.movementName,
        reps: lastEntry.reps,
        weight: lastEntry.weight,
        unit: lastEntry.unit,
        notes: lastEntry.notes
      })
      setMovementName(lastEntry.movementName)
      setReps(lastEntry.reps.toString())
      setWeight(lastEntry.weight.toString())
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="card-depth p-4 mb-6 w-full animate-slide-up">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        
        {/* Movement Input with simple autocomplete */}
        <div className="relative z-20">
          <input
            ref={inputRef}
            type="text"
            placeholder="Movement name"
            value={movementName}
            onChange={(e) => {
              setMovementName(e.target.value)
              setShowAutocomplete(true)
            }}
            onFocus={() => setShowAutocomplete(true)}
            onBlur={() => setTimeout(() => setShowAutocomplete(false), 200)}
            className="w-full bg-bg-tertiary border border-border rounded-xl px-4 py-3.5 text-lg outline-none focus:border-accent transition-colors"
            required
          />
          {showAutocomplete && movementName && filteredMovements.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-bg-secondary border border-border shadow-card-lg rounded-xl overflow-hidden animate-fade-in max-h-48 overflow-y-auto">
              {filteredMovements.map(m => (
                <button
                  key={m.id}
                  type="button"
                  className="w-full text-left px-4 py-3 hover:bg-bg-tertiary active:bg-bg-tertiary active:scale-100 border-b border-border last:border-b-0"
                  onClick={() => {
                    setMovementName(m.name)
                    setShowAutocomplete(false)
                    // Optional: prefill from history here instead
                  }}
                >
                  {m.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Reps and Weight */}
        <div className="flex gap-3">
          <div className="flex-1">
            <input
              type="number"
              placeholder="Weight"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="w-full bg-bg-tertiary border border-border rounded-xl px-4 py-3.5 text-lg outline-none focus:border-accent transition-colors"
              step="any"
              required
            />
            <span className="text-xs text-text-tertiary block mt-1 ml-1 font-semibold uppercase">{settings.unit}</span>
          </div>
          <div className="flex-1">
            <input
              type="number"
              placeholder="Reps"
              value={reps}
              onChange={(e) => setReps(e.target.value)}
              className="w-full bg-bg-tertiary border border-border rounded-xl px-4 py-3.5 text-lg outline-none focus:border-accent transition-colors"
              required
            />
            <span className="text-xs text-text-tertiary block mt-1 ml-1 font-semibold uppercase">Reps</span>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting || !movementName || !reps || !weight}
          className="w-full bg-accent hover:bg-accent-hover active:bg-accent-active text-text-on-accent font-bold text-lg rounded-xl py-4 flex items-center justify-center gap-2 shadow-btn disabled:opacity-70 mt-1"
        >
          <Plus className="w-5 h-5" />
          Log Set
        </button>
      </form>

      {lastEntry && (
        <div className="mt-3 pt-3 border-t border-border">
          <button
            type="button"
            onClick={handleRepeatLast}
            disabled={isSubmitting}
            className="w-full bg-bg-tertiary hover:bg-border active:scale-[0.98] text-text-primary rounded-xl py-3 flex items-center justify-center gap-2 transition-all font-medium text-sm"
          >
            <CopyPlus className="w-4 h-4 text-accent" />
            Repeat: {lastEntry.movementName} ({lastEntry.reps} × {lastEntry.weight}{lastEntry.unit})
          </button>
        </div>
      )}
    </div>
  )
}
