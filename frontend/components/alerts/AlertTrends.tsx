"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, AlertTriangle, Activity } from 'lucide-react'

interface AlertData {
  symptom_text: string
  symptom_type: string
  severity_score: number
  timestamp: string
}

interface AlertTrendsProps {
  alerts: AlertData[]
}

export default function AlertTrends({ alerts }: AlertTrendsProps) {
  // Calculate trends
  const last24Hours = alerts.filter(a => {
    const alertTime = new Date(a.timestamp).getTime()
    const now = Date.now()
    return (now - alertTime) < 24 * 60 * 60 * 1000
  })

  const criticalAlerts = alerts.filter(a => a.severity_score >= 4)
  const avgSeverity = alerts.length > 0
    ? (alerts.reduce((sum, a) => sum + a.severity_score, 0) / alerts.length).toFixed(1)
    : '0'

  const symptomBreakdown = alerts.reduce((acc, alert) => {
    acc[alert.symptom_type] = (acc[alert.symptom_type] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const mostCommon = Object.entries(symptomBreakdown)
    .sort(([, a], [, b]) => b - a)[0]

  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <TrendingUp className="w-4 h-4" />
          Alert Trends & Insights
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-medium text-blue-600">Last 24h</span>
            </div>
            <div className="text-2xl font-bold text-blue-700 dark:text-blue-400">
              {last24Hours.length}
            </div>
            <div className="text-xs text-blue-600/70">alerts detected</div>
          </div>

          <div className="p-4 bg-red-50 dark:bg-red-950/30 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              <span className="text-xs font-medium text-red-600">Critical</span>
            </div>
            <div className="text-2xl font-bold text-red-700 dark:text-red-400">
              {criticalAlerts.length}
            </div>
            <div className="text-xs text-red-600/70">high severity</div>
          </div>

          <div className="p-4 bg-amber-50 dark:bg-amber-950/30 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-amber-600" />
              <span className="text-xs font-medium text-amber-600">Avg Severity</span>
            </div>
            <div className="text-2xl font-bold text-amber-700 dark:text-amber-400">
              {avgSeverity}
            </div>
            <div className="text-xs text-amber-600/70">out of 5.0</div>
          </div>

          <div className="p-4 bg-purple-50 dark:bg-purple-950/30 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-4 h-4 text-purple-600" />
              <span className="text-xs font-medium text-purple-600">Most Common</span>
            </div>
            <div className="text-sm font-bold text-purple-700 dark:text-purple-400 truncate">
              {mostCommon ? mostCommon[0].replace('_', ' ') : 'N/A'}
            </div>
            <div className="text-xs text-purple-600/70">
              {mostCommon ? `${mostCommon[1]} times` : 'no data'}
            </div>
          </div>
        </div>

        {/* Symptom Breakdown */}
        <div className="mt-4 space-y-2">
          <h4 className="text-sm font-semibold">Symptom Distribution</h4>
          {Object.entries(symptomBreakdown).map(([type, count]) => {
            const percentage = ((count / alerts.length) * 100).toFixed(0)
            return (
              <div key={type} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="capitalize">{type.replace('_', ' ')}</span>
                  <span className="font-medium">{count} ({percentage}%)</span>
                </div>
                <div className="h-2 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-teal-500 to-cyan-600 transition-all"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
