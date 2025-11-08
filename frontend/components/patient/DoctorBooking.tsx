"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Calendar, Clock, Star, Search, Filter, MapPin, Video, CheckCircle2, Loader2 } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'

interface Doctor {
  id: string
  name: string
  specialty: string
  specialties: string[]
  rating: number
  reviews: number
  experience: number
  languages: string[]
  availability: string
  consultationFee: number
  image?: string
  location: string
  about: string
}

interface DoctorBookingProps {
  symptomCategory?: string
  severity?: number
}

// Mock doctor data - replace with API call
const DOCTORS: Doctor[] = [
  {
    id: '1',
    name: 'Dr. Rajesh Kumar',
    specialty: 'Cardiologist',
    specialties: ['Cardiology', 'Heart Disease', 'Chest Pain'],
    rating: 4.8,
    reviews: 234,
    experience: 15,
    languages: ['English', 'Hindi', 'Tamil'],
    availability: 'Available Today',
    consultationFee: 800,
    location: 'Apollo Hospital, Delhi',
    about: 'Specialized in treating heart conditions, chest pain, and cardiovascular diseases.',
    image: '/doctors/dr-kumar.jpg'
  },
  {
    id: '2',
    name: 'Dr. Priya Sharma',
    specialty: 'Pulmonologist',
    specialties: ['Pulmonology', 'Respiratory', 'Breathing Issues'],
    rating: 4.9,
    reviews: 189,
    experience: 12,
    languages: ['English', 'Hindi'],
    availability: 'Available Today',
    consultationFee: 750,
    location: 'Fortis Hospital, Mumbai',
    about: 'Expert in respiratory conditions, breathing difficulties, and lung diseases.',
    image: '/doctors/dr-sharma.jpg'
  },
  {
    id: '3',
    name: 'Dr. Amit Patel',
    specialty: 'Neurologist',
    specialties: ['Neurology', 'Headache', 'Dizziness', 'Neurological'],
    rating: 4.7,
    reviews: 156,
    experience: 18,
    languages: ['English', 'Hindi', 'Gujarati'],
    availability: 'Tomorrow',
    consultationFee: 900,
    location: 'Max Hospital, Bangalore',
    about: 'Specialized in neurological conditions, headaches, and brain-related issues.',
    image: '/doctors/dr-patel.jpg'
  },
  {
    id: '4',
    name: 'Dr. Sneha Reddy',
    specialty: 'Orthopedic Surgeon',
    specialties: ['Orthopedics', 'Injury', 'Fracture', 'Bone', 'Joint Pain'],
    rating: 4.9,
    reviews: 278,
    experience: 14,
    languages: ['English', 'Hindi', 'Telugu'],
    availability: 'Available Today',
    consultationFee: 850,
    location: 'AIIMS, Hyderabad',
    about: 'Expert in treating fractures, injuries, and musculoskeletal conditions.',
    image: '/doctors/dr-reddy.jpg'
  },
  {
    id: '5',
    name: 'Dr. Vikram Singh',
    specialty: 'General Physician',
    specialties: ['General Medicine', 'Fever', 'Infection', 'Pain'],
    rating: 4.6,
    reviews: 312,
    experience: 10,
    languages: ['English', 'Hindi', 'Punjabi'],
    availability: 'Available Now',
    consultationFee: 500,
    location: 'Medanta Hospital, Gurgaon',
    about: 'General physician for common ailments, infections, and routine checkups.',
    image: '/doctors/dr-singh.jpg'
  }
]

const SPECIALTY_MAP: Record<string, string[]> = {
  'chest_pain': ['Cardiologist', 'General Physician'],
  'breathing_difficulty': ['Pulmonologist', 'Cardiologist'],
  'neurological': ['Neurologist', 'General Physician'],
  'injury': ['Orthopedic Surgeon', 'General Physician'],
  'pain': ['General Physician', 'Orthopedic Surgeon'],
  'infection': ['General Physician'],
  'bleeding': ['General Physician', 'Orthopedic Surgeon'],
  'mental_health': ['Psychiatrist', 'General Physician']
}

