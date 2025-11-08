"use client"

import { useState, useEffect } from 'react'
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
    setIsBooking(true)
    setError(null)

    try {
      const razorpayKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID
      const isTestMode = razorpayKey?.startsWith('rzp_test_')
      
      console.log('Razorpay Key:', razorpayKey ? 'Loaded' : 'Missing')
      console.log('Test Mode:', isTestMode)
      
      if (!razorpayKey || razorpayKey === 'rzp_test_dummy') {
        throw new Error('Razorpay key not configured. Please add NEXT_PUBLIC_RAZORPAY_KEY_ID to .env.local')
      }

      // Initialize Razorpay payment with test mode configuration
      const options: any = {
        key: razorpayKey,
        amount: doctor.consultationFee * 100, // Amount in paise (₹800 = 80000 paise)
        currency: 'INR',
        name: 'Arogya-AI',
        description: `Consultation with ${doctor.name}`,
        image: '/logo.png',
        handler: async function (response: any) {
          // Payment successful, now create appointment
          await handleConfirmBooking(response.razorpay_payment_id)
        },
        prefill: {
          name: 'Test Patient', // Test mode prefill
          email: 'test@example.com',
          contact: '9999999999'
        },
        notes: {
          doctor_id: doctor.id,
          date: selectedDate,
          time: selectedTime,
          test_mode: isTestMode
        },
        theme: {
          color: '#14b8a6' // Teal color matching your theme
        },
        modal: {
          ondismiss: function() {
            setIsBooking(false)
            setError('Payment cancelled')
          },
          confirm_close: true,
          escape: true,
          backdropclose: true
        }
      }

      // In test mode, configure for domestic cards and enable all test features
      if (isTestMode) {
        // Enable all card networks including domestic
        options.config = {
          display: {
            blocks: {
              banks: {
                name: 'Pay using Cards (Test Mode)',
                instruments: [
                  {
                    method: 'card',
                    types: ['credit', 'debit'],
                    networks: ['Visa', 'MasterCard', 'Maestro', 'RuPay']
                  }
                ]
              }
            },
            sequence: ['block.banks'],
            preferences: {
              show_default_blocks: false // Hide UPI, wallets, netbanking in test mode
            }
          }
        }
        
        // Add test mode notice with multiple card options
        console.warn('🧪 TEST MODE: Card payments available')
        console.warn('International Card: 4111 1111 1111 1111')
        console.warn('Domestic Card: 5267 3181 8797 5449 (Mastercard)')
        console.warn('RuPay Card: 6521 5499 8435 2187')
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
            <div className="text-center text-xs text-slate-500 dark:text-slate-400">
              <p>🔒 Secure payment powered by Razorpay</p>
              {process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID?.startsWith('rzp_test_') ? (
                <div className="mt-2 p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded">
                  <p className="text-amber-700 dark:text-amber-400 font-medium mb-2">🧪 TEST MODE - Try These Cards</p>
                  
                  <div className="space-y-2 text-left">
                    <div className="bg-white dark:bg-slate-800 p-2 rounded border border-amber-200 dark:border-amber-700">
                      <p className="text-amber-700 dark:text-amber-400 font-semibold text-[11px]">✅ Domestic Mastercard (Recommended)</p>
                      <p className="text-amber-600 dark:text-amber-500 font-mono text-[10px]">5267 3181 8797 5449</p>
                    </div>
                    
                    <div className="bg-white dark:bg-slate-800 p-2 rounded border border-amber-200 dark:border-amber-700">
                      <p className="text-amber-700 dark:text-amber-400 font-semibold text-[11px]">✅ RuPay Card</p>
                      <p className="text-amber-600 dark:text-amber-500 font-mono text-[10px]">6521 5499 8435 2187</p>
                    </div>
                    
                    <div className="bg-white dark:bg-slate-800 p-2 rounded border border-amber-200 dark:border-amber-700">
                      <p className="text-amber-700 dark:text-amber-400 font-semibold text-[11px]">⚠️ International Visa (may fail)</p>
                      <p className="text-amber-600 dark:text-amber-500 font-mono text-[10px]">4111 1111 1111 1111</p>
                    </div>
                  </div>
                  
                  <p className="text-amber-600 dark:text-amber-500 mt-2 text-[10px]">CVV: Any 3 digits • Expiry: Any future date • Name: Any name</p>
                  <p className="mt-1 text-[10px] text-amber-600 dark:text-amber-500 font-semibold">💡 No real money will be charged</p>
                </div>
              ) : (
                <p className="mt-1">Cards • Net Banking • UPI • Wallets</p>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
