"use client"

import { useSettings } from "@/contexts/SettingsContext"
import { useAuth } from "@/contexts/AuthContext"
import { LogOut, Save, Moon, Sun, Monitor, Scale } from "lucide-react"

export default function SettingsPage() {
  const { settings, updateSettings, loading: settingsLoading } = useSettings()
  const { user, logout } = useAuth()

  if (settingsLoading) return null

  return (
    <div className="w-full pb-8 animate-fade-in">
      <h1 className="text-3xl font-extrabold tracking-tight mb-8">Settings</h1>

      <div className="flex flex-col gap-6">
        
        {/* Profile Card */}
        <div className="card-depth p-4 flex justify-between items-center group">
          <div>
            <h2 className="text-sm font-bold text-text-tertiary uppercase tracking-wider mb-1">Account</h2>
            <p className="font-medium">{user?.email}</p>
          </div>
          <button 
            onClick={logout}
            className="flex items-center gap-2 text-danger font-bold hover:bg-danger/10 px-4 py-2 rounded-xl transition-colors active:scale-95"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>

        {/* Appearance */}
        <div className="card-depth p-4">
          <h2 className="text-sm font-bold text-text-tertiary uppercase tracking-wider mb-4">Appearance</h2>
          
          <div className="grid grid-cols-3 gap-2 bg-bg-tertiary p-1 rounded-2xl">
            {(['system', 'light', 'dark'] as const).map(theme => {
              const isActive = settings.theme === theme
              const Icon = theme === 'system' ? Monitor : theme === 'light' ? Sun : Moon

              return (
                <button
                  key={theme}
                  onClick={() => updateSettings({ theme })}
                  className={`flex flex-col items-center gap-1.5 py-3 rounded-xl transition-all duration-300 ${
                    isActive ? "bg-bg-secondary shadow-card-pressed text-accent" : "text-text-secondary hover:text-text-primary"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-xs font-bold capitalize">{theme}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Unit */}
        <div className="card-depth p-4">
          <h2 className="text-sm font-bold text-text-tertiary uppercase tracking-wider mb-4">Weight Unit</h2>
          
          <div className="grid grid-cols-2 gap-2 bg-bg-tertiary p-1 rounded-2xl">
            {(['kg', 'lbs'] as const).map(unit => {
              const isActive = settings.unit === unit

              return (
                <button
                  key={unit}
                  onClick={() => updateSettings({ unit })}
                  className={`flex items-center justify-center gap-2 py-3 rounded-xl transition-all duration-300 ${
                    isActive ? "bg-bg-secondary shadow-card-pressed text-accent" : "text-text-secondary hover:text-text-primary"
                  }`}
                >
                  <Scale className="w-4 h-4" />
                  <span className="text-sm font-bold uppercase">{unit}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Data */}
        <div className="card-depth p-4 flex justify-between items-center group">
          <div>
            <h2 className="text-sm font-bold text-text-tertiary uppercase tracking-wider mb-1">Data</h2>
            <p className="text-sm text-text-secondary">Export your history as CSV</p>
          </div>
          <button 
            className="flex items-center gap-2 text-primary font-bold bg-bg-tertiary hover:bg-border px-4 py-2 rounded-xl transition-colors active:scale-95"
            onClick={() => alert("CSV Export coming soon! Requires fetching all workouts and building a Blob.")}
          >
            <Save className="w-5 h-5" />
            Export
          </button>
        </div>

      </div>
      
      <div className="mt-12 text-center text-xs font-medium text-text-tertiary flex flex-col items-center gap-2">
        <p>Built with Next.js & Firebase</p>
        <div className="w-8 h-1 rounded-full bg-border" />
      </div>
    </div>
  )
}
