import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase-server'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PatientRecordsClient } from '@/components/records/patient-records-client'
import { LogoutButton } from '@/components/dashboard/logout-button'
import { AnimatedLogo } from '@/components/ui/animated-logo'
import { ArrowLeft } from 'lucide-react'

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
      <main className="max-w-7xl mx-auto p-6">
        <div className="mb-8">
          <Link href="/dashboard">
            <Button variant="ghost" className="mb-4 gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Button>
          </Link>
          <h2 className="text-3xl font-bold">Patient Records</h2>
          <p className="text-muted-foreground mt-1">
            View and manage patient information
          </p>
        </div>

        <PatientRecordsClient patients={patientsWithConsultations} />
      </main>
    </div>
  )
}
