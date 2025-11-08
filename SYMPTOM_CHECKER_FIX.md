# Symptom Checker Button Fix ✅

## Issue Fixed
The "Check My Symptoms" button was not clickable because it was disabled when the backend server connection check failed.

## Changes Made

### 1. Updated Backend URL Configuration
**File**: `Vibeathon/frontend/components/patient/PatientSymptomChecker.tsx`

Changed hardcoded URLs to use environment variable:

```typescript
// Before
const response = await fetch('http://localhost:8000/')

// After
const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'
const response = await fetch(`${backendUrl}/`)
```

This was done in two places:
- `checkServerConnection()` function
- `analyzeSymptoms()` function

## How to Test

### 1. Make sure the backend is running:

```bash
cd Vibeathon/backend
python run.py
```

You should see:
```
INFO:     Uvicorn running on http://0.0.0.0:8000
```

### 2. Make sure the frontend is running:

```bash
cd Vibeathon/frontend
npm run dev
```

### 3. Test the symptom checker:

1. Navigate to: http://localhost:3000/patient/book-appointment
2. You should see the "Symptom Checker" tab
3. The button should now be clickable (not grayed out)
4. Try entering symptoms like "I have chest pain"
5. Click "Check My Symptoms"

## Button Disabled States

The button is disabled when:
- ✅ Backend server is not connected (`serverStatus !== 'connected'`)
- ✅ Currently analyzing symptoms (`isAnalyzing`)
- ✅ No symptoms entered (`!symptoms.trim()`)

## Server Status Indicator

The component shows a red alert if the backend is disconnected:
```
⚠️ Service Unavailable
Unable to connect to symptom checker. Please contact your doctor directly.
```

## Environment Variables

Make sure your `.env.local` has:
```bash
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
```

## Backend Endpoint

The symptom checker uses the `/analyze` endpoint:
- **Method**: POST
- **URL**: `http://localhost:8000/analyze`
- **Body**:
  ```json
  {
    "text": "patient symptoms",
    "consultation_id": "patient-timestamp",
    "speaker_type": "patient"
  }
  ```

## Troubleshooting

### Button still disabled?

1. **Check backend is running**:
   ```bash
   curl http://localhost:8000/
   ```
   Should return: `{"status":"healthy",...}`

2. **Check browser console** (F12):
   - Look for connection errors
   - Check if `serverStatus` is 'connected'

3. **Check environment variable**:
   - Restart the Next.js dev server after changing `.env.local`
   - Verify with: `console.log(process.env.NEXT_PUBLIC_BACKEND_URL)`

4. **CORS issues**:
   - Backend already has CORS enabled for `http://localhost:3000`
   - If using different port, update `main.py`:
     ```python
     allow_origins=["http://localhost:3000", "http://localhost:3001"]
     ```

### Backend not starting?

1. **Check Python dependencies**:
   ```bash
   cd Vibeathon/backend
   pip install -r requirements.txt
   ```

2. **Check environment variables**:
   - Make sure `.env` file exists in `Vibeathon/backend/`
   - Required: `GEMINI_API_KEY`, `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`

3. **Check port 8000 is free**:
   ```bash
   # Windows
   netstat -ano | findstr :8000
   
   # Mac/Linux
   lsof -i :8000
   ```

## Success Indicators

When working correctly:
- ✅ No red "Service Unavailable" alert
- ✅ "Check My Symptoms" button is blue/teal (not grayed out)
- ✅ Button shows "Check My Symptoms" with Activity icon
- ✅ Clicking button shows "Analyzing your symptoms..." with spinner
- ✅ Results appear below after analysis

## Features

The symptom checker:
- 🤖 Uses AI to analyze symptoms
- 🚨 Detects critical symptoms requiring immediate attention
- 📊 Provides severity scores (1-5)
- 💡 Gives recommendations and next steps
- 📅 Allows scheduling consultations based on severity
- ⚡ Quick select buttons for common symptoms

## Next Steps

If everything is working:
1. Test with different symptoms
2. Try the quick select buttons
3. Test the "Schedule Consultation" flow
4. Verify severity levels display correctly (mild/moderate/severe/critical)
