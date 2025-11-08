import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase-server'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PatientRecordsClient } from '@/components/records/patient-records-client'
import { LogoutButton } from '@/components/dashboard/logout-button'
import { AnimatedLogo } from '@/components/ui/animated-logo'
import { ArrowLeft, Users, FileText, Calendar } from 'lucide-react'

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
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50 dark:from-teal-950 dark:via-cyan-950 dark:to-blue-950">
      {/* Navigation Header */}
      <header className="border-b bg-white/80 dark:bg-zinc-900/80 backdrop-blur-lg">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-500 via-cyan-500 to-blue-500" />
        
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-8">
              <AnimatedLogo size="md" href="/dashboard" />
              <nav className="flex gap-6">
                <Link 
                  href="/dashboard" 
                  className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                >
                  Dashboard
                </Link>
                <Link 
                  href="/records" 
                  className="text-sm font-medium text-primary"
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
      <main className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Hero Section */}
        <div className="relative mb-8 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50 dark:from-teal-950/30 dark:via-cyan-950/30 dark:to-blue-950/30 rounded-3xl" />
          <div className="absolute inset-0 bg-gradient-to-br from-teal-400/10 via-cyan-400/10 to-blue-400/10 rounded-3xl" />
          
          <div className="relative p-8 md:p-12">
            <Link href="/dashboard">
              <Button variant="ghost" className="mb-6 gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back to Dashboard
              </Button>
            </Link>
            
            <div className="flex items-center gap-4 mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-xl blur-md opacity-50" />
                <div className="relative bg-gradient-to-br from-teal-500 to-cyan-600 p-3 rounded-xl shadow-lg">
                  <Users className="w-8 h-8 text-white" />
                </div>
              </div>
              <div>
                <h2 className="text-4xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 dark:from-teal-400 dark:to-cyan-400 bg-clip-text text-transparent">
                  Patient Records
                </h2>
                <p className="text-zinc-600 dark:text-zinc-400 mt-1">
                  View and manage patient information
                </p>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="border-teal-200/50 dark:border-teal-800/50">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-3xl font-bold text-teal-600 dark:text-teal-400">
                        {patientsWithConsultations.length}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Total Patients
                      </div>
                    </div>
                    <Users className="w-8 h-8 text-teal-600 dark:text-teal-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-cyan-200/50 dark:border-cyan-800/50">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-3xl font-bold text-cyan-600 dark:text-cyan-400">
                        {patientsWithConsultations.reduce((sum, p) => sum + p.consultations.length, 0)}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Total Records
                      </div>
                    </div>
                    <FileText className="w-8 h-8 text-cyan-600 dark:text-cyan-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-blue-200/50 dark:border-blue-800/50">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                        {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Today's Date
                      </div>
                    </div>
                    <Calendar className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Patient Records Content */}
        <Card className="border-zinc-200/50 dark:border-zinc-800/50">
          <PatientRecordsClient patients={patientsWithConsultations} />
        </Card>
      </main>
    </div>
  )
}
