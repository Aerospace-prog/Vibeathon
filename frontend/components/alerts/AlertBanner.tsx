"use client"

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { AlertCircle, X } from 'lucide-react'
import { useState, useEffect } from 'react'

interface AlertData {
  id?: string
  symptom_text: string
  symptom_type: string
  severity_score: number
  timestamp: string
}

interface AlertBannerProps {
  alert: AlertData
  onAcknowledge?: (alertId?: string) => void
  autoHide?: boolean
  autoHideDelay?: number
}

export default function AlertBanner({
  alert,
  onAcknowledge,
  autoHide = false,
  autoHideDelay = 10000,
}: AlertBannerProps) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    if (autoHide) {
      const timer = setTimeout(() => {
        handleAcknowledge()
      }, autoHideDelay)
      return () => clearTimeout(timer)
    }
  }, [autoHide, autoHideDelay])

  const handleAcknowledge = () => {
    setIsVisible(false)
    if (onAcknowledge) {
      onAcknowledge(alert.id)
    }
  }

  const getSeverityColor = (severity: number) => {
    if (severity >= 5) return 'bg-red-100 border-red-600 text-red-900'
    if (severity >= 3) return 'bg-orange-100 border-orange-600 text-orange-900'
    return 'bg-yellow-100 border-yellow-600 text-yellow-900'
  }

  const getSeverityAnimation = (severity: number) => {
    if (severity >= 5) return 'animate-pulse'
    return ''
  }

  if (!isVisible) return null

  return (
    <div className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-2xl px-4 ${getSeverityAnimation(alert.severity_score)}`}>
      <Alert className={`${getSeverityColor(alert.severity_score)} border-2 shadow-2xl`}>
        <AlertCircle className="h-5 w-5" />
        <AlertTitle className="text-lg font-bold flex items-center justify-between pr-8">
          <span className="flex items-center gap-2">
            🚨 CRITICAL MEDICAL ALERT
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-black/10">
              Severity: {alert.severity_score}/5
            </span>
          </span>
        </AlertTitle>
        <AlertDescription className="mt-3 space-y-2">
          <div>
            <strong>Symptom:</strong>{' '}
            {alert.symptom_type.replace('_', ' ').toUpperCase()}
          </div>
          <div>
            <strong>Patient said:</strong> "{alert.symptom_text}"
          </div>
          <div className="flex gap-2 mt-4">
            <Button
              onClick={handleAcknowledge}
              size="sm"
              className="bg-white text-black hover:bg-gray-100"
            >
              Acknowledge
            </Button>
          </div>
        </AlertDescription>
        <button
          onClick={handleAcknowledge}
          className="absolute top-4 right-4 text-current hover:opacity-70"
        >
          <X className="h-4 w-4" />
        </button>
      </Alert>
    </div>
  )
}
