"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { RealTimeEmotionAnalyzer } from '@/components/emotions/RealTimeEmotionAnalyzer'
import { supabase } from '@/lib/supabase'

export default function EmotionAnalyzerSection() {
  const [isExpanded, setIsExpanded] = useState(true)
  const [userId, setUserId] = useState<string>('')

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        setUserId(session.user.id)
      }
    }
    fetchUser()
  }, [])

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-2xl font-bold">🎭 Real-Time Emotion Analyzer</h3>
          <p className="text-muted-foreground text-sm">
            AI-powered voice emotion detection with persistent statistics and real-time updates
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? (
            <>
              <ChevronUp className="h-4 w-4 mr-2" />
              Hide
            </>
          ) : (
            <>
              <ChevronDown className="h-4 w-4 mr-2" />
              Show
            </>
          )}
        </Button>
      </div>
      
      {isExpanded && userId && <RealTimeEmotionAnalyzer userId={userId} />}
    </div>
  )
}
