'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { Power, Loader2 } from 'lucide-react'

export function AvailabilityToggle() {
  const [isAvailable, setIsAvailable] = useState(true)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    loadAvailability()
  }, [])

  const loadAvailability = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const { data } = await supabase
        .from('doctors')
        .select('is_available')
        .eq('id', session.user.id)
        .single()

      if (data) {
        setIsAvailable(data.is_available ?? true)
      }
    } catch (error) {
      console.error('Error loading availability:', error)
    }
  }

  const toggleAvailability = async () => {
    setIsLoading(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const newAvailability = !isAvailable

      const { error } = await supabase
        .from('doctors')
        .update({ is_available: newAvailability })
        .eq('id', session.user.id)

      if (error) throw error

      setIsAvailable(newAvailability)
      toast.success(newAvailability ? '✅ You are now available' : '⏸️ You are now unavailable')
    } catch (error) {
      console.error('Error updating availability:', error)
      toast.error('Failed to update availability')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="relative group">
      {/* Glow effect */}
      <div className={`absolute -inset-0.5 rounded-full blur transition-opacity ${
        isAvailable 
          ? 'bg-gradient-to-r from-green-500 to-emerald-500 opacity-50 group-hover:opacity-75' 
          : 'bg-gradient-to-r from-slate-400 to-slate-500 opacity-30 group-hover:opacity-50'
      }`} />
      
      <button
        onClick={toggleAvailability}
        disabled={isLoading}
        className={`relative flex items-center gap-2 px-3 py-1.5 rounded-full font-semibold text-sm transition-all transform group-hover:scale-105 ${
          isAvailable
            ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg'
            : 'bg-gradient-to-r from-slate-300 to-slate-400 hover:from-slate-400 hover:to-slate-500 text-slate-700 dark:from-slate-700 dark:to-slate-800 dark:text-slate-300 shadow-md'
        } ${isLoading ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        {isLoading ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <span className="relative flex h-2.5 w-2.5">
            {isAvailable && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
            )}
            <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
              isAvailable ? 'bg-white' : 'bg-slate-600 dark:bg-slate-400'
            }`} />
          </span>
        )}
        <span className="text-xs font-bold uppercase tracking-wide">
          {isAvailable ? 'Available' : 'Offline'}
        </span>
      </button>
    </div>
  )
}
