"use client"

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Play, Pause, RotateCcw } from 'lucide-react'

interface LiveSimulationProps {
  onTranscriptUpdate: (text: string) => void
  onAutoAnalyze: () => void
}

const SIMULATION_SCENARIOS = [
  {
    name: "Emergency - Chest Pain",
    transcript: "Doctor, I'm having severe chest pain that started about 10 minutes ago. It feels like crushing pressure and it's radiating down my left arm. I'm also feeling short of breath and a bit dizzy.",
    delay: 50,
  },
  {
    name: "Mental Health Crisis",
    transcript: "I've been feeling really down lately. I can't sleep, I don't want to eat, and honestly, I've been having thoughts about ending my life. I don't know what to do anymore.",
    delay: 60,
  },
  {
    name: "Routine Checkup",
    transcript: "I've been feeling pretty good overall. Just a mild headache here and there, nothing serious. My energy levels are normal and I'm sleeping well.",
    delay: 50,
  },
  {
    name: "Breathing Emergency",
    transcript: "I can't breathe properly. It started suddenly about an hour ago. Every breath feels difficult and I'm getting worse. Please help me.",
    delay: 55,
  },
]

export default function LiveSimulation({ onTranscriptUpdate, onAutoAnalyze }: LiveSimulationProps) {
  const [selectedScenario, setSelectedScenario] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentText, setCurrentText] = useState('')
  const [currentIndex, setCurrentIndex] = useState(0)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const scenario = SIMULATION_SCENARIOS[selectedScenario]

  useEffect(() => {
    if (isPlaying && currentIndex < scenario.transcript.length) {
      intervalRef.current = setTimeout(() => {
        const nextChar = scenario.transcript[currentIndex]
        const newText = currentText + nextChar
        setCurrentText(newText)
        setCurrentIndex(currentIndex + 1)
        onTranscriptUpdate(newText)

        // Auto-analyze at sentence breaks
        if (nextChar === '.' || nextChar === '!' || nextChar === '?') {
          setTimeout(() => {
            onAutoAnalyze()
          }, 500)
        }
      }, scenario.delay)
    } else if (currentIndex >= scenario.transcript.length) {
      setIsPlaying(false)
    }

    return () => {
      if (intervalRef.current) {
        clearTimeout(intervalRef.current)
      }
    }
  }, [isPlaying, currentIndex, currentText, scenario, onTranscriptUpdate, onAutoAnalyze])

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying)
  }

  const handleReset = () => {
    setIsPlaying(false)
    setCurrentText('')
    setCurrentIndex(0)
    onTranscriptUpdate('')
  }

  const handleScenarioChange = (index: number) => {
    setSelectedScenario(index)
    handleReset()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>🎬 Live Consultation Simulation</CardTitle>
        <CardDescription>
          Simulate a real-time consultation with auto-typing and automatic alert detection
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Scenario Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Select Scenario</label>
          <div className="grid grid-cols-2 gap-2">
            {SIMULATION_SCENARIOS.map((s, index) => (
              <Button
                key={index}
                variant={selectedScenario === index ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleScenarioChange(index)}
                disabled={isPlaying}
              >
                {s.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Controls */}
        <div className="flex gap-2">
          <Button
            onClick={handlePlayPause}
            variant={isPlaying ? 'destructive' : 'default'}
            className="flex-1"
          >
            {isPlaying ? (
              <>
                <Pause className="mr-2 h-4 w-4" />
                Pause
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" />
                {currentIndex > 0 ? 'Resume' : 'Start Simulation'}
              </>
            )}
          </Button>
          <Button onClick={handleReset} variant="outline">
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Progress</span>
            <span>
              {currentIndex} / {scenario.transcript.length} characters
            </span>
          </div>
          <div className="w-full bg-secondary rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{
                width: `${(currentIndex / scenario.transcript.length) * 100}%`,
              }}
            />
          </div>
        </div>

        {/* Live Preview */}
        <div className="border rounded-lg p-3 bg-muted/50 min-h-[100px]">
          <div className="text-sm">
            {currentText || (
              <span className="text-muted-foreground italic">
                Click "Start Simulation" to begin...
              </span>
            )}
            {isPlaying && <span className="animate-pulse">|</span>}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
