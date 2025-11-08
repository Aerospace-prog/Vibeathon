import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase-server'
import { Button } from '@/components/ui/button'
import { DoctorAppointmentsList } from '@/components/appointments/doctor-appointments-list'
import { LogoutButton } from '@/components/dashboard/logout-button'
import { AnimatedLogo } from '@/components/ui/animated-logo'
import { ArrowLeft } from 'lucide-react'

export default async function AppointmentsPage() {
  const supabase = await createClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect('/auth')
  }

  // Check if user is a doctor
  const userRole = session.user.user_metadata?.role
  if (userRole === 'patient') {
    redirect('/patient/dashboard')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950">
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 border-b border-white/20 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl shadow-lg shadow-black/5">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-8">
              <AnimatedLogo size="md" href="/dashboard" />
              <nav className="hidden md:flex gap-6">
                <Link 
                  href="/dashboard" 
                  className="relative text-sm font-semibold text-muted-foreground hover:text-primary transition-colors group"
                >
                  <span className="relative z-10">Dashboard</span>
                  <span className="absolute inset-x-0 -bottom-1 h-0.5 bg-gradient-to-r from-teal-500 to-cyan-500 transform scale-x-0 group-hover:scale-x-100 transition-transform" />
                </Link>
                <Link 
                  href="/appointments" 
                  className="relative text-sm font-semibold text-primary group"
                >
                  <span className="relative z-10">Appointments</span>
                  <span className="absolute inset-x-0 -bottom-1 h-0.5 bg-gradient-to-r from-teal-500 to-cyan-500 transform scale-x-100 transition-transform" />
                </Link>
                <Link 
                  href="/records" 
                  className="relative text-sm font-semibold text-muted-foreground hover:text-primary transition-colors group"
                >
                  <span className="relative z-10">Patient Records</span>
                  <span className="absolute inset-x-0 -bottom-1 h-0.5 bg-gradient-to-r from-teal-500 to-cyan-500 transform scale-x-0 group-hover:scale-x-100 transition-transform" />
                </Link>
                <Link 
                  href="/profile" 
                  className="relative text-sm font-semibold text-muted-foreground hover:text-primary transition-colors group"
                >
                  <span className="relative z-10">Profile</span>
                  <span className="absolute inset-x-0 -bottom-1 h-0.5 bg-gradient-to-r from-teal-500 to-cyan-500 transform scale-x-0 group-hover:scale-x-100 transition-transform" />
                </Link>
              </nav>
            </div>
            <LogoutButton />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto p-6">
        <div className="mb-8">
          <Link href="/dashboard">
            <Button variant="ghost" className="mb-4 gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Button>
          </Link>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 dark:from-teal-400 dark:to-cyan-400 bg-clip-text text-transparent">
            My Appointments
          </h1>
          <p className="text-muted-foreground mt-2">
            View and manage your scheduled appointments
          </p>
        </div>

        <DoctorAppointmentsList doctorId={session.user.id} />
      </main>
    </div>
  )
}
