import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase-server'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { StartCallButton } from '@/components/dashboard/start-call-button'
import { LogoutButton } from '@/components/dashboard/logout-button'
import { AnimatedLogo } from '@/components/ui/animated-logo'

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

// Extract doctor name from email
function extractDoctorName(email: string): string {
  // Remove domain
  const username = email.split('@')[0]
  
  // Remove numbers and special characters
  const cleanName = username.replace(/[0-9_.-]/g, '')
  
  // Capitalize first letter
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

  // Check if user is a doctor, redirect patients to their dashboard
  const userRole = session.user.user_metadata?.role
  if (userRole === 'patient') {
    redirect('/patient/dashboard')
  }

  const doctorName = extractDoctorName(session.user.email || 'Doctor')

  // Fetch upcoming consultations for the authenticated doctor
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
    // Silently handle database errors - tables might not exist yet
    upcomingConsultations = []
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* Navigation Header */}
      <header className="border-b bg-white dark:bg-zinc-900">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-8">
              <AnimatedLogo size="md" href="/dashboard" />
              <nav className="flex gap-6">
                <Link 
                  href="/dashboard" 
                  className="text-sm font-medium text-primary"
                >
                  Dashboard
                </Link>
                <Link 
                  href="/records" 
                  className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                >
                  Patient Records
                </Link>
              </nav>
            </div>
            <LogoutButton />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-6">
        {/* Welcome Hero Section */}
        <div className="relative mb-8 overflow-hidden">
          {/* Animated background */}
          <div className="absolute inset-0 bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50 dark:from-teal-950/30 dark:via-cyan-950/30 dark:to-blue-950/30 rounded-3xl" />
          <div className="absolute inset-0 bg-gradient-to-br from-teal-400/10 via-cyan-400/10 to-blue-400/10 rounded-3xl animate-gradient-shift" />
          
          {/* Floating particles */}
          <div className="absolute top-4 right-4 w-2 h-2 bg-teal-400/30 rounded-full animate-float-slow" />
          <div className="absolute bottom-6 left-8 w-1.5 h-1.5 bg-cyan-400/30 rounded-full animate-float-slow" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 right-12 w-1 h-1 bg-blue-400/30 rounded-full animate-float-slow" style={{ animationDelay: '2s' }} />
          
          <div className="relative p-8 md:p-12">
            <div className="flex items-center justify-between flex-wrap gap-6">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    {/* Animated avatar */}
                    <div className="absolute inset-0 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-full blur-xl opacity-50 animate-pulse-slow" />
                    <div className="relative w-16 h-16 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                      {doctorName.charAt(0)}
                    </div>
                  </div>
                  <div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 dark:from-teal-400 dark:to-cyan-400 bg-clip-text text-transparent">
                      Welcome back, Dr. {doctorName}!
                    </h1>
                    <p className="text-zinc-600 dark:text-zinc-400 mt-1 flex items-center gap-2">
                      <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      Ready to provide exceptional care
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Quick stats */}
              <div className="flex gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-teal-600 dark:text-teal-400">
                    {upcomingConsultations.length}
                  </div>
                  <div className="text-xs text-zinc-600 dark:text-zinc-400">Consultations</div>
                </div>
                <div className="w-px bg-zinc-200 dark:bg-zinc-800" />
                <div className="text-center">
                  <div className="text-3xl font-bold text-cyan-600 dark:text-cyan-400">
                    {upcomingConsultations.filter(c => !c.approved).length}
                  </div>
                  <div className="text-xs text-zinc-600 dark:text-zinc-400">Pending</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid gap-6 md:grid-cols-2 mb-8">
          <Card className="border-teal-200/50 dark:border-teal-800/50 hover:shadow-xl transition-all duration-300 group relative overflow-hidden">
            {/* Animated background */}
            <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            
            <CardHeader className="relative">
              <div className="flex items-center gap-3 mb-2">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-lg blur-md opacity-50 group-hover:opacity-75 transition-opacity" />
                  <div className="relative bg-gradient-to-br from-teal-500 to-cyan-600 p-2 rounded-lg">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
                <CardTitle className="text-xl">Start New Consultation</CardTitle>
              </div>
              <CardDescription>Begin a new video consultation with a patient</CardDescription>
            </CardHeader>
            <CardContent className="relative">
              <StartCallButton />
            </CardContent>
          </Card>

          <Card className="border-cyan-200/50 dark:border-cyan-800/50 hover:shadow-xl transition-all duration-300 group relative overflow-hidden">
            {/* Animated background */}
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            
            <CardHeader className="relative">
              <div className="flex items-center gap-3 mb-2">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg blur-md opacity-50 group-hover:opacity-75 transition-opacity" />
                  <div className="relative bg-gradient-to-br from-cyan-500 to-blue-600 p-2 rounded-lg">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                </div>
                <CardTitle className="text-xl">Patient Records</CardTitle>
              </div>
              <CardDescription>View and manage patient information</CardDescription>
            </CardHeader>
            <CardContent className="relative">
              <Link href="/records">
                <Button variant="outline" className="w-full border-cyan-300 dark:border-cyan-700 hover:bg-cyan-50 dark:hover:bg-cyan-950/30 hover:border-cyan-500 transition-all">
                  View All Records
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Consultations */}
        <Card className="border-zinc-200/50 dark:border-zinc-800/50">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-lg blur-md opacity-50" />
                <div className="relative bg-gradient-to-br from-teal-500 to-cyan-600 p-2 rounded-lg">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div>
                <CardTitle>Recent Consultations</CardTitle>
                <CardDescription>Your consultation history</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {upcomingConsultations.length === 0 ? (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-teal-50 dark:bg-teal-950/30 rounded-full mb-4">
                  <svg className="w-8 h-8 text-teal-600 dark:text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <p className="text-sm text-muted-foreground">
                  No consultations yet. Start your first consultation above.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingConsultations.map((consultation, index) => (
                  <div
                    key={consultation.id}
                    className="group flex items-center justify-between p-4 border rounded-xl hover:border-teal-300 dark:hover:border-teal-700 hover:bg-teal-50/50 dark:hover:bg-teal-950/20 transition-all duration-300 hover:shadow-md"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="flex-1 flex items-center gap-4">
                      {/* Patient Avatar */}
                      <div className="relative">
                        <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold shadow-md">
                          {(Array.isArray(consultation.patients) 
                            ? consultation.patients[0]?.name 
                            : consultation.patients?.name || 'U')[0]}
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-white dark:bg-zinc-900 rounded-full flex items-center justify-center">
                          <div className="w-2.5 h-2.5 bg-green-500 rounded-full" />
                        </div>
                      </div>
                      
                      <div className="flex-1">
                        <p className="font-semibold text-zinc-900 dark:text-zinc-100 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                          {Array.isArray(consultation.patients) 
                            ? consultation.patients[0]?.name 
                            : consultation.patients?.name || 'Unknown Patient'}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-xs text-zinc-600 dark:text-zinc-400">
                            {new Date(consultation.consultation_date).toLocaleString('en-IN', {
                              dateStyle: 'medium',
                              timeStyle: 'short',
                            })}
                          </p>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300">
                            {Array.isArray(consultation.patients)
                              ? consultation.patients[0]?.preferred_language
                              : consultation.patients?.preferred_language || 'N/A'}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      {consultation.approved ? (
                        <span className="text-xs px-3 py-1 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 font-medium">
                          ✓ Approved
                        </span>
                      ) : (
                        <span className="text-xs px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300 font-medium animate-pulse">
                          ⏱ Pending
                        </span>
                      )}
                      <Link href={`/consultation/${consultation.id}/review`}>
                        <Button variant="outline" size="sm" className="group-hover:border-teal-500 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-all">
                          View Notes →
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
