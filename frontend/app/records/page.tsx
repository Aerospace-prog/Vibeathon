import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase-server'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PatientRecordsClient } from '@/components/records/patient-records-client'
import { LogoutButton } from '@/components/dashboard/logout-button'
import { AnimatedLogo } from '@/components/ui/animated-logo'
import { ArrowLeft, Users, FileText, Calendar, Activity, Sparkles, Heart, TrendingUp, Clock, Star } from 'lucide-react'

interface Patient {
  id: string
  name: string
  date_of_birth: string
  preferred_language: string
}

interface Consultation {
  id: string
  consultation_date: string
  approved: boolean
  raw_soap_note: any
}

interface PatientWithConsultations extends Patient {
  consultations: Consultation[]
}

export default async function RecordsPage() {
  const supabase = await createClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect('/auth')
  }

  // Fetch all patients for the authenticated doctor (via consultations)
  let patientsWithConsultations: PatientWithConsultations[] = []

  try {
    // Using a subquery to get unique patients who have consultations with this doctor
    const { data: consultationsData, error: consultationsError } = await supabase
      .from('consultations')
      .select(`
        patient_id,
        patients (
          id,
          name,
          date_of_birth,
          preferred_language
        )
      `)
      .eq('doctor_id', session.user.id)

    if (!consultationsError && consultationsData) {
      // Extract unique patients
      const patientsMap = new Map<string, Patient>()
      consultationsData.forEach((consultation: any) => {
        const patient = Array.isArray(consultation.patients) 
          ? consultation.patients[0] 
          : consultation.patients
        
        if (patient && !patientsMap.has(patient.id)) {
          patientsMap.set(patient.id, patient)
        }
      })

      const patients = Array.from(patientsMap.values())

      // Fetch all consultations for these patients
      const patientIds = patients.map(p => p.id)
      
      if (patientIds.length > 0) {
        const { data: allConsultations, error: allConsultationsError } = await supabase
          .from('consultations')
          .select('id, patient_id, consultation_date, approved, raw_soap_note')
          .eq('doctor_id', session.user.id)
          .in('patient_id', patientIds)
          .order('consultation_date', { ascending: false })

        if (!allConsultationsError && allConsultations) {
          // Group consultations by patient
          patientsWithConsultations = patients.map(patient => ({
            ...patient,
            consultations: allConsultations.filter(c => c.patient_id === patient.id)
          }))
        }
      }
    }
  } catch (err) {
    // Silently handle database errors - tables might not exist yet
    patientsWithConsultations = []
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-purple-950 dark:via-pink-950 dark:to-blue-950 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '0s', animationDuration: '20s' }} />
        <div className="absolute top-40 right-20 w-[500px] h-[500px] bg-pink-400/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '5s', animationDuration: '25s' }} />
        <div className="absolute bottom-20 left-1/3 w-[450px] h-[450px] bg-blue-400/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '10s', animationDuration: '30s' }} />
        
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(168,85,247,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(168,85,247,0.03)_1px,transparent_1px)] bg-[size:50px_50px]" />
      </div>

      {/* Navigation Header */}
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
              <nav className="flex gap-6">
                <Link 
                  href="/dashboard" 
                  className="relative text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors group"
                >
                  <span className="relative">
                    Dashboard
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full group-hover:w-full transition-all duration-300" />
                  </span>
                </Link>
                <Link 
                  href="/records" 
                  className="relative text-sm font-bold text-transparent bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text group"
                >
                  <span className="relative">
                    Patient Records
                    <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full" />
                  </span>
                </Link>
              </nav>
            </div>
            <LogoutButton />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative max-w-7xl mx-auto p-6 space-y-8">
        {/* Hero Section */}
        <div className="relative group">
          {/* Glow effect */}
          <div className="absolute -inset-2 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 rounded-3xl blur-3xl opacity-30 group-hover:opacity-50 transition-opacity animate-pulse-slow" />
          
          <div className="relative bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl rounded-3xl border-2 border-white/20 shadow-2xl overflow-hidden p-8 md:p-12">
            {/* Animated gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-blue-500/10 animate-gradient-shift" style={{ backgroundSize: '200% 200%' }} />
            
            {/* Sparkle decorations */}
            <Sparkles className="absolute top-6 right-6 w-8 h-8 text-yellow-400 animate-pulse" />
            <Star className="absolute bottom-6 left-6 w-6 h-6 text-pink-400 animate-spin" style={{ animationDuration: '8s' }} />
            
            <div className="relative">
              <Link href="/dashboard">
                <Button variant="ghost" className="mb-6 gap-2 hover:bg-purple-100 dark:hover:bg-purple-950/30 group/btn">
                  <ArrowLeft className="w-4 h-4 group-hover/btn:-translate-x-1 transition-transform" />
                  Back to Dashboard
                </Button>
              </Link>
              
              <div className="flex items-center gap-4 mb-4">
                <div className="relative">
                  <div className="absolute -inset-2 bg-gradient-to-br from-purple-600 via-pink-600 to-blue-600 rounded-xl blur-lg opacity-50 animate-pulse" />
                  <div className="relative bg-gradient-to-br from-purple-500 via-pink-500 to-blue-500 p-4 rounded-xl shadow-2xl">
                    <Users className="w-8 h-8 text-white animate-pulse" />
                  </div>
                </div>
                <div>
                  <h2 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent animate-gradient-x" style={{ backgroundSize: '200% 200%' }}>
                    Patient Records
                  </h2>
                  <p className="text-slate-600 dark:text-slate-400 mt-2 flex items-center gap-2 text-lg font-medium">
                    <FileText className="w-5 h-5 text-purple-500" />
                    View and manage patient information
                    <Heart className="w-5 h-5 text-pink-500 animate-heartbeat fill-pink-500" />
                  </p>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                <div className="group/stat relative">
                  <div className="absolute -inset-1 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl blur opacity-50 group-hover/stat:opacity-75 transition-opacity" />
                  <div className="relative bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/50 dark:to-pink-950/50 p-4 rounded-xl border-2 border-purple-200 dark:border-purple-800 shadow-lg transform group-hover/stat:scale-105 transition-all duration-300">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-3xl font-black bg-gradient-to-br from-purple-600 to-pink-600 bg-clip-text text-transparent">
                          {patientsWithConsultations.length}
                        </div>
                        <div className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wide">
                          Total Patients
                        </div>
                      </div>
                      <Users className="w-8 h-8 text-purple-600 dark:text-purple-400 animate-bounce" style={{ animationDuration: '2s' }} />
                    </div>
                  </div>
                </div>

                <div className="group/stat relative">
                  <div className="absolute -inset-1 bg-gradient-to-br from-pink-600 to-rose-600 rounded-xl blur opacity-50 group-hover/stat:opacity-75 transition-opacity" />
                  <div className="relative bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-950/50 dark:to-rose-950/50 p-4 rounded-xl border-2 border-pink-200 dark:border-pink-800 shadow-lg transform group-hover/stat:scale-105 transition-all duration-300">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-3xl font-black bg-gradient-to-br from-pink-600 to-rose-600 bg-clip-text text-transparent">
                          {patientsWithConsultations.reduce((sum, p) => sum + p.consultations.length, 0)}
                        </div>
                        <div className="text-xs font-bold text-pink-600 dark:text-pink-400 uppercase tracking-wide">
                          Total Records
                        </div>
                      </div>
                      <FileText className="w-8 h-8 text-pink-600 dark:text-pink-400 animate-pulse" />
                    </div>
                  </div>
                </div>

                <div className="group/stat relative">
                  <div className="absolute -inset-1 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl blur opacity-50 group-hover/stat:opacity-75 transition-opacity" />
                  <div className="relative bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/50 dark:to-cyan-950/50 p-4 rounded-xl border-2 border-blue-200 dark:border-blue-800 shadow-lg transform group-hover/stat:scale-105 transition-all duration-300">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-3xl font-black bg-gradient-to-br from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                          {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </div>
                        <div className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wide">
                          Today's Date
                        </div>
                      </div>
                      <Calendar className="w-8 h-8 text-blue-600 dark:text-blue-400 animate-bounce" style={{ animationDuration: '2s' }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Patient Records Content */}
        <div className="relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 rounded-2xl blur-xl opacity-20" />
          <div className="relative bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-2xl border-2 border-white/20 shadow-2xl overflow-hidden">
            <PatientRecordsClient patients={patientsWithConsultations} />
          </div>
        </div>
      </main>
    </div>
  )
}
