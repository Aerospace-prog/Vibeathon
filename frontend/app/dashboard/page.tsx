import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase-server'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { DoctorAppointmentsList } from '@/components/appointments/doctor-appointments-list'
import { LogoutButton } from '@/components/dashboard/logout-button'
import { AvailabilityToggle } from '@/components/dashboard/availability-toggle'
import { AnimatedLogo } from '@/components/ui/animated-logo'
import { Users, Heart, Brain, Shield, Video, Award } from 'lucide-react'

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
      .eq('doctor_id', session.user.id)
    
    totalAppointments = allAppointments?.length || 0
    
    // Fetch upcoming scheduled appointments
    const { data: appointments, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('doctor_id', session.user.id)
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
                    
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="relative flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75" />
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-purple-500" />
                        </div>
                        <span className="text-sm font-bold text-transparent bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text uppercase tracking-wider">
                          Welcome Back, Doctor
                        </span>
                        <Sparkles className="w-4 h-4 text-yellow-500 animate-pulse" />
                      </div>
                      <h1 className="text-5xl md:text-6xl font-black bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent animate-gradient-x" style={{ backgroundSize: '200% 200%' }}>
                        Dr. {doctorName}
                      </h1>
                      <p className="text-slate-600 dark:text-slate-400 mt-3 flex items-center gap-2 text-lg font-medium">
                        <span className="relative flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500" />
                        </span>
                        Ready to provide exceptional care
                        <Heart className="w-5 h-5 text-pink-500 animate-heartbeat fill-pink-500" />
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Enhanced Animated Stats Cards */}
                <div className="flex gap-5">
                  <div className="group/stat relative">
                    <div className="absolute -inset-2 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl blur-xl opacity-50 group-hover/stat:opacity-100 transition-opacity animate-pulse" />
                    <div className="relative bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/50 dark:to-pink-950/50 backdrop-blur-xl rounded-2xl p-6 border-2 border-purple-200 dark:border-purple-800 shadow-2xl transform group-hover/stat:scale-110 group-hover/stat:-rotate-3 transition-all duration-300">
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="w-5 h-5 text-purple-600 dark:text-purple-400 animate-bounce" style={{ animationDuration: '2s' }} />
                        <div className="text-4xl font-black bg-gradient-to-br from-purple-600 to-pink-600 bg-clip-text text-transparent">
                          {upcomingConsultations.length}
                        </div>
                      </div>
                      <div className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wide">
                        Consultations
                      </div>
                    </div>
                  </div>
                  
                  <div className="group/stat relative">
                    <div className="absolute -inset-2 bg-gradient-to-br from-pink-600 to-blue-600 rounded-2xl blur-xl opacity-50 group-hover/stat:opacity-100 transition-opacity animate-pulse" />
                    <div className="relative bg-gradient-to-br from-pink-50 to-blue-50 dark:from-pink-950/50 dark:to-blue-950/50 backdrop-blur-xl rounded-2xl p-6 border-2 border-pink-200 dark:border-pink-800 shadow-2xl transform group-hover/stat:scale-110 group-hover/stat:rotate-3 transition-all duration-300">
                      <div className="flex items-center gap-2 mb-2">
                        <Zap className="w-5 h-5 text-pink-600 dark:text-pink-400 animate-pulse" />
                        <div className="text-4xl font-black bg-gradient-to-br from-pink-600 to-blue-600 bg-clip-text text-transparent">
                          {upcomingConsultations.filter(c => !c.approved).length}
                        </div>
                      </div>
                      <div className="text-xs font-bold text-pink-600 dark:text-pink-400 uppercase tracking-wide">
                        Pending
                      </div>
                    </div>
                  </div>
                  
                  <div className="group/stat relative">
                    <div className="absolute -inset-2 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl blur-xl opacity-50 group-hover/stat:opacity-100 transition-opacity animate-pulse" />
                    <div className="relative bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/50 dark:to-cyan-950/50 backdrop-blur-xl rounded-2xl p-6 border-2 border-blue-200 dark:border-blue-800 shadow-2xl transform group-hover/stat:scale-110 group-hover/stat:-rotate-3 transition-all duration-300">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400 animate-bounce" style={{ animationDuration: '2s' }} />
                        <div className="text-4xl font-black bg-gradient-to-br from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                          {upcomingConsultations.filter(c => c.approved).length}
                        </div>
                      </div>
                      <div className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wide">
                        Approved
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>


        {/* Enhanced Quick Action Card */}
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 rounded-3xl blur-2xl opacity-30 group-hover:opacity-60 transition-opacity animate-pulse-slow" />
          <Card className="relative border-2 border-white/20 bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl shadow-2xl transform group-hover:scale-[1.02] transition-all duration-500 overflow-hidden">
            {/* Animated gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-pink-500/10 to-blue-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
            
            {/* Sparkle decorations */}
            <Sparkles className="absolute top-4 right-4 w-6 h-6 text-yellow-400 animate-pulse" />
            
            <CardHeader className="relative">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="absolute -inset-2 bg-gradient-to-br from-purple-600 via-pink-600 to-blue-600 rounded-xl blur-lg opacity-50 group-hover:opacity-100 transition-opacity animate-pulse" />
                  <div className="relative bg-gradient-to-br from-purple-500 via-pink-500 to-blue-500 p-4 rounded-xl shadow-2xl transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                    <Video className="w-7 h-7 text-white animate-pulse" />

                  </div>
                  <div className="text-xs text-zinc-600 dark:text-zinc-400">Consultations</div>
                </div>
                <div className="w-px bg-zinc-200 dark:bg-zinc-800" />
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{upcomingConsultations.filter(c => !c.approved).length}</div>
                  <div className="text-xs text-zinc-600 dark:text-zinc-400">Pending</div>

        {/* Enhanced Feature Cards Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: Brain, title: 'AI-Powered', desc: 'Smart Medical Analysis', color: 'from-purple-500 to-pink-500', iconColor: 'text-purple-600 dark:text-purple-400' },
            { icon: Shield, title: 'HIPAA Secure', desc: 'Protected Patient Data', color: 'from-green-500 to-emerald-500', iconColor: 'text-green-600 dark:text-green-400' },
            { icon: Heart, title: 'Patient Care', desc: 'Always First Priority', color: 'from-red-500 to-rose-500', iconColor: 'text-red-600 dark:text-red-400' },
            { icon: Award, title: 'Excellence', desc: 'Top-Rated Service', color: 'from-blue-500 to-cyan-500', iconColor: 'text-blue-600 dark:text-blue-400' }
          ].map((feature, i) => (
            <div key={i} className="group relative animate-slide-up" style={{ animationDelay: `${i * 100}ms` }}>
              <div className={`absolute -inset-1 bg-gradient-to-br ${feature.color} rounded-2xl blur-xl opacity-40 group-hover:opacity-75 transition-opacity animate-pulse-slow`} />
              <div className="relative bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-2xl p-6 border-2 border-white/20 shadow-2xl transform group-hover:scale-105 group-hover:-translate-y-3 transition-all duration-300 overflow-hidden">
                {/* Animated gradient overlay */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 transition-opacity`} />
                
                <div className="relative">
                  <div className="relative inline-block mb-4">
                    <div className={`absolute -inset-2 bg-gradient-to-br ${feature.color} rounded-xl blur-md opacity-50 group-hover:opacity-100 transition-opacity`} />
                    <div className={`relative bg-gradient-to-br ${feature.color} p-3 rounded-xl shadow-lg transform group-hover:scale-110 group-hover:rotate-12 transition-all duration-300`}>
                      <feature.icon className="w-7 h-7 text-white" />
                    </div>
                  </div>
                  <h3 className={`font-bold text-lg mb-2 ${feature.iconColor}`}>{feature.title}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{feature.desc}</p>
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
