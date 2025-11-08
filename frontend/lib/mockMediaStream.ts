/**
 * Mock Media Stream for Testing Without Camera/Microphone
 * Creates a fake video stream with a colored canvas and silent audio
 */

export function createMockVideoStream(): MediaStream {
  // Create a canvas element for fake video
  const canvas = document.createElement('canvas')
  canvas.width = 640
  canvas.height = 480
  const ctx = canvas.getContext('2d')!

  // Draw a gradient background with text
  const drawFrame = () => {
    // Gradient background
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
    gradient.addColorStop(0, '#667eea')
    gradient.addColorStop(1, '#764ba2')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Add text
    ctx.fillStyle = 'white'
    ctx.font = 'bold 32px Arial'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('Test Mode', canvas.width / 2, canvas.height / 2 - 40)
    
    ctx.font = '20px Arial'
    ctx.fillText('No Camera Required', canvas.width / 2, canvas.height / 2 + 10)
    
    // Add timestamp
    ctx.font = '16px monospace'
    ctx.fillText(new Date().toLocaleTimeString(), canvas.width / 2, canvas.height / 2 + 50)
  }

  // Update canvas every 100ms
  const interval = setInterval(drawFrame, 100)
  drawFrame()

  // Get video stream from canvas
  const videoStream = canvas.captureStream(30) // 30 FPS

  // Create silent audio track
  const audioContext = new AudioContext()
  const oscillator = audioContext.createOscillator()
  const gainNode = audioContext.createGain()
  
  // Set gain to 0 for silence
  gainNode.gain.value = 0
  
  oscillator.connect(gainNode)
  gainNode.connect(audioContext.destination)
  oscillator.start()

  // Get audio stream
  const audioDestination = audioContext.createMediaStreamDestination()
  gainNode.connect(audioDestination)
  const audioTrack = audioDestination.stream.getAudioTracks()[0]

  // Combine video and audio
  const mockStream = new MediaStream([
    ...videoStream.getVideoTracks(),
    audioTrack
  ])

  // Cleanup function (store on stream for later cleanup)
  ;(mockStream as any)._cleanup = () => {
    clearInterval(interval)
    oscillator.stop()
    audioContext.close()
  }

  return mockStream
}

export function createMockAudioStream(): MediaStream {
  // Create silent audio track
  const audioContext = new AudioContext()
  const oscillator = audioContext.createOscillator()
  const gainNode = audioContext.createGain()
  
  // Very low volume for testing
  gainNode.gain.value = 0.001
  
  oscillator.connect(gainNode)
  const audioDestination = audioContext.createMediaStreamDestination()
  gainNode.connect(audioDestination)
  oscillator.start()

  const mockStream = audioDestination.stream

  // Cleanup function
  ;(mockStream as any)._cleanup = () => {
    oscillator.stop()
    audioContext.close()
  }

  return mockStream
}

export function cleanupMockStream(stream: MediaStream) {
  // Stop all tracks
  stream.getTracks().forEach(track => track.stop())
  
  // Call cleanup if available
  if ((stream as any)._cleanup) {
    (stream as any)._cleanup()
  }
}
