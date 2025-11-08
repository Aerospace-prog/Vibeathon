"use client"

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import PatientSymptomChecker from '@/components/patient/PatientSymptomChecker'
import DoctorBooking from '@/components/patient/DoctorBooking'
import { Stethoscope, Calendar } from 'lucide-react'

export default function BookAppointmentPage() {
  const [activeTab, setActiveTab] = useState('symptom-checker')
  const [symptomCategory, setSymptomCategory] = useState<string | undefined>()
  const [severity, setSeverity] = useState<number | undefined>()

  const handleBookAppointment = (category: string, severityScore: number) => {
    setSymptomCategory(category)
    setSeverity(severityScore)
    setActiveTab('find-doctor')
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Healthcare Services</h1>
        <p className="text-muted-foreground">
          Check your symptoms and book appointments with qualified doctors
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-2 h-12">
          <TabsTrigger value="symptom-checker" className="gap-2">
            <Stethoscope className="w-4 h-4" />
            Symptom Checker
          </TabsTrigger>
          <TabsTrigger value="find-doctor" className="gap-2">
            <Calendar className="w-4 h-4" />
            Find Doctor
          </TabsTrigger>
        </TabsList>

        <TabsContent value="symptom-checker" className="space-y-6">
          <PatientSymptomChecker onBookAppointment={handleBookAppointment} />
        </TabsContent>

        <TabsContent value="find-doctor" className="space-y-6">
          <DoctorBooking symptomCategory={symptomCategory} severity={severity} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
