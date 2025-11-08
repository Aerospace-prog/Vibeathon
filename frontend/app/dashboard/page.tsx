import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase-server'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { DoctorAppointmentsList } from '@/components/appointments/doctor-appointments-list'
import { LogoutButton } from '@/components/dashboard/logout-button'
import { AvailabilityToggle } from '@/components/dashboard/availability-toggle'
import { AnimatedLogo } from '@/components/ui/animated-logo'
import { Users, Shield, Clock, Stethoscope } from 'lucide-react'

interface Appointment {
  id: string
  patient_id: string
  date: string
  time: string
  status: string
  symptom_category: string | null
  severity: number | null
  consultation_fee: number
  created_at: string
  patient_name?: string
  patient_email?: string
}

function extractDoctorName(email: string): string {
  const username = email.split('@')[0]
  const cleanName = username.replace(/[0-9_.-]/g, '')
  return cleanName.charAt(0).toUpperCase() + cleanName.slice(1)
}

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth')
  }

  const userRole = user.user_metadata?.role
  if (userRole === 'patient') {
    redirect('/patient/dashboard')
  }

  // Fetch doctor profile from database
  let doctorName = 'Doctor'
  try {
    const { data: doctorProfile } = await supabase
      .from('doctors')
      .select('full_name')
      .eq('id', user.id)
      .single()
    
    if (doctorProfile?.full_name) {
      doctorName = doctorProfile.full_name
    } else {
      doctorName = extractDoctorName(user.email || 'Doctor')
    }
  } catch (error) {
    doctorName = extractDoctorName(user.email || 'Doctor')
  }

  // Fetch scheduled appointments from database
  let scheduledAppointments: Appointment[] = []
  let totalAppointments = 0
  
  try {
    // Get today's date
    const today = new Date().toISOString().split('T')[0]
    
    // Fetch all appointments for stats
    const { data: allAppointments } = await supabase
      .from('appointments')
      .select('id, status')
      .eq('doctor_id', user.id)
    
    totalAppointments = allAppointments?.length || 0
    
    // Fetch upcoming scheduled appointments
    const { data: appointments, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('doctor_id', user.id)
      .eq('status', 'scheduled')
      .gte('date', today)
      .order('date', { ascending: true })
      .order('time', { ascending: true })
      .limit(5)

    if (!error && appointments) {
      scheduledAppointments = appointments as Appointment[]
    }
  } catch (err) {
    console.error('Error fetching appointments:', err)
    scheduledAppointments = []
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50 dark:from-teal-950 dark:via-cyan-950 dark:to-blue-950">
      {/* Navigation Header */}
      <header className="border-b bg-white/80 dark:bg-zinc-900/80 backdrop-blur-lg">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-500 via-cyan-500 to-blue-500" />
        
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-8">
              <AnimatedLogo size="md" href="/dashboard" />
              <nav className="hidden md:flex gap-6">
                <Link 
                  href="/dashboard" 
                  className="text-sm font-medium text-primary"
                >
                  Dashboard
                </Link>
                <Link 
                  href="/doctor/appointments" 
                  className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                >
                  My Appointments
                </Link>
                <Link 
                  href="/records" 
                  className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                >
                  Patient Records
                </Link>
                <Link 
                  href="/profile" 
                  className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                >
                  Profile
                </Link>
              </nav>
            </div>
            <div className="flex items-center gap-4">
              <AvailabilityToggle />
              <LogoutButton />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-6">
        {/* Welcome Hero Section */}
        <div className="relative mb-8 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50 dark:from-teal-950/30 dark:via-cyan-950/30 dark:to-blue-950/30 rounded-3xl" />
          <div className="absolute inset-0 bg-gradient-to-br from-teal-400/10 via-cyan-400/10 to-blue-400/10 rounded-3xl animate-gradient-shift" />
          
          <div className="relative p-8 md:p-12">
            <div className="flex items-center justify-between flex-wrap gap-6">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-full blur-xl opacity-50 animate-pulse-slow" />
                    <div className="relative w-16 h-16 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                      {doctorName.charAt(0)}
                    </div>
                  </div>
                  <div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 dark:from-teal-400 dark:to-cyan-400 bg-clip-text text-transparent">
                      Dr. {doctorName}
                    </h1>
                    <p className="text-zinc-600 dark:text-zinc-400 mt-1 flex items-center gap-2">
                      <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500" />
                      </span>
                      Ready to provide exceptional care
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Quick stats */}
              <div className="flex gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-teal-600 dark:text-teal-400">
                    {totalAppointments}
                  </div>
                  <div className="text-xs text-zinc-600 dark:text-zinc-400">Total</div>
                </div>
                <div className="w-px bg-zinc-200 dark:bg-zinc-800" />
                <div className="text-center">
                  <div className="text-3xl font-bold text-cyan-600 dark:text-cyan-400">
                    {scheduledAppointments.length}
                  </div>
                  <div className="text-xs text-zinc-600 dark:text-zinc-400">Scheduled</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card className="border-teal-200/50 dark:border-teal-800/50 hover:shadow-xl transition-all duration-300 group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardHeader className="relative">
              <div className="flex items-center gap-3 mb-2">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-lg blur-md opacity-50 group-hover:opacity-75 transition-opacity" />
                  <div className="relative bg-gradient-to-br from-teal-500 to-cyan-600 p-2 rounded-lg">
                    <Stethoscope className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-xs text-zinc-600 dark:text-zinc-400">Consultations</div>
                </div>
                <CardTitle className="text-lg">Consultations</CardTitle>
              </div>
              <CardDescription>Manage patient consultations</CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-blue-200/50 dark:border-blue-800/50 hover:shadow-xl transition-all duration-300 group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardHeader className="relative">
              <div className="flex items-center gap-3 mb-2">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg blur-md opacity-50 group-hover:opacity-75 transition-opacity" />
                  <div className="relative bg-gradient-to-br from-blue-500 to-indigo-600 p-2 rounded-lg">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                </div>
                <CardTitle className="text-lg">Patient Records</CardTitle>
              </div>
              <CardDescription>View patient history</CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-cyan-200/50 dark:border-cyan-800/50 hover:shadow-xl transition-all duration-300 group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardHeader className="relative">
              <div className="flex items-center gap-3 mb-2">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg blur-md opacity-50 group-hover:opacity-75 transition-opacity" />
                  <div className="relative bg-gradient-to-br from-cyan-500 to-blue-600 p-2 rounded-lg">
                    <Clock className="w-5 h-5 text-white" />
                  </div>
                </div>
                <CardTitle className="text-lg">Availability</CardTitle>
              </div>
              <CardDescription>Manage your schedule</CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-green-200/50 dark:border-green-800/50 hover:shadow-xl transition-all duration-300 group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardHeader className="relative">
              <div className="flex items-center gap-3 mb-2">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg blur-md opacity-50 group-hover:opacity-75 transition-opacity" />
                  <div className="relative bg-gradient-to-br from-green-500 to-emerald-600 p-2 rounded-lg">
                    <Shield className="w-5 h-5 text-white" />
                  </div>
                </div>
                <CardTitle className="text-lg">HIPAA Secure</CardTitle>
              </div>
              <CardDescription>Protected patient data</CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Appointments Section */}
        <Card className="border-zinc-200/50 dark:border-zinc-800/50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Appointments</CardTitle>
                <CardDescription>Your latest patient consultations</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <DoctorAppointmentsList 
              doctorId={user.id} 
              limit={2}
              showFilters={false}
              showStats={false}
            />
            
            {/* View All Button */}
            <div className="mt-6">
              <Link href="/doctor/appointments" className="block">
                <Button 
                  className="w-full bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white"
                  size="lg"
                >
                  View All Appointments
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