export default function DoctorBooking({ symptomCategory, severity }: DoctorBookingProps) {
  const [doctors, setDoctors] = useState<Doctor[]>(DOCTORS)
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>(DOCTORS)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('all')
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null)
  const [showBookingDialog, setShowBookingDialog] = useState(false)

  useEffect(() => {
    // Filter doctors based on symptom category
    if (symptomCategory && SPECIALTY_MAP[symptomCategory]) {
      const relevantSpecialties = SPECIALTY_MAP[symptomCategory]
      const filtered = DOCTORS.filter(doc => 
        relevantSpecialties.includes(doc.specialty)
      )
      setFilteredDoctors(filtered)
      if (relevantSpecialties.length > 0) {
        setSelectedSpecialty(relevantSpecialties[0])
      }
    }
  }, [symptomCategory])

  useEffect(() => {
    let filtered = doctors

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(doc =>
        doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.specialties.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    }

    // Filter by specialty
    if (selectedSpecialty !== 'all') {
      filtered = filtered.filter(doc => doc.specialty === selectedSpecialty)
    }

    setFilteredDoctors(filtered)
  }, [searchQuery, selectedSpecialty, doctors])

  const specialties = ['all', ...Array.from(new Set(DOCTORS.map(d => d.specialty)))]

  const handleBookAppointment = (doctor: Doctor) => {
    setSelectedDoctor(doctor)
    setShowBookingDialog(true)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-2 border-white/20 bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-teal-950/30 dark:to-cyan-950/30">
        <CardHeader>
          <CardTitle className="text-2xl">Find the Right Doctor</CardTitle>
          <CardDescription className="text-base">
            {symptomCategory 
              ? `Based on your symptoms, we recommend these specialists`
              : 'Browse our network of qualified healthcare professionals'}
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input
              placeholder="Search by doctor name or specialty..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 text-base"
            />
          </div>

          {/* Specialty Filter */}
          <div className="space-y-2">
            <label className="text-sm font-semibold flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Filter by Specialty
            </label>
            <div className="flex flex-wrap gap-2">
              {specialties.map((specialty) => (
                <Button
                  key={specialty}
                  variant={selectedSpecialty === specialty ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedSpecialty(specialty)}
                  className={selectedSpecialty === specialty ? 'bg-teal-600 hover:bg-teal-700' : ''}
                >
                  {specialty === 'all' ? 'All Specialties' : specialty}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Doctor List */}
      <div className="grid gap-4">
        {filteredDoctors.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No doctors found matching your criteria</p>
            </CardContent>
          </Card>
        ) : (
          filteredDoctors.map((doctor) => (
            <Card key={doctor.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Doctor Avatar */}
                  <Avatar className="w-24 h-24 border-4 border-teal-100">
                    <AvatarImage src={doctor.image} alt={doctor.name} />
                    <AvatarFallback className="text-2xl bg-gradient-to-br from-teal-500 to-cyan-600 text-white">
                      {doctor.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>

                  {/* Doctor Info */}
                  <div className="flex-1 space-y-3">
                    <div>
                      <h3 className="text-xl font-bold">{doctor.name}</h3>
                      <p className="text-teal-600 dark:text-teal-400 font-semibold">{doctor.specialty}</p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {doctor.specialties.map((spec, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {spec}
                        </Badge>
                      ))}
                    </div>

                    <p className="text-sm text-muted-foreground">{doctor.about}</p>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                      <div className="flex items-center gap-2">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-semibold">{doctor.rating}</span>
                        <span className="text-muted-foreground">({doctor.reviews})</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-teal-600" />
                        <span>{doctor.experience} years exp</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <span className="text-xs">{doctor.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span className={doctor.availability.includes('Now') || doctor.availability.includes('Today') ? 'text-green-600 font-semibold' : ''}>
                          {doctor.availability}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-muted-foreground">Languages:</span>
                      <span>{doctor.languages.join(', ')}</span>
                    </div>
                  </div>

                  {/* Booking Section */}
                  <div className="flex flex-col justify-between items-end gap-3 min-w-[180px]">
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Consultation Fee</p>
                      <p className="text-2xl font-bold text-teal-600">₹{doctor.consultationFee}</p>
                    </div>
                    <Button 
                      onClick={() => handleBookAppointment(doctor)}
                      className="w-full bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white gap-2"
                    >
                      <Video className="w-4 h-4" />
                      Book Appointment
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Booking Dialog */}
      {selectedDoctor && (
        <BookingDialog
          doctor={selectedDoctor}
          open={showBookingDialog}
          onClose={() => setShowBookingDialog(false)}
          symptomCategory={symptomCategory}
          severity={severity}
        />
      )}
    </div>
  )
}

// Booking Dialog Component
function BookingDialog({ doctor, open, onClose, symptomCategory, severity }: { 
  doctor: Doctor; 
  open: boolean; 
  onClose: () => void;
  symptomCategory?: string;
  severity?: number;
}) {
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [bookingConfirmed, setBookingConfirmed] = useState(false)
  const [isBooking, setIsBooking] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const availableDates = [
    { date: new Date().toISOString().split('T')[0], label: 'Today' },
    { date: new Date(Date.now() + 86400000).toISOString().split('T')[0], label: 'Tomorrow' },
    { date: new Date(Date.now() + 172800000).toISOString().split('T')[0], label: new Date(Date.now() + 172800000).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) }
  ]

  const availableTimes = [
    '09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'
  ]

  const formatTimeDisplay = (time: string) => {
    const [hours, minutes] = time.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour
    return `${displayHour}:${minutes} ${ampm}`
  }

  const handleConfirmBooking = async () => {
    setIsBooking(true)
    setError(null)

    try {
      // Get patient ID from session (you'll need to implement this based on your auth)
      const patientId = 'current-user-id' // TODO: Get from auth context
      
      const response = await fetch('http://localhost:8000/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          patient_id: patientId,
          doctor_id: doctor.id,
          symptom_category: symptomCategory,
          severity: severity,
          date: selectedDate,
          time: selectedTime,
          consultation_fee: doctor.consultationFee
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Failed to book appointment')
      }

      const appointment = await response.json()
      console.log('Appointment created:', appointment)

      setBookingConfirmed(true)
      setTimeout(() => {
        onClose()
        setBookingConfirmed(false)
        setSelectedDate('')
        setSelectedTime('')
        setError(null)
        // Optionally redirect to appointments page
        window.location.href = '/patient/dashboard'
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to book appointment')
      setIsBooking(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">Book Appointment</DialogTitle>
          <DialogDescription>
            Schedule a video consultation with {doctor.name}
          </DialogDescription>
        </DialogHeader>

        {bookingConfirmed ? (
          <div className="py-12 text-center space-y-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>
            <h3 className="text-xl font-bold">Appointment Confirmed!</h3>
            <p className="text-muted-foreground">
              Your appointment with {doctor.name} has been scheduled for {selectedDate} at {selectedTime}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Doctor Summary */}
            <Card className="bg-teal-50 dark:bg-teal-950/30">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <Avatar className="w-16 h-16">
                    <AvatarFallback className="bg-gradient-to-br from-teal-500 to-cyan-600 text-white">
                      {doctor.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-bold">{doctor.name}</h4>
                    <p className="text-sm text-teal-600">{doctor.specialty}</p>
                    <p className="text-sm text-muted-foreground">{doctor.location}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Date Selection */}
            <div className="space-y-2">
              <label className="text-sm font-semibold flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Select Date
              </label>
              <div className="grid grid-cols-3 gap-2">
                {availableDates.map((date) => (
                  <Button
                    key={date.date}
                    variant={selectedDate === date.date ? 'default' : 'outline'}
                    onClick={() => setSelectedDate(date.date)}
                    className={selectedDate === date.date ? 'bg-teal-600 hover:bg-teal-700' : ''}
                  >
                    {date.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Time Selection */}
            {selectedDate && (
              <div className="space-y-2">
                <label className="text-sm font-semibold flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Select Time
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {availableTimes.map((time) => (
                    <Button
                      key={time}
                      variant={selectedTime === time ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedTime(time)}
                      className={selectedTime === time ? 'bg-teal-600 hover:bg-teal-700' : ''}
                    >
                      {formatTimeDisplay(time)}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Consultation Fee */}
            <Card className="bg-slate-50 dark:bg-slate-900">
              <CardContent className="pt-6">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Consultation Fee</span>
                  <span className="text-2xl font-bold text-teal-600">₹{doctor.consultationFee}</span>
                </div>
              </CardContent>
            </Card>

            {/* Error Message */}
            {error && (
              <Card className="bg-red-50 dark:bg-red-950/30 border-red-200">
                <CardContent className="pt-6">
                  <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                </CardContent>
              </Card>
            )}

            {/* Confirm Button */}
            <Button
              onClick={handleConfirmBooking}
              disabled={!selectedDate || !selectedTime || isBooking}
              className="w-full h-12 bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white"
            >
              {isBooking ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Booking...
                </>
              ) : (
                'Confirm Booking'
              )}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
