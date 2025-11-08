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
          <Card className="border-purple-200/50 dark:border-purple-800/50 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30">
              <CardTitle className="flex items-center gap-2 text-purple-900 dark:text-purple-100">
                <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg">
                  <ImageIcon className="w-5 h-5 text-white" />
                </div>
                AI Medical Image Analysis
              </CardTitle>
              <p className="text-sm text-purple-600 dark:text-purple-400 mt-2">
                Upload a photo for instant AI-powered preliminary assessment
              </p>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              {/* File Upload */}
              {!preview ? (
                <div
                  onDrop={handleDrop}
                  onDragOver={(e) => e.preventDefault()}
                  className="relative border-2 border-dashed border-purple-300 dark:border-purple-700 rounded-xl p-12 text-center hover:border-purple-500 hover:bg-purple-50/50 dark:hover:bg-purple-950/20 transition-all duration-300 cursor-pointer group"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                    className="hidden"
                  />
                  <div className="relative flex flex-col items-center gap-4">
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full blur-xl opacity-50 animate-pulse" />
                      <div className="relative p-6 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full shadow-lg">
                        <Camera className="w-10 h-10 text-white" />
                      </div>
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-1">
                        Take a photo or upload image
                      </p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        PNG, JPG up to 10MB • Supports skin conditions, wounds, rashes
                      </p>
                    </div>
                    <Button type="button" className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white shadow-lg">
                      <Upload className="w-4 h-4 mr-2" />
                      Choose File
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl blur-xl" />
                  <div className="relative border-2 border-purple-200 dark:border-purple-800 rounded-xl overflow-hidden shadow-xl">
                    <img
                      src={preview}
                      alt="Preview"
                      className="w-full max-h-96 object-contain bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <Button
                    onClick={reset}
                    variant="destructive"
                    size="sm"
                    className="absolute top-3 right-3 shadow-lg"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                  <div className="absolute bottom-3 left-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-lg">
                    <p className="text-xs font-medium text-slate-700 dark:text-slate-300">
                      ✓ Image ready for analysis
                    </p>
                  </div>
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
                    className="w-full h-12 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 text-base font-semibold"
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        {analyzing ? '🤖 AI is analyzing your image...' : 'Uploading...'}
                      </>
                    ) : (
                      <>
                        <Upload className="w-5 h-5 mr-2" />
                        Upload & Analyze with AI
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
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Success Header */}
      <Card className="border-green-200/50 dark:border-green-800/50 shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-green-500 rounded-full blur-lg opacity-50 animate-pulse" />
                <div className="relative p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full">
                  <CheckCircle2 className="w-6 h-6 text-white" />
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-green-900 dark:text-green-100">
                  AI Analysis Complete
                </h2>
                <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                  Powered by Google Gemini Vision AI
                </p>
              </div>
            </div>
            <Button onClick={onReset} variant="outline" className="border-green-300 hover:bg-green-50 dark:hover:bg-green-950/30">
              Upload Another
            </Button>
          </div>
        </div>
      </Card>

      <div className="grid gap-6">
        {/* Visual Description */}
        <Card className="border-blue-200/50 dark:border-blue-800/50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <ImageIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-2 text-blue-900 dark:text-blue-100">What We See:</h3>
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  {analysisData.visual_description}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Severity */}
        <Card className="border-slate-200/50 dark:border-slate-800/50">
          <CardContent className="pt-6">
            <h3 className="font-semibold text-lg mb-3">Severity Assessment:</h3>
            <div className="flex items-center gap-3 mb-3">
              <div className={`px-4 py-2 rounded-full text-sm font-bold shadow-md ${getSeverityColor(analysisData.severity)}`}>
                {analysisData.severity?.toUpperCase()}
              </div>
            </div>
            {analysisData.severity_reasoning && (
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed bg-slate-50 dark:bg-slate-900 p-3 rounded-lg">
                {analysisData.severity_reasoning}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Possible Conditions */}
        {analysisData.possible_conditions && analysisData.possible_conditions.length > 0 && (
          <Card className="border-purple-200/50 dark:border-purple-800/50">
            <CardContent className="pt-6">
              <h3 className="font-semibold text-lg mb-4 text-purple-900 dark:text-purple-100">Possible Conditions:</h3>
              <div className="space-y-3">
                {analysisData.possible_conditions.map((condition: any, index: number) => (
                  <div key={index} className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 rounded-xl border border-purple-200 dark:border-purple-800 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-purple-900 dark:text-purple-100">{index + 1}. {condition.name}</span>
                      <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                        condition.likelihood === 'high' ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' :
                        condition.likelihood === 'medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300' :
                        'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                      }`}>
                        {condition.likelihood} likelihood
                      </span>
                    </div>
                    <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                      {condition.reasoning}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Red Flags */}
        {analysisData.red_flags && analysisData.red_flags.length > 0 && (
          <Card className="border-red-300 dark:border-red-800 shadow-lg">
            <CardContent className="pt-6">
              <div className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950/30 dark:to-orange-950/30 p-5 rounded-xl border-2 border-red-200 dark:border-red-800">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-red-500 rounded-lg animate-pulse">
                    <AlertCircle className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-bold text-lg text-red-700 dark:text-red-400">
                    ⚠️ Warning Signs - Watch For:
                  </h3>
                </div>
                <ul className="space-y-2">
                  {analysisData.red_flags.map((flag: string, index: number) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-red-700 dark:text-red-400">
                      <span className="text-red-500 font-bold mt-0.5">•</span>
                      <span className="flex-1 font-medium">{flag}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recommendations */}
        {analysisData.recommendations && (
          <Card className="border-teal-200/50 dark:border-teal-800/50">
            <CardContent className="pt-6">
              <h3 className="font-semibold text-lg mb-4 text-teal-900 dark:text-teal-100">Recommendations:</h3>
              <div className="space-y-4">
                {analysisData.recommendations.see_doctor_immediately && (
                  <div className="p-4 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950/30 dark:to-orange-950/30 border-2 border-red-300 dark:border-red-800 rounded-xl">
                    <p className="text-sm font-bold text-red-700 dark:text-red-400 flex items-center gap-2">
                      <AlertCircle className="w-5 h-5" />
                      ⚠️ Seek medical attention immediately
                    </p>
                  </div>
                )}
                {analysisData.recommendations.home_care && analysisData.recommendations.home_care.length > 0 && (
                  <div className="bg-teal-50 dark:bg-teal-950/30 p-4 rounded-xl">
                    <p className="text-sm font-semibold mb-3 text-teal-900 dark:text-teal-100">🏠 Home Care Instructions:</p>
                    <ul className="space-y-2">
                      {analysisData.recommendations.home_care.map((care: string, index: number) => (
                        <li key={index} className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                          <span className="text-teal-500 font-bold mt-0.5">✓</span>
                          <span className="flex-1">{care}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Questions for Doctor */}
        {analysisData.questions_for_doctor && analysisData.questions_for_doctor.length > 0 && (
          <Card className="border-indigo-200/50 dark:border-indigo-800/50">
            <CardContent className="pt-6">
              <h3 className="font-semibold text-lg mb-4 text-indigo-900 dark:text-indigo-100">💬 Questions to Ask Your Doctor:</h3>
              <ul className="space-y-3">
                {analysisData.questions_for_doctor.map((question: string, index: number) => (
                  <li key={index} className="flex items-start gap-3 p-3 bg-indigo-50 dark:bg-indigo-950/30 rounded-lg">
                    <span className="flex-shrink-0 w-6 h-6 bg-indigo-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                      {index + 1}
                    </span>
                    <span className="text-sm text-slate-700 dark:text-slate-300 flex-1">{question}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Disclaimer */}
        <Card className="border-amber-300 dark:border-amber-800 bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950/30 dark:to-yellow-950/30">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-amber-900 dark:text-amber-100 mb-1">
                  Important Medical Disclaimer
                </p>
                <p className="text-xs text-amber-700 dark:text-amber-400 leading-relaxed">
                  {analysisData.disclaimer || 'This is not a medical diagnosis. Please consult a healthcare professional.'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
