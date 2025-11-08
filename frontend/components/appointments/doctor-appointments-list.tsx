'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar, Clock, User, Phone, Video, CheckCircle2, XCircle, Loader2, IndianRupee } from 'lucide-react'
import { toast } from 'sonner'

// Helper function to format date
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

interface Appointment {
  id: string
  patient_id: string
  date: string
  time?: string // Optional since it might not exist in the schema
  status: string
  symptom_category: string | null
  severity: number | null
  consultation_fee: number
  created_at: string
  patient_name?: string
  patient_email?: string
}

interface DoctorAppointmentsListProps {
  doctorId: string
}

export function DoctorAppointmentsList({ doctorId }: DoctorAppointmentsListProps) {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'scheduled' | 'completed' | 'cancelled'>('all')
  const [setupNeeded, setSetupNeeded] = useState(false)

  useEffect(() => {
    fetchAppointments()

    // Set up real-time subscription for new appointments
    const channel = supabase
      .channel('appointments-changes')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'appointments',
          filter: `doctor_id=eq.${doctorId}`
        },
        (payload) => {
          console.log('Real-time appointment update:', payload)
          
          if (payload.eventType === 'INSERT') {
            // New appointment created - fetch fresh data and show notification
            fetchAppointments()
            toast.success('New appointment booked!', {
              description: 'A patient has scheduled a new appointment with you.',
              duration: 5000
            })
          } else if (payload.eventType === 'UPDATE') {
            // Appointment updated - update in state
            setAppointments(prev => 
              prev.map(apt => 
                apt.id === payload.new.id 
                  ? { ...apt, ...payload.new }
                  : apt
              )
            )
          } else if (payload.eventType === 'DELETE') {
            // Appointment deleted - remove from state
            setAppointments(prev => 
              prev.filter(apt => apt.id !== payload.old.id)
            )
          }
        }
      )
      .subscribe()

    // Cleanup subscription on unmount
    return () => {
      supabase.removeChannel(channel)
    }
  }, [doctorId])

  const handleJoinAppointment = async (appointmentId: string) => {
    try {
      console.log('Joining appointment:', appointmentId)
      
      // Skip status update for now - the constraint might not allow 'in-progress'
      // Just navigate directly to the consultation room
      
      const appointment = appointments.find(a => a.id === appointmentId)
      if (!appointment) {
        toast.error('Appointment not found')
        return
      }
      
      console.log('Navigating to consultation room for appointment:', appointment)
      toast.success('Joining consultation...')
      
      // Navigate to consultation room using appointment ID
      window.location.href = `/consultation/${appointmentId}/room?userType=doctor`
      
    } catch (err) {
      console.error('Error joining appointment:', err)
      toast.error('An unexpected error occurred')
    }
  }

  const handleUpdateStatus = async (appointmentId: string, status: string) => {
    try {
      console.log('Updating appointment:', appointmentId, 'to status:', status)
      
      const { data, error } = await supabase
        .from('appointments')
        .update({ status })
        .eq('id', appointmentId)
        .select()

      if (error) {
        console.error('Error updating appointment:', error)
        toast.error('Failed to update appointment status')
      } else {
        console.log('Appointment updated successfully:', data)
        toast.success(`Appointment ${status}`)
        // Refresh appointments list
        fetchAppointments()
      }
    } catch (err) {
      console.error('Error updating appointment:', err)
      toast.error('An error occurred')
    }
  }

  const handleViewNotes = (appointmentId: string) => {
    // Find consultation for this appointment
    const consultation = appointments.find(a => a.id === appointmentId)
    if (consultation) {
      window.location.href = `/consultation/${appointmentId}/review`
    }
  }

  const fetchAppointments = async () => {
    setLoading(true)
    try {
      console.log('Fetching appointments for doctor:', doctorId)
      
      // Fetch appointments for this doctor
      // Note: Removed .order('time') as the column doesn't exist in the current schema
      const { data: appointmentsData, error: appointmentsError } = await supabase
        .from('appointments')
        .select('*')
        .eq('doctor_id', doctorId)
        .order('date', { ascending: true })
      
      console.log('Appointments query result:', { data: appointmentsData, error: appointmentsError })

      if (appointmentsError) {
        console.error('Error fetching appointments:', appointmentsError)
        console.error('Error details:', JSON.stringify(appointmentsError, null, 2))
        
        // Check if it's an RLS policy issue
        if (appointmentsError.code === '42501' || appointmentsError.message?.includes('policy')) {
          console.error('⚠️ RLS Policy Error: Doctor cannot access appointments')
          console.error('This might be because:')
          console.error('1. RLS policies are not set up correctly')
          console.error('2. The doctor_id in appointments does not match the logged-in user')
          console.error('3. The appointments table RLS is too restrictive')
        }
        
        // Show user-friendly error message
        if (appointmentsError.code === 'PGRST116' || appointmentsError.message?.includes('relation') || appointmentsError.message?.includes('does not exist')) {
          console.warn('⚠️ Appointments table does not exist. Please run the database migration.')
          console.warn('Run: backend/migrations/001_create_appointments_tables.sql')
          setSetupNeeded(true)
        }
        
        setAppointments([])
        setLoading(false)
        return
      }

      if (!appointmentsData || appointmentsData.length === 0) {
        setAppointments([])
        setLoading(false)
        return
      }

      // Fetch patient details from patients table
      const patientIds = [...new Set(appointmentsData.map(apt => apt.patient_id))]
      
      console.log('Fetching patients for IDs:', patientIds)
      
      if (patientIds.length > 0) {
        const { data: patientsData, error: patientsError } = await supabase
          .from('patients')
          .select('id, user_id, name, email')
          .in('user_id', patientIds)

        console.log('Patients query result:', { data: patientsData, error: patientsError })

        if (patientsError) {
          console.error('Error fetching patients:', patientsError)
          console.error('Patients table might not exist or RLS policies are blocking access')
        }

        // Create a map of patient details
        const patientMap = new Map()
        if (patientsData && patientsData.length > 0) {
          patientsData.forEach(patient => {
            patientMap.set(patient.user_id, {
              name: patient.name || 'Patient',
              email: patient.email || ''
            })
          })
          console.log('Patient map created:', Object.fromEntries(patientMap))
        } else {
          console.warn('No patient data found. Patients table might be empty or inaccessible.')
        }

        // Combine appointment data with patient details
        const enrichedAppointments = appointmentsData.map(apt => ({
          ...apt,
          patient_name: patientMap.get(apt.patient_id)?.name || `Patient ${apt.patient_id.substring(0, 8)}`,
          patient_email: patientMap.get(apt.patient_id)?.email || '',
          consultation_fee: apt.consultation_fee || 0,
          time: apt.time || null
        }))

        console.log('Enriched appointments:', enrichedAppointments)
        setAppointments(enrichedAppointments)
      } else {
        setAppointments(appointmentsData.map(apt => ({
          ...apt,
          patient_name: 'Unknown Patient',
          patient_email: '',
          consultation_fee: apt.consultation_fee || 0,
          time: apt.time || null
        })))
      }
    } catch (err) {
      console.error('Unexpected error fetching appointments:', err)
      setAppointments([])
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      case 'missed':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-4 h-4" />
      case 'cancelled':
      case 'missed':
        return <XCircle className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  const filteredAppointments = appointments.filter(apt => {
    if (filter === 'all') return true
    return apt.status === filter
  })

  const stats = {
    total: appointments.length,
    scheduled: appointments.filter(a => a.status === 'scheduled').length,
    completed: appointments.filter(a => a.status === 'completed').length,
    cancelled: appointments.filter(a => a.status === 'cancelled').length
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-teal-600" />
          <p className="text-muted-foreground">Loading appointments...</p>
        </CardContent>
      </Card>
    )
  }

  if (setupNeeded) {
    return (
      <Card className="border-2 border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20 dark:border-yellow-800">
        <CardContent className="py-12 text-center">
          <div className="max-w-2xl mx-auto space-y-4">
            <div className="text-yellow-600 dark:text-yellow-400 text-5xl mb-4">⚠️</div>
            <h3 className="text-xl font-bold text-yellow-900 dark:text-yellow-100">
              Database Setup Required
            </h3>
            <p className="text-yellow-800 dark:text-yellow-200">
              The appointments table hasn't been created yet. Please run the database migration to enable appointments.
            </p>
            <div className="bg-yellow-100 dark:bg-yellow-900/30 p-4 rounded-lg text-left">
              <p className="text-sm font-semibold text-yellow-900 dark:text-yellow-100 mb-2">Quick Setup:</p>
              <ol className="text-sm text-yellow-800 dark:text-yellow-200 space-y-1 list-decimal list-inside">
                <li>Open Supabase SQL Editor</li>
                <li>Run: <code className="bg-yellow-200 dark:bg-yellow-800 px-1 py-0.5 rounded">backend/migrations/001_create_appointments_tables.sql</code></li>
                <li>Refresh this page</li>
              </ol>
            </div>
            <p className="text-xs text-yellow-700 dark:text-yellow-300">
              See <code className="bg-yellow-200 dark:bg-yellow-800 px-1 py-0.5 rounded">SETUP_APPOINTMENTS_TABLE.md</code> for detailed instructions.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-2 border-teal-200/50 dark:border-teal-800/50">
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-teal-600 dark:text-teal-400">{stats.total}</div>
            <p className="text-sm text-muted-foreground mt-1">Total Appointments</p>
          </CardContent>
        </Card>
        <Card className="border-2 border-blue-200/50 dark:border-blue-800/50">
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{stats.scheduled}</div>
            <p className="text-sm text-muted-foreground mt-1">Scheduled</p>
          </CardContent>
        </Card>
        <Card className="border-2 border-green-200/50 dark:border-green-800/50">
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-green-600 dark:text-green-400">{stats.completed}</div>
            <p className="text-sm text-muted-foreground mt-1">Completed</p>
          </CardContent>
        </Card>
        <Card className="border-2 border-red-200/50 dark:border-red-800/50">
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-red-600 dark:text-red-400">{stats.cancelled}</div>
            <p className="text-sm text-muted-foreground mt-1">Cancelled</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter Buttons */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-2">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('all')}
              className={filter === 'all' ? 'bg-teal-600 hover:bg-teal-700' : ''}
            >
              All ({stats.total})
            </Button>
            <Button
              variant={filter === 'scheduled' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('scheduled')}
              className={filter === 'scheduled' ? 'bg-blue-600 hover:bg-blue-700' : ''}
            >
              Scheduled ({stats.scheduled})
            </Button>
            <Button
              variant={filter === 'completed' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('completed')}
              className={filter === 'completed' ? 'bg-green-600 hover:bg-green-700' : ''}
            >
              Completed ({stats.completed})
            </Button>
            <Button
              variant={filter === 'cancelled' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('cancelled')}
              className={filter === 'cancelled' ? 'bg-red-600 hover:bg-red-700' : ''}
            >
              Cancelled ({stats.cancelled})
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Appointments List */}
      {filteredAppointments.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Calendar className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">
              {filter === 'all' 
                ? 'No appointments yet. Patients will book appointments through the platform.'
                : `No ${filter} appointments found.`}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredAppointments.map((appointment) => (
            <Card key={appointment.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Patient Info */}
                  <div className="flex-1 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-bold flex items-center gap-2">
                          <User className="w-5 h-5 text-teal-600" />
                          {appointment.patient_name}
                        </h3>
                        {appointment.patient_email && (
                          <p className="text-sm text-muted-foreground">{appointment.patient_email}</p>
                        )}
                      </div>
                      <Badge className={`${getStatusColor(appointment.status)} flex items-center gap-1`}>
                        {getStatusIcon(appointment.status)}
                        {appointment.status}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span>{formatDate(appointment.date)}</span>
                      </div>
                      {appointment.time && (
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          <span>{appointment.time}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <IndianRupee className="w-4 h-4 text-muted-foreground" />
                        <span>₹{appointment.consultation_fee || 0}</span>
                      </div>
                    </div>

                    {appointment.symptom_category && (
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {appointment.symptom_category}
                        </Badge>
                        {appointment.severity && (
                          <Badge variant="outline" className="text-xs">
                            Severity: {appointment.severity}/5
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 min-w-[140px]">
                    {appointment.status === 'scheduled' && (
                      <>
                        <Button 
                          className="w-full bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white gap-2"
                          size="sm"
                          onClick={() => handleJoinAppointment(appointment.id)}
                        >
                          <Video className="w-4 h-4" />
                          Join Call
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="w-full"
                          onClick={() => handleUpdateStatus(appointment.id, 'cancelled')}
                        >
                          Cancel
                        </Button>
                      </>
                    )}
                    {appointment.status === 'in-progress' && (
                      <Button 
                        className="w-full bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white gap-2"
                        size="sm"
                        onClick={() => handleJoinAppointment(appointment.id)}
                      >
                        <Video className="w-4 h-4 animate-pulse" />
                        Rejoin Call
                      </Button>
                    )}
                    {appointment.status === 'completed' && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="w-full"
                        onClick={() => handleViewNotes(appointment.id)}
                      >
                        View Notes
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
