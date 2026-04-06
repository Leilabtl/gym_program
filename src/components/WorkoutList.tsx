"use client"

import { WorkoutEntry } from "@/types"
import { CopyPlus, Trash2, Edit2, Check } from "lucide-react"
import { useState } from "react"
import { useSettings } from "@/contexts/SettingsContext";

interface WorkoutListProps {
  entries: WorkoutEntry[];
  onDeleteEntry: (id: string, movementId?: string) => Promise<void>;
  onDuplicateEntry: (entry: WorkoutEntry) => Promise<void>;
  onUpdateEntry?: (id: string, updates: Partial<WorkoutEntry>) => Promise<void>;
  onDeleteMovement?: (movementName: string) => Promise<void>;
  readOnly?: boolean;
}

export function WorkoutList({ 
  entries, 
  onDeleteEntry, 
  onDuplicateEntry, 
  onUpdateEntry,
  onDeleteMovement,
  readOnly = false 
}: WorkoutListProps) {
  const { settings } = useSettings()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editReps, setEditReps] = useState("")
  const [editWeight, setEditWeight] = useState("")

  if (entries.length === 0) return null;

  // Group entries by movement name
  const grouped = entries.reduce((acc, entry) => {
    if (!acc[entry.movementName]) acc[entry.movementName] = []
    acc[entry.movementName].push(entry)
    return acc
  }, {} as Record<string, WorkoutEntry[]>)

  const handleEditStart = (entry: WorkoutEntry) => {
    setEditingId(entry.id)
    setEditReps(entry.reps.toString())
    setEditWeight(entry.weight.toString())
  }

  const handleEditSave = async (id: string) => {
    if (onUpdateEntry && editReps && editWeight) {
      await onUpdateEntry(id, { 
        reps: parseInt(editReps), 
        weight: parseFloat(editWeight) 
      })
    }
    setEditingId(null)
  }

  return (
    <div className="flex flex-col gap-4 w-full pb-6">
      {Object.entries(grouped).map(([movement, sets]) => (
        <div key={movement} className="card-depth overflow-hidden animate-stagger-in relative">
          
          {/* Movement Header */}
          <div className="bg-bg-tertiary/50 px-4 py-3 flex justify-between items-center border-b border-border">
            <h3 className="font-bold text-lg tracking-tight">{movement}</h3>
            
            {!readOnly && onDeleteMovement && (
              <button 
                onClick={() => onDeleteMovement(movement)}
                className="text-text-tertiary hover:text-danger active:scale-90 p-1 rounded-md"
                aria-label="Delete all sets for movement"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Sets List */}
          <div className="divide-y divide-border/50">
            {sets.map((set, index) => {
              const isEditing = editingId === set.id

              return (
                <div key={set.id} className="flex items-center justify-between px-4 py-3 bg-bg-secondary hover:bg-bg-accent/20 transition-colors group">
                  
                  <div className="flex items-center gap-4">
                    <span className="text-text-tertiary font-mono text-xs font-bold w-4">{index + 1}</span>
                    
                    {isEditing ? (
                      <div className="flex items-center gap-2">
                        <input 
                          type="number" 
                          value={editWeight} 
                          onChange={e => setEditWeight(e.target.value)}
                          className="w-16 bg-bg-tertiary border border-accent rounded px-2 py-1 text-center outline-none"
                          autoFocus
                        />
                        <span className="text-text-secondary text-sm">{set.unit}</span>
                        <span className="text-text-tertiary">×</span>
                        <input 
                          type="number" 
                          value={editReps} 
                          onChange={e => setEditReps(e.target.value)}
                          className="w-16 bg-bg-tertiary border border-accent rounded px-2 py-1 text-center outline-none"
                        />
                      </div>
                    ) : (
                      <div 
                        className="font-medium text-lg cursor-pointer"
                        onClick={() => !readOnly && handleEditStart(set)}
                      >
                        {set.weight} <span className="text-sm font-normal text-text-secondary">{set.unit}</span>
                        <span className="mx-2 text-text-tertiary text-sm">×</span>
                        {set.reps} <span className="text-sm font-normal text-text-secondary">reps</span>
                      </div>
                    )}
                  </div>

                  {!readOnly && (
                    <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                      {isEditing ? (
                        <button 
                          onClick={() => handleEditSave(set.id)}
                          className="p-2 text-success hover:bg-success/10 rounded-lg active:scale-90"
                        >
                          <Check className="w-5 h-5" />
                        </button>
                      ) : (
                        <>
                          <button 
                            onClick={() => onDuplicateEntry(set)}
                            className="p-2 text-accent hover:bg-accent/10 rounded-lg active:scale-90"
                          >
                            <CopyPlus className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleEditStart(set)}
                            className="p-2 text-text-tertiary hover:bg-bg-tertiary rounded-lg active:scale-90 hidden sm:block"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => onDeleteEntry(set.id)}
                            className="p-2 text-danger hover:bg-danger/10 rounded-lg active:scale-90"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
