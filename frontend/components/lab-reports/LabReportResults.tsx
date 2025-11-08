'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertTriangle, CheckCircle, Info } from 'lucide-react'

interface LabValue {
  name: string
  value: string
  unit: string
  status: 'normal' | 'high' | 'low'
  normal_range?: string
}

interface AbnormalValue extends LabValue {
  explanation: string
  recommendation?: string
}

interface LabReportAnalysis {
  values: LabValue[]
  abnormal_values: AbnormalValue[]
  summary: string
  urgent_attention?: boolean
  urgent_message?: string
}

interface LabReportResultsProps {
  analysis: LabReportAnalysis
}

export function LabReportResults({ analysis }: LabReportResultsProps) {
  const hasAbnormalValues = analysis.abnormal_values && analysis.abnormal_values.length > 0

  return (
    <div className="space-y-6">
      {/* Urgent Alert */}
      {analysis.urgent_attention && (
        <div className="relative group">
          <div className="absolute inset-0 bg-red-500/20 rounded-xl blur-xl animate-pulse" />
          <Alert variant="destructive" className="relative border-2 border-red-500/50 bg-red-50/80 dark:bg-red-950/80 backdrop-blur-xl">
            <AlertTriangle className="h-5 w-5" />
            <AlertDescription className="text-base font-medium">
              {analysis.urgent_message || 'Some values require immediate medical attention. Please consult your doctor.'}
            </AlertDescription>
          </Alert>
        </div>
      )}

      {/* Summary */}
      <div className="relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-teal-500/20 to-cyan-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500" />
        <Card className="relative border-2 border-white/20 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
              Analysis Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg">{analysis.summary}</p>
          </CardContent>
        </Card>
      </div>

      {/* Abnormal Values */}
      {hasAbnormalValues && (
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500" />
          <Card className="relative border-2 border-orange-200/50 dark:border-orange-800/50 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center animate-pulse">
                  <AlertTriangle className="h-6 w-6 text-white" />
                </div>
                Values Requiring Attention
              </CardTitle>
              <CardDescription className="text-base">
                The following values are outside the normal range
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
            {analysis.abnormal_values.map((value, index) => (
              <div
                key={index}
                className={`relative p-6 border-2 rounded-xl transition-all hover:shadow-lg ${
                  value.status === 'high'
                    ? 'border-red-200 dark:border-red-800 bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950/30 dark:to-orange-950/30'
                    : 'border-blue-200 dark:border-blue-800 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30'
                }`}
              >
                {/* Status Badge - Top Right */}
                <div className="absolute top-4 right-4">
                  {value.status === 'high' ? (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-full shadow-lg animate-pulse">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" clipRule="evenodd" />
                      </svg>
                      <span className="text-xs font-bold">HIGH</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-full shadow-lg">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" clipRule="evenodd" transform="rotate(180 10 10)" />
                      </svg>
                      <span className="text-xs font-bold">LOW</span>
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-start mb-4 pr-20">
                  <div className="flex-1">
                    <h4 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">{value.name}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                      <span className="font-medium">Normal range:</span>
                      <span className="px-2 py-0.5 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
                        {value.normal_range || 'Not specified'}
                      </span>
                    </p>
                  </div>
                </div>

                {/* Value Display */}
                <div className="mb-4">
                  <div className={`inline-flex flex-col items-center px-6 py-3 rounded-xl ${
                    value.status === 'high'
                      ? 'bg-gradient-to-br from-red-100 to-orange-100 dark:from-red-900/40 dark:to-orange-900/40 border-2 border-red-300 dark:border-red-700'
                      : 'bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900/40 dark:to-cyan-900/40 border-2 border-blue-300 dark:border-blue-700'
                  }`}>
                    <span className={`text-4xl font-black ${
                      value.status === 'high'
                        ? 'text-red-600 dark:text-red-400'
                        : 'text-blue-600 dark:text-blue-400'
                    }`}>
                      {value.value}
                    </span>
                    <span className={`text-lg font-semibold mt-1 ${
                      value.status === 'high'
                        ? 'text-red-700 dark:text-red-300'
                        : 'text-blue-700 dark:text-blue-300'
                    }`}>
                      {value.unit}
                    </span>
                  </div>
                </div>

                {/* Explanation Box */}
                <div className="p-4 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
                  <div className="flex items-start gap-2 mb-3">
                    <Info className="w-5 h-5 text-teal-600 dark:text-teal-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1">What this means:</p>
                      <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{value.explanation}</p>
                    </div>
                  </div>
                  {value.recommendation && (
                    <div className="flex items-start gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
                      <AlertTriangle className="w-5 h-5 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1">Recommendation:</p>
                        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{value.recommendation}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
        </div>
      )}

      {/* All Values */}
      <div className="relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500" />
        <Card className="relative border-2 border-white/20 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </div>
              All Test Results
            </CardTitle>
            <CardDescription className="text-base">
              Complete list of lab values from your report
            </CardDescription>
          </CardHeader>
          <CardContent>
          {analysis.values && analysis.values.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
                    <th className="text-left py-4 px-4 font-bold text-gray-700 dark:text-gray-300 uppercase text-xs tracking-wider">Test Name</th>
                    <th className="text-right py-4 px-4 font-bold text-gray-700 dark:text-gray-300 uppercase text-xs tracking-wider">Value</th>
                    <th className="text-left py-4 px-4 font-bold text-gray-700 dark:text-gray-300 uppercase text-xs tracking-wider">Unit</th>
                    <th className="text-left py-4 px-4 font-bold text-gray-700 dark:text-gray-300 uppercase text-xs tracking-wider">Normal Range</th>
                    <th className="text-center py-4 px-4 font-bold text-gray-700 dark:text-gray-300 uppercase text-xs tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {analysis.values.map((value, index) => (
                    <tr
                      key={index}
                      className={`border-b transition-colors ${
                        value.status === 'high' 
                          ? 'bg-red-50/50 dark:bg-red-950/20 hover:bg-red-50 dark:hover:bg-red-950/30' 
                          : value.status === 'low'
                          ? 'bg-blue-50/50 dark:bg-blue-950/20 hover:bg-blue-50 dark:hover:bg-blue-950/30'
                          : 'hover:bg-gray-50 dark:hover:bg-gray-900/20'
                      }`}
                    >
                      <td className="py-4 px-4 font-semibold text-gray-900 dark:text-gray-100">{value.name}</td>
                      <td className={`py-4 px-4 text-right font-bold text-lg ${
                        value.status === 'high' 
                          ? 'text-red-600 dark:text-red-400' 
                          : value.status === 'low'
                          ? 'text-blue-600 dark:text-blue-400'
                          : 'text-gray-900 dark:text-gray-100'
                      }`}>
                        {value.value}
                      </td>
                      <td className="py-4 px-4 text-gray-600 dark:text-gray-400">{value.unit}</td>
                      <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-500">
                        {value.normal_range || '-'}
                      </td>
                      <td className="py-4 px-4 text-center">
                        {value.status === 'normal' ? (
                          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border border-green-200 dark:border-green-800 rounded-full">
                            <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                            <span className="text-sm font-semibold text-green-700 dark:text-green-400">Normal</span>
                          </div>
                        ) : value.status === 'high' ? (
                          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950/30 dark:to-orange-950/30 border border-red-200 dark:border-red-800 rounded-full animate-pulse">
                            <svg className="w-4 h-4 text-red-600 dark:text-red-400" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" clipRule="evenodd" />
                            </svg>
                            <span className="text-sm font-bold text-red-700 dark:text-red-400">HIGH</span>
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 border border-blue-200 dark:border-blue-800 rounded-full">
                            <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" clipRule="evenodd" transform="rotate(180 10 10)" />
                            </svg>
                            <span className="text-sm font-bold text-blue-700 dark:text-blue-400">LOW</span>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">
              No test values could be extracted from the report
            </p>
          )}
        </CardContent>
      </Card>
      </div>

      {/* Disclaimer */}
      <div className="relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-teal-500/10 to-cyan-500/10 rounded-xl blur-lg" />
        <Alert className="relative border-2 border-teal-200/50 dark:border-teal-800/50 bg-teal-50/80 dark:bg-teal-950/80 backdrop-blur-xl">
          <Info className="h-5 w-5 text-teal-600 dark:text-teal-400" />
          <AlertDescription className="text-base">
            <strong>Important:</strong> This analysis is AI-generated and should not replace professional medical advice. 
            Please consult with your healthcare provider to discuss these results.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  )
}
