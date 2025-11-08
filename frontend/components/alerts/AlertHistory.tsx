"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'

interface AlertData {
  symptom_text: string
  symptom_type: string
  severity_score: number
  timestamp: string
}

interface AlertHistoryProps {
  alerts: AlertData[]
  onClear?: () => void
}

export default function AlertHistory({ alerts, onClear }: AlertHistoryProps) {
  const getSeverityColor = (severity: number) => {
    if (severity >= 5) return 'bg-red-500'
    if (severity >= 3) return 'bg-orange-500'
    return 'bg-yellow-500'
  }

  const getSeverityLabel = (severity: number) => {
    if (severity >= 5) return 'CRITICAL'
    if (severity >= 4) return 'URGENT'
    if (severity >= 3) return 'WARNING'
    return 'LOW'
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Alert History</CardTitle>
            <CardDescription>
              {alerts.length} alert{alerts.length !== 1 ? 's' : ''} detected in this session
            </CardDescription>
          </div>
          {alerts.length > 0 && onClear && (
            <button
              onClick={onClear}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Clear History
            </button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {alerts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No alerts detected yet. Try analyzing some patient speech.
          </div>
        ) : (
          <ScrollArea className="h-[300px] pr-4">
            <div className="space-y-3">
              {alerts.map((alert, index) => (
                <div
                  key={index}
                  className="border rounded-lg p-3 hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <Badge className={`${getSeverityColor(alert.severity_score)} text-white`}>
                      {getSeverityLabel(alert.severity_score)} - {alert.severity_score}/5
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(alert.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="text-sm">
                    <div className="font-semibold text-foreground mb-1">
                      {alert.symptom_type.replace('_', ' ').toUpperCase()}
                    </div>
                    <div className="text-muted-foreground">
                      "{alert.symptom_text}"
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  )
}
