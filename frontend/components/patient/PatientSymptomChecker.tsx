"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle, CheckCircle2, Loader2, Heart, Activity, Phone, Calendar } from 'lucide-react'

interface AlertData {
  symptom_text: string
  symptom_type: string
  severity_score: number
  timestamp: string
  ai_analysis?: string
  recommendations?: string
}

interface AnalysisResult {
  alert_detected: boolean
  alert: AlertData | null
  message: string
}

interface PatientSymptomCheckerProps {
  onBookAppointment?: (symptomCategory: string, severity: number) => void
}

const COMMON_SYMPTOMS = [
  "I have chest pain",
  "I'm having trouble breathing",
  "I feel dizzy and lightheaded",
  "I have a severe headache",
  "I'm experiencing heart palpitations"
]

export default function PatientSymptomChecker({ onBookAppointment }: PatientSymptomCheckerProps) {
  const [symptoms, setSymptoms] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [serverStatus, setServerStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking')

  useEffect(() => {
    checkServerConnection()
  }, [])

  const checkServerConnection = async () => {
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'
      const response = await fetch(`${backendUrl}/`)
      if (response.ok) {
        setServerStatus('connected')
      } else {
        setServerStatus('disconnected')
      }
    } catch (error) {
      setServerStatus('disconnected')
    }
  }

  const analyzeSymptoms = async () => {
    if (!symptoms.trim()) return

    setIsAnalyzing(true)
    setResult(null)

    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'
      const response = await fetch(`${backendUrl}/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: symptoms,
          consultation_id: `patient-${Date.now()}`,
          speaker_type: 'patient',
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to analyze symptoms')
      }

      const data: AnalysisResult = await response.json()
      setResult(data)
    } catch (error) {
      setResult({
        alert_detected: false,
        alert: null,
        message: 'Unable to analyze symptoms. Please try again or contact your doctor.',
      })
    } finally {
      setIsAnalyzing(false)
    }
  }

  const getSeverityMessage = (severity: number) => {
    if (severity === 5) return {
      title: '🚨 URGENT - Seek Immediate Medical Attention',
      message: 'Your symptoms may require emergency care. Please call emergency services or go to the nearest emergency room immediately.',
      action: 'Call Emergency Services',
      color: 'bg-red-100 border-red-500 text-red-900 dark:bg-red-950/50 dark:text-red-100'
    }
    if (severity === 4) return {
      title: '⚠️ Important - Schedule Urgent Consultation',
      message: 'Your symptoms need medical attention. Please schedule an appointment with a doctor as soon as possible.',
      action: 'Schedule Urgent Consultation',
      color: 'bg-orange-100 border-orange-500 text-orange-900 dark:bg-orange-950/50 dark:text-orange-100'
    }
    if (severity === 3) return {
      title: '💡 Attention - Monitor Your Symptoms',
      message: 'Your symptoms should be monitored. Consider scheduling a consultation with your doctor if they persist or worsen.',
      action: 'Schedule Consultation',
      color: 'bg-yellow-100 border-yellow-500 text-yellow-900 dark:bg-yellow-950/50 dark:text-yellow-100'
    }
    return {
      title: '✓ Noted - Continue Monitoring',
      message: 'Your symptoms have been noted. Continue to monitor how you feel and consult a doctor if anything changes.',
      action: 'Continue Monitoring',
      color: 'bg-blue-100 border-blue-500 text-blue-900 dark:bg-blue-950/50 dark:text-blue-100'
    }
  }

  const handleScheduleConsultation = (symptomCategory: string, severity: number) => {
    if (onBookAppointment) {
      onBookAppointment(symptomCategory, severity)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-teal-500/20 to-cyan-500/20 rounded-2xl blur-xl" />
        <Card className="relative border-2 border-white/20 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl shadow-2xl">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-xl blur-md opacity-50 animate-pulse" />
                <div className="relative bg-gradient-to-br from-teal-500 to-cyan-600 p-3 rounded-xl shadow-lg">
                  <Heart className="w-6 h-6 text-white animate-heartbeat" />
                </div>
              </div>
              <div>
                <CardTitle className="text-2xl font-bold">How are you feeling?</CardTitle>
                <CardDescription className="text-base">
                  Describe your symptoms and we'll help assess if you need immediate care
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Server Status */}
            {serverStatus === 'disconnected' && (
              <Alert className="bg-red-50 border-red-500 dark:bg-red-950/50">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Service Unavailable</AlertTitle>
                <AlertDescription>
                  Unable to connect to symptom checker. Please contact your doctor directly.
                </AlertDescription>
              </Alert>
            )}

            {/* Symptom Input */}
            <div className="space-y-2">
              <label className="text-sm font-semibold flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Describe your symptoms
              </label>
              <Textarea
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                placeholder="Tell us what you're experiencing... For example: 'I have chest pain that started an hour ago' or 'I'm having difficulty breathing'"
                rows={5}
                className="resize-none border-2 focus:border-teal-500 transition-all"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{symptoms.length} characters</span>
                <span>{symptoms.trim().split(/\s+/).filter(Boolean).length} words</span>
              </div>
            </div>

            {/* Quick Symptom Buttons */}
            <div className="space-y-2">
              <label className="text-sm font-semibold">Quick select common symptoms:</label>
              <div className="flex flex-wrap gap-2">
                {COMMON_SYMPTOMS.map((symptom, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => setSymptoms(symptom)}
                    className="text-xs hover:bg-teal-50 dark:hover:bg-teal-950/30 hover:border-teal-500 transition-all"
                  >
                    {symptom}
                  </Button>
                ))}
              </div>
            </div>

            {/* Analyze Button */}
            <Button
              onClick={analyzeSymptoms}
              disabled={isAnalyzing || serverStatus !== 'connected' || !symptoms.trim()}
              className="w-full h-12 text-base font-semibold bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white shadow-lg hover:shadow-xl transition-all"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Analyzing your symptoms...
                </>
              ) : (
                <>
                  <Activity className="mr-2 h-5 w-5" />
                  Check My Symptoms
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Results */}
      {result && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          {result.alert_detected && result.alert ? (
            <Card className={`border-2 ${getSeverityMessage(result.alert.severity_score).color} shadow-2xl`}>
              <CardHeader>
                <div className="flex items-start gap-3">
                  {result.alert.severity_score >= 4 ? (
                    <AlertCircle className="h-6 w-6 animate-pulse" />
                  ) : (
                    <Activity className="h-6 w-6" />
                  )}
                  <div className="flex-1">
                    <AlertTitle className="text-xl font-bold mb-2">
                      {getSeverityMessage(result.alert.severity_score).title}
                    </AlertTitle>
                    <AlertDescription className="text-base space-y-4">
                      <p className="font-medium">
                        {getSeverityMessage(result.alert.severity_score).message}
                      </p>
                      
                      <div className="bg-white/50 dark:bg-slate-900/50 rounded-lg p-4 space-y-3">
                        <div>
                          <p className="text-sm font-semibold mb-1">Your Symptoms:</p>
                          <p className="italic text-sm">"{result.alert.symptom_text}"</p>
                        </div>
                        
                        {result.alert.ai_analysis && (
                          <div className="border-t border-current/20 pt-3">
                            <p className="text-sm font-semibold mb-1">🤖 AI Analysis:</p>
                            <p className="text-sm">{result.alert.ai_analysis}</p>
                          </div>
                        )}
                        
                        {result.alert.recommendations && (
                          <div className="border-t border-current/20 pt-3">
                            <p className="text-sm font-semibold mb-1">💡 Recommendations:</p>
                            <p className="text-sm font-medium">{result.alert.recommendations}</p>
                          </div>
                        )}
                        
                        <div className="border-t border-current/20 pt-3 grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="font-semibold">Category:</span>
                            <br />
                            <span className="capitalize">{result.alert.symptom_type.replace('_', ' ')}</span>
                          </div>
                          <div>
                            <span className="font-semibold">Severity:</span>
                            <br />
                            <span className="text-lg font-bold">{result.alert.severity_score}/5</span>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-col sm:flex-row gap-3 pt-2">
                        {result.alert.severity_score === 5 && (
                          <Button className="flex-1 bg-red-600 hover:bg-red-700 text-white gap-2">
                            <Phone className="w-4 h-4" />
                            Call Emergency: 911
                          </Button>
                        )}
                        {result.alert.severity_score >= 3 && (
                          <Button 
                            onClick={() => handleScheduleConsultation(result.alert!.symptom_type, result.alert!.severity_score)}
                            className={`flex-1 gap-2 ${
                              result.alert.severity_score >= 4 
                                ? 'bg-orange-600 hover:bg-orange-700 text-white' 
                                : 'bg-teal-600 hover:bg-teal-700 text-white'
                            }`}
                          >
                            <Calendar className="w-4 h-4" />
                            {result.alert.severity_score >= 4 ? 'Schedule Urgent Consultation' : 'Schedule Consultation'}
                          </Button>
                        )}
                      </div>
                    </AlertDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ) : (
            <Card className="border-2 bg-green-50 border-green-500 text-green-900 dark:bg-green-950/50 dark:text-green-100 shadow-xl">
              <CardHeader>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-6 w-6" />
                  <div>
                    <AlertTitle className="text-xl font-bold mb-2">
                      ✓ No Immediate Concerns Detected
                    </AlertTitle>
                    <AlertDescription className="text-base space-y-3">
                      <p className="font-medium">
                        Based on your description, no critical symptoms requiring immediate attention were detected.
                      </p>
                      <p className="text-sm">
                        However, if you're concerned about your symptoms or they worsen, please don't hesitate to schedule a consultation with a doctor.
                      </p>
                      <div className="flex gap-3 pt-2">
                        <Button 
                          onClick={() => handleScheduleConsultation('general', 2)}
                          variant="outline" 
                          className="flex-1 gap-2"
                        >
                          <Calendar className="w-4 h-4" />
                          Schedule Consultation
                        </Button>
                      </div>
                    </AlertDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          )}
        </div>
      )}

      {/* Disclaimer */}
      <Card className="border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
        <CardContent className="pt-6">
          <p className="text-xs text-slate-600 dark:text-slate-400 text-center">
            <strong>Important:</strong> This symptom checker is not a substitute for professional medical advice. 
            If you're experiencing a medical emergency, call emergency services immediately. 
            Always consult with a healthcare provider for proper diagnosis and treatment.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
