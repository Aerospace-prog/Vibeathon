"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react'
import AlertHistory from './AlertHistory'
import LiveSimulation from './LiveSimulation'
import AlertStatistics from './AlertStatistics'
import { Toast } from '@/components/ui/toast'

interface AlertData {
  symptom_text: string
  symptom_type: string
  severity_score: number
  timestamp: string
}

interface AnalysisResult {
  alert_detected: boolean
  alert: AlertData | null
  message: string
}

const EXAMPLE_PHRASES = [
  { text: "I have severe chest pain that started suddenly", label: "Chest Pain (Critical)" },
  { text: "I can't breathe properly", label: "Breathing Issue (Critical)" },
  { text: "I passed out earlier today", label: "Loss of Consciousness" },
  { text: "I'm feeling suicidal", label: "Mental Health Crisis" },
  { text: "I have a mild headache", label: "Mild Symptom (No Alert)" },
  { text: "The patient looks fine to me", label: "Doctor Speech (No Alert)" },
]

export default function AlertEngineTest() {
  const [consultationId, setConsultationId] = useState('test-consultation-001')
  const [speakerType, setSpeakerType] = useState<'patient' | 'doctor'>('patient')
  const [transcript, setTranscript] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [serverStatus, setServerStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking')
  const [alertHistory, setAlertHistory] = useState<AlertData[]>([])
  const [totalAnalyses, setTotalAnalyses] = useState(0)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null)

  // Check server connection on mount
  useEffect(() => {
    checkServerConnection()
  }, [])

  const checkServerConnection = async () => {
    try {
      const response = await fetch('http://localhost:8000/')
      if (response.ok) {
        setServerStatus('connected')
      } else {
        setServerStatus('disconnected')
      }
    } catch (error) {
      setServerStatus('disconnected')
    }
  }

  const analyzeTranscript = async () => {
    if (!transcript.trim()) {
      setToast({ message: 'Please enter some text to analyze', type: 'error' })
      return
    }

    setIsAnalyzing(true)
    setResult(null)
    setToast({ message: 'Analyzing transcript...', type: 'info' })

    try {
      const response = await fetch('http://localhost:8000/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: transcript,
          consultation_id: consultationId,
          speaker_type: speakerType,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to analyze transcript')
      }

      const data: AnalysisResult = await response.json()
      
      // Update total analyses count FIRST (before setting result)
      setTotalAnalyses(prev => prev + 1)
      
      // Add to history if alert detected
      if (data.alert_detected && data.alert) {
        setAlertHistory(prev => [...prev, data.alert!])
        setToast({ 
          message: `Critical alert detected: ${data.alert.symptom_type.replace('_', ' ')}`, 
          type: 'error' 
        })
      } else {
        setToast({ message: 'Analysis complete - No critical symptoms detected', type: 'success' })
      }
      
      // Set result LAST to trigger re-render with updated stats
      setResult(data)
    } catch (error) {
      setResult({
        alert_detected: false,
        alert: null,
        message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}. Make sure the backend server is running.`,
      })
      setToast({ 
        message: 'Analysis failed. Check if backend server is running.', 
        type: 'error' 
      })
    } finally {
      setIsAnalyzing(false)
    }
  }

  const setExample = (text: string) => {
    setTranscript(text)
    setSpeakerType('patient')
    setToast({ message: 'Example loaded! Click Analyze to test.', type: 'info' })
  }

  const getSeverityColor = (severity: number) => {
    if (severity >= 5) return 'bg-red-100 border-red-500 text-red-900'
    if (severity >= 3) return 'bg-orange-100 border-orange-500 text-orange-900'
    return 'bg-green-100 border-green-500 text-green-900'
  }

  const getSeverityAction = (severity: number) => {
    if (severity === 5) return 'IMMEDIATE medical attention required. Consider emergency services.'
    if (severity === 4) return 'Urgent medical attention needed. Prioritize this patient.'
    if (severity === 3) return 'Medical attention recommended. Monitor closely.'
    return 'Continue normal consultation.'
  }

  const clearHistory = () => {
    setAlertHistory([])
    setTotalAnalyses(0)
    setResult(null)
    setToast({ message: 'History cleared successfully', type: 'success' })
  }

  return (
    <div className="space-y-6">
      {/* Server Status */}
      <Alert className={`${serverStatus === 'connected' ? 'bg-green-50 border-green-500' : 'bg-red-50 border-red-500'} transition-all duration-300`}>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>
          {serverStatus === 'checking' && '⏳ Checking server connection...'}
          {serverStatus === 'connected' && '✅ Connected to Alert Engine API'}
          {serverStatus === 'disconnected' && '❌ Server not running'}
        </AlertTitle>
        {serverStatus === 'disconnected' && (
          <AlertDescription>
            Start the backend server: <code className="text-xs bg-black/10 px-2 py-1 rounded">cd backend && ./start_server.sh</code>
          </AlertDescription>
        )}
      </Alert>
      
      {/* Statistics Dashboard */}
      <AlertStatistics alerts={alertHistory} totalAnalyses={totalAnalyses} />

      {/* Input Form */}
      <Card className="border-2 hover:border-primary/50 transition-colors">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
          <CardTitle className="flex items-center gap-2">
            🔬 Test Alert Engine
          </CardTitle>
          <CardDescription>
            Enter patient or doctor speech to test real-time critical symptom detection
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                📋 Consultation ID
              </label>
              <Input
                value={consultationId}
                onChange={(e) => setConsultationId(e.target.value)}
                placeholder="Enter consultation ID"
                className="transition-all focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                👤 Speaker Type
              </label>
              <select
                value={speakerType}
                onChange={(e) => setSpeakerType(e.target.value as 'patient' | 'doctor')}
                className="w-full h-10 px-3 rounded-md border border-input bg-background transition-all focus:ring-2 focus:ring-primary focus:outline-none"
              >
                <option value="patient">🤒 Patient</option>
                <option value="doctor">👨‍⚕️ Doctor</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              💬 Patient/Doctor Speech
            </label>
            <Textarea
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              placeholder="Type what the patient or doctor is saying... Try phrases like 'I have severe chest pain' or 'I can't breathe properly'"
              rows={4}
              className="transition-all focus:ring-2 focus:ring-primary resize-none"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{transcript.length} characters</span>
              <span>{transcript.trim().split(/\s+/).filter(Boolean).length} words</span>
            </div>
          </div>

          <Button
            onClick={analyzeTranscript}
            disabled={isAnalyzing || serverStatus !== 'connected' || !transcript.trim()}
            className="w-full h-12 text-base font-semibold transition-all hover:scale-[1.02] active:scale-[0.98]"
            size="lg"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Analyzing Transcript...
              </>
            ) : (
              <>
                🔍 Analyze for Critical Symptoms
              </>
            )}
          </Button>
          
          {!transcript.trim() && (
            <p className="text-xs text-center text-muted-foreground">
              Enter some text above to enable analysis
            </p>
          )}
        </CardContent>
      </Card>

      {/* Live Simulation */}
      <LiveSimulation
        onTranscriptUpdate={setTranscript}
        onAutoAnalyze={analyzeTranscript}
      />

      {/* Example Phrases */}
      <Card className="border-2">
        <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950 dark:to-orange-950">
          <CardTitle className="text-base flex items-center gap-2">
            💡 Try These Examples
          </CardTitle>
          <CardDescription>
            Click any example to auto-fill the text area
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-2">
            {EXAMPLE_PHRASES.map((example, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => setExample(example.text)}
                className="transition-all hover:scale-105 hover:shadow-md active:scale-95"
              >
                {example.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {result && (
        <Card className="border-2 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              📊 Analysis Result
            </CardTitle>
          </CardHeader>
          <CardContent>
            {result.alert_detected && result.alert ? (
              <Alert className={`${getSeverityColor(result.alert.severity_score)} border-2 animate-in fade-in zoom-in-95 duration-300`}>
                <AlertCircle className={`h-5 w-5 ${result.alert.severity_score >= 5 ? 'animate-pulse' : ''}`} />
                <AlertTitle className="text-lg font-bold flex items-center gap-2 flex-wrap">
                  🚨 CRITICAL ALERT DETECTED
                  <span className="text-xs font-semibold px-3 py-1 rounded-full bg-black/10">
                    Severity: {result.alert.severity_score}/5
                  </span>
                </AlertTitle>
                <AlertDescription className="mt-3 space-y-3">
                  <div className="flex items-start gap-2">
                    <span className="font-semibold min-w-[120px]">Symptom Type:</span>
                    <span className="font-medium">
                      {result.alert.symptom_type.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="font-semibold min-w-[120px]">Detected Text:</span>
                    <span className="italic">"{result.alert.symptom_text}"</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="font-semibold min-w-[120px]">Timestamp:</span>
                    <span>{new Date(result.alert.timestamp).toLocaleString()}</span>
                  </div>
                  <div className="pt-3 border-t border-current/20">
                    <div className="flex items-start gap-2">
                      <span className="font-semibold min-w-[120px]">Action Required:</span>
                      <span className="font-medium">
                        {getSeverityAction(result.alert.severity_score)}
                      </span>
                    </div>
                  </div>
                </AlertDescription>
              </Alert>
            ) : (
              <Alert className="bg-green-50 border-green-500 text-green-900 border-2 animate-in fade-in zoom-in-95 duration-300">
                <CheckCircle2 className="h-5 w-5" />
                <AlertTitle className="text-lg font-bold">
                  ✅ No Critical Symptoms Detected
                </AlertTitle>
                <AlertDescription className="mt-2 space-y-2">
                  <div className="font-medium">{result.message}</div>
                  <div className="text-sm opacity-90">
                    The transcript was analyzed and no critical medical symptoms requiring
                    immediate attention were found.
                  </div>
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* Alert History */}
      <AlertHistory alerts={alertHistory} onClear={clearHistory} />
      
      {/* Toast Notifications */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  )
}
