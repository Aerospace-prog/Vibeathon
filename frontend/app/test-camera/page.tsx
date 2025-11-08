'use client'

import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'

export default function TestCameraPage() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [error, setError] = useState<string | null>(null)

  const startCamera = async () => {
    try {
      console.log('🎥 Requesting camera access...')
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      })
      
      console.log('✅ Camera access granted!', mediaStream.getTracks())
      setStream(mediaStream)
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
        await videoRef.current.play()
        console.log('✅ Video playing!')
      }
    } catch (err) {
      console.error('❌ Camera error:', err)
      setError(err instanceof Error ? err.message : 'Failed to access camera')
    }
  }

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
      setStream(null)
      if (videoRef.current) {
        videoRef.current.srcObject = null
      }
    }
  }

  useEffect(() => {
    return () => {
      stopCamera()
    }
  }, [])

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold">Camera Test</h1>
        
        <div className="space-x-4">
          <Button onClick={startCamera} disabled={!!stream}>
            Start Camera
          </Button>
          <Button onClick={stopCamera} disabled={!stream} variant="destructive">
            Stop Camera
          </Button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div className="bg-black rounded-lg overflow-hidden aspect-video">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
        </div>

        <div className="bg-white dark:bg-zinc-900 p-4 rounded-lg">
          <h2 className="font-semibold mb-2">Stream Info:</h2>
          <pre className="text-sm">
            {stream ? JSON.stringify({
              active: stream.active,
              tracks: stream.getTracks().map(t => ({
                kind: t.kind,
                enabled: t.enabled,
                readyState: t.readyState,
                label: t.label
              }))
            }, null, 2) : 'No stream'}
          </pre>
        </div>
      </div>
    </div>
  )
}
