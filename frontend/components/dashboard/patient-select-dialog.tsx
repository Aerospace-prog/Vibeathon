'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { supabase } from '@/lib/supabase'
import { Spinner } from '@/components/ui/spinner'
import { toast } from 'sonner'
import { User, Plus, Search } from 'lucide-react'

interface Patient {
  id: string
  name: string
  date_of_birth: string
  preferred_language: string
}

interface PatientSelectDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PatientSelectDialog({ open, onOpenChange }: PatientSelectDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [patients, setPatients] = useState<Patient[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const router = useRouter()

  // Load patients when dialog opens
  useEffect(() => {
    if (open) {
      loadPatients()
    }
  }, [open])

  const loadPatients = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      // Try to get patients from appointments table
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          patient_id,
          patients (
            id,
            name,
            date_of_birth,
            preferred_language
          )
        `)
        .eq('doctor_id', session.user.id)
        .eq('status', 'scheduled')
        .order('appointment_date')

      if (error) {
        // If appointments table doesn't exist, show all patients as fallback
        console.warn('Appointments table not found, showing all patients:', error)
        const { data: allPatients, error: patientsError } = await supabase
          .from('patients')
          .select('id, name, date_of_birth, preferred_language')
          .order('name')
        
        if (patientsError) throw patientsError
        setPatients(allPatients || [])
        return
      }
      
      // Extract unique patients from appointments
      const uniquePatients = new Map()
      data?.forEach((appointment: any) => {
        if (appointment.patients) {
          const patient = appointment.patients
          if (!uniquePatients.has(patient.id)) {
            uniquePatients.set(patient.id, patient)
          }
        }
      })
      
      setPatients(Array.from(uniquePatients.values()))
    } catch (error) {
      console.error('Error loading patients:', error)
      toast.error('Failed to load patients')
    }
  }

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleSelectPatient = async (patientId: string) => {
    setIsLoading(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        toast.error('Session expired. Please sign in again.')
        router.push('/auth')
        return
      }

      // Create consultation
      const { data: consultation, error } = await supabase
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

      if (error) throw error

      toast.success('Consultation started!')
      onOpenChange(false)
      router.push(`/consultation/${consultation.id}/room?userType=doctor`)
    } catch (error) {
      console.error('Error starting consultation:', error)
      toast.error('Failed to start consultation')
      setIsLoading(false)
    }
  }



  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Select Patient with Appointment</DialogTitle>
          <DialogDescription>
            Choose a patient who has a scheduled appointment with you
          </DialogDescription>
        </DialogHeader>

        <>
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search patients with appointments..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="space-y-2 max-h-96 overflow-y-auto">
                {filteredPatients.length === 0 ? (
                  <div className="text-center py-8">
                    <User className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground mb-2">
                      {searchQuery ? 'No patients found' : 'No scheduled appointments'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Patients need to book an appointment first
                    </p>
                  </div>
                ) : (
                  filteredPatients.map((patient) => (
                    <button
                      key={patient.id}
                      onClick={() => handleSelectPatient(patient.id)}
                      disabled={isLoading}
                      className="w-full text-left p-4 rounded-lg border hover:bg-accent transition-colors disabled:opacity-50"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{patient.name}</p>
                          <p className="text-sm text-muted-foreground">
                            DOB: {new Date(patient.date_of_birth).toLocaleDateString()} • 
                            Language: {patient.preferred_language === 'hi' ? 'Hindi' : 'English'}
                          </p>
                        </div>
                        <User className="w-5 h-5 text-muted-foreground" />
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          </>
      </DialogContent>
    </Dialog>
  )
}
