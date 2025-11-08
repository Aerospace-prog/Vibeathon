'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

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
      toast.success(newAvailability ? 'You are now available' : 'You are now unavailable')
    } catch (error) {
      console.error('Error updating availability:', error)
      toast.error('Failed to update availability')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <button
      onClick={toggleAvailability}
      disabled={isLoading}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
        isAvailable
          ? 'bg-green-500 hover:bg-green-600 text-white'
          : 'bg-gray-300 hover:bg-gray-400 text-gray-700'
      } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <span className={`w-2 h-2 rounded-full ${isAvailable ? 'bg-white' : 'bg-gray-600'} animate-pulse`}></span>
      {isAvailable ? 'Available' : 'Unavailable'}
    </button>
  )
}
