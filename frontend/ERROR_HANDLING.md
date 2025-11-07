# Error Handling and Loading States Implementation

This document describes the comprehensive error handling and loading states implemented across the Arogya-AI Telehealth Platform.

## Overview

The application now includes:
- React Error Boundaries for catching component errors
- Toast notifications for user feedback
- WebSocket retry logic with exponential backoff
- Loading spinners for async operations
- User-friendly error messages throughout

## Components

### 1. Error Boundary (`components/ErrorBoundary.tsx`)

A React Error Boundary component that catches JavaScript errors anywhere in the component tree.

**Features:**
- Catches and logs errors
- Displays user-friendly error message
- Shows stack trace in development mode
- Provides "Refresh Page" and "Go Back" actions

**Usage:**
```tsx
<ErrorBoundary>
  <YourComponent />
</ErrorBoundary>
```

The Error Boundary is automatically applied at the root layout level.

### 2. Toast Provider (`components/providers/ToastProvider.tsx`)

Provides toast notifications using the `sonner` library.

**Features:**
- Success, error, warning, and info toasts
- Auto-dismiss after 4 seconds
- Close button for manual dismissal
- Positioned at top-right

**Usage:**
```tsx
import { toast } from 'sonner'

toast.success('Operation successful!')
toast.error('Something went wrong')
toast.warning('Please be careful')
toast.info('FYI: Something happened')
```

### 3. WebSocket with Retry (`lib/useWebSocketWithRetry.ts`)

A custom React hook that manages WebSocket connections with automatic retry logic.

**Features:**
- Automatic reconnection with exponential backoff
- Configurable max retries (default: 3)
- Configurable retry delay (default: 2000ms)
- Connection state tracking
- User notifications for connection status

**Parameters:**
- `url`: WebSocket URL
- `onMessage`: Message handler
- `onOpen`: Connection opened handler
- `onClose`: Connection closed handler
- `onError`: Error handler
- `maxRetries`: Maximum retry attempts (default: 3)
- `retryDelay`: Initial retry delay in ms (default: 1000)
- `enabled`: Whether to connect (default: true)

**Returns:**
- `ws`: WebSocket instance
- `isConnected`: Connection status
- `isConnecting`: Connecting status
- `error`: Error message
- `send`: Function to send data
- `reconnect`: Function to manually reconnect
- `close`: Function to close connection

**Usage:**
```tsx
const { ws, isConnected, send, reconnect } = useWebSocketWithRetry({
  url: 'ws://localhost:8000/ws',
  onMessage: (event) => console.log(event.data),
  maxRetries: 3,
  retryDelay: 2000
})
```

### 4. Loading Spinner (`components/ui/spinner.tsx`)

Reusable loading spinner components.

**Components:**
- `Spinner`: Basic spinner with size variants
- `LoadingOverlay`: Spinner with message

**Usage:**
```tsx
<Spinner size="sm" />
<Spinner size="md" />
<Spinner size="lg" />

<LoadingOverlay message="Loading data..." />
```

## Implementation Details

### VideoCallRoom Component

**Error Handling:**
- Media device access errors (permissions, not found, in use)
- WebRTC connection failures
- WebSocket connection failures with automatic retry
- Audio streaming errors

**Loading States:**
- Connecting to video call
- Connecting to translation service
- Media initialization

**User Feedback:**
- Connection status alerts
- Toast notifications for events
- Retry buttons for failed connections

### SoapNoteReview Component

**Error Handling:**
- Failed to load SOAP note
- Failed to save SOAP note
- Failed to submit lexicon term
- Network errors

**Loading States:**
- Loading SOAP note
- Saving SOAP note
- Submitting lexicon term

**User Feedback:**
- Toast notifications for all actions
- Error fallback screen with retry option
- Success messages for completed actions

### Authentication Page

**Error Handling:**
- Invalid credentials
- Network errors
- Validation errors
- Session errors

**Loading States:**
- Signing in
- Creating account

**User Feedback:**
- Toast notifications
- Inline error alerts
- Loading spinner in button

### Dashboard Components

**StartCallButton:**
- Session validation
- Patient creation errors
- Consultation creation errors
- Loading state with spinner

## Best Practices

### 1. Always Show Loading States

```tsx
const [isLoading, setIsLoading] = useState(false)

// Show loading
if (isLoading) {
  return <LoadingOverlay message="Loading..." />
}
```

### 2. Provide User Feedback

```tsx
try {
  await someAsyncOperation()
  toast.success('Operation completed!')
} catch (err) {
  toast.error('Operation failed')
}
```

### 3. Handle Errors Gracefully

```tsx
try {
  // risky operation
} catch (err) {
  console.error('Error:', err)
  const message = err instanceof Error ? err.message : 'Unknown error'
  setError(message)
  toast.error(message)
}
```

### 4. Provide Recovery Options

```tsx
<Button onClick={handleRetry}>
  <RefreshCw className="h-4 w-4" />
  Retry
</Button>
```

### 5. Use Exponential Backoff for Retries

The WebSocket hook implements exponential backoff:
- Attempt 1: 2s delay
- Attempt 2: 4s delay
- Attempt 3: 8s delay

## Testing Error Scenarios

### Test WebSocket Retry Logic

1. Start the application
2. Stop the backend server
3. Start a video call
4. Observe retry attempts with toast notifications
5. Restart backend server
6. Verify automatic reconnection

### Test Media Device Errors

1. Deny camera/microphone permissions
2. Start a video call
3. Verify error message and recovery instructions

### Test Network Errors

1. Disconnect network
2. Try to load SOAP note
3. Verify error message and retry button
4. Reconnect network
5. Click retry button

## Future Enhancements

1. **Offline Mode**: Cache data for offline access
2. **Error Reporting**: Integrate with error tracking service (Sentry)
3. **Network Status Indicator**: Show online/offline status
4. **Retry Queue**: Queue failed operations for automatic retry
5. **Progressive Enhancement**: Graceful degradation for older browsers
