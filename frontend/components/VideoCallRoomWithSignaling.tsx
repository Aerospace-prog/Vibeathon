'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { toast } from 'sonner'
import { Video, VideoOff, Mic, MicOff, PhoneOff, ArrowLeft } from 'lucide-react'

interface VideoCallRoomProps {
  consultationId: string
  userType: 'doctor' | 'patient'
}

export default function VideoCallRoomWithSignaling({ consultationId, userType }: VideoCallRoomProps) {
  const router = useRouter()
  
  // Video refs
  const localVideoRef = useRef<HTMLVideoElement>(null)
  const remoteVideoRef = useRef<HTMLVideoElement>(null)
  
  // WebRTC refs
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null)
  const localStreamRef = useRef<MediaStream | null>(null)
  const signalingWsRef = useRef<WebSocket | null>(null)
  const hasCreatedOfferRef = useRef(false) // Prevent duplicate offers
  const iceCandidateQueueRef = useRef<RTCIceCandidateInit[]>([]) // Queue ICE candidates if WS not ready
  const isInitializedRef = useRef(false) // Prevent double initialization in React Strict Mode
  const cleanupDoneRef = useRef(false) // Track if cleanup has been done
  const isInitializingRef = useRef(false) // Prevent concurrent initialization
  
  // State
  const [isVideoOn, setIsVideoOn] = useState(true)
  const [isAudioOn, setIsAudioOn] = useState(true)
  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(true)
  const [hasRemoteStream, setHasRemoteStream] = useState(false) // Track if remote stream is available
  
  // const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'
  // const wsUrl = backendUrl.replace('http', 'ws')

  useEffect(() => {
    let mounted = true
    
    // Prevent double initialization in React Strict Mode
    if (isInitializedRef.current) {
      console.log('⚠️ Already initialized, skipping...')
      return () => {
        // Cleanup on unmount
        if (mounted && !cleanupDoneRef.current) {
          console.log('🧹 Cleaning up (unmount)...')
          cleanup()
        }
      }
    }
    
    isInitializedRef.current = true
    cleanupDoneRef.current = false
    console.log('🚀 Initializing video call...')
    
    // Use a small delay to ensure component is fully mounted
    const initTimer = setTimeout(() => {
      if (mounted) {
        initializeCall()
      }
    }, 100)
    
    return () => {
      mounted = false
      clearTimeout(initTimer)
      if (!cleanupDoneRef.current) {
        console.log('🧹 Cleaning up...')
        cleanup()
        cleanupDoneRef.current = true
        isInitializedRef.current = false
      }
    }
  }, [consultationId, userType])

  const initializeCall = async () => {
    // Prevent concurrent initializations
    if (isInitializingRef.current) {
      console.log('⚠️ Already initializing, skipping...')
      return
    }
    
    // Prevent multiple initializations
    if (signalingWsRef.current?.readyState === WebSocket.OPEN) {
      console.log('⚠️ WebSocket already connected, skipping initialization')
      return
    }
    
    isInitializingRef.current = true
    
    // Clean up any existing connections first
    if (signalingWsRef.current) {
      console.log('🧹 Cleaning up existing WebSocket connection')
      try {
        signalingWsRef.current.close()
      } catch (e) {
        console.error('Error closing WebSocket:', e)
      }
      signalingWsRef.current = null
    }
    
    if (peerConnectionRef.current) {
      console.log('🧹 Cleaning up existing peer connection')
      try {
        peerConnectionRef.current.close()
      } catch (e) {
        console.error('Error closing peer connection:', e)
      }
      peerConnectionRef.current = null
    }
    
    try {
      // 1. Get local media
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      })
      
      localStreamRef.current = stream
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream
        // Ensure local video plays
        localVideoRef.current.play().catch(err => {
          console.error('Error playing local video:', err)
        })
      }
      
      console.log('✅ Local media obtained', {
        videoTracks: stream.getVideoTracks().length,
        audioTracks: stream.getAudioTracks().length
      })
      
      // 2. Create peer connection
      const pc = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' }
        ]
      })
      
      peerConnectionRef.current = pc
      
      // 3. Add local tracks to peer connection
      stream.getTracks().forEach(track => {
        pc.addTrack(track, stream)
      })
      
      // 4. Handle remote stream
      pc.ontrack = (event) => {
        console.log('📹 Received remote track', {
          streams: event.streams.length,
          track: event.track.kind,
          id: event.track.id,
          enabled: event.track.enabled
        })
        
        if (event.streams && event.streams.length > 0) {
          const remoteStream = event.streams[0]
          console.log('✅ Remote stream received:', {
            videoTracks: remoteStream.getVideoTracks().length,
            audioTracks: remoteStream.getAudioTracks().length,
            active: remoteStream.active
          })
          
          // Update state to show remote video
          setHasRemoteStream(true)
          
          // Wait for video element to be ready
          const setRemoteVideo = () => {
            if (remoteVideoRef.current) {
              // Check if we already have this stream
              if (remoteVideoRef.current.srcObject !== remoteStream) {
                console.log('🎥 Setting remote video stream')
                remoteVideoRef.current.srcObject = remoteStream
              }
              
              // CRITICAL: Ensure remote video plays
              remoteVideoRef.current.play()
                .then(() => {
                  console.log('✅ Remote video playing successfully')
                  setIsConnected(true)
                  setIsConnecting(false)
                  toast.success('Connected to peer!')
                })
                .catch(err => {
                  console.error('❌ Error playing remote video:', err)
                  // Retry playing
                  setTimeout(() => {
                    if (remoteVideoRef.current) {
                      remoteVideoRef.current.play().catch(e => {
                        console.error('❌ Retry play failed:', e)
                      })
                    }
                  }, 500)
                })
            } else {
              // Retry if video element not ready yet
              console.log('⏳ Video element not ready, retrying...')
              setTimeout(setRemoteVideo, 100)
            }
          }
          
          setRemoteVideo()
        } else {
          console.warn('⚠️ Received track event but no streams available')
        }
      }
      
      // 5. Handle connection state
      pc.onconnectionstatechange = () => {
        const state = pc.connectionState
        console.log('🔗 Connection state:', state)
        if (state === 'connected') {
          setIsConnected(true)
          setIsConnecting(false)
          toast.success('Video call connected!')
        } else if (state === 'failed') {
          console.error('❌ Connection failed - attempting to restart ICE')
          toast.error('Connection failed. Trying to reconnect...')
          setIsConnecting(false)
          // Try to restart ICE
          try {
            pc.restartIce()
          } catch (err) {
            console.error('Error calling restartIce:', err)
          }
        } else if (state === 'disconnected') {
          toast.warning('Peer disconnected')
          setIsConnected(false)
        } else if (state === 'connecting') {
          setIsConnecting(true)
        }
      }
      
      // 5b. Handle ICE connection state (more detailed)
      pc.oniceconnectionstatechange = () => {
        const iceState = pc.iceConnectionState
        console.log('🧊 ICE connection state:', iceState)
        if (iceState === 'failed') {
          console.error('❌ ICE connection failed')
          toast.error('Network connection failed. Check your internet.')
        } else if (iceState === 'connected' || iceState === 'completed') {
          console.log('✅ ICE connection established')
        }
      }
      
      // 5c. Monitor ICE gathering state
      pc.onicegatheringstatechange = () => {
        console.log('🧊 ICE gathering state:', pc.iceGatheringState)
      }
      
      // 6. Handle ICE candidates
      pc.onicecandidate = (event) => {
        const ws = signalingWsRef.current
        
        if (event.candidate) {
          // Queue candidate if WebSocket not ready
          if (!ws || ws.readyState !== WebSocket.OPEN) {
            console.log('🧊 Queueing ICE candidate (WS not ready)')
            iceCandidateQueueRef.current.push(event.candidate)
            return
          }
          
          // Send candidate immediately if WebSocket is ready
          try {
            console.log('🧊 Sending ICE candidate:', event.candidate.candidate.substring(0, 50))
            ws.send(JSON.stringify({
              type: 'ice-candidate',
              candidate: event.candidate
            }))
          } catch (err) {
            console.error('❌ Error sending ICE candidate:', err)
            // Queue it for later
            iceCandidateQueueRef.current.push(event.candidate)
          }
        } else {
          // null candidate means end of candidates
          console.log('🧊 ICE candidate gathering complete')
          if (ws && ws.readyState === WebSocket.OPEN) {
            try {
              ws.send(JSON.stringify({
                type: 'ice-candidate',
                candidate: null
              }))
            } catch (err) {
              console.error('❌ Error sending end-of-candidates:', err)
            }
          }
        }
      }
      
      // 7. Connect to signaling server
      // Close any existing connection first
      if (signalingWsRef.current !== null) {
        console.log('🧹 Closing existing signaling WebSocket')
        const ws: WebSocket = signalingWsRef.current
        try {
          if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
            ws.close()
          }
        } catch (err) {
          console.error('Error closing existing WebSocket:', err)
        }
        signalingWsRef.current = null
      }
      
      const signalingWs = new WebSocket(`http://10.20.18.252:8000/ws/signaling/${consultationId}/${userType}`)
      signalingWsRef.current = signalingWs
      
      console.log(`🔌 Connecting to signaling server: $http://10.20.18.252:8000/ws/signaling/${consultationId}/${userType}`)
      
      signalingWs.onopen = () => {
        console.log('✅ Signaling connected as', userType)
        toast.success('Signaling server connected')
        
        // Send any queued ICE candidates
        const queue = iceCandidateQueueRef.current
        if (queue.length > 0) {
          console.log(`📤 Sending ${queue.length} queued ICE candidates`)
          queue.forEach(candidate => {
            try {
              signalingWs.send(JSON.stringify({
                type: 'ice-candidate',
                candidate: candidate
              }))
            } catch (err) {
              console.error('❌ Error sending queued ICE candidate:', err)
            }
          })
          iceCandidateQueueRef.current = []
        }
        
        // Fallback: If doctor and we haven't created offer yet, try after a delay
        // This handles the case where both users connect at the same time
        if (userType === 'doctor' && !hasCreatedOfferRef.current) {
          console.log('⏰ Doctor connected, will attempt to create offer in 3 seconds if no patient join message received')
          setTimeout(() => {
            const pc = peerConnectionRef.current
            if (!hasCreatedOfferRef.current && pc && signalingWs.readyState === WebSocket.OPEN) {
              console.log('🔄 Fallback: Doctor creating offer (no patient join message received)')
              hasCreatedOfferRef.current = true
              createOffer()
            }
          }, 3000)
        }
      }
      
      signalingWs.onmessage = async (event) => {
        try {
          const message = JSON.parse(event.data)
          console.log('📨 Signaling message received:', message.type, message)
          
          switch (message.type) {
            case 'offer':
              console.log('📥 Received OFFER message')
              await handleOffer(message.offer)
              break
            case 'answer':
              console.log('📥 Received ANSWER message')
              await handleAnswer(message.answer)
              break
            case 'ice-candidate':
              console.log('🧊 Received ICE candidate')
              await handleIceCandidate(message.candidate)
              break
            case 'user-joined':
              console.log(`👤 ${message.userType} joined (${message.totalUsers} total)`, {
                currentUser: userType,
                joinedUser: message.userType,
                totalUsers: message.totalUsers
              })
              
              // Only create offer once when patient joins (doctor's perspective)
              if (userType === 'doctor' && message.userType === 'patient' && !hasCreatedOfferRef.current) {
                hasCreatedOfferRef.current = true
                console.log('🎬 Patient joined, doctor creating offer...')
                // Wait a bit to ensure both peers are ready
                setTimeout(() => {
                  createOffer()
                }, 1500)
              }
              
              // If patient sees doctor joined, they should wait for offer
              if (userType === 'patient' && message.userType === 'doctor') {
                console.log('👨‍⚕️ Doctor joined, waiting for offer...')
              }
              
              // Debug: Log if we see our own join message (shouldn't happen)
              if (userType === message.userType) {
                console.warn('⚠️ Received own join message - this might indicate a signaling issue')
              }
              break
            default:
              console.warn('⚠️ Unknown message type:', message.type)
          }
        } catch (err) {
          console.error('❌ Error processing signaling message:', err)
        }
      }
      
      signalingWs.onerror = (error) => {
        console.error('❌ Signaling error:', error)
        toast.error('Signaling connection error')
      }
      
      signalingWs.onclose = (event) => {
        console.log('🔌 Signaling disconnected', {
          code: event.code,
          reason: event.reason,
          wasClean: event.wasClean
        })
        
        // Only reconnect if it wasn't a clean close and we're still mounted
        if (event.code !== 1000 && !cleanupDoneRef.current) {
          console.log('🔄 Attempting to reconnect in 2 seconds...')
          setTimeout(() => {
            if (!cleanupDoneRef.current && !signalingWsRef.current) {
              console.log('🔄 Reconnecting...')
              initializeCall()
            }
          }, 2000)
        }
      }
      
      setIsConnecting(false)
      isInitializingRef.current = false
      
    } catch (err) {
      console.error('❌ Error initializing call:', err)
      toast.error('Failed to access camera/microphone')
      setIsConnecting(false)
      isInitializingRef.current = false
    }
  }

  const createOffer = async () => {
    // Prevent duplicate offers
    if (hasCreatedOfferRef.current) {
      console.log('⚠️ Offer already created, skipping...')
      return
    }
    
    const pc = peerConnectionRef.current
    const ws = signalingWsRef.current
    
    console.log('🔍 createOffer called', {
      hasPC: !!pc,
      hasWS: !!ws,
      wsState: ws?.readyState,
      hasCreatedOffer: hasCreatedOfferRef.current
    })
    
    if (!pc) {
      console.error('❌ No peer connection')
      return
    }
    if (!ws) {
      console.error('❌ No signaling WebSocket')
      return
    }
    if (ws.readyState !== WebSocket.OPEN) {
      console.error('❌ WebSocket not open, state:', ws.readyState)
      return
    }
    
    // Mark as creating to prevent duplicates
    hasCreatedOfferRef.current = true
    
    try {
      console.log('📤 Creating offer...')
      const offer = await pc.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true
      })
      console.log('✅ Offer created:', offer.type)
      
      await pc.setLocalDescription(offer)
      console.log('✅ Local description set')
      
      const offerMessage = {
        type: 'offer',
        offer: offer
      }
      
      ws.send(JSON.stringify(offerMessage))
      console.log('✅ Offer sent successfully via WebSocket')
      toast.success('Call initiated')
    } catch (err) {
      console.error('❌ Error creating offer:', err)
      if (err instanceof Error) {
        console.error('Error details:', err.message, err.stack)
      }
      // Reset flag on error so we can retry
      hasCreatedOfferRef.current = false
      toast.error('Failed to initiate call')
    }
  }

  const handleOffer = async (offer: RTCSessionDescriptionInit) => {
    const pc = peerConnectionRef.current
    const ws = signalingWsRef.current
    
    if (!pc) {
      console.error('❌ No peer connection when handling offer')
      return
    }
    if (!ws) {
      console.error('❌ No signaling WebSocket when handling offer')
      return
    }
    
    try {
      console.log('📥 Received offer, creating answer...')
      toast.info('Received call, connecting...')
      
      // Set remote description first
      await pc.setRemoteDescription(new RTCSessionDescription(offer))
      console.log('✅ Remote description set')
      
      // Create and set local description (answer)
      const answer = await pc.createAnswer()
      await pc.setLocalDescription(answer)
      console.log('✅ Local description (answer) set')
      
      // Send answer
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
          type: 'answer',
          answer: answer
        }))
        console.log('✅ Answer sent successfully')
        toast.success('Answered call')
      } else {
        console.error('❌ WebSocket not open when trying to send answer')
        toast.error('Connection lost, please refresh')
      }
    } catch (err) {
      console.error('❌ Error handling offer:', err)
      toast.error('Failed to answer call')
    }
  }

  const handleAnswer = async (answer: RTCSessionDescriptionInit) => {
    const pc = peerConnectionRef.current
    
    if (!pc) {
      console.error('❌ No peer connection when handling answer')
      return
    }
    
    try {
      console.log('📥 Received answer')
      
      // Check if we already have a remote description
      if (pc.remoteDescription) {
        console.log('⚠️ Remote description already set, updating...')
      }
      
      await pc.setRemoteDescription(new RTCSessionDescription(answer))
      console.log('✅ Answer applied, connection should establish')
      toast.success('Call answered, connecting...')
    } catch (err) {
      console.error('❌ Error handling answer:', err)
      if (err instanceof Error) {
        console.error('Error details:', err.message, err.stack)
      }
      toast.error('Failed to process answer')
    }
  }

  const handleIceCandidate = async (candidate: RTCIceCandidateInit | null) => {
    const pc = peerConnectionRef.current
    
    if (!pc) {
      console.error('❌ No peer connection when handling ICE candidate')
      return
    }
    
    // null candidate means end of candidates
    if (!candidate) {
      console.log('🧊 Received end-of-candidates signal')
      return
    }
    
    try {
      // Check if remote description is set
      if (!pc.remoteDescription) {
        console.log('⏳ Queueing ICE candidate (no remote description yet)')
        // Queue it - will be added after remote description is set
        setTimeout(() => handleIceCandidate(candidate), 100)
        return
      }
      
      await pc.addIceCandidate(new RTCIceCandidate(candidate))
      console.log('✅ ICE candidate added:', candidate.candidate?.substring(0, 50))
    } catch (err) {
      console.error('❌ Error adding ICE candidate:', err)
      // If error is because remote description not set, retry
      if (err instanceof Error && err.message.includes('remoteDescription')) {
        console.log('⏳ Retrying ICE candidate after remote description is set')
        setTimeout(() => handleIceCandidate(candidate), 200)
      }
    }
  }

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0]
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled
        setIsVideoOn(videoTrack.enabled)
      }
    }
  }

  const toggleAudio = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0]
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled
        setIsAudioOn(audioTrack.enabled)
      }
    }
  }

  const cleanup = () => {
    console.log('🧹 Starting cleanup...')
    cleanupDoneRef.current = true
    
    // Stop all media tracks
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => {
        track.stop()
        console.log('🛑 Stopped track:', track.kind)
      })
      localStreamRef.current = null
    }
    
    // Close peer connection
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close()
      peerConnectionRef.current = null
      console.log('🛑 Closed peer connection')
    }
    
    // Close WebSocket
    if (signalingWsRef.current) {
      if (signalingWsRef.current.readyState === WebSocket.OPEN || 
          signalingWsRef.current.readyState === WebSocket.CONNECTING) {
        signalingWsRef.current.close()
        console.log('🛑 Closed signaling WebSocket')
      }
      signalingWsRef.current = null
    }
    
    // Reset flags
    hasCreatedOfferRef.current = false
    iceCandidateQueueRef.current = []
    setHasRemoteStream(false)
    setIsConnected(false)
    setIsConnecting(true)
    console.log('✅ Cleanup complete')
  }

  const endCall = () => {
    cleanup()
    router.push(userType === 'doctor' ? '/doctor/appointments' : '/patient/appointments')
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700 p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => router.back()} className="text-white">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <h1 className="text-white text-lg font-semibold">
              Video Consultation
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-yellow-500'} animate-pulse`} />
            <span className="text-white text-sm">
              {isConnecting ? 'Connecting...' : isConnected ? 'Connected' : 'Waiting for peer'}
            </span>
          </div>
        </div>
      </header>

      {/* Video Grid */}
      <main className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Remote Video */}
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-0 aspect-video bg-slate-900 relative">
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                muted={false}
                className="w-full h-full object-cover"
                onLoadedMetadata={() => {
                  console.log('✅ Remote video metadata loaded')
                  if (remoteVideoRef.current) {
                    remoteVideoRef.current.play().catch(err => {
                      console.error('Error playing after metadata load:', err)
                    })
                  }
                }}
                onPlay={() => {
                  console.log('✅ Remote video started playing')
                  setHasRemoteStream(true)
                  setIsConnected(true)
                }}
                onError={(e) => {
                  console.error('❌ Remote video error:', e)
                }}
              />
              {!hasRemoteStream && (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-900">
                  <div className="text-center text-white">
                    <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                      <Video className="w-8 h-8" />
                    </div>
                    <p className="text-lg">Waiting for {userType === 'doctor' ? 'patient' : 'doctor'}...</p>
                    <p className="text-sm text-slate-400 mt-2">
                      {isConnecting ? 'Connecting...' : 'Waiting for connection'}
                    </p>
                  </div>
                </div>
              )}
              <div className="absolute top-4 left-4 bg-slate-900/80 px-3 py-1 rounded-lg">
                <span className="text-white text-sm">
                  {userType === 'doctor' ? 'Patient' : 'Doctor'}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Local Video */}
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-0 aspect-video bg-slate-900 relative">
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
                style={{ transform: 'scaleX(-1)' }}
              />
              <div className="absolute top-4 left-4 bg-slate-900/80 px-3 py-1 rounded-lg">
                <span className="text-white text-sm">You</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Controls */}
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-6">
            <div className="flex justify-center items-center gap-4">
              <Button
                onClick={toggleVideo}
                variant="outline"
                size="lg"
                className={`${isVideoOn ? 'bg-slate-700' : 'bg-red-500'} text-white border-slate-600`}
              >
                {isVideoOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
              </Button>

              <Button
                onClick={toggleAudio}
                variant="outline"
                size="lg"
                className={`${isAudioOn ? 'bg-slate-700' : 'bg-red-500'} text-white border-slate-600`}
              >
                {isAudioOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
              </Button>

              <Button
                onClick={endCall}
                variant="destructive"
                size="lg"
                className="bg-red-500 hover:bg-red-600"
              >
                <PhoneOff className="w-5 h-5 mr-2" />
                End Call
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
