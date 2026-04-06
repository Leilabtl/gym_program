"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { getTemplates, addEntriesToWorkout, getTodayWorkout, createWorkout } from "@/lib/firestore"
import { Template } from "@/types"
import { SkeletonList } from "@/components/Skeleton"
import { ClipboardList, Play, Settings2 } from "lucide-react"

export default function TemplatesPage() {
  const { user } = useAuth()
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingTemplateId, setLoadingTemplateId] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      getTemplates(user.uid)
        .then(setTemplates)
        .catch(console.error)
        .finally(() => setLoading(false))
    }
  }, [user])

  const handleStartTemplate = async (template: Template) => {
    if (!user || loadingTemplateId) return
    setLoadingTemplateId(template.id)

    try {
      const today = await getTodayWorkout(user.uid)
      let workoutId = today?.id

      if (!workoutId) {
        workoutId = await createWorkout(user.uid, {
          date: new Date().toISOString().slice(0, 10),
          entries: [],
          createdAt: Date.now(),
          completed: false
        })
      }

      const newEntries = template.entries.map(te => ({
        id: crypto.randomUUID(),
        movementName: te.movementName,
        reps: te.reps,
        weight: te.weight,
        unit: te.unit,
        createdAt: Date.now(),
      }))

      await addEntriesToWorkout(user.uid, workoutId, newEntries)
      
      // Success flash & redirect
      window.location.href = "/" // hard reload to ensure clean home state, or could use router.push("/")
      
    } catch (e) {
      console.error(e)
      setLoadingTemplateId(null)
    }
  }

  if (loading) {
    return (
      <div className="w-full flex justify-center py-6">
        <SkeletonList count={3} />
      </div>
    )
  }

  if (templates.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center mt-24 text-text-tertiary animate-fade-in">
        <ClipboardList className="w-16 h-16 mb-4 opacity-50" />
        <p>No templates created yet.</p>
        <p className="text-sm mt-2 text-center max-w-xs">You can save your current workout as a template from the Home page.</p>
      </div>
    )
  }

  return (
    <div className="w-full pb-8">
      <h1 className="text-3xl font-extrabold tracking-tight mb-8">Templates</h1>

      <div className="flex flex-col gap-4 animate-stagger-in">
        {templates.map(template => {
          const isStarting = loadingTemplateId === template.id
          
          return (
            <div key={template.id} className="card-depth p-5 transition-all">
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-bold text-xl">{template.name}</h3>
                <button className="text-text-tertiary hover:bg-bg-tertiary p-2 rounded-xl active:scale-90 transition-colors">
                  <Settings2 className="w-5 h-5" />
                </button>
              </div>

              <div className="mb-6 space-y-1.5">
                {template.entries.slice(0, 4).map((e, i) => (
                  <div key={i} className="flex justify-between text-sm text-text-secondary">
                    <span>{e.reps} × {e.movementName}</span>
                    <span className="font-medium text-text-primary">{e.weight}{e.unit}</span>
                  </div>
                ))}
                {template.entries.length > 4 && (
                  <div className="text-xs text-text-tertiary font-bold mt-2 uppercase">
                    + {template.entries.length - 4} more
                  </div>
                )}
              </div>

              <button
                onClick={() => handleStartTemplate(template)}
                disabled={isStarting}
                className="w-full bg-accent hover:bg-accent-hover text-white font-bold py-3.5 rounded-xl flex justify-center items-center gap-2 active:scale-[0.98] transition-all shadow-btn disabled:opacity-70"
              >
                {isStarting ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-white" />
                    Load Template
                  </>
                )}
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
