# Test WebSocket Connection

## Current Issue
WebSocket is failing to connect. This could be due to:
1. Backend STT pipeline not initialized
2. Database connection issues
3. Missing dependencies

## Quick Test

### Test 1: Check Backend is Running

Open browser and go to: http://localhost:8000/docs

You should see the FastAPI Swagger documentation.

### Test 2: Check Health Endpoint

Go to: http://localhost:8000/health

You should see:
```json
{
  "status": "healthy" or "degraded",
  "service": "arogya-ai-backend",
  "dependencies": {
    "database": "healthy" or "unhealthy",
    "stt_pipeline": "healthy" or "unhealthy"
  }
}
```

### Test 3: Check Backend Terminal

Look at your backend terminal for errors. Common issues:

**"Failed to initialize STT pipeline"**
- Missing Google Cloud credentials
- Missing API keys

**"Database connection failed"**
- Supabase credentials not set in backend/.env

## Solution: Add Missing Environment Variables

The backend needs these in `backend/.env`:

```env
# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_service_role_key

# Google Cloud (for STT and Translation)
GOOGLE_APPLICATION_CREDENTIALS=path/to/service-account.json
# OR
GOOGLE_CLOUD_PROJECT=your-project-id

# OpenAI (for SOAP note generation)
OPENAI_API_KEY=your_openai_api_key
```

## Temporary Fix: Skip STT Pipeline

For testing the video call without translation, we can modify the backend to skip STT initialization.

### Option 1: Mock Mode (Recommended for Testing)

Add to `backend/.env`:
```env
MOCK_MODE=true
```

Then modify `backend/app/main.py` to check for mock mode.

### Option 2: Test WebSocket Directly

Use this JavaScript in browser console to test WebSocket:

```javascript
const ws = new WebSocket('ws://localhost:8000/ws/test-consultation-id/doctor');

ws.onopen = () => {
  console.log('✅ WebSocket connected!');
};

ws.onerror = (error) => {
  console.error('❌ WebSocket error:', error);
};

ws.onmessage = (event) => {
  console.log('📨 Message received:', event.data);
};

ws.onclose = () => {
  console.log('🔌 WebSocket closed');
};
```

If this connects successfully, the WebSocket server is working.

## What to Check in Backend Terminal

When you start a video call, you should see in backend terminal:

```
INFO: WebSocket connected: consultation=xxx, user=doctor
INFO: Created new consultation room: xxx
```

If you see errors instead, that's what we need to fix.

## Next Steps

1. Check `http://localhost:8000/health` - what does it say?
2. Look at backend terminal - any errors?
3. Check `backend/.env` - are all required variables set?

Let me know what you find and I'll help fix it!
