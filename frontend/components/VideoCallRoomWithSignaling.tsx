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
  
  // State
  const [isVideoOn, setIsVideoOn] = useState(true)
  const [isAudioOn, setIsAudioOn] = useState(true)
  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(true)
  
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'
  const wsUrl = backendUrl.replace('http', 'ws')

  useEffect(() => {
    initializeCall()
    
    return () => {
      cleanup()
    }
  }, [consultationId, userType])

  const initializeCall = async () => {
    try {
      // 1. Get local media
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      })
      
      localStreamRef.current = stream
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream
      }
      
      console.log('✅ Local media obtained')
      
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
        console.log('📹 Received remote track')
        if (remoteVideoRef.current && event.streams[0]) {
          remoteVideoRef.current.srcObject = event.streams[0]
          setIsConnected(true)
          toast.success('Connected to peer!')
        }
      }
      
      // 5. Handle connection state
      pc.onconnectionstatechange = () => {
        console.log('🔗 Connection state:', pc.connectionState)
        if (pc.connectionState === 'connected') {
          setIsConnected(true)
          setIsConnecting(false)
          toast.success('Video call connected!')
        } else if (pc.connectionState === 'failed') {
          toast.error('Connection failed')
          setIsConnecting(false)
        } else if (pc.connectionState === 'disconnected') {
          toast.warning('Peer disconnected')
          setIsConnected(false)
        }
      }
      
      // 6. Handle ICE candidates
      pc.onicecandidate = (event) => {
        if (event.candidate && signalingWsRef.current?.readyState === WebSocket.OPEN) {
          console.log('🧊 Sending ICE candidate')
          signalingWsRef.current.send(JSON.stringify({
            type: 'ice-candidate',
            candidate: event.candidate
          }))
        }
      }
      
      // 7. Connect to signaling server
      const signalingWs = new WebSocket(`${wsUrl}/ws/signaling/${consultationId}/${userType}`)
      signalingWsRef.current = signalingWs
      
      signalingWs.onopen = () => {
        console.log('✅ Signaling connected as', userType)
        toast.success('Signaling server connected')
      }
      
      signalingWs.onmessage = async (event) => {
        const message = JSON.parse(event.data)
        console.log('📨 Signaling message:', message.type)
        
        switch (message.type) {
          case 'offer':
            await handleOffer(message.offer)
            break
          case 'answer':
            await handleAnswer(message.answer)
            break
          case 'ice-candidate':
            await handleIceCandidate(message.candidate)
            break
          case 'user-joined':
            console.log(`👤 ${message.userType} joined (${message.totalUsers} total)`)
            // Only create offer once when patient joins
            if (userType === 'doctor' && message.userType === 'patient' && !hasCreatedOfferRef.current) {
              hasCreatedOfferRef.current = true
              console.log('🎬 Patient joined, doctor creating offer...')
              setTimeout(() => createOffer(), 1000)
            }
            break
        }
      }
      
      signalingWs.onerror = (error) => {
        console.error('❌ Signaling error:', error)
        toast.error('Signaling connection error')
      }
      
      signalingWs.onclose = () => {
        console.log('🔌 Signaling disconnected')
      }
      
      setIsConnecting(false)
      
    } catch (err) {
      console.error('❌ Error initializing call:', err)
      toast.error('Failed to access camera/microphone')
      setIsConnecting(false)
    }
  }

  const createOffer = async () => {
    const pc = peerConnectionRef.current
    const ws = signalingWsRef.current
    
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
    
    try {
      console.log('📤 Creating offer...')
      const offer = await pc.createOffer()
      await pc.setLocalDescription(offer)
      
      ws.send(JSON.stringify({
        type: 'offer',
        offer: offer
      }))
      
      console.log('✅ Offer sent successfully')
      toast.success('Call initiated')
    } catch (err) {
      console.error('❌ Error creating offer:', err)
      toast.error('Failed to initiate call')
    }
  }

  const handleOffer = async (offer: RTCSessionDescriptionInit) => {
    const pc = peerConnectionRef.current
    const ws = signalingWsRef.current
    
    if (!pc || !ws) return
    
    try {
      console.log('📥 Received offer, creating answer...')
      toast.info('Received call, connecting...')
      await pc.setRemoteDescription(new RTCSessionDescription(offer))
      
      const answer = await pc.createAnswer()
      await pc.setLocalDescription(answer)
      
      ws.send(JSON.stringify({
        type: 'answer',
        answer: answer
      }))
      
      console.log('✅ Answer sent successfully')
      toast.success('Answered call')
    } catch (err) {
      console.error('❌ Error handling offer:', err)
      toast.error('Failed to answer call')
    }
  }

  const handleAnswer = async (answer: RTCSessionDescriptionInit) => {
    const pc = peerConnectionRef.current
    
    if (!pc) return
    
    try {
      console.log('📥 Received answer')
      await pc.setRemoteDescription(new RTCSessionDescription(answer))
      console.log('✅ Answer applied, connection should establish')
      toast.success('Call answered, connecting...')
    } catch (err) {
      console.error('❌ Error handling answer:', err)
      toast.error('Failed to process answer')
    }
  }

  const handleIceCandidate = async (candidate: RTCIceCandidateInit) => {
    const pc = peerConnectionRef.current
    
    if (!pc) return
    
    try {
      await pc.addIceCandidate(new RTCIceCandidate(candidate))
      console.log('✅ ICE candidate added')
    } catch (err) {
      console.error('❌ Error adding ICE candidate:', err)
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
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop())
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close()
    }
    if (signalingWsRef.current) {
      signalingWsRef.current.close()
    }
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
                className="w-full h-full object-cover"
              />
              {!isConnected && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-white">
                    <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Video className="w-8 h-8" />
                    </div>
                    <p>Waiting for {userType === 'doctor' ? 'patient' : 'doctor'}...</p>
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
