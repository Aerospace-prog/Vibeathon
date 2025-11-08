'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Upload, FileText, Image as ImageIcon, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface LabReportUploadProps {
  patientId: string
  onUploadSuccess?: (analysis: any) => void
}

export function LabReportUpload({ patientId, onUploadSuccess }: LabReportUploadProps) {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0])
    }
  }

  const handleFileSelect = (selectedFile: File) => {
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png']
    
    if (!allowedTypes.includes(selectedFile.type)) {
      toast.error('Please upload a PDF or image file (JPG, PNG)')
      return
    }

    if (selectedFile.size > 10 * 1024 * 1024) { // 10MB limit
      toast.error('File size must be less than 10MB')
      return
    }

    setFile(selectedFile)
  }

  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select a file first')
      return
    }

    setUploading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('patient_id', patientId)

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/lab-reports/upload`, {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.detail || 'Upload failed')
      }

      toast.success('Lab report analyzed successfully!')
      setFile(null)
      
      if (onUploadSuccess) {
        onUploadSuccess(data.analysis)
      }

    } catch (error: any) {
      console.error('Upload error:', error)
      toast.error(error.message || 'Failed to upload lab report')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="relative group">
      <div className="absolute inset-0 bg-gradient-to-r from-teal-500/20 to-cyan-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500" />
      <Card className="relative border-2 border-white/20 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl shadow-2xl hover:shadow-teal-500/20 transition-all duration-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Upload className="h-6 w-6 text-teal-600 dark:text-teal-400" />
            Upload Lab Report
          </CardTitle>
          <CardDescription className="text-base">
            Upload your lab report (PDF or image) for AI-powered analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
        <div
          className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
            dragActive 
              ? 'border-teal-500 bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-teal-950/50 dark:to-cyan-950/50 scale-105' 
              : 'border-gray-300 dark:border-gray-700 hover:border-teal-400 dark:hover:border-teal-600'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          {!file ? (
            <>
              <div className="relative inline-block mb-4">
                <div className="absolute inset-0 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-full blur-md opacity-50 animate-pulse" />
                <div className="relative bg-gradient-to-br from-teal-500 to-cyan-600 p-4 rounded-full">
                  <Upload className="h-12 w-12 text-white" />
                </div>
              </div>
              <p className="text-base font-medium text-gray-700 dark:text-gray-300 mb-2">
                Drag and drop your lab report here
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Supports PDF, JPG, PNG (max 10MB)
              </p>
              <input
                type="file"
                id="file-upload"
                className="hidden"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => e.target.files && handleFileSelect(e.target.files[0])}
              />
              <label htmlFor="file-upload">
                <Button variant="outline" asChild className="border-teal-300 dark:border-teal-700 hover:bg-teal-50 dark:hover:bg-teal-950/30">
                  <span>Browse Files</span>
                </Button>
              </label>
            </>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-2">
                {file.type === 'application/pdf' ? (
                  <FileText className="h-8 w-8 text-red-500" />
                ) : (
                  <ImageIcon className="h-8 w-8 text-blue-500" />
                )}
                <div className="text-left">
                  <p className="font-medium">{file.name}</p>
                  <p className="text-sm text-gray-500">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <div className="flex gap-2 justify-center">
                <Button
                  onClick={handleUpload}
                  disabled={uploading}
                  className="bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white shadow-lg shadow-teal-500/30 hover:shadow-xl hover:shadow-teal-500/40 transition-all"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Upload & Analyze
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setFile(null)}
                  disabled={uploading}
                  className="border-gray-300 dark:border-gray-700"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
    </div>
  )
}
