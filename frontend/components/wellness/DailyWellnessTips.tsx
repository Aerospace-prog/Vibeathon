'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Apple, Dumbbell, Brain, RefreshCw, Sparkles } from 'lucide-react'

interface HealthTip {
  category: string
  tip_text: string
  generated_date: string
}

interface TipsData {
  nutrition: HealthTip
  exercise: HealthTip
  mental_health: HealthTip
}

export function DailyWellnessTips() {
  const [tips, setTips] = useState<TipsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState<string | null>(null)

  const fetchTips = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/health-tips/all/today`)
      const data = await response.json()
      
      if (data.success) {
        setTips(data.tips)
      }
    } catch (error) {
      console.error('Error fetching health tips:', error)
    } finally {
      setLoading(false)
    }
  }

  const refreshTip = async (category: string) => {
    setRefreshing(category)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/health-tips/${category}`)
      const data = await response.json()
      
      if (data.success && tips) {
        setTips({
          ...tips,
          [category]: data.tip
        })
      }
    } catch (error) {
      console.error(`Error refreshing ${category} tip:`, error)
    } finally {
      setRefreshing(null)
    }
  }

  useEffect(() => {
    fetchTips()
  }, [])

  const tipCategories = [
    {
      key: 'nutrition',
      title: 'Nutrition Tip',
      icon: Apple,
      color: 'from-green-500 to-emerald-500',
      bgColor: 'from-green-50 to-emerald-50 dark:from-green-950/50 dark:to-emerald-950/50',
      iconColor: 'text-green-600 dark:text-green-400',
      borderColor: 'border-green-200 dark:border-green-800'
    },
    {
      key: 'exercise',
      title: 'Exercise Tip',
      icon: Dumbbell,
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'from-blue-50 to-cyan-50 dark:from-blue-950/50 dark:to-cyan-950/50',
      iconColor: 'text-blue-600 dark:text-blue-400',
      borderColor: 'border-blue-200 dark:border-blue-800'
    },
    {
      key: 'mental_health',
      title: 'Mental Health Tip',
      icon: Brain,
      color: 'from-purple-500 to-pink-500',
      bgColor: 'from-purple-50 to-pink-50 dark:from-purple-950/50 dark:to-pink-950/50',
      iconColor: 'text-purple-600 dark:text-purple-400',
      borderColor: 'border-purple-200 dark:border-purple-800'
    }
  ]

  if (loading) {
    return (
      <div className="grid gap-6 md:grid-cols-3">
        {tipCategories.map((category) => (
          <Card key={category.key} className="animate-pulse">
            <CardHeader>
              <div className="h-6 bg-zinc-200 dark:bg-zinc-800 rounded w-3/4" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded" />
                <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-5/6" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Section Header */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-lg blur-md opacity-50 animate-pulse" />
          <div className="relative bg-gradient-to-br from-teal-500 to-cyan-600 p-2 rounded-lg">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
        </div>
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 dark:from-teal-400 dark:to-cyan-400 bg-clip-text text-transparent">
            Daily Wellness Tips
          </h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            AI-powered health tips to keep you at your best
          </p>
        </div>
      </div>

      {/* Tips Grid */}
      <div className="grid gap-6 md:grid-cols-3">
        {tipCategories.map((category) => {
          const tip = tips?.[category.key as keyof TipsData]
          const Icon = category.icon

          return (
            <div key={category.key} className="group relative">
              {/* Glow effect */}
              <div className={`absolute -inset-1 bg-gradient-to-br ${category.color} rounded-2xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity`} />
              
              {/* Card */}
              <Card className={`relative bg-gradient-to-br ${category.bgColor} backdrop-blur-xl border-2 ${category.borderColor} shadow-xl transform group-hover:scale-105 transition-all duration-300`}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {/* Icon */}
                      <div className="relative">
                        <div className={`absolute -inset-2 bg-gradient-to-br ${category.color} rounded-xl blur-md opacity-50`} />
                        <div className={`relative bg-gradient-to-br ${category.color} p-2 rounded-xl shadow-lg`}>
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                      </div>
                      <CardTitle className={`text-lg ${category.iconColor}`}>
                        {category.title}
                      </CardTitle>
                    </div>
                    
                    {/* Refresh Button */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => refreshTip(category.key)}
                      disabled={refreshing === category.key}
                      className="h-8 w-8 p-0"
                    >
                      <RefreshCw 
                        className={`w-4 h-4 ${refreshing === category.key ? 'animate-spin' : ''}`} 
                      />
                    </Button>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
                    {tip?.tip_text || 'Loading tip...'}
                  </p>
                  
                  {/* Date */}
                  <div className="mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                    <p className="text-xs text-zinc-500 dark:text-zinc-500">
                      Tip of the day • {new Date().toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )
        })}
      </div>
    </div>
  )
}
