import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase-server'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { StartCallButton } from '@/components/dashboard/start-call-button'
import { LogoutButton } from '@/components/dashboard/logout-button'
import { AvailabilityToggle } from '@/components/dashboard/availability-toggle'
import { AnimatedLogo } from '@/components/ui/animated-logo'
import { Users, Heart, Brain, Shield, Video, Award } from 'lucide-react'

interface Patient {
  name: string
  preferred_language: string
}

interface Consultation {
  id: string
  consultation_date: string
  patient_id: string
  approved: boolean
  patients: Patient | Patient[] | null
}

function extractDoctorName(email: string): string {
  const username = email.split('@')[0]
  const cleanName = username.replace(/[0-9_.-]/g, '')
  return cleanName.charAt(0).toUpperCase() + cleanName.slice(1)
}

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect('/auth')
  }

  const userRole = session.user.user_metadata?.role
  if (userRole === 'patient') {
    redirect('/patient/dashboard')
  }

  // Fetch doctor profile from database
  let doctorName = 'Doctor'
  try {
    const { data: doctorProfile } = await supabase
      .from('doctors')
      .select('full_name')
      .eq('id', session.user.id)
      .single()
    
    if (doctorProfile?.full_name) {
      doctorName = doctorProfile.full_name
    } else {
      doctorName = extractDoctorName(session.user.email || 'Doctor')
    }
  } catch (error) {
    doctorName = extractDoctorName(session.user.email || 'Doctor')
  }

  let upcomingConsultations: Consultation[] = []
  
  try {
    const { data: consultations, error } = await supabase
      .from('consultations')
      .select(`
        id,
        consultation_date,
        patient_id,
        approved,
        patients (
          name,
          preferred_language
        )
      `)
      .eq('doctor_id', session.user.id)
      .order('consultation_date', { ascending: true })
      .limit(10)

    if (!error && consultations) {
      upcomingConsultations = consultations as Consultation[]
    }
  } catch (err) {
    upcomingConsultations = []
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-teal-50 dark:from-cyan-950 dark:via-blue-950 dark:to-teal-950">
      {/* Navigation Header */}
      <header className="border-b bg-white/80 dark:bg-zinc-900/80 backdrop-blur-lg">
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
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-50 via-blue-50 to-teal-50 dark:from-cyan-950/30 dark:via-blue-950/30 dark:to-teal-950/30 rounded-3xl" />
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/10 via-blue-400/10 to-teal-400/10 rounded-3xl animate-gradient-shift" />
          
          <div className="relative p-8 md:p-12">
            <div className="flex items-center justify-between flex-wrap gap-6">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full blur-xl opacity-50 animate-pulse-slow" />
                    <div className="relative w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                      {doctorName.charAt(0)}
                    </div>
                  </div>
                  <div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 dark:from-cyan-400 dark:to-blue-400 bg-clip-text text-transparent">
                      Welcome, Dr. {doctorName}!
                    </h1>
                    <p className="text-zinc-600 dark:text-zinc-400 mt-1 flex items-center gap-2">
                      <Heart className="w-4 h-4 text-pink-500 animate-heartbeat" />
                      Ready to provide exceptional care
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Quick stats */}
              <div className="flex gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-cyan-600 dark:text-cyan-400">
                    {upcomingConsultations.length}
                  </div>
                  <div className="text-xs text-zinc-600 dark:text-zinc-400">Consultations</div>
                </div>
                <div className="w-px bg-zinc-200 dark:bg-zinc-800" />
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{upcomingConsultations.filter(c => !c.approved).length}</div>
                  <div className="text-xs text-zinc-600 dark:text-zinc-400">Pending</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Start Consultation Card */}
        <Card className="border-cyan-200/50 dark:border-cyan-800/50">
          <CardHeader>
            <CardTitle>Start New Consultation</CardTitle>
            <CardDescription>
              Begin a new video consultation with AI-powered real-time translation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <StartCallButton />
          </CardContent>
        </Card>

        {/* Feature Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-cyan-200/50 dark:border-cyan-800/50">
            <CardHeader>
              <Brain className="w-8 h-8 text-cyan-600 dark:text-cyan-400 mb-2" />
              <CardTitle>AI-Powered</CardTitle>
              <CardDescription>Smart Medical Analysis</CardDescription>
            </CardHeader>
          </Card>
          
          <Card className="border-green-200/50 dark:border-green-800/50">
            <CardHeader>
              <Shield className="w-8 h-8 text-green-600 dark:text-green-400 mb-2" />
              <CardTitle>HIPAA Secure</CardTitle>
              <CardDescription>Protected Patient Data</CardDescription>
            </CardHeader>
          </Card>
          
          <Card className="border-pink-200/50 dark:border-pink-800/50">
            <CardHeader>
              <Heart className="w-8 h-8 text-pink-600 dark:text-pink-400 mb-2" />
              <CardTitle>Patient Care</CardTitle>
              <CardDescription>Always First Priority</CardDescription>
            </CardHeader>
          </Card>
          
          <Card className="border-blue-200/50 dark:border-blue-800/50">
            <CardHeader>
              <Award className="w-8 h-8 text-blue-600 dark:text-blue-400 mb-2" />
              <CardTitle>Excellence</CardTitle>
              <CardDescription>Top-Rated Service</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </main>
    </div>
  )
}
