'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { LogoutButton } from '@/components/dashboard/logout-button'
import { AnimatedLogo } from '@/components/ui/animated-logo'
import { 
  FileText, 
  Stethoscope, 
  FlaskConical, 
  Camera, 
  Calendar,
  Clock,
  User,
  ArrowLeft,
  Download,
  Eye,
  Loader2,
  Sparkles,
  X
} from 'lucide-react'

interface SOAPNote {
  id: string
  consultation_id: string
  subjective: string
  objective: string
  assessment: string
  plan: string
  created_at: string
  doctor?: {
    full_name: string
    specialization?: string
  }
}

interface LabReport {
  id: string
  file_name: string
  file_type: string
  extracted_text: string
  analysis_result: any
  uploaded_at: string
  status: string
}

interface MedicalImage {
  id: string
  image_url: string
  analysis_result: any
  uploaded_at: string
  status: string
}

export default function MedicalRecordsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [soapNotes, setSoapNotes] = useState<SOAPNote[]>([])
  const [labReports, setLabReports] = useState<LabReport[]>([])
  const [medicalImages, setMedicalImages] = useState<MedicalImage[]>([])
  const [patientId, setPatientId] = useState<string>('')
  const [selectedReport, setSelectedReport] = useState<LabReport | null>(null)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [downloading, setDownloading] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        const { data: { session } } = await supabase.auth.getSession()

        if (!session) {
          router.push('/auth')
          return
        }

        setPatientId(session.user.id)

        // Fetch SOAP Notes
        const { data: soapData } = await supabase
          .from('soap_notes')
          .select(`
            *,
            consultations!inner(
              doctor_id,
              doctors(full_name, specialization)
            )
          `)
          .eq('consultations.patient_id', session.user.id)
          .order('created_at', { ascending: false })

        if (soapData) {
          setSoapNotes(soapData as any)
        }

        // Fetch Lab Reports
        const { data: labData } = await supabase
          .from('lab_reports')
          .select('*')
          .eq('patient_id', session.user.id)
          .order('uploaded_at', { ascending: false })

        if (labData) {
          setLabReports(labData)
        }

        // Fetch Medical Images
        const { data: imageData } = await supabase
          .from('medical_images')
          .select('*')
          .eq('patient_id', session.user.id)
          .order('uploaded_at', { ascending: false })

        if (imageData) {
          setMedicalImages(imageData)
        }

      } catch (error) {
        console.error('Error fetching medical records:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [router])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleViewReport = (report: LabReport) => {
    setSelectedReport(report)
    setViewDialogOpen(true)
  }

  const handleDownloadReport = async (report: LabReport) => {
    setDownloading(report.id)
    try {
      // Create a text file with the report content
      const content = `
LAB REPORT
==========

File: ${report.file_name}
Date: ${formatDate(report.uploaded_at)}
Status: ${report.status}

EXTRACTED TEXT:
${report.extracted_text}

AI ANALYSIS:
${report.analysis_result?.summary || 'No summary available'}

KEY FINDINGS:
${report.analysis_result?.key_findings || 'No key findings available'}

RECOMMENDATIONS:
${report.analysis_result?.recommendations || 'No recommendations available'}
      `.trim()

      // Create blob and download
      const blob = new Blob([content], { type: 'text/plain' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${report.file_name.replace(/\.[^/.]+$/, '')}_analysis.txt`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error downloading report:', error)
      alert('Failed to download report')
    } finally {
      setDownloading(null)
    }
  }

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
                  className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
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
                  className="text-sm font-medium text-primary"
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
        {/* Back Button */}
        <div className="mb-6">
          <Link href="/patient/dashboard">
            <Button variant="ghost" size="sm" className="hover:bg-cyan-50 dark:hover:bg-cyan-950/30">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
        </div>

        {/* Hero Section */}
        <div className="relative mb-8 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-50 via-blue-50 to-teal-50 dark:from-cyan-950/30 dark:via-blue-950/30 dark:to-teal-950/30 rounded-3xl" />
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/10 via-blue-400/10 to-teal-400/10 rounded-3xl animate-gradient-shift" />
          
          <div className="relative p-8 md:p-12">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl blur-xl opacity-75 animate-pulse-slow" />
                <div className="relative w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-2xl">
                  <FileText className="w-8 h-8 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 dark:from-cyan-400 dark:to-blue-400 bg-clip-text text-transparent">
                  Medical Records
                </h1>
                <p className="text-zinc-600 dark:text-zinc-400 mt-1 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-yellow-500" />
                  Your complete health history in one place
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs for Different Record Types */}
        <Tabs defaultValue="soap" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-lg">
            <TabsTrigger value="soap" className="flex items-center gap-2">
              <Stethoscope className="w-4 h-4" />
              SOAP Notes
              {soapNotes.length > 0 && (
                <Badge variant="secondary" className="ml-1">{soapNotes.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="lab" className="flex items-center gap-2">
              <FlaskConical className="w-4 h-4" />
              Lab Reports
              {labReports.length > 0 && (
                <Badge variant="secondary" className="ml-1">{labReports.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="images" className="flex items-center gap-2">
              <Camera className="w-4 h-4" />
              Medical Images
              {medicalImages.length > 0 && (
                <Badge variant="secondary" className="ml-1">{medicalImages.length}</Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {loading ? (
            <div className="text-center py-12">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-cyan-600" />
              <p className="text-sm text-muted-foreground">Loading your medical records...</p>
            </div>
          ) : (
            <>
              {/* SOAP Notes Tab */}
              <TabsContent value="soap" className="space-y-4">
                {soapNotes.length === 0 ? (
                  <Card className="border-zinc-200/50 dark:border-zinc-800/50">
                    <CardContent className="text-center py-12">
                      <div className="inline-flex items-center justify-center w-16 h-16 bg-cyan-50 dark:bg-cyan-950/30 rounded-full mb-4">
                        <Stethoscope className="w-8 h-8 text-cyan-600 dark:text-cyan-400" />
                      </div>
                      <p className="text-sm text-muted-foreground mb-4">
                        No SOAP notes yet. Your doctor will add notes after consultations.
                      </p>
                      <Link href="/patient/book-appointment">
                        <Button className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white">
                          Book Consultation
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                ) : (
                  soapNotes.map((note) => (
                    <Card key={note.id} className="border-cyan-200/50 dark:border-cyan-800/50 hover:shadow-xl transition-all duration-300 group relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                      <CardHeader className="relative">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg blur-md opacity-50" />
                              <div className="relative bg-gradient-to-br from-cyan-500 to-blue-600 p-2 rounded-lg">
                                <Stethoscope className="w-5 h-5 text-white" />
                              </div>
                            </div>
                            <div>
                              <CardTitle className="text-lg">
                                Dr. {note.doctor?.full_name || 'Doctor'}
                              </CardTitle>
                              <CardDescription className="flex items-center gap-2 mt-1">
                                <Calendar className="w-3 h-3" />
                                {formatDate(note.created_at)}
                              </CardDescription>
                            </div>
                          </div>
                          <Badge variant="outline" className="bg-cyan-50 dark:bg-cyan-950/30">
                            SOAP Note
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="relative space-y-4">
                        <div>
                          <h4 className="font-semibold text-sm text-cyan-600 dark:text-cyan-400 mb-2">Subjective</h4>
                          <p className="text-sm text-zinc-700 dark:text-zinc-300">{note.subjective}</p>
                        </div>
                        <div>
                          <h4 className="font-semibold text-sm text-blue-600 dark:text-blue-400 mb-2">Objective</h4>
                          <p className="text-sm text-zinc-700 dark:text-zinc-300">{note.objective}</p>
                        </div>
                        <div>
                          <h4 className="font-semibold text-sm text-teal-600 dark:text-teal-400 mb-2">Assessment</h4>
                          <p className="text-sm text-zinc-700 dark:text-zinc-300">{note.assessment}</p>
                        </div>
                        <div>
                          <h4 className="font-semibold text-sm text-indigo-600 dark:text-indigo-400 mb-2">Plan</h4>
                          <p className="text-sm text-zinc-700 dark:text-zinc-300">{note.plan}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </TabsContent>

              {/* Lab Reports Tab */}
              <TabsContent value="lab" className="space-y-4">
                {labReports.length === 0 ? (
                  <Card className="border-zinc-200/50 dark:border-zinc-800/50">
                    <CardContent className="text-center py-12">
                      <div className="inline-flex items-center justify-center w-16 h-16 bg-green-50 dark:bg-green-950/30 rounded-full mb-4">
                        <FlaskConical className="w-8 h-8 text-green-600 dark:text-green-400" />
                      </div>
                      <p className="text-sm text-muted-foreground mb-4">
                        No lab reports yet. Upload your reports for AI-powered analysis.
                      </p>
                      <Link href="/patient/dashboard/lab-reports">
                        <Button className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white">
                          Upload Lab Report
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                ) : (
                  labReports.map((report) => (
                    <Card key={report.id} className="border-green-200/50 dark:border-green-800/50 hover:shadow-xl transition-all duration-300 group relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                      <CardHeader className="relative">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg blur-md opacity-50" />
                              <div className="relative bg-gradient-to-br from-green-500 to-emerald-600 p-2 rounded-lg">
                                <FlaskConical className="w-5 h-5 text-white" />
                              </div>
                            </div>
                            <div>
                              <CardTitle className="text-lg">{report.file_name}</CardTitle>
                              <CardDescription className="flex items-center gap-2 mt-1">
                                <Calendar className="w-3 h-3" />
                                {formatDate(report.uploaded_at)}
                              </CardDescription>
                            </div>
                          </div>
                          <Badge 
                            variant="outline" 
                            className={report.status === 'completed' ? 'bg-green-50 dark:bg-green-950/30' : 'bg-yellow-50 dark:bg-yellow-950/30'}
                          >
                            {report.status}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="relative space-y-4">
                        {report.analysis_result && (
                          <div className="space-y-3">
                            <h4 className="font-semibold text-sm text-green-600 dark:text-green-400">AI Analysis</h4>
                            <div className="bg-green-50 dark:bg-green-950/30 rounded-lg p-4 space-y-2">
                              {report.analysis_result.summary && (
                                <p className="text-sm text-zinc-700 dark:text-zinc-300">{report.analysis_result.summary}</p>
                              )}
                              {report.analysis_result.key_findings && (
                                <div>
                                  <p className="text-xs font-semibold text-green-600 dark:text-green-400 mb-1">Key Findings:</p>
                                  <p className="text-sm text-zinc-700 dark:text-zinc-300">{report.analysis_result.key_findings}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex-1"
                            onClick={() => handleViewReport(report)}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            View Full Report
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex-1"
                            onClick={() => handleDownloadReport(report)}
                            disabled={downloading === report.id}
                          >
                            {downloading === report.id ? (
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                              <Download className="w-4 h-4 mr-2" />
                            )}
                            {downloading === report.id ? 'Downloading...' : 'Download'}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </TabsContent>

              {/* Medical Images Tab */}
              <TabsContent value="images" className="space-y-4">
                {medicalImages.length === 0 ? (
                  <Card className="border-zinc-200/50 dark:border-zinc-800/50">
                    <CardContent className="text-center py-12">
                      <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-50 dark:bg-purple-950/30 rounded-full mb-4">
                        <Camera className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                      </div>
                      <p className="text-sm text-muted-foreground mb-4">
                        No medical images yet. Upload images for AI-powered skin analysis.
                      </p>
                      <Link href="/patient/medical-images">
                        <Button className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white">
                          Upload Medical Image
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2">
                    {medicalImages.map((image) => (
                      <Card key={image.id} className="border-purple-200/50 dark:border-purple-800/50 hover:shadow-xl transition-all duration-300 group relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <CardHeader className="relative">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              <div className="relative">
                                <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg blur-md opacity-50" />
                                <div className="relative bg-gradient-to-br from-purple-500 to-pink-600 p-2 rounded-lg">
                                  <Camera className="w-5 h-5 text-white" />
                                </div>
                              </div>
                              <div>
                                <CardTitle className="text-lg">Medical Image</CardTitle>
                                <CardDescription className="flex items-center gap-2 mt-1">
                                  <Calendar className="w-3 h-3" />
                                  {formatDate(image.uploaded_at)}
                                </CardDescription>
                              </div>
                            </div>
                            <Badge 
                              variant="outline" 
                              className={image.status === 'completed' ? 'bg-purple-50 dark:bg-purple-950/30' : 'bg-yellow-50 dark:bg-yellow-950/30'}
                            >
                              {image.status}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="relative space-y-4">
                          {image.image_url && (
                            <div className="relative aspect-video rounded-lg overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                              <img 
                                src={image.image_url} 
                                alt="Medical scan" 
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                          {image.analysis_result && (
                            <div className="space-y-2">
                              <h4 className="font-semibold text-sm text-purple-600 dark:text-purple-400">AI Analysis</h4>
                              <div className="bg-purple-50 dark:bg-purple-950/30 rounded-lg p-4">
                                <p className="text-sm text-zinc-700 dark:text-zinc-300">
                                  {typeof image.analysis_result === 'string' 
                                    ? image.analysis_result 
                                    : image.analysis_result.analysis || 'Analysis completed'}
                                </p>
                              </div>
                            </div>
                          )}
                          <Button variant="outline" size="sm" className="w-full">
                            <Eye className="w-4 h-4 mr-2" />
                            View Full Analysis
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            </>
          )}
        </Tabs>
      </main>

      {/* View Report Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FlaskConical className="w-5 h-5 text-green-600" />
              {selectedReport?.file_name}
            </DialogTitle>
            <DialogDescription>
              Uploaded on {selectedReport && formatDate(selectedReport.uploaded_at)}
            </DialogDescription>
          </DialogHeader>
          
          {selectedReport && (
            <div className="space-y-6 mt-4">
              {/* AI Analysis Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-green-600 dark:text-green-400 flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  AI Analysis
                </h3>
                
                {/* Summary */}
                {selectedReport.analysis_result?.summary && (
                  <div className="bg-green-50 dark:bg-green-950/30 rounded-lg p-4">
                    <h4 className="font-semibold text-base text-green-700 dark:text-green-300 mb-3">Summary</h4>
                    <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
                      {selectedReport.analysis_result.summary}
                    </p>
                  </div>
                )}

                {/* Lab Values Table */}
                {selectedReport.analysis_result?.values && selectedReport.analysis_result.values.length > 0 && (
                  <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                    <div className="px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-700">
                      <h4 className="font-semibold text-sm text-zinc-700 dark:text-zinc-300">Lab Values</h4>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-zinc-50 dark:bg-zinc-800/50">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-semibold text-zinc-600 dark:text-zinc-400">Test Name</th>
                            <th className="px-4 py-2 text-left text-xs font-semibold text-zinc-600 dark:text-zinc-400">Value</th>
                            <th className="px-4 py-2 text-left text-xs font-semibold text-zinc-600 dark:text-zinc-400">Normal Range</th>
                            <th className="px-4 py-2 text-left text-xs font-semibold text-zinc-600 dark:text-zinc-400">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                          {selectedReport.analysis_result.values.map((value: any, index: number) => (
                            <tr key={index} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                              <td className="px-4 py-3 text-sm text-zinc-700 dark:text-zinc-300">{value.name}</td>
                              <td className="px-4 py-3 text-sm font-medium text-zinc-900 dark:text-zinc-100">
                                {value.value} {value.unit}
                              </td>
                              <td className="px-4 py-3 text-sm text-zinc-600 dark:text-zinc-400">{value.normal_range}</td>
                              <td className="px-4 py-3">
                                <Badge 
                                  variant={value.status === 'normal' ? 'outline' : 'destructive'}
                                  className={
                                    value.status === 'normal' 
                                      ? 'bg-green-50 text-green-700 border-green-200' 
                                      : value.status === 'high'
                                      ? 'bg-red-50 text-red-700 border-red-200'
                                      : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                                  }
                                >
                                  {value.status}
                                </Badge>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Abnormal Values */}
                {selectedReport.analysis_result?.abnormal_values && selectedReport.analysis_result.abnormal_values.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-semibold text-base text-orange-600 dark:text-orange-400">Abnormal Values</h4>
                    {selectedReport.analysis_result.abnormal_values.map((abnormal: any, index: number) => (
                      <div key={index} className="bg-orange-50 dark:bg-orange-950/30 rounded-lg p-4 border-l-4 border-orange-500">
                        <div className="flex items-start justify-between mb-2">
                          <h5 className="font-semibold text-sm text-orange-900 dark:text-orange-100">{abnormal.name}</h5>
                          <Badge variant="destructive" className="bg-orange-100 text-orange-700 border-orange-300">
                            {abnormal.status}
                          </Badge>
                        </div>
                        <div className="space-y-2 text-sm">
                          <p className="text-zinc-700 dark:text-zinc-300">
                            <span className="font-medium">Value:</span> {abnormal.value} {abnormal.unit} 
                            <span className="text-zinc-500 dark:text-zinc-400 ml-2">(Normal: {abnormal.normal_range})</span>
                          </p>
                          <p className="text-zinc-700 dark:text-zinc-300">
                            <span className="font-medium">Explanation:</span> {abnormal.explanation}
                          </p>
                          {abnormal.recommendation && (
                            <p className="text-zinc-700 dark:text-zinc-300">
                              <span className="font-medium">Recommendation:</span> {abnormal.recommendation}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Urgent Attention Alert */}
                {selectedReport.analysis_result?.urgent_attention && (
                  <div className="bg-red-50 dark:bg-red-950/30 rounded-lg p-4 border-l-4 border-red-500">
                    <h4 className="font-semibold text-base text-red-700 dark:text-red-300 mb-2 flex items-center gap-2">
                      <span className="text-xl">⚠️</span>
                      Urgent Attention Required
                    </h4>
                    <p className="text-sm text-red-700 dark:text-red-300">
                      {selectedReport.analysis_result.urgent_message}
                    </p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-4 border-t">
                <Button 
                  onClick={() => handleDownloadReport(selectedReport)}
                  disabled={downloading === selectedReport.id}
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white"
                >
                  {downloading === selectedReport.id ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Downloading...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 mr-2" />
                      Download Report
                    </>
                  )}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setViewDialogOpen(false)}
                  className="flex-1"
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
