'use client'

import { useState, useRef } from 'react'
import { Upload, Camera, X, Loader2, AlertCircle, CheckCircle2, Image as ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { supabase } from '@/lib/supabase'

interface MedicalImageUploadProps {
  appointmentId?: string
  onUploadComplete?: (imageId: string) => void
}

export default function MedicalImageUpload({ appointmentId, onUploadComplete }: MedicalImageUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  
  // Form fields
  const [bodyPart, setBodyPart] = useState('')
  const [symptoms, setSymptoms] = useState<string[]>([])
  const [symptomInput, setSymptomInput] = useState('')
  const [description, setDescription] = useState('')
  const [imageType, setImageType] = useState('skin_condition')
  
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file')
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('Image too large (max 10MB)')
      return
    }

    setSelectedFile(file)
    setPreview(URL.createObjectURL(file))
    setError(null)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) handleFileSelect(file)
  }

  const addSymptom = () => {
    if (symptomInput.trim() && !symptoms.includes(symptomInput.trim())) {
      setSymptoms([...symptoms, symptomInput.trim()])
      setSymptomInput('')
    }
  }

  const removeSymptom = (symptom: string) => {
    setSymptoms(symptoms.filter(s => s !== symptom))
  }

  const handleUpload = async () => {
    if (!selectedFile) return

    setUploading(true)
    setAnalyzing(true)
    setError(null)

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Prepare form data
      const formData = new FormData()
      formData.append('file', selectedFile)
      formData.append('patient_id', user.id)
      formData.append('body_part', bodyPart)
      formData.append('symptoms', JSON.stringify(symptoms))
      formData.append('patient_description', description)
      formData.append('image_type', imageType)
      if (appointmentId) {
        formData.append('appointment_id', appointmentId)
      }

      // Upload and analyze
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/medical-images/upload`, {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Upload failed')
      }

      const result = await response.json()
      console.log('Upload result:', result)
      console.log('AI Analysis:', result.ai_analysis)
      
      // Ensure ai_analysis is an object, not a string
      const analysisData = typeof result.ai_analysis === 'string' 
        ? JSON.parse(result.ai_analysis) 
        : result.ai_analysis
      
      setAnalysis(analysisData)
      
      if (onUploadComplete) {
        onUploadComplete(result.id)
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
      setAnalyzing(false)
    }
  }

  const reset = () => {
    setSelectedFile(null)
    setPreview(null)
    setAnalysis(null)
    setError(null)
    setBodyPart('')
    setSymptoms([])
    setDescription('')
    setImageType('skin_condition')
  }

  return (
    <div className="space-y-6">
      {!analysis ? (
        <>
          {/* Upload Area */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5" />
                Upload Medical Image
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* File Upload */}
              {!preview ? (
                <div
                  onDrop={handleDrop}
                  onDragOver={(e) => e.preventDefault()}
                  className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg p-8 text-center hover:border-teal-500 transition-colors cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                    className="hidden"
                  />
                  <div className="flex flex-col items-center gap-3">
                    <div className="p-4 bg-teal-50 dark:bg-teal-950 rounded-full">
                      <Camera className="w-8 h-8 text-teal-600" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900 dark:text-slate-100">
                        Take a photo or upload image
                      </p>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        PNG, JPG up to 10MB
                      </p>
                    </div>
                    <Button type="button" variant="outline" size="sm">
                      <Upload className="w-4 h-4 mr-2" />
                      Choose File
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="relative">
                  <img
                    src={preview}
                    alt="Preview"
                    className="w-full rounded-lg max-h-96 object-contain bg-slate-100 dark:bg-slate-900"
                  />
                  <Button
                    onClick={reset}
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              )}

              {preview && (
                <>
                  {/* Image Type */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Image Type</label>
                    <select
                      value={imageType}
                      onChange={(e) => setImageType(e.target.value)}
                      className="w-full p-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700"
                    >
                      <option value="skin_condition">Skin Condition</option>
                      <option value="wound">Wound</option>
                      <option value="rash">Rash</option>
                      <option value="burn">Burn</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  {/* Body Part */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Body Part</label>
                    <input
                      type="text"
                      value={bodyPart}
                      onChange={(e) => setBodyPart(e.target.value)}
                      placeholder="e.g., left arm, face, chest"
                      className="w-full p-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700"
                    />
                  </div>

                  {/* Symptoms */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Symptoms</label>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={symptomInput}
                        onChange={(e) => setSymptomInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSymptom())}
                        placeholder="e.g., itching, pain, swelling"
                        className="flex-1 p-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700"
                      />
                      <Button onClick={addSymptom} type="button" size="sm">
                        Add
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {symptoms.map((symptom) => (
                        <span
                          key={symptom}
                          className="px-3 py-1 bg-teal-100 dark:bg-teal-900 text-teal-700 dark:text-teal-300 rounded-full text-sm flex items-center gap-2"
                        >
                          {symptom}
                          <button onClick={() => removeSymptom(symptom)} className="hover:text-teal-900">
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Description</label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Describe what you're experiencing..."
                      rows={3}
                      className="w-full p-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700"
                    />
                  </div>

                  {/* Upload Button */}
                  <Button
                    onClick={handleUpload}
                    disabled={uploading}
                    className="w-full"
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        {analyzing ? 'Analyzing with AI...' : 'Uploading...'}
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 mr-2" />
                        Upload & Analyze
                      </>
                    )}
                  </Button>
                </>
              )}

              {/* Error */}
              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                </div>
              )}

              {/* Disclaimer */}
              <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg">
                <p className="text-xs text-amber-700 dark:text-amber-400">
                  ⚠️ <strong>Important:</strong> This AI analysis is for informational purposes only and is NOT a medical diagnosis. 
                  Always consult with a qualified healthcare professional for medical advice.
                </p>
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        /* Analysis Results */
        <AnalysisResults analysis={analysis} onReset={reset} />
      )}
    </div>
  )
}

function AnalysisResults({ analysis, onReset }: { analysis: any; onReset: () => void }) {
  // Parse analysis if it's a string
  const analysisData = typeof analysis === 'string' ? JSON.parse(analysis) : analysis
  
  const getSeverityColor = (severity: string) => {
    switch (severity?.toLowerCase()) {
      case 'mild': return 'text-green-600 bg-green-50 dark:bg-green-950'
      case 'moderate': return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-950'
      case 'severe': return 'text-red-600 bg-red-50 dark:bg-red-950'
      default: return 'text-slate-600 bg-slate-50 dark:bg-slate-950'
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            AI Analysis Complete
          </CardTitle>
          <Button onClick={onReset} variant="outline" size="sm">
            Upload Another
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Visual Description */}
        <div>
          <h3 className="font-semibold mb-2">What We See:</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {analysisData.visual_description}
          </p>
        </div>

        {/* Severity */}
        <div>
          <h3 className="font-semibold mb-2">Severity Assessment:</h3>
          <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getSeverityColor(analysisData.severity)}`}>
            {analysisData.severity?.toUpperCase()}
          </div>
          {analysisData.severity_reasoning && (
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
              {analysisData.severity_reasoning}
            </p>
          )}
        </div>

        {/* Possible Conditions */}
        {analysisData.possible_conditions && analysisData.possible_conditions.length > 0 && (
          <div>
            <h3 className="font-semibold mb-2">Possible Conditions:</h3>
            <div className="space-y-2">
              {analysisData.possible_conditions.map((condition: any, index: number) => (
                <div key={index} className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium">{condition.name}</span>
                    <span className="text-xs px-2 py-1 bg-slate-200 dark:bg-slate-800 rounded">
                      {condition.likelihood} likelihood
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {condition.reasoning}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Red Flags */}
        {analysisData.red_flags && analysisData.red_flags.length > 0 && (
          <div className="p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg">
            <h3 className="font-semibold text-red-700 dark:text-red-400 mb-2 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Warning Signs:
            </h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-red-600 dark:text-red-400">
              {analysisData.red_flags.map((flag: string, index: number) => (
                <li key={index}>{flag}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Recommendations */}
        {analysisData.recommendations && (
          <div>
            <h3 className="font-semibold mb-2">Recommendations:</h3>
            <div className="space-y-2">
              {analysisData.recommendations.see_doctor_immediately && (
                <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-sm font-medium text-red-700 dark:text-red-400">
                    ⚠️ Seek medical attention immediately
                  </p>
                </div>
              )}
              {analysisData.recommendations.home_care && analysisData.recommendations.home_care.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-1">Home Care:</p>
                  <ul className="list-disc list-inside space-y-1 text-sm text-slate-600 dark:text-slate-400">
                    {analysisData.recommendations.home_care.map((care: string, index: number) => (
                      <li key={index}>{care}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Questions for Doctor */}
        {analysisData.questions_for_doctor && analysisData.questions_for_doctor.length > 0 && (
          <div>
            <h3 className="font-semibold mb-2">Questions to Ask Your Doctor:</h3>
            <ul className="list-decimal list-inside space-y-1 text-sm text-slate-600 dark:text-slate-400">
              {analysisData.questions_for_doctor.map((question: string, index: number) => (
                <li key={index}>{question}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Disclaimer */}
        <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg">
          <p className="text-xs text-amber-700 dark:text-amber-400">
            {analysisData.disclaimer || 'This is not a medical diagnosis. Please consult a healthcare professional.'}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
