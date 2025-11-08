import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase-server'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { StartCallButton } from '@/components/dashboard/start-call-button'
import { LogoutButton } from '@/components/dashboard/logout-button'
import { AnimatedLogo } from '@/components/ui/animated-logo'
import { Activity, Users, TrendingUp, Zap, Sparkles, Heart, Brain, Shield } from 'lucide-react'

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

  const doctorName = extractDoctorName(session.user.email || 'Doctor')

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-teal-400/20 to-cyan-400/20 rounded-full blur-3xl animate-blob" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-indigo-400/20 rounded-full blur-3xl animate-blob animation-delay-2000" />
        <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-blob animation-delay-4000" />
      </div>

      {/* Navigation Header with Glassmorphism */}
      <header className="sticky top-0 z-50 border-b border-white/20 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl shadow-lg shadow-black/5">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-8">
              <AnimatedLogo size="md" href="/dashboard" />
              <nav className="hidden md:flex gap-6">
                <Link 
                  href="/dashboard" 
                  className="relative text-sm font-semibold text-primary group"
                >
                  <span className="relative z-10">Dashboard</span>
                  <span className="absolute inset-x-0 -bottom-1 h-0.5 bg-gradient-to-r from-teal-500 to-cyan-500 transform scale-x-100 transition-transform" />
                </Link>
                <Link 
                  href="/records" 
                  className="relative text-sm font-semibold text-muted-foreground hover:text-primary transition-colors group"
                >
                  <span className="relative z-10">Patient Records</span>
                  <span className="absolute inset-x-0 -bottom-1 h-0.5 bg-gradient-to-r from-teal-500 to-cyan-500 transform scale-x-0 group-hover:scale-x-100 transition-transform" />
                </Link>
              </nav>
            </div>
            <LogoutButton />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto p-6 space-y-8">
        {/* Hero Section with 3D Effect */}
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-teal-500/20 via-cyan-500/20 to-blue-500/20 rounded-3xl blur-2xl group-hover:blur-3xl transition-all duration-500" />
          <div className="relative bg-gradient-to-br from-white/80 to-white/40 dark:from-slate-900/80 dark:to-slate-800/40 backdrop-blur-2xl rounded-3xl border border-white/20 shadow-2xl shadow-teal-500/10 p-8 md:p-12 transform hover:scale-[1.01] transition-all duration-500">
            <div className="flex items-center justify-between flex-wrap gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  {/* Animated Avatar with Glow */}
                  <div className="relative group/avatar">
                    <div className="absolute inset-0 bg-gradient-to-br from-teal-500 via-cyan-500 to-blue-500 rounded-2xl blur-xl opacity-75 group-hover/avatar:opacity-100 animate-pulse-slow" />
                    <div className="relative w-20 h-20 bg-gradient-to-br from-teal-500 via-cyan-500 to-blue-500 rounded-2xl flex items-center justify-center text-white text-3xl font-bold shadow-2xl transform group-hover/avatar:scale-110 group-hover/avatar:rotate-3 transition-all duration-300">
                      {doctorName.charAt(0)}
                    </div>
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-4 border-white dark:border-slate-900 animate-pulse" />
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="w-5 h-5 text-yellow-500 animate-pulse" />
                      <span className="text-xs font-semibold text-teal-600 dark:text-teal-400 uppercase tracking-wider">
                        Welcome Back
                      </span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-600 dark:from-teal-400 dark:via-cyan-400 dark:to-blue-400 bg-clip-text text-transparent animate-gradient">
                      Dr. {doctorName}
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-2 flex items-center gap-2 font-medium">
                      <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500" />
                      </span>
                      Ready to provide exceptional care
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Animated Stats Cards */}
              <div className="flex gap-4">
                <div className="group/stat relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-2xl blur-lg opacity-50 group-hover/stat:opacity-75 transition-opacity" />
                  <div className="relative bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-xl transform group-hover/stat:scale-110 group-hover/stat:-rotate-2 transition-all duration-300">
                    <div className="text-4xl font-black bg-gradient-to-br from-teal-600 to-cyan-600 bg-clip-text text-transparent">
                      {upcomingConsultations.length}
                    </div>
                    <div className="text-xs font-semibold text-slate-600 dark:text-slate-400 mt-1 flex items-center gap-1">
                      <Activity className="w-3 h-3" />
                      Consultations
                    </div>
                  </div>
                </div>
                
                <div className="group/stat relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl blur-lg opacity-50 group-hover/stat:opacity-75 transition-opacity" />
                  <div className="relative bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-xl transform group-hover/stat:scale-110 group-hover/stat:rotate-2 transition-all duration-300">
                    <div className="text-4xl font-black bg-gradient-to-br from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                      {upcomingConsultations.filter(c => !c.approved).length}
                    </div>
                    <div className="text-xs font-semibold text-slate-600 dark:text-slate-400 mt-1 flex items-center gap-1">
                      <Zap className="w-3 h-3" />
                      Pending
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Action Card with Hover Effect */}
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-teal-500/20 to-cyan-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500" />
          <Card className="relative border-2 border-white/20 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl shadow-2xl hover:shadow-teal-500/20 transform hover:scale-[1.02] transition-all duration-500 overflow-hidden">
            {/* Animated gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-teal-500/0 via-cyan-500/10 to-teal-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
            
            <CardHeader className="relative">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-xl blur-md opacity-50 animate-pulse" />
                  <div className="relative bg-gradient-to-br from-teal-500 to-cyan-600 p-3 rounded-xl shadow-lg transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                    <Activity className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div>
                  <CardTitle className="text-2xl font-bold flex items-center gap-2">
                    Start New Consultation
                    <Sparkles className="w-5 h-5 text-yellow-500 animate-pulse" />
                  </CardTitle>
                  <CardDescription className="text-base">
                    Begin a new video consultation with real-time translation
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="relative">
              <StartCallButton />
            </CardContent>
          </Card>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid gap-6 md:grid-cols-3">
          {[
            { icon: Brain, title: 'AI-Powered', desc: 'Smart Analysis', color: 'from-purple-500 to-pink-500' },
            { icon: Shield, title: 'HIPAA Secure', desc: 'Protected Data', color: 'from-green-500 to-emerald-500' },
            { icon: Heart, title: 'Patient Care', desc: 'First Priority', color: 'from-red-500 to-rose-500' }
          ].map((feature, i) => (
            <div key={i} className="group relative" style={{ animationDelay: `${i * 100}ms` }}>
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} rounded-xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity`} />
              <div className="relative bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-xl p-6 border border-white/20 shadow-xl transform group-hover:scale-105 group-hover:-translate-y-2 transition-all duration-300">
                <feature.icon className="w-8 h-8 mb-3 text-slate-700 dark:text-slate-300 group-hover:scale-110 transition-transform" />
                <h3 className="font-bold text-lg mb-1">{feature.title}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">{feature.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
