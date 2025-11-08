'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Spinner, LoadingOverlay } from '@/components/ui/spinner'
import { useWebSocketWithRetry } from '@/lib/useWebSocketWithRetry'
import { toast } from 'sonner'
import { AlertCircle, Wifi, WifiOff, ArrowLeft } from 'lucide-react'

interface VideoCallRoomProps {
  consultationId: string
  userType: 'doctor' | 'patient'
}

interface CaptionMessage {
  speaker_id: string
  original_text: string
  translated_text: string
  timestamp: number
}

export default function VideoCallRoom({ consultationId, userType }: VideoCallRoomProps) {
  const router = useRouter()
  
  // Video refs
  const localVideoRef = useRef<HTMLVideoElement>(null)
  const remoteVideoRef = useRef<HTMLVideoElement>(null)
  
  // WebRTC refs
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null)
  const localStreamRef = useRef<MediaStream | null>(null)
  
  // Media refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  
  // State
  const [isConnecting, setIsConnecting] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [captions, setCaptions] = useState<CaptionMessage[]>([])
  const [isCallActive, setIsCallActive] = useState(false)
  const [mediaError, setMediaError] = useState<string | null>(null)
  const [debugMode] = useState(process.env.NEXT_PUBLIC_DEBUG_MODE === 'true')
  
  const captionsEndRef = useRef<HTMLDivElement>(null)

  // WebSocket with retry logic
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'
  const wsUrl = backendUrl.replace('http', 'ws')
  
  // Debug logging
  useEffect(() => {
    if (debugMode) {
      console.log('🔍 Debug Mode: ON')
      console.log('📹 Local video ref:', localVideoRef.current)
      console.log('📹 Local stream:', localStreamRef.current)
      console.log('🎬 Call active:', isCallActive)
    }
  }, [debugMode, isCallActive])
  
  const {
    ws,
    isConnected: wsConnected,
    isConnecting: wsConnecting,
    error: wsError,
    send: wsSend,
    reconnect: wsReconnect,
    close: wsClose
  } = useWebSocketWithRetry({
    url: `${wsUrl}/ws/${consultationId}/${userType}`,
    enabled: isCallActive && !debugMode, // Disable WebSocket in debug mode
    maxRetries: 3,
    retryDelay: 2000,
    onMessage: (event) => {
      try {
        const message: CaptionMessage = JSON.parse(event.data)
        setCaptions(prev => [...prev, message])
      } catch (err) {
        console.error('Error parsing WebSocket message:', err)
        toast.error('Failed to parse translation message')
      }
    },
    onOpen: () => {
      console.log('WebSocket connected')
    },
    onError: (error) => {
      console.error('WebSocket error:', error)
      if (!debugMode) {
        setError('Connection to translation service failed')
      }
    }
  })

  // Start audio streaming when WebSocket connects
  useEffect(() => {
    if (wsConnected && isCallActive && !debugMode && localStreamRef.current) {
      console.log('WebSocket connected and call active, starting audio streaming')
      startAudioStreaming()
    }
  }, [wsConnected, isCallActive, debugMode])

  // Auto-scroll captions
  useEffect(() => {
    captionsEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [captions])

  // Initialize WebRTC and media
  useEffect(() => {
    let mounted = true

    const initializeMedia = async () => {
      try {
        setIsConnecting(true)
        setMediaError(null)
        
        // Check if media devices are available
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error('Media devices not supported in this browser')
        }

        // Request user media (video and audio)
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 }
          },
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          }
        })

        if (!mounted) {
          stream.getTracks().forEach(track => track.stop())
          return
        }

        localStreamRef.current = stream

        // Display local video
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream
          // Ensure video plays
          localVideoRef.current.play().catch(err => {
            console.error('Error playing local video:', err)
          })
          console.log('✅ Local video stream set:', stream.getTracks())
        } else {
          console.error('❌ Local video ref is null!')
        }

        // Set up WebRTC peer connection
        const configuration: RTCConfiguration = {
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' }
          ]
        }

        const peerConnection = new RTCPeerConnection(configuration)
        peerConnectionRef.current = peerConnection

        // Add local stream tracks to peer connection
        stream.getTracks().forEach(track => {
          peerConnection.addTrack(track, stream)
        })

        // Handle incoming remote stream
        peerConnection.ontrack = (event) => {
          if (remoteVideoRef.current && event.streams[0]) {
            remoteVideoRef.current.srcObject = event.streams[0]
            toast.success('Remote participant connected')
          }
        }

        // Handle connection state changes
        peerConnection.onconnectionstatechange = () => {
          const state = peerConnection.connectionState
          console.log('WebRTC connection state:', state)
          
          if (state === 'connected') {
            setIsCallActive(true)
            setIsConnecting(false)
            toast.success('Video call connected')
          } else if (state === 'failed') {
            setError('Video connection failed. Please check your network.')
            toast.error('Video connection failed')
          } else if (state === 'disconnected') {
            toast.warning('Video connection lost')
          }
        }

        // Handle ICE candidates
        peerConnection.onicecandidate = (event) => {
          if (event.candidate) {
            // In a real implementation, send this to the other peer via signaling server
            console.log('ICE candidate:', event.candidate)
          }
        }

        setIsConnecting(false)
        setIsCallActive(true)
        toast.success('Media devices initialized')

      } catch (err) {
        console.error('Error accessing media devices:', err)
        if (mounted) {
          let errorMessage = 'Failed to access camera/microphone.'
          
          if (err instanceof Error) {
            if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
              errorMessage = 'Camera/microphone access denied. Please grant permissions and refresh.'
            } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
              errorMessage = 'No camera or microphone found. Please connect devices and refresh.'
            } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
              errorMessage = 'Camera/microphone is already in use by another application.'
            } else {
              errorMessage = err.message
            }
          }
          
          setMediaError(errorMessage)
          setError(errorMessage)
          setIsConnecting(false)
          toast.error(errorMessage)
        }
      }
    }

    initializeMedia()

    return () => {
      mounted = false
      // Cleanup will be handled by endCall
    }
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop()
      }
    }
  }, [])

  const startAudioStreaming = () => {
    console.log('startAudioStreaming called', {
      hasLocalStream: !!localStreamRef.current,
      hasWs: !!ws,
      wsReadyState: ws?.readyState,
      wsConnected
    })
    
    if (!localStreamRef.current) {
      console.error('No local stream available')
      return
    }
    
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      console.error('WebSocket not ready', { ws, readyState: ws?.readyState })
      return
    }

    try {
      // Stop existing recorder if any
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop()
      }

      // Get audio track from local stream
      const audioTrack = localStreamRef.current.getAudioTracks()[0]
      if (!audioTrack) {
        console.error('No audio track found')
        toast.error('No audio track available for streaming')
        return
      }

      // Create a new MediaStream with only audio
      const audioStream = new MediaStream([audioTrack])

      // Create MediaRecorder to capture audio chunks
      // Try OGG Opus first (better supported by Google Cloud), fallback to WebM
      let mimeType = 'audio/ogg;codecs=opus'
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'audio/webm;codecs=opus'
      }
      
      console.log(`Using audio format: ${mimeType}`)
      
      const mediaRecorder = new MediaRecorder(audioStream, {
        mimeType: mimeType
      })
      mediaRecorderRef.current = mediaRecorder

      // Stream audio chunks to backend at 1-second intervals
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0 && ws?.readyState === WebSocket.OPEN) {
          // Send binary audio chunk
          wsSend(event.data)
        }
      }

      mediaRecorder.onerror = (error) => {
        console.error('MediaRecorder error:', error)
        toast.error('Audio recording error occurred')
      }

      mediaRecorder.onstart = () => {
        console.log('Audio streaming started')
        toast.success('Live translation active')
      }

      // Start recording with 2-second timeslices for better STT accuracy
      // Longer chunks give Google Cloud STT more context to work with
      mediaRecorder.start(2000)

    } catch (err) {
      console.error('Error starting audio streaming:', err)
      const errorMessage = 'Failed to start audio streaming'
      setError(errorMessage)
      toast.error(errorMessage)
    }
  }

  const endCall = () => {
    try {
      // Stop media recorder
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop()
      }

      // Close WebSocket
      wsClose()

      // Close peer connection
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close()
      }

      // Stop all media tracks
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop())
      }

      toast.success('Call ended successfully')
      
      // Navigate to SOAP note review page
      router.push(`/consultation/${consultationId}/review`)
    } catch (err) {
      console.error('Error ending call:', err)
      toast.error('Error ending call, but navigating to review page')
      router.push(`/consultation/${consultationId}/review`)
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* Navigation Header */}
      <header className="border-b bg-white dark:bg-zinc-900">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
              <div className="h-6 w-px bg-border" />
              <h1 className="text-2xl font-bold">Arogya-AI</h1>
              <span className="text-sm text-muted-foreground">
                Consultation Room - {userType === 'doctor' ? 'Doctor' : 'Patient'}
              </span>
            </div>
            <Button 
              onClick={endCall}
              variant="destructive"
              disabled={isConnecting}
            >
              End Call & Review Notes
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Video Section */}
          <div className="lg:col-span-2 space-y-4">
            {/* Error Alert */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* WebSocket Status */}
            {!wsConnected && isCallActive && !wsConnecting && (
              <Alert variant="destructive">
                <WifiOff className="h-4 w-4" />
                <AlertDescription className="flex items-center justify-between">
                  <span>Translation service disconnected</span>
                  <Button size="sm" variant="outline" onClick={wsReconnect}>
                    Reconnect
                  </Button>
                </AlertDescription>
              </Alert>
            )}

            {wsConnecting && (
              <Alert>
                <Spinner size="sm" />
                <AlertDescription>
                  Connecting to translation service...
                </AlertDescription>
              </Alert>
            )}

            {wsConnected && isCallActive && (
              <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
                <Wifi className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-600">
                  Live translation active
                </AlertDescription>
              </Alert>
            )}

            {/* Connecting State */}
            {isConnecting && (
              <Alert>
                <Spinner size="sm" />
                <AlertDescription>
                  Connecting to video call... Please allow camera and microphone access.
                </AlertDescription>
              </Alert>
            )}

            {/* Media Error */}
            {mediaError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-2">
                    <p>{mediaError}</p>
                    <Button size="sm" variant="outline" onClick={() => window.location.reload()}>
                      Refresh Page
                    </Button>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {/* Remote Video (larger) */}
            <Card>
              <CardContent className="p-0">
                <div className="relative bg-black aspect-video rounded-lg overflow-hidden">
                  <video
                    ref={remoteVideoRef}
                    autoPlay
                    playsInline
                    className="w-full h-full object-cover"
                  />
                  {!remoteVideoRef.current?.srcObject && (
                    <div className="absolute inset-0 flex items-center justify-center text-white">
                      <p className="text-lg">Waiting for remote participant...</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Local Video (smaller, picture-in-picture style) */}
            <Card>
              <CardContent className="p-0">
                <div className="relative bg-black aspect-video rounded-lg overflow-hidden">
                  <video
                    ref={localVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-2 left-2 bg-black/50 text-white px-2 py-1 rounded text-sm">
                    You ({userType})
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Live Captions Section */}
          <div className="lg:col-span-1">
            <Card className="h-[calc(100vh-12rem)]">
              <CardContent className="p-4 h-full flex flex-col">
                <h3 className="font-semibold mb-4">Live Translations</h3>
                <div className="flex-1 overflow-y-auto space-y-3 mb-4">
                  {captions.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      Translations will appear here during the call...
                    </p>
                  ) : (
                    captions.map((caption, index) => (
                      <div
                        key={index}
                        className={`p-3 rounded-lg ${
                          caption.speaker_id === userType
                            ? 'bg-blue-50 dark:bg-blue-950 ml-4'
                            : 'bg-zinc-100 dark:bg-zinc-800 mr-4'
                        }`}
                      >
                        <div className="text-xs font-semibold mb-1 text-muted-foreground">
                          {caption.speaker_id === userType ? 'You' : 'Other Participant'}
                        </div>
                        <div className="text-sm">
                          {caption.translated_text}
                        </div>
                        {caption.original_text !== caption.translated_text && (
                          <div className="text-xs text-muted-foreground mt-1 italic">
                            Original: {caption.original_text}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                  <div ref={captionsEndRef} />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
