"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ChevronDown, ChevronUp } from 'lucide-react'
import AlertEngineTest from '@/components/alerts/AlertEngineTest'

export default function AlertEngineSection() {
  const [isExpanded, setIsExpanded] = useState(true)

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-2xl font-bold">🏥 Alert Engine Testing</h3>
          <p className="text-muted-foreground text-sm">
            Test the real-time medical alert detection system with dynamic input
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
      
      {isExpanded && <AlertEngineTest />}
    </div>
  )
}
