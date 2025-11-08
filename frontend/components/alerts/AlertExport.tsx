"use client"

import { Button } from '@/components/ui/button'
import { Download, FileJson, FileSpreadsheet } from 'lucide-react'

interface AlertData {
  symptom_text: string
  symptom_type: string
  severity_score: number
  timestamp: string
}

interface AlertExportProps {
  alerts: AlertData[]
}

export default function AlertExport({ alerts }: AlertExportProps) {
  const exportToCSV = () => {
    if (alerts.length === 0) return

    const headers = ['Timestamp', 'Symptom Type', 'Severity', 'Text']
    const rows = alerts.map(alert => [
      new Date(alert.timestamp).toLocaleString(),
      alert.symptom_type.replace('_', ' '),
      alert.severity_score,
      `"${alert.symptom_text}"`
    ])

    const csv = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `alerts-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const exportToJSON = () => {
    if (alerts.length === 0) return

    const json = JSON.stringify(alerts, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `alerts-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={exportToCSV}
        disabled={alerts.length === 0}
        className="gap-2"
      >
        <FileSpreadsheet className="w-4 h-4" />
        Export CSV
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={exportToJSON}
        disabled={alerts.length === 0}
        className="gap-2"
      >
        <FileJson className="w-4 h-4" />
        Export JSON
      </Button>
    </div>
  )
}
