'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'
import { Spinner } from '@/components/ui/spinner'
import { toast } from 'sonner'

export function StartCallButton() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleStartCall = async () => {
    setIsLoading(true)
    
    try {
      // Get current user session
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        toast.error('Session expired. Please sign in again.')
        router.push('/auth')
        return
      }

      // For demo purposes, we'll create a consultation with a placeholder patient
      // In production, you would select an existing patient or create a new one
      
      // First, check if we have any patients, if not create a demo patient
      const { data: patients, error: patientsError } = await supabase
        .from('patients')
        .select('id')
        .limit(1)
        .single()

      let patientId = patients?.id

      // If no patients exist, create a demo patient
      if (!patientId || patientsError) {
        toast.info('Creating demo patient...')
        
        const { data: newPatient, error: createError } = await supabase
          .from('patients')
          .insert({
            name: 'Demo Patient',
            date_of_birth: '1990-01-01',
            preferred_language: 'Hindi'
          })
          .select('id')
          .single()

        if (createError) {
          console.error('Error creating patient:', createError)
          const errorMessage = createError.message || 'Failed to create patient. Please try again.'
          toast.error(errorMessage)
          setIsLoading(false)
          return
        }

        patientId = newPatient.id
      }

      // Create a new consultation record
      toast.info('Starting consultation...')
      
      const { data: consultation, error: consultationError } = await supabase
        .from('consultations')
        .insert({
          patient_id: patientId,
          doctor_id: session.user.id,
          consultation_date: new Date().toISOString(),
          full_transcript: '',
          approved: false
        })
        .select('id')
        .single()

      if (consultationError) {
        console.error('Error creating consultation:', consultationError)
        const errorMessage = consultationError.message || 'Failed to start consultation. Please try again.'
        toast.error(errorMessage)
        setIsLoading(false)
        return
      }

      toast.success('Consultation started!')
      
      // Navigate to the video call room
      router.push(`/consultation/${consultation.id}/room?userType=doctor`)
    } catch (error) {
      console.error('Unexpected error:', error)
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred. Please try again.'
      toast.error(errorMessage)
      setIsLoading(false)
    }
  }

  return (
    <Button 
      onClick={handleStartCall} 
      disabled={isLoading}
      className="w-full"
    >
      {isLoading ? (
        <span className="flex items-center gap-2">
          <Spinner size="sm" />
          Starting...
        </span>
      ) : (
        'Start New Call'
      )}
    </Button>
  )
}
