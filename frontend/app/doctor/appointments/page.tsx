'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar, Clock, Video, CheckCircle2, XCircle, Loader2, ArrowLeft, User, IndianRupee, Filter } from 'lucide-react'
import { toast } from 'sonner'

interface Appointment {
  id: string
  patient_id: string
  patient_name: string
  patient_email: string
  date: string
  time: string
  status: string
  symptom_category: string | null
  severity: number | null
  consultation_fee: number
  created_at: string
}

export default function DoctorAppointmentsPage() {
  const router = useRouter()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'scheduled' | 'completed' | 'cancelled'>('all')

  useEffect(() => {
    async function fetchAppointments() {
      try {
        // Check authentication
        const { data: { session } } = await supabase.auth.getSession()
        
        if (!session) {
          router.push('/auth')
          return
        }

        // Check if user is a doctor
        const userRole = session.user.user_metadata?.role
        if (userRole === 'patient') {
          router.push('/patient/dashboard')
          return
        }

        // Fetch doctor's appointments
        const { data: appointmentsData, error: appointmentsError } = await supabase
          .from('appointments')
          .select('*')
          .eq('doctor_id', session.user.id)
          .order('date', { ascending: false })
          .order('time', { ascending: false })

        if (appointmentsError) {
          console.error('Error fetching appointments:', appointmentsError)
          setError('Failed to load appointments')
          setLoading(false)
          return
        }

        setAppointments(appointmentsData || [])
        setFilteredAppointments(appointmentsData || [])
      } catch (err) {
        console.error('Unexpected error:', err)
        setError('An unexpected error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchAppointments()

    // Set up real-time subscription
    const channel = supabase
      .channel('doctor-appointments-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'appointments',
        },
        (payload) => {
          console.log('Real-time appointment update:', payload)
          fetchAppointments() // Refresh appointments on any change
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [router])

  useEffect(() => {
    // Apply filter
    if (filter === 'all') {
      setFilteredAppointments(appointments)
    } else {
      setFilteredAppointments(appointments.filter(apt => apt.status === filter))
    }
  }, [filter, appointments])

  const handleJoinAppointment = async (appointmentId: string) => {
    try {
      toast.success('Joining consultation...')
      router.push(`/consultation/${appointmentId}/room?userType=doctor`)
    } catch (err) {
      console.error('Error joining appointment:', err)
      toast.error('Failed to join consultation')
    }
  }

  const handleUpdateStatus = async (appointmentId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status })
        .eq('id', appointmentId)

      if (error) {
        console.error('Error updating appointment:', error)
        toast.error('Failed to update appointment status')
      } else {
        toast.success(`Appointment ${status}`)
        // Refresh appointments
        const { data } = await supabase
          .from('appointments')
          .select('*')
          .eq('doctor_id', (await supabase.auth.getSession()).data.session?.user.id)
          .order('date', { ascending: false })
        
        if (data) {
          setAppointments(data)
        }
      }
    } catch (err) {
      console.error('Error updating appointment:', err)
      toast.error('An error occurred')
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatTime = (timeString: string) => {
    if (!timeString) return ''
    const [hours, minutes] = timeString.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour
    return `${displayHour}:${minutes} ${ampm}`
  }

  const stats = {
    total: appointments.length,
    scheduled: appointments.filter(a => a.status === 'scheduled').length,
    completed: appointments.filter(a => a.status === 'completed').length,
    cancelled: appointments.filter(a => a.status === 'cancelled').length
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50 dark:from-teal-950 dark:via-cyan-950 dark:to-blue-950">
      <div className="container max-w-7xl mx-auto py-8 px-4">
        {/* Back Button */}
        <div className="mb-6">
          <Button
            asChild
            variant="ghost"
            className="gap-2 hover:bg-white/50 dark:hover:bg-zinc-800/50"
          >
            <Link href="/dashboard">
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Link>
          </Button>
        </div>

        {/* Header Card */}
        <Card className="mb-8 border-zinc-200/50 dark:border-zinc-800/50">
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-xl blur-md opacity-50" />
                <div className="relative bg-gradient-to-br from-teal-500 to-cyan-600 p-3 rounded-xl shadow-lg">
                  <Calendar className="w-8 h-8 text-white" />
                </div>
              </div>
              <div>
                <CardTitle className="text-3xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 dark:from-teal-400 dark:to-cyan-400 bg-clip-text text-transparent">
                  My Appointments
                </CardTitle>
                <CardDescription className="text-base mt-1">
                  Manage your patient consultations
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4 mb-8">
          <Card className="border-teal-200/50 dark:border-teal-800/50">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-teal-600 dark:text-teal-400">{stats.total}</div>
              <p className="text-sm text-muted-foreground mt-1">Total Appointments</p>
            </CardContent>
          </Card>
          <Card className="border-blue-200/50 dark:border-blue-800/50">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{stats.scheduled}</div>
              <p className="text-sm text-muted-foreground mt-1">Scheduled</p>
            </CardContent>
          </Card>
          <Card className="border-green-200/50 dark:border-green-800/50">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-green-600 dark:text-green-400">{stats.completed}</div>
              <p className="text-sm text-muted-foreground mt-1">Completed</p>
            </CardContent>
          </Card>
          <Card className="border-red-200/50 dark:border-red-800/50">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-red-600 dark:text-red-400">{stats.cancelled}</div>
              <p className="text-sm text-muted-foreground mt-1">Cancelled</p>
            </CardContent>
          </Card>
        </div>

        {/* Filter Buttons */}
        <Card className="mb-8 border-zinc-200/50 dark:border-zinc-800/50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-semibold">Filter by Status</span>
            </div>
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

        {loading ? (
          <Card className="border-zinc-200/50 dark:border-zinc-800/50">
            <CardContent className="py-12 text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-teal-600" />
              <p className="text-muted-foreground">Loading appointments...</p>
            </CardContent>
          </Card>
        ) : error ? (
          <Card className="border-2 border-red-200 dark:border-red-800">
            <CardContent className="py-12 text-center">
              <XCircle className="w-16 h-16 mx-auto mb-4 text-red-600" />
              <p className="text-red-600 font-semibold">{error}</p>
            </CardContent>
          </Card>
        ) : filteredAppointments.length === 0 ? (
          <Card className="border-zinc-200/50 dark:border-zinc-800/50">
            <CardContent className="py-16 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-teal-50 dark:bg-teal-950/30 rounded-full mb-4">
                <Calendar className="w-8 h-8 text-teal-600 dark:text-teal-400" />
              </div>
              <h3 className="text-2xl font-bold mb-2">
                {filter === 'all' ? 'No Appointments Yet' : `No ${filter} appointments`}
              </h3>
              <p className="text-muted-foreground">
                {filter === 'all' 
                  ? 'Patients will book appointments through the platform'
                  : `You don't have any ${filter} appointments at the moment`}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredAppointments.map((appointment) => (
              <Card key={appointment.id} className="border-zinc-200/50 dark:border-zinc-800/50 hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row gap-6">
                    {/* Patient Info */}
                    <div className="flex-1 space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-lg font-bold flex items-center gap-2">
                            <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-full flex items-center justify-center text-white font-bold">
                              {appointment.patient_name?.charAt(0) || 'P'}
                            </div>
                            {appointment.patient_name || `Patient ${appointment.patient_id.substring(0, 8)}`}
                          </h3>
                          {appointment.patient_email && (
                            <p className="text-sm text-muted-foreground ml-12">{appointment.patient_email}</p>
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
                            <span>{formatTime(appointment.time)}</span>
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
                          onClick={() => router.push(`/consultation/${appointment.id}/review`)}
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
    </div>
  )
}
