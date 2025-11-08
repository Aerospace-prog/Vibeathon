# WebSocket Connection Fix

## Problem

The frontend was creating hundreds of WebSocket connections because:

1. **Dependency Array Issue**: The `useEffect` in `useWebSocketWithRetry` had `connect` and `close` functions in its dependency array
2. **Function Recreation**: These functions were recreated on every render due to `useCallback` dependencies
3. **Reconnection Loop**: Each recreation triggered the effect, causing a new connection

## Solution

### 1. Fixed Dependency Array
**File:** `frontend/lib/useWebSocketWithRetry.ts`

Changed from:
```typescript
useEffect(() => {
  // ...
}, [enabled, connect, close])  // ❌ Functions recreated every render
```

To:
```typescript
useEffect(() => {
  // ...
}, [enabled, url])  // ✅ Only reconnect when enabled or URL changes
```

### 2. Added Connection State Check

Added check to prevent connecting if already connected or connecting:

```typescript
const connect = useCallback(() => {
  // Don't connect if already connected or connecting
  if (wsRef.current) {
    const state = wsRef.current.readyState
    if (state === WebSocket.OPEN || state === WebSocket.CONNECTING) {
      console.log('WebSocket already connected or connecting, skipping...')
      return
    }
  }
  // ... rest of connection logic
}, [url, ...])
```

### 3. Conditional Connection

Only connect if not already connected:

```typescript
if (enabled && !wsRef.current) {
  connect()
}
```

## Result

Now the WebSocket will only create ONE connection per video call session:

**Before:**
```
INFO: WebSocket connected: xxx_doctor
INFO: WebSocket connected: xxx_doctor
INFO: WebSocket connected: xxx_doctor
... (hundreds of times)
```

**After:**
```
INFO: WebSocket connected: xxx_doctor
Received 8192 bytes of audio data from doctor
Received 8192 bytes of audio data from doctor
... (normal operation)
```

## Testing

1. **Restart frontend:**
   ```bash
   cd frontend
   npm run dev
   ```

2. **Start a video call**
3. **Check backend logs** - should see only ONE connection message
4. **Check browser console** - should see "WebSocket connected" only once

## Expected Behavior

- ✅ One WebSocket connection per user
- ✅ Connection persists for entire call
- ✅ Automatic reconnection only on disconnect
- ✅ Clean disconnection when call ends

## Why This Matters

**Before:**
- 100+ connections per call
- Server resource exhaustion
- Potential rate limiting
- Confusing logs

**After:**
- 1 connection per call
- Efficient resource usage
- Clean logs
- Reliable operation

## Additional Notes

The retry logic still works correctly:
- If connection fails, it will retry up to 3 times
- Exponential backoff between retries (2s, 4s, 8s)
- User sees toast notifications for connection status
- Graceful degradation if connection can't be established
