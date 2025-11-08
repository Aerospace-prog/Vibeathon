"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Calendar, Clock, Video, X, Loader2, AlertCircle } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface Appointment {
  id: string
  patient_id: string
  doctor_id: string
  symptom_category?: string
  severity?: number
  date: string
  time: string
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled' | 'missed'
  consultation_fee: number
  created_at: string
  updated_at: string
  doctor_name?: string
  doctor_specialty?: string
  doctor_image?: string
}

interface AppointmentsListProps {
  type: 'upcoming' | 'past'
  patientId: string
  limit?: number
}

export default function AppointmentsList({ type, patientId, limit }: AppointmentsListProps) {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchAppointments()
  }, [patientId, type])

  const fetchAppointments = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const status = type === 'upcoming' ? 'scheduled' : 'completed'
      const url = `http://localhost:8000/api/appointments/patient/${patientId}?status=${status}${limit ? `&page_size=${limit}` : ''}`
      
      const response = await fetch(url)
      
      if (!response.ok) {
        throw new Error('Failed to fetch appointments')
      }

      const data = await response.json()
      setAppointments(data.appointments || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load appointments')
    } finally {
      setIsLoading(false)
    }
  }

  const canJoinConsultation = (appointment: Appointment) => {
    const appointmentDateTime = new Date(`${appointment.date}T${appointment.time}`)
    const now = new Date()
    const diffMinutes = (appointmentDateTime.getTime() - now.getTime()) / 60000
    
    // Can join 15 minutes before to 30 minutes after
    return diffMinutes <= 15 && diffMinutes >= -30
  }

  const getTimeUntil = (appointment: Appointment) => {
    const appointmentDateTime = new Date(`${appointment.date}T${appointment.time}`)
    const now = new Date()
    const diffMinutes = Math.floor((appointmentDateTime.getTime() - now.getTime()) / 60000)
    
    if (diffMinutes < 0) return 'Started'
    if (diffMinutes < 60) return `in ${diffMinutes} min`
    if (diffMinutes < 1440) return `in ${Math.floor(diffMinutes / 60)} hours`
    return `in ${Math.floor(diffMinutes / 1440)} days`
  }

  const handleCancelAppointment = async (appointmentId: string) => {
    if (!confirm('Are you sure you want to cancel this appointment?')) return

    try {
      const response = await fetch(`http://localhost:8000/api/appointments/${appointmentId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to cancel appointment')
      }

      fetchAppointments()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to cancel appointment')
    }
  }

  const handleJoinConsultation = (appointmentId: string) => {
    window.location.href = `/consultation/${appointmentId}`
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    if (date.toDateString() === today.toDateString()) return 'Today'
    if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow'
    
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    })
  }

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour
    return `${displayHour}:${minutes} ${ampm}`
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
      </div>
    )
  }

  if (error) {
    return (
      <Alert className="bg-red-50 border-red-200">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  if (appointments.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-teal-50 dark:bg-teal-950/30 rounded-full mb-4">
          <Calendar className="w-8 h-8 text-teal-600 dark:text-teal-400" />
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          {type === 'upcoming' 
            ? 'No upcoming appointments. Book your first consultation!' 
            : 'No past consultations yet.'}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {appointments.map((appointment) => (
        <Card key={appointment.id} className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <Avatar className="w-16 h-16 border-2 border-teal-100">
                <AvatarImage src={appointment.doctor_image} alt={appointment.doctor_name} />
                <AvatarFallback className="bg-gradient-to-br from-teal-500 to-cyan-600 text-white">
                  {appointment.doctor_name?.split(' ').map(n => n[0]).join('') || 'DR'}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-lg">{appointment.doctor_name || 'Doctor'}</h4>
                    <p className="text-sm text-teal-600 dark:text-teal-400">{appointment.doctor_specialty}</p>
                  </div>
                  <Badge 
                    variant={appointment.status === 'scheduled' ? 'default' : 'secondary'}
                    className={
                      appointment.status === 'scheduled' 
                        ? 'bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-300' 
                        : ''
                    }
                  >
                    {appointment.status}
                  </Badge>
                </div>

                <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(appointment.date)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{formatTime(appointment.time)}</span>
                  </div>
                  {type === 'upcoming' && (
                    <span className="text-teal-600 dark:text-teal-400 font-semibold">
                      {getTimeUntil(appointment)}
                    </span>
                  )}
                </div>

                {appointment.symptom_category && (
                  <div className="mt-2">
                    <Badge variant="outline" className="text-xs">
                      {appointment.symptom_category.replace('_', ' ')}
                    </Badge>
                  </div>
                )}
              </div>

              {type === 'upcoming' && (
                <div className="flex flex-col gap-2">
                  {canJoinConsultation(appointment) ? (
                    <Button
                      onClick={() => handleJoinConsultation(appointment.id)}
                      className="bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white gap-2"
                    >
                      <Video className="w-4 h-4" />
                      Join Now
                    </Button>
                  ) : (
                    <Button variant="outline" disabled>
                      <Clock className="w-4 h-4 mr-2" />
                      {getTimeUntil(appointment)}
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCancelAppointment(appointment.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <X className="w-4 h-4 mr-1" />
                    Cancel
                  </Button>
                </div>
              )}

              {type === 'past' && (
                <Button variant="outline">
                  View SOAP Notes
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
