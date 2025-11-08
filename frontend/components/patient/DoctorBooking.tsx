"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Calendar, Clock, Search, Filter, MapPin, Video, CheckCircle2, Loader2, ArrowLeft } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { supabase } from '@/lib/supabase'

interface Doctor {
  id: string
  name: string
  specialty: string
  specialties: string[]
  experience: number
  availability: string
  isAvailable: boolean
  consultationFee: number
  image?: string
  location: string
  about: string
}

interface DoctorBookingProps {
  symptomCategory?: string
  severity?: number
}

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
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('all')
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null)
  const [showBookingDialog, setShowBookingDialog] = useState(false)
  const [loading, setLoading] = useState(true)

  // Fetch doctors from Supabase with availability
  useEffect(() => {
    async function fetchDoctors() {
      setLoading(true)
      try {
        // Fetch doctors with is_available field
        const { data: doctorsData, error: doctorsError } = await supabase
          .from('doctors')
          .select('*')
          .order('created_at', { ascending: false })

        if (doctorsError) {
          console.error('Error fetching doctors:', doctorsError)
          setDoctors([])
          setFilteredDoctors([])
          setLoading(false)
          return
        }

        if (!doctorsData || doctorsData.length === 0) {
          setDoctors([])
          setFilteredDoctors([])
          setLoading(false)
          return
        }

        console.log('✅ Successfully fetched', doctorsData.length, 'doctors with availability')

        // Transform database data to match Doctor interface
        const transformedDoctors: Doctor[] = doctorsData.map(doc => {
          // Use is_available directly from the doctors table
          const isAvailable = doc.is_available !== false // Default to true if null/undefined
          
          // Log each doctor's availability
          console.log(`Doctor ${doc.full_name || doc.email}: available = ${isAvailable}`)
          
          return {
            id: doc.id,
            name: doc.full_name || doc.email.split('@')[0],
            specialty: doc.specialization || 'General Physician',
            specialties: doc.specialization ? [doc.specialization] : ['General Physician'],
            experience: doc.years_of_experience || 0,
            availability: isAvailable ? 'Available Today' : 'Unavailable',
            isAvailable: isAvailable,
            consultationFee: Number(doc.consultation_fee) || 500,
            location: 'Online Consultation',
            about: `Experienced ${doc.specialization || 'General Physician'} with ${doc.years_of_experience || 0} years of practice.`,
            image: undefined
          }
        })

        setDoctors(transformedDoctors)
        setFilteredDoctors(transformedDoctors)
      } catch (err) {
        console.error('Unexpected error fetching doctors:', err)
        setDoctors([])
        setFilteredDoctors([])
      } finally {
        setLoading(false)
      }
    }

    fetchDoctors()
  }, [])

  useEffect(() => {
    // Filter doctors based on symptom category
    if (symptomCategory && SPECIALTY_MAP[symptomCategory] && doctors.length > 0) {
      const relevantSpecialties = SPECIALTY_MAP[symptomCategory]
      const filtered = doctors.filter(doc => 
        relevantSpecialties.includes(doc.specialty)
      )
      setFilteredDoctors(filtered)
      if (relevantSpecialties.length > 0) {
        setSelectedSpecialty(relevantSpecialties[0])
      }
    }
  }, [symptomCategory, doctors])

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

  const specialties = ['all', ...Array.from(new Set(doctors.map(d => d.specialty)))]

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
        {loading ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-teal-600" />
              <p className="text-muted-foreground">Loading doctors...</p>
            </CardContent>
          </Card>
        ) : filteredDoctors.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">
                {doctors.length === 0 
                  ? 'No doctors available at the moment. Please check back later.'
                  : 'No doctors found matching your criteria'}
              </p>
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

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-teal-600" />
                        <span>{doctor.experience} years exp</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <span className="text-xs">{doctor.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${doctor.isAvailable ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                        <span className={doctor.isAvailable ? 'text-green-600 font-semibold' : 'text-red-600'}>
                          {doctor.availability}
                        </span>
                      </div>
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
                      disabled={!doctor.isAvailable}
                      className="w-full bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Video className="w-4 h-4" />
                      {doctor.isAvailable ? 'Book Appointment' : 'Unavailable'}
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
  const router = useRouter()
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

  const handlePayment = async () => {
    if (!selectedDate || !selectedTime) {
      setError('Please select date and time')
      return
    }

    setIsBooking(true)
    setError(null)

    try {
      // Get current user session
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        throw new Error('Please sign in to book an appointment')
      }

      const razorpayKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID
      const isTestMode = razorpayKey?.startsWith('rzp_test_')
      const isDevelopment = process.env.NODE_ENV === 'development'
      
      console.log('Razorpay Key:', razorpayKey ? 'Loaded' : 'Missing')
      console.log('Test Mode:', isTestMode)
      
      // In development without Razorpay, allow mock payment
      if (!razorpayKey || razorpayKey === 'rzp_test_dummy') {
        if (isDevelopment) {
          console.warn('⚠️ Development Mode: Using mock payment')
          // Simulate payment success after 2 seconds
          setTimeout(async () => {
            await handleConfirmBooking('mock_payment_' + Date.now())
          }, 2000)
          return
        }
        throw new Error('Razorpay key not configured. Please add NEXT_PUBLIC_RAZORPAY_KEY_ID to .env.local')
      }

      // Initialize Razorpay payment with test mode configuration
      const options: any = {
        key: razorpayKey,
        amount: doctor.consultationFee * 100, // Amount in paise
        currency: 'INR',
        name: 'Arogya-AI',
        description: `Consultation with ${doctor.name}`,
        image: '/logo.png',
        handler: async function (response: any) {
          // Payment successful, now create appointment
          await handleConfirmBooking(response.razorpay_payment_id)
        },
        prefill: {
          name: session?.user?.user_metadata?.full_name || 'Patient',
          email: session?.user?.email || 'test@example.com',
          contact: session?.user?.user_metadata?.phone || '9999999999'
        },
        notes: {
          doctor_id: doctor.id,
          doctor_name: doctor.name,
          date: selectedDate,
          time: selectedTime,
          test_mode: isTestMode
        },
        theme: {
          color: '#14b8a6' // Teal color
        },
        modal: {
          ondismiss: function() {
            setIsBooking(false)
            setError('Payment cancelled by user')
          },
          confirm_close: true,
          escape: true,
          backdropclose: false,
          animation: true
        },
        retry: {
          enabled: true,
          max_count: 3
        }
      }

      // Configure to accept all payment methods and cards
      if (isTestMode) {
        // In test mode, accept any card number
        options.config = {
          display: {
            blocks: {
              card: {
                name: 'Pay with Card',
                instruments: [
                  {
                    method: 'card'
                  }
                ]
              },
              other: {
                name: 'Other Payment Methods',
                instruments: [
                  { method: 'upi' },
                  { method: 'netbanking' },
                  { method: 'wallet' }
                ]
              }
            },
            sequence: ['block.card', 'block.other'],
            preferences: {
              show_default_blocks: true
            }
          }
        }
        console.warn('🧪 TEST MODE: Any card number will work')
        console.warn('Try: 4111111111111111 or any 16-digit number')
      } else {
        // Production mode - show all payment options
        options.config = {
          display: {
            preferences: {
              show_default_blocks: true
            }
          }
        }
      }

      // Load Razorpay script if not already loaded
      if (typeof window !== 'undefined' && !(window as any).Razorpay) {
        const script = document.createElement('script')
        script.src = 'https://checkout.razorpay.com/v1/checkout.js'
        script.async = true
        script.onload = () => {
          const rzp = new (window as any).Razorpay(options)
          rzp.open()
        }
        document.body.appendChild(script)
      } else if (typeof window !== 'undefined') {
        const rzp = new (window as any).Razorpay(options)
        rzp.open()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payment failed')
      setIsBooking(false)
    }
  }

  const handleConfirmBooking = async (paymentId: string) => {
    try {
      // Get patient ID from session
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        throw new Error('Please sign in to book an appointment')
      }

      // Get patient record
      const { data: patientData } = await supabase
        .from('patients')
        .select('id')
        .eq('user_id', session.user.id)
        .single()

      if (!patientData) {
        throw new Error('Patient profile not found')
      }

      const patientId = patientData.id
      
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
          consultation_fee: doctor.consultationFee,
          payment_id: paymentId,
          payment_status: 'completed'
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Failed to book appointment')
      }

      const appointment = await response.json()
      console.log('Appointment created:', appointment)

      setBookingConfirmed(true)
      setIsBooking(false)
      
      setTimeout(() => {
        onClose()
        setBookingConfirmed(false)
        setSelectedDate('')
        setSelectedTime('')
        setError(null)
        // Redirect to appointments page
        router.push('/patient/appointments')
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
          <div className="flex items-center gap-2 mb-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="gap-1"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
          </div>
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
            <Card className="bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-teal-950/30 dark:to-cyan-950/30 border-2 border-teal-100 dark:border-teal-900">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <Avatar className="w-20 h-20 border-4 border-white dark:border-slate-800 shadow-lg">
                    <AvatarFallback className="bg-gradient-to-br from-teal-500 to-cyan-600 text-white text-xl">
                      {doctor.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h4 className="font-bold text-lg">{doctor.name}</h4>
                    <p className="text-sm text-teal-600 dark:text-teal-400 font-semibold">{doctor.specialty}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Video className="w-3 h-3 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground">{doctor.location}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Experience</p>
                    <p className="text-lg font-bold text-teal-600">{doctor.experience}+ yrs</p>
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
            <Card className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 border-2">
              <CardContent className="pt-6">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Amount</p>
                    <p className="text-xs text-muted-foreground mt-1">Video Consultation Fee</p>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-teal-600">₹{doctor.consultationFee}</p>
                    <p className="text-xs text-green-600 font-medium">All inclusive</p>
                  </div>
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

            {/* Payment Button */}
            <Button
              onClick={handlePayment}
              disabled={!selectedDate || !selectedTime || isBooking}
              className="w-full h-12 bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white gap-2"
            >
              {isBooking ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                  Pay ₹{doctor.consultationFee} & Book
                </>
              )}
            </Button>
            
            {/* Payment Info */}
            <div className="space-y-3">
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span className="font-medium">Secure Payment Gateway</span>
              </div>
              
              <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"/>
                  </svg>
                  <span>Cards</span>
                </div>
                <div className="flex items-center gap-1">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                  <span>UPI</span>
                </div>
                <div className="flex items-center gap-1">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M21 18v1c0 1.1-.9 2-2 2H5c-1.11 0-2-.9-2-2V5c0-1.1.89-2 2-2h14c1.1 0 2 .9 2 2v1h-9c-1.11 0-2 .9-2 2v8c0 1.1.89 2 2 2h9zm-9-2h10V8H12v8zm4-2.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
                  </svg>
                  <span>Wallets</span>
                </div>
                <div className="flex items-center gap-1">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/>
                  </svg>
                  <span>Net Banking</span>
                </div>
              </div>

              {process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID?.startsWith('rzp_test_') && (
                <div className="space-y-2">
                  <div className="p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <p className="text-xs font-semibold text-blue-700 dark:text-blue-400 mb-2">🧪 Test Mode - Use These Details:</p>
                    <div className="space-y-1 text-xs text-blue-600 dark:text-blue-500">
                      <p><span className="font-semibold">Card:</span> 4111 1111 1111 1111</p>
                      <p><span className="font-semibold">CVV:</span> Any 3 digits (e.g., 123)</p>
                      <p><span className="font-semibold">Expiry:</span> Any future date (e.g., 12/25)</p>
                      <p><span className="font-semibold">OTP:</span> Any 6 digits (e.g., 123456)</p>
                      <p className="text-[10px] mt-1 text-blue-500">💡 No real money will be charged</p>
                    </div>
                  </div>
                </div>
              )}
              
              <p className="text-center text-xs text-muted-foreground">
                Powered by Razorpay • 100% Secure
              </p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
