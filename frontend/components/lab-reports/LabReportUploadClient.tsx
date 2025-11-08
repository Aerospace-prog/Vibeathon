'use client'

import { useState } from 'react'
import { LabReportUpload } from './LabReportUpload'
import { LabReportResults } from './LabReportResults'

interface LabReportUploadClientProps {
  patientId: string
}

export function LabReportUploadClient({ patientId }: LabReportUploadClientProps) {
  const [analysis, setAnalysis] = useState<any>(null)

  const handleUploadSuccess = (analysisData: any) => {
    setAnalysis(analysisData)
  }

  return (
    <>
      <LabReportUpload 
        patientId={patientId}
        onUploadSuccess={handleUploadSuccess}
      />

      {analysis && (
        <LabReportResults analysis={analysis} />
      )}
    </>
  )
}
