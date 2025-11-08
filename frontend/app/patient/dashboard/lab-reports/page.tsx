import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { LabReportUploadClient } from '@/components/lab-reports/LabReportUploadClient'
import { AnimatedLogo } from '@/components/ui/animated-logo'
import { LogoutButton } from '@/components/dashboard/logout-button'
import { ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase-server'

export default async function LabReportsPage() {
  const supabase = await createClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect('/auth')
  }

  // Check if user is a patient
  const userRole = session.user.user_metadata?.role
  if (userRole === 'doctor') {
    redirect('/dashboard')
  }

  // Use the actual user ID from session
  const patientId = session.user.id

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50 dark:from-teal-950 dark:via-cyan-950 dark:to-blue-950">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-teal-400/20 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-400/20 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-blue-400/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }} />
      </div>

      {/* Navigation Header */}
      <header className="relative z-10 border-b bg-white/80 dark:bg-zinc-900/80 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-8">
              <AnimatedLogo size="md" href="/patient/dashboard" />
              <nav className="flex gap-6">
                <Link 
                  href="/patient/dashboard" 
                  className="text-sm font-medium text-muted-foreground hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
                >
                  Dashboard
                </Link>
                <Link 
                  href="/patient/appointments" 
                  className="text-sm font-medium text-muted-foreground hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
                >
                  My Appointments
                </Link>
                <Link 
                  href="/patient/medical-images" 
                  className="text-sm font-medium text-muted-foreground hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
                >
                  AI Image Analysis
                </Link>
                <Link 
                  href="/patient/records" 
                  className="text-sm font-medium text-muted-foreground hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
                >
                  Medical Records
                </Link>
              </nav>
            </div>
            <LogoutButton />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto p-6">
        <div className="mb-6">
          <Link href="/patient/dashboard">
            <Button variant="ghost" size="sm" className="hover:bg-teal-50 dark:hover:bg-teal-950/30">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
        </div>

        {/* Hero Section */}
        <div className="relative group mb-8">
          <div className="absolute inset-0 bg-gradient-to-r from-teal-500/20 via-cyan-500/20 to-blue-500/20 rounded-3xl blur-2xl group-hover:blur-3xl transition-all duration-500" />
          <div className="relative bg-gradient-to-br from-white/80 to-white/40 dark:from-slate-900/80 dark:to-slate-800/40 backdrop-blur-2xl rounded-3xl border border-white/20 shadow-2xl shadow-teal-500/10 p-8 md:p-12">
            <div className="flex items-center gap-4 mb-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-2xl blur-xl opacity-75 animate-pulse-slow" />
                <div className="relative w-16 h-16 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-2xl flex items-center justify-center shadow-2xl">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>
              <div>
                <h2 className="text-4xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 dark:from-teal-400 dark:to-cyan-400 bg-clip-text text-transparent">
                  Lab Report Analyzer
                </h2>
                <p className="text-lg text-slate-600 dark:text-slate-400 mt-1">
                  AI-powered analysis with instant insights and explanations
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-6">
          <LabReportUploadClient patientId={patientId} />
        </div>
      </main>
    </div>
  )
}
