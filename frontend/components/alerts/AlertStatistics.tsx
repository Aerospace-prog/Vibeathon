"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, TrendingUp, Clock, Activity } from 'lucide-react'

interface AlertData {
  symptom_text: string
  symptom_type: string
  severity_score: number
  timestamp: string
}

interface AlertStatisticsProps {
  alerts: AlertData[]
  totalAnalyses: number
}

export default function AlertStatistics({ alerts, totalAnalyses }: AlertStatisticsProps) {
  const criticalAlerts = alerts.filter(a => a.severity_score >= 5).length
  const urgentAlerts = alerts.filter(a => a.severity_score === 4).length
  const warningAlerts = alerts.filter(a => a.severity_score === 3).length
  
  const detectionRate = totalAnalyses > 0 
    ? ((alerts.length / totalAnalyses) * 100).toFixed(1)
    : '0.0'

  const avgSeverity = alerts.length > 0
    ? (alerts.reduce((sum, a) => sum + a.severity_score, 0) / alerts.length).toFixed(1)
    : '0.0'

  const symptomTypes = alerts.reduce((acc, alert) => {
    acc[alert.symptom_type] = (acc[alert.symptom_type] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const mostCommon = Object.entries(symptomTypes).sort((a, b) => b[1] - a[1])[0]

  const stats = [
    {
      label: 'Total Alerts',
      value: alerts.length,
      icon: AlertCircle,
      color: 'text-blue-500',
    },
    {
      label: 'Detection Rate',
      value: `${detectionRate}%`,
      icon: TrendingUp,
      color: 'text-green-500',
    },
    {
      label: 'Avg Severity',
      value: avgSeverity,
      icon: Activity,
      color: 'text-orange-500',
    },
    {
      label: 'Total Analyses',
      value: totalAnalyses,
      icon: Clock,
      color: 'text-purple-500',
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>📊 Detection Statistics</CardTitle>
        <CardDescription>
          Real-time metrics from your testing session
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Main Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center gap-2">
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
                <span className="text-xs text-muted-foreground">{stat.label}</span>
              </div>
              <div className="text-2xl font-bold">{stat.value}</div>
            </div>
          ))}
        </div>

        {/* Severity Breakdown */}
        <div className="space-y-2">
          <h4 className="text-sm font-semibold">Severity Breakdown</h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">Critical (5)</span>
              <div className="flex items-center gap-2">
                <div className="w-32 bg-secondary rounded-full h-2">
                  <div
                    className="bg-red-500 h-2 rounded-full transition-all"
                    style={{
                      width: alerts.length > 0 ? `${(criticalAlerts / alerts.length) * 100}%` : '0%',
                    }}
                  />
                </div>
                <span className="text-sm font-medium w-8 text-right">{criticalAlerts}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Urgent (4)</span>
              <div className="flex items-center gap-2">
                <div className="w-32 bg-secondary rounded-full h-2">
                  <div
                    className="bg-orange-500 h-2 rounded-full transition-all"
                    style={{
                      width: alerts.length > 0 ? `${(urgentAlerts / alerts.length) * 100}%` : '0%',
                    }}
                  />
                </div>
                <span className="text-sm font-medium w-8 text-right">{urgentAlerts}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Warning (3)</span>
              <div className="flex items-center gap-2">
                <div className="w-32 bg-secondary rounded-full h-2">
                  <div
                    className="bg-yellow-500 h-2 rounded-full transition-all"
                    style={{
                      width: alerts.length > 0 ? `${(warningAlerts / alerts.length) * 100}%` : '0%',
                    }}
                  />
                </div>
                <span className="text-sm font-medium w-8 text-right">{warningAlerts}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Most Common Symptom */}
        {mostCommon && (
          <div className="border-t pt-4">
            <h4 className="text-sm font-semibold mb-2">Most Detected Symptom</h4>
            <div className="flex items-center justify-between bg-muted rounded-lg p-3">
              <span className="font-medium">
                {mostCommon[0].replace('_', ' ').toUpperCase()}
              </span>
              <span className="text-2xl font-bold">{mostCommon[1]}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
