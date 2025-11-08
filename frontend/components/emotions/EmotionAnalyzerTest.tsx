"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import EmotionIndicator from './EmotionIndicator'
import { Play, Pause, RotateCcw } from 'lucide-react'

type EmotionType = 'calm' | 'anxious' | 'distressed' | 'pain' | 'sad' | 'neutral'

interface EmotionState {
  type: EmotionType
  confidence: number
}

const EMOTION_SCENARIOS = [
  {
    id: 'calm',
    name: 'Calm Patient',
    description: 'Patient speaking in a relaxed, comfortable manner',
    emotion: { type: 'calm' as EmotionType, confidence: 0.82 }
  },
  {
    id: 'anxious',
    name: 'Anxious Patient',
    description: 'Patient showing signs of worry and nervousness',
    emotion: { type: 'anxious' as EmotionType, confidence: 0.75 }
  },
  {
    id: 'distressed',
    name: 'Distressed Patient',
    description: 'Patient highly stressed or upset',
    emotion: { type: 'distressed' as EmotionType, confidence: 0.78 }
  },
  {
    id: 'pain',
    name: 'Patient in Pain',
    description: 'Patient experiencing physical discomfort',
    emotion: { type: 'pain' as EmotionType, confidence: 0.72 }
  },
  {
    id: 'sad',
    name: 'Sad Patient',
    description: 'Patient showing signs of sadness or depression',
    emotion: { type: 'sad' as EmotionType, confidence: 0.70 }
  },
  {
    id: 'neutral',
    name: 'Neutral Patient',
    description: 'Patient in baseline emotional state',
    emotion: { type: 'neutral' as EmotionType, confidence: 0.65 }
  }
]

export default function EmotionAnalyzerTest() {
  const [currentEmotion, setCurrentEmotion] = useState<EmotionState>(
    EMOTION_SCENARIOS[0].emotion
  )
  const [isSimulating, setIsSimulating] = useState(false)
  const [currentScenarioIndex, setCurrentScenarioIndex] = useState(0)

  const handleScenarioSelect = (scenario: typeof EMOTION_SCENARIOS[0]) => {
    setCurrentEmotion(scenario.emotion)
    setIsSimulating(false)
  }

  const startSimulation = () => {
    setIsSimulating(true)
    let index = 0
    
    const interval = setInterval(() => {
      index = (index + 1) % EMOTION_SCENARIOS.length
      setCurrentScenarioIndex(index)
      setCurrentEmotion(EMOTION_SCENARIOS[index].emotion)
      
      if (index === EMOTION_SCENARIOS.length - 1) {
        setIsSimulating(false)
        clearInterval(interval)
      }
    }, 3000)
  }

  const stopSimulation = () => {
    setIsSimulating(false)
  }

  const resetSimulation = () => {
    setIsSimulating(false)
    setCurrentScenarioIndex(0)
    setCurrentEmotion(EMOTION_SCENARIOS[0].emotion)
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="manual" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="manual">Manual Testing</TabsTrigger>
          <TabsTrigger value="simulation">Live Simulation</TabsTrigger>
        </TabsList>

        {/* Manual Testing Tab */}
        <TabsContent value="manual" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Current Emotion State</CardTitle>
              <CardDescription>
                Real-time emotion detection visualization
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EmotionIndicator emotion={currentEmotion} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Test Scenarios</CardTitle>
              <CardDescription>
                Click on a scenario to see how different emotions are displayed
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {EMOTION_SCENARIOS.map((scenario) => (
                  <button
                    key={scenario.id}
                    onClick={() => handleScenarioSelect(scenario)}
                    className={`p-4 border rounded-lg text-left transition-all hover:shadow-md ${
                      currentEmotion.type === scenario.emotion.type
                        ? 'border-primary bg-primary/5'
                        : 'border-zinc-200 dark:border-zinc-800'
                    }`}
                  >
                    <div className="font-semibold text-sm mb-1">
                      {scenario.name}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {scenario.description}
                    </div>
                    <div className="mt-2 text-xs font-medium">
                      Confidence: {Math.round(scenario.emotion.confidence * 100)}%
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Live Simulation Tab */}
        <TabsContent value="simulation" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Live Emotion Simulation</CardTitle>
              <CardDescription>
                Watch emotions change automatically as if in a real consultation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <EmotionIndicator emotion={currentEmotion} />

              <div className="flex items-center gap-3">
                {!isSimulating ? (
                  <Button onClick={startSimulation} className="flex-1">
                    <Play className="h-4 w-4 mr-2" />
                    Start Simulation
                  </Button>
                ) : (
                  <Button onClick={stopSimulation} variant="destructive" className="flex-1">
                    <Pause className="h-4 w-4 mr-2" />
                    Stop Simulation
                  </Button>
                )}
                <Button onClick={resetSimulation} variant="outline">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset
                </Button>
              </div>

              {isSimulating && (
                <div className="p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 bg-blue-500 rounded-full animate-pulse" />
                    <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                      Simulation Running
                    </span>
                  </div>
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                    Cycling through scenarios: {currentScenarioIndex + 1} / {EMOTION_SCENARIOS.length}
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <h4 className="text-sm font-semibold">Simulation Sequence:</h4>
                <div className="space-y-1">
                  {EMOTION_SCENARIOS.map((scenario, index) => (
                    <div
                      key={scenario.id}
                      className={`text-xs p-2 rounded ${
                        isSimulating && index === currentScenarioIndex
                          ? 'bg-primary/10 border border-primary'
                          : 'bg-zinc-50 dark:bg-zinc-900'
                      }`}
                    >
                      {index + 1}. {scenario.name} - {scenario.description}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Feature Information */}
      <Card>
        <CardHeader>
          <CardTitle>About Emotion Analysis</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold text-sm mb-2">How It Works</h4>
            <p className="text-sm text-muted-foreground">
              The emotion analyzer extracts acoustic features from patient audio including pitch, 
              energy, speech rate, and spectral characteristics. These features are processed in 
              real-time to classify the patient's emotional state with confidence scoring.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-sm mb-2">Emotion Categories</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• <strong>Calm:</strong> Relaxed and comfortable state</li>
              <li>• <strong>Anxious:</strong> Signs of worry or nervousness</li>
              <li>• <strong>Distressed:</strong> Highly stressed or upset</li>
              <li>• <strong>Pain:</strong> Physical discomfort indicators</li>
              <li>• <strong>Sad:</strong> Signs of sadness or depression</li>
              <li>• <strong>Neutral:</strong> Baseline emotional state</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-sm mb-2">Performance</h4>
            <p className="text-sm text-muted-foreground">
              Processing time: &lt;0.01 seconds per audio sample | Real-time capable: ✓ | 
              Confidence threshold: 70% for UI updates
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
