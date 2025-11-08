import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase-server'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { StartCallButton } from '@/components/dashboard/start-call-button'
import { LogoutButton } from '@/components/dashboard/logout-button'
import { AvailabilityToggle } from '@/components/dashboard/availability-toggle'
import { AnimatedLogo } from '@/components/ui/animated-logo'
import { Activity, Users, TrendingUp, Zap, Sparkles, Heart, Brain, Shield, Calendar, Clock, Video, FileText, Award, Target, BarChart3, Star, Stethoscope } from 'lucide-react'

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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-purple-950 dark:via-pink-950 dark:to-blue-950 relative overflow-hidden">
      {/* Animated Background Elements - Enhanced */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '0s', animationDuration: '20s' }} />
        <div className="absolute top-40 right-20 w-[500px] h-[500px] bg-pink-400/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '5s', animationDuration: '25s' }} />
        <div className="absolute bottom-20 left-1/3 w-[450px] h-[450px] bg-blue-400/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '10s', animationDuration: '30s' }} />
        <div className="absolute top-1/2 right-1/4 w-80 h-80 bg-cyan-400/15 rounded-full blur-3xl animate-float" style={{ animationDelay: '15s', animationDuration: '22s' }} />
        
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(168,85,247,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(168,85,247,0.03)_1px,transparent_1px)] bg-[size:50px_50px]" />
      </div>

      {/* Navigation Header with Enhanced Glassmorphism */}
      <header className="sticky top-0 z-50 border-b border-white/20 bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl shadow-2xl shadow-purple-500/5">
        {/* Animated top border */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 animate-gradient-x" style={{ backgroundSize: '200% 200%' }} />
        
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-8">
              <div className="relative group">
                <div className="absolute -inset-2 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 rounded-xl blur opacity-0 group-hover:opacity-75 transition-opacity" />
                <AnimatedLogo size="md" href="/dashboard" />
              </div>
              <nav className="hidden md:flex gap-6">
                <Link 
                  href="/dashboard" 
                  className="relative text-sm font-bold text-transparent bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text group"
                >
                  <span className="relative">
                    Dashboard
                    <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full" />
                  </span>
                </Link>
                <Link 
                  href="/doctor/appointments" 
                  className="relative text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors group"
                >
                  <span className="relative">
                    My Appointments
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full group-hover:w-full transition-all duration-300" />
                  </span>
                </Link>
                <Link 
                  href="/records" 
                  className="relative text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors group"
                >
                  <span className="relative">
                    Patient Records
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full group-hover:w-full transition-all duration-300" />
                  </span>
                </Link>
                <Link 
                  href="/profile" 
                  className="relative text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors group"
                >
                  <span className="relative">
                    Profile
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full group-hover:w-full transition-all duration-300" />
                  </span>
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
      <main className="relative z-10 max-w-7xl mx-auto p-6 space-y-8">
        {/* Hero Section with Enhanced 3D Effect */}
        <div className="relative group">
          {/* Mega glow effect */}
          <div className="absolute -inset-2 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 rounded-3xl blur-3xl opacity-30 group-hover:opacity-50 transition-opacity animate-pulse-slow" />
          
          <div className="relative bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl rounded-3xl border-2 border-white/20 shadow-2xl overflow-hidden">
            {/* Animated gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-blue-500/10 animate-gradient-shift" style={{ backgroundSize: '200% 200%' }} />
            
            {/* Sparkle decorations */}
            <Sparkles className="absolute top-6 right-6 w-8 h-8 text-yellow-400 animate-pulse" />
            <Sparkles className="absolute bottom-6 left-6 w-6 h-6 text-pink-400 animate-bounce" />
            <Star className="absolute top-1/2 right-12 w-5 h-5 text-purple-400 animate-spin" style={{ animationDuration: '8s' }} />
            
            <div className="relative p-8 md:p-12">
              <div className="flex items-center justify-between flex-wrap gap-8">
                <div className="space-y-4 flex-1">
                  <div className="flex items-center gap-5">
                    {/* Enhanced Animated Avatar */}
                    <div className="relative group/avatar">
                      <div className="absolute -inset-3 bg-gradient-to-br from-purple-600 via-pink-600 to-blue-600 rounded-2xl blur-2xl opacity-75 group-hover/avatar:opacity-100 transition-opacity animate-pulse-slow" />
                      <div className="relative w-24 h-24 bg-gradient-to-br from-purple-500 via-pink-500 to-blue-500 rounded-2xl flex items-center justify-center text-white text-4xl font-black shadow-2xl transform group-hover/avatar:scale-110 group-hover/avatar:rotate-6 transition-all duration-500">
                        {doctorName.charAt(0)}
                      </div>
                      {/* Status indicators */}
                      <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-white dark:border-slate-900 flex items-center justify-center shadow-lg">
                        <Stethoscope className="w-4 h-4 text-white" />
                      </div>
                      <div className="absolute -bottom-2 -left-2 w-8 h-8 bg-yellow-500 rounded-full border-4 border-white dark:border-slate-900 flex items-center justify-center shadow-lg animate-bounce" style={{ animationDuration: '2s' }}>
                        <Star className="w-4 h-4 text-white fill-white" />
                      </div>
                    </div>
                    
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
                </div>
                <div>
                  <CardTitle className="text-2xl font-bold flex items-center gap-2 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
                    Start New Consultation
                    <Sparkles className="w-5 h-5 text-yellow-500 animate-pulse" />
                  </CardTitle>
                  <CardDescription className="text-base mt-1">
                    Begin a new video consultation with AI-powered real-time translation
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="relative">
              <StartCallButton />
            </CardContent>
          </Card>
        </div>

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
          ))}
        </div>

        {/* Additional Stats Section */}
        <div className="grid gap-6 md:grid-cols-3">
          {[
            { icon: Users, value: upcomingConsultations.length, label: 'Total Patients', color: 'from-purple-500 to-pink-500', iconAnim: 'animate-bounce' },
            { icon: Clock, value: '24/7', label: 'Availability', color: 'from-pink-500 to-rose-500', iconAnim: 'animate-spin', iconDuration: '8s' },
            { icon: BarChart3, value: '98%', label: 'Success Rate', color: 'from-blue-500 to-cyan-500', iconAnim: 'animate-pulse' }
          ].map((stat, i) => (
            <div key={i} className="group relative">
              <div className={`absolute -inset-1 bg-gradient-to-br ${stat.color} rounded-2xl blur-xl opacity-30 group-hover:opacity-60 transition-opacity`} />
              <div className="relative bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-2xl p-6 border-2 border-white/20 shadow-xl transform group-hover:scale-105 transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <div className={`text-4xl font-black bg-gradient-to-br ${stat.color} bg-clip-text text-transparent mb-2`}>
                      {stat.value}
                    </div>
                    <div className="text-sm font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                      {stat.label}
                    </div>
                  </div>
                  <div className="relative">
                    <div className={`absolute -inset-2 bg-gradient-to-br ${stat.color} rounded-xl blur-md opacity-50`} />
                    <div className={`relative bg-gradient-to-br ${stat.color} p-3 rounded-xl shadow-lg`}>
                      <stat.icon className={`w-8 h-8 text-white ${stat.iconAnim}`} style={{ animationDuration: stat.iconDuration }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
