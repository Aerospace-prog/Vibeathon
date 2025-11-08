'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar, Clock, Video, CheckCircle2, XCircle, Loader2, ArrowLeft } from 'lucide-react'

export default function PatientAppointmentsPage() {
  const router = useRouter()
  const [appointments, setAppointments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchAppointments() {
      try {
        // Check authentication
        const { data: { session } } = await supabase.auth.getSession()
        
        if (!session) {
          router.push('/auth')
          return
        }

        // First get the patient record for this user
        const { data: patientData } = await supabase
          .from('patients')
          .select('id')
          .eq('user_id', session.user.id)
          .single()

        if (!patientData) {
          setError('Patient profile not found')
          setLoading(false)
          return
        }

        // Fetch patient's appointments
        const { data: appointmentsData, error: appointmentsError } = await supabase
          .from('appointments')
          .select('id, doctor_id, date, time, consultation_fee, status, notes, created_at')
          .eq('patient_id', patientData.id)
          .order('date', { ascending: false })

        if (appointmentsError) {
          console.error('Error fetching appointments:', appointmentsError)
          setError('Failed to load appointments')
          setLoading(false)
          return
        }

        // Fetch doctor details for each appointment
        const appointmentsWithDoctors = await Promise.all(
          (appointmentsData || []).map(async (appointment) => {
            const { data: doctorData } = await supabase
              .from('doctors')
              .select('full_name, specialization, consultation_fee')
              .eq('id', appointment.doctor_id)
              .single()

            return {
              ...appointment,
              doctors: doctorData
            }
          })
        )

        setAppointments(appointmentsWithDoctors)
      } catch (err) {
        console.error('Unexpected error:', err)
        setError('An unexpected error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchAppointments()
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'scheduled':
        return <Clock className="w-4 h-4" />
      case 'completed':
        return <CheckCircle2 className="w-4 h-4" />
      case 'cancelled':
        return <XCircle className="w-4 h-4" />
      case 'in_progress':
        return <Loader2 className="w-4 h-4 animate-spin" />
      default:
        return <Calendar className="w-4 h-4" />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-teal-400/20 to-cyan-400/20 rounded-full blur-3xl animate-blob" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-indigo-400/20 rounded-full blur-3xl animate-blob animation-delay-2000" />
        <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-blob animation-delay-4000" />
      </div>

      <div className="relative z-10 container max-w-6xl mx-auto py-8 px-4">
        {/* Back Button */}
        <div className="mb-6">
          <Button
            asChild
            variant="ghost"
            className="gap-2 hover:bg-white/50 dark:hover:bg-slate-800/50 backdrop-blur-sm"
          >
            <Link href="/patient/dashboard">
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Link>
          </Button>
        </div>

        {/* Header Card */}
        <Card className="mb-8 border-2 border-white/20 bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-teal-950/30 dark:to-cyan-950/30 backdrop-blur-xl shadow-2xl">
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-xl blur-md opacity-50 animate-pulse" />
                <div className="relative bg-gradient-to-br from-teal-500 to-cyan-600 p-3 rounded-xl shadow-lg">
                  <Calendar className="w-8 h-8 text-white" />
                </div>
              </div>
              <div>
                <CardTitle className="text-3xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 dark:from-teal-400 dark:to-cyan-400 bg-clip-text text-transparent">
                  My Appointments
                </CardTitle>
                <CardDescription className="text-base mt-1">
                  View and manage your consultation appointments
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>

        {loading ? (
          <Card className="border-2 border-white/20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-2xl">
            <CardContent className="py-12 text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-teal-600" />
              <p className="text-muted-foreground">Loading appointments...</p>
            </CardContent>
          </Card>
        ) : error ? (
          <Card className="border-2 border-red-200 dark:border-red-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-2xl">
            <CardContent className="py-12 text-center">
              <XCircle className="w-16 h-16 mx-auto mb-4 text-red-600" />
              <p className="text-red-600 font-semibold">{error}</p>
            </CardContent>
          </Card>
        ) : !appointments || appointments.length === 0 ? (
          <Card className="border-2 border-white/20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-2xl">
            <CardContent className="py-16 text-center">
              <div className="relative inline-block mb-6">
                <div className="absolute inset-0 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-full blur-xl opacity-50 animate-pulse" />
                <div className="relative bg-gradient-to-br from-teal-100 to-cyan-100 dark:from-teal-900 dark:to-cyan-900 p-6 rounded-full">
                  <Calendar className="w-16 h-16 text-teal-600 dark:text-teal-400" />
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-2">No Appointments Yet</h3>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                Book your first consultation with a qualified doctor and start your healthcare journey
              </p>
              <Button 
                asChild 
                className="bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white shadow-lg shadow-teal-500/30"
              >
                <a href="/patient/dashboard">Find Doctors</a>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {appointments.map((appointment: any) => (
              <div key={appointment.id} className="group relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-teal-500 via-cyan-500 to-blue-500 rounded-2xl blur-lg opacity-20 group-hover:opacity-30 transition-opacity" />
                <Card className="relative border-2 border-white/20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02]">
                  <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-xl font-bold">
                          {appointment.doctors?.full_name || 'Doctor'}
                        </h3>
                        <p className="text-teal-600 dark:text-teal-400 font-semibold">
                          {appointment.doctors?.specialization || 'General Physician'}
                        </p>
                      </div>
                      <Badge className={getStatusColor(appointment.status)}>
                        <span className="flex items-center gap-1">
                          {getStatusIcon(appointment.status)}
                          {appointment.status}
                        </span>
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span>
                          {new Date(appointment.date).toLocaleDateString('en-US', {
                            weekday: 'short',
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span>
                          {appointment.time ? (
                            // Display the selected time slot
                            (() => {
                              const [hours, minutes] = appointment.time.split(':')
                              const hour = parseInt(hours)
                              const ampm = hour >= 12 ? 'PM' : 'AM'
                              const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour
                              return `${displayHour}:${minutes} ${ampm}`
                            })()
                          ) : (
                            // Fallback to date time if time field is not available
                            new Date(appointment.date).toLocaleTimeString('en-US', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })
                          )}
                        </span>
                      </div>
                    </div>

                    {appointment.notes && (
                      <p className="text-sm text-muted-foreground">
                        {appointment.notes}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col justify-between items-end gap-3 min-w-[180px]">
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Consultation Fee</p>
                      <p className="text-2xl font-bold text-teal-600">
                        ₹{appointment.consultation_fee || appointment.doctors?.consultation_fee || 0}
                      </p>
                    </div>
                    {appointment.status === 'scheduled' && (
                      <Button 
                        asChild
                        className="w-full bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white gap-2 shadow-lg shadow-teal-500/30 transform hover:scale-105 transition-all"
                      >
                        <Link href={`/consultation/${appointment.id}/room?userType=patient`}>
                          <Video className="w-4 h-4" />
                          Join Call
                        </Link>
                      </Button>
                    )}
                    {appointment.status === 'completed' && (
                      <Button variant="outline" className="w-full border-2 hover:bg-teal-50 dark:hover:bg-teal-950/30">
                        View Details
                      </Button>
                    )}
                  </div>
                </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
