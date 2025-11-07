'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { toast } from 'sonner'

interface UseWebSocketOptions {
  url: string
  onMessage?: (event: MessageEvent) => void
  onOpen?: () => void
  onClose?: () => void
  onError?: (error: Event) => void
  maxRetries?: number
  retryDelay?: number
  enabled?: boolean
}

interface UseWebSocketReturn {
  ws: WebSocket | null
  isConnected: boolean
  isConnecting: boolean
  error: string | null
  send: (data: string | ArrayBufferLike | Blob | ArrayBufferView) => void
  reconnect: () => void
  close: () => void
}

export function useWebSocketWithRetry({
  url,
  onMessage,
  onOpen,
  onClose,
  onError,
  maxRetries = 3,
  retryDelay = 1000,
  enabled = true
}: UseWebSocketOptions): UseWebSocketReturn {
  const wsRef = useRef<WebSocket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const retryCountRef = useRef(0)
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const shouldConnectRef = useRef(enabled)

  const connect = useCallback(() => {
    if (!shouldConnectRef.current || wsRef.current?.readyState === WebSocket.OPEN) {
      return
    }

    try {
      setIsConnecting(true)
      setError(null)

      const ws = new WebSocket(url)
      wsRef.current = ws

      ws.onopen = () => {
        console.log('WebSocket connected')
        setIsConnected(true)
        setIsConnecting(false)
        setError(null)
        retryCountRef.current = 0
        
        if (retryCountRef.current > 0) {
          toast.success('Reconnected successfully')
        }
        
        onOpen?.()
      }

      ws.onmessage = (event) => {
        onMessage?.(event)
      }

      ws.onerror = (event) => {
        console.error('WebSocket error:', event)
        const errorMessage = 'Connection error occurred'
        setError(errorMessage)
        onError?.(event)
      }

      ws.onclose = () => {
        console.log('WebSocket closed')
        setIsConnected(false)
        setIsConnecting(false)
        wsRef.current = null
        onClose?.()

        // Attempt to reconnect with exponential backoff
        if (shouldConnectRef.current && retryCountRef.current < maxRetries) {
          const delay = retryDelay * Math.pow(2, retryCountRef.current)
          retryCountRef.current++
          
          toast.warning(`Connection lost. Retrying in ${delay / 1000}s... (${retryCountRef.current}/${maxRetries})`)
          
          retryTimeoutRef.current = setTimeout(() => {
            connect()
          }, delay)
        } else if (retryCountRef.current >= maxRetries) {
          const errorMessage = 'Failed to connect after multiple attempts'
          setError(errorMessage)
          toast.error(errorMessage)
        }
      }
    } catch (err) {
      console.error('Error creating WebSocket:', err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to create connection'
      setError(errorMessage)
      setIsConnecting(false)
      toast.error(errorMessage)
    }
  }, [url, onMessage, onOpen, onClose, onError, maxRetries, retryDelay])

  const send = useCallback((data: string | ArrayBufferLike | Blob | ArrayBufferView) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(data)
    } else {
      console.warn('WebSocket is not connected. Cannot send data.')
      toast.error('Cannot send data: Connection not established')
    }
  }, [])

  const reconnect = useCallback(() => {
    retryCountRef.current = 0
    if (wsRef.current) {
      wsRef.current.close()
    }
    connect()
  }, [connect])

  const close = useCallback(() => {
    shouldConnectRef.current = false
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current)
    }
    if (wsRef.current) {
      wsRef.current.close()
      wsRef.current = null
    }
    setIsConnected(false)
    setIsConnecting(false)
  }, [])

  useEffect(() => {
    shouldConnectRef.current = enabled
    if (enabled) {
      connect()
    } else {
      close()
    }

    return () => {
      shouldConnectRef.current = false
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current)
      }
      if (wsRef.current) {
        wsRef.current.close()
      }
    }
  }, [enabled, connect, close])

  return {
    ws: wsRef.current,
    isConnected,
    isConnecting,
    error,
    send,
    reconnect,
    close
  }
}
