"use client"

import { motion } from 'framer-motion'
import { Info } from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface EmotionIndicatorProps {
  emotion: {
    type: 'calm' | 'anxious' | 'distressed' | 'pain' | 'sad' | 'neutral'
    confidence: number
  }
}

const EMOTION_CATEGORIES = {
  calm: {
    color: '#10B981',
    description: 'Patient appears relaxed and comfortable',
    label: 'Calm'
  },
  anxious: {
    color: '#F59E0B',
    description: 'Patient shows signs of worry or nervousness',
    label: 'Anxious'
  },
  distressed: {
    color: '#EF4444',
    description: 'Patient appears highly stressed or upset',
    label: 'Distressed'
  },
  pain: {
    color: '#DC2626',
    description: 'Patient may be experiencing physical discomfort',
    label: 'Pain'
  },
  sad: {
    color: '#6B7280',
    description: 'Patient shows signs of sadness or depression',
    label: 'Sad'
  },
  neutral: {
    color: '#9CA3AF',
    description: 'Baseline emotional state',
    label: 'Neutral'
  }
}

export default function EmotionIndicator({ emotion }: EmotionIndicatorProps) {
  const emotionInfo = EMOTION_CATEGORIES[emotion.type]
  
  return (
    <TooltipProvider>
      <div className="flex items-center gap-4">
        {/* Circular Emotion Indicator */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="relative"
        >
          <motion.div
            key={emotion.type}
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5 }}
            className="w-24 h-24 rounded-full flex items-center justify-center shadow-lg"
            style={{ 
              backgroundColor: emotionInfo.color,
              boxShadow: `0 0 20px ${emotionInfo.color}40`
            }}
          >
            <div className="text-center">
              <div className="text-white font-bold text-sm">
                {emotionInfo.label}
              </div>
              <div className="text-white text-xs opacity-90">
                {Math.round(emotion.confidence * 100)}%
              </div>
            </div>
          </motion.div>
          
          {/* Pulse animation for high confidence */}
          {emotion.confidence > 0.7 && (
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{ backgroundColor: emotionInfo.color }}
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 0, 0.5],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          )}
        </motion.div>

        {/* Emotion Details */}
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h4 className="text-lg font-semibold" style={{ color: emotionInfo.color }}>
              {emotionInfo.label}
            </h4>
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">{emotionInfo.description}</p>
              </TooltipContent>
            </Tooltip>
          </div>
          
          <p className="text-sm text-muted-foreground mt-1">
            {emotionInfo.description}
          </p>
          
          {/* Confidence Bar */}
          <div className="mt-3">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
              <span>Confidence</span>
              <span>{Math.round(emotion.confidence * 100)}%</span>
            </div>
            <div className="h-2 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${emotion.confidence * 100}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="h-full rounded-full"
                style={{ backgroundColor: emotionInfo.color }}
              />
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}
