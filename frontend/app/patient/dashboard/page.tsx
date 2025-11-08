import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase-server'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LogoutButton } from '@/components/dashboard/logout-button'
import { AnimatedLogo } from '@/components/ui/animated-logo'
import { Calendar, FileText, Video, Heart, Clock, User, Camera } from 'lucide-react'

// Extract patient name from email
function extractPatientName(email: string): string {
  const username = email.split('@')[0]
  const cleanName = username.replace(/[0-9_.-]/g, '')
  return cleanName.charAt(0).toUpperCase() + cleanName.slice(1)
}

export default async function PatientDashboard() {
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

  const patientName = extractPatientName(session.user.email || 'Patient')

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-teal-50 dark:from-cyan-950 dark:via-blue-950 dark:to-teal-950">
      {/* Navigation Header */}
      <header className="border-b bg-white/80 dark:bg-zinc-900/80 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-8">
              <AnimatedLogo size="md" href="/patient/dashboard" />
              <nav className="flex gap-6">
                <Link 
                  href="/patient/dashboard" 
                  className="text-sm font-medium text-primary"
                >
                  Dashboard
                </Link>
                <Link 
                  href="/patient/appointments" 
                  className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                >
                  My Appointments
                </Link>
                <Link 
                  href="/patient/medical-images" 
                  className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                >
                  AI Image Analysis
                </Link>
                <Link 
                  href="/patient/records" 
                  className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
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
                      {patientName.charAt(0)}
                    </div>
                  </div>
                  <div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 dark:from-cyan-400 dark:to-blue-400 bg-clip-text text-transparent">
                      Welcome, {patientName}!
                    </h1>
                    <p className="text-zinc-600 dark:text-zinc-400 mt-1 flex items-center gap-2">
                      <Heart className="w-4 h-4 text-pink-500 animate-heartbeat" />
                      Your health journey starts here
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Quick stats */}
              <div className="flex gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-cyan-600 dark:text-cyan-400">0</div>
                  <div className="text-xs text-zinc-600 dark:text-zinc-400">Appointments</div>
                </div>
                <div className="w-px bg-zinc-200 dark:bg-zinc-800" />
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">0</div>
                  <div className="text-xs text-zinc-600 dark:text-zinc-400">Records</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Link href="/patient/book-appointment">
            <Card className="border-cyan-200/50 dark:border-cyan-800/50 hover:shadow-xl transition-all duration-300 group relative overflow-hidden cursor-pointer">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardHeader className="relative">
                <div className="flex items-center gap-3 mb-2">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg blur-md opacity-50 group-hover:opacity-75 transition-opacity" />
                    <div className="relative bg-gradient-to-br from-cyan-500 to-blue-600 p-2 rounded-lg">
                      <Calendar className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <CardTitle className="text-lg">Book Appointment</CardTitle>
                </div>
                <CardDescription>Check symptoms & find doctors</CardDescription>
              </CardHeader>
              <CardContent className="relative">
                <Button className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white">
                  Book Now
                </Button>
              </CardContent>
            </Card>
          </Link>

          <Link href="/patient/medical-images">
            <Card className="border-purple-200/50 dark:border-purple-800/50 hover:shadow-xl transition-all duration-300 group relative overflow-hidden cursor-pointer">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardHeader className="relative">
                <div className="flex items-center gap-3 mb-2">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg blur-md opacity-50 group-hover:opacity-75 transition-opacity" />
                    <div className="relative bg-gradient-to-br from-purple-500 to-pink-600 p-2 rounded-lg">
                      <Camera className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <CardTitle className="text-lg">AI Image Analysis</CardTitle>
                </div>
                <CardDescription>Upload & analyze skin conditions</CardDescription>
              </CardHeader>
              <CardContent className="relative">
                <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white">
                  Analyze Now
                </Button>
              </CardContent>
            </Card>
          </Link>

          <Card className="border-blue-200/50 dark:border-blue-800/50 hover:shadow-xl transition-all duration-300 group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-teal-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardHeader className="relative">
              <div className="flex items-center gap-3 mb-2">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-teal-600 rounded-lg blur-md opacity-50 group-hover:opacity-75 transition-opacity" />
                  <div className="relative bg-gradient-to-br from-blue-500 to-teal-600 p-2 rounded-lg">
                    <Video className="w-5 h-5 text-white" />
                  </div>
                </div>
                <CardTitle className="text-lg">Join Consultation</CardTitle>
              </div>
              <CardDescription>Join your scheduled video call</CardDescription>
            </CardHeader>
            <CardContent className="relative">
              <Button variant="outline" className="w-full border-blue-300 dark:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950/30">
                Join Call
              </Button>
            </CardContent>
          </Card>

          <Card className="border-teal-200/50 dark:border-teal-800/50 hover:shadow-xl transition-all duration-300 group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardHeader className="relative">
              <div className="flex items-center gap-3 mb-2">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-lg blur-md opacity-50 group-hover:opacity-75 transition-opacity" />
                  <div className="relative bg-gradient-to-br from-teal-500 to-cyan-600 p-2 rounded-lg">
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                </div>
                <CardTitle className="text-lg">My Records</CardTitle>
              </div>
              <CardDescription>View your medical history</CardDescription>
            </CardHeader>
            <CardContent className="relative">
              <Link href="/patient/records">
                <Button variant="outline" className="w-full border-teal-300 dark:border-teal-700 hover:bg-teal-50 dark:hover:bg-teal-950/30">
                  View Records
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Appointments */}
        <Card className="border-zinc-200/50 dark:border-zinc-800/50">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg blur-md opacity-50" />
                <div className="relative bg-gradient-to-br from-cyan-500 to-blue-600 p-2 rounded-lg">
                  <Clock className="w-5 h-5 text-white" />
                </div>
              </div>
              <div>
                <CardTitle>Upcoming Appointments</CardTitle>
                <CardDescription>Your scheduled consultations</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-cyan-50 dark:bg-cyan-950/30 rounded-full mb-4">
                <Calendar className="w-8 h-8 text-cyan-600 dark:text-cyan-400" />
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                No upcoming appointments. Book your first consultation!
              </p>
              <Link href="/patient/book-appointment">
                <Button className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white">
                  <Calendar className="w-4 h-4 mr-2" />
                  Book Appointment
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
