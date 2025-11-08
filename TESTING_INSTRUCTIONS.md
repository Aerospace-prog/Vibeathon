# 🏥 Alert Engine - Dynamic Testing Instructions

## What You Have Now

✅ **Backend Alert Engine** - Real-time medical symptom detection
✅ **FastAPI REST API** - HTTP endpoints for analysis
✅ **React Testing Interface** - Dynamic, integrated with your frontend
✅ **Reusable Components** - Ready for consultation room integration

## Quick Start (3 Steps)

### Step 1: Start Backend API

```bash
cd backend
./start_server.sh
```

You should see:
```
🚀 Starting FastAPI server on http://localhost:8000
📊 API docs available at http://localhost:8000/docs
```

### Step 2: Start Frontend (New Terminal)

```bash
cd frontend
npm run dev
```

You should see:
```
▲ Next.js 14.x.x
- Local: http://localhost:3000
```

### Step 3: Test It!

**Option A: From Dashboard (Recommended)**
1. Open browser: **http://localhost:3000/dashboard**
2. Login with your credentials
3. Scroll down to "🏥 Alert Engine Testing" section
4. Type any patient speech in the text area
5. Click "Analyze for Critical Symptoms"
6. See real-time results!

**Option B: Dedicated Test Page**
1. Open browser: **http://localhost:3000/alert-test**
2. Login with your credentials
3. Full-screen testing interface

## OR Use the All-in-One Script

```bash
./start_alert_engine.sh
```

This starts both backend and frontend automatically!

## Testing Examples

### Critical Alerts (Should Trigger)

Try typing these in the test interface:

1. **"I have severe chest pain that started suddenly"**
   - Expected: Severity 5 alert for chest_pain

2. **"I can't breathe properly"**
   - Expected: Severity 5 alert for breathing

3. **"I passed out earlier today"**
   - Expected: Severity 5 alert for consciousness

4. **"I'm feeling suicidal"**
   - Expected: Severity 5 alert for mental_health

### No Alerts (Should NOT Trigger)

5. **"I have a mild headache"**
   - Expected: No alert (severity too low)

6. **"The patient looks fine to me"** (set speaker to "doctor")
   - Expected: No alert (doctor speaking)

## What Makes This Dynamic?

✅ **Real User Input** - Type anything, not just test cases
✅ **Live Analysis** - Instant feedback from the Alert Engine
✅ **Interactive UI** - Change speaker type, consultation ID
✅ **Visual Feedback** - Color-coded alerts based on severity
✅ **Example Buttons** - Quick testing with pre-filled phrases
✅ **Live Simulation** - Auto-typing consultation scenarios with real-time detection
✅ **Alert History** - Track all detected alerts in your session
✅ **Statistics Dashboard** - Real-time metrics and detection rates

## New Dynamic Features

### 1. 🎬 Live Consultation Simulation
- **Auto-typing scenarios** - Watch patient speech being typed in real-time
- **4 pre-built scenarios** - Emergency chest pain, mental health crisis, routine checkup, breathing emergency
- **Automatic detection** - Alerts trigger automatically at sentence breaks
- **Play/Pause/Reset controls** - Full control over simulation
- **Progress tracking** - See character-by-character progress

### 2. 📊 Statistics Dashboard
- **Total alerts** - Count of all detected alerts
- **Detection rate** - Percentage of analyses that triggered alerts
- **Average severity** - Mean severity score across all alerts
- **Severity breakdown** - Visual bars showing critical/urgent/warning distribution
- **Most common symptom** - Track which symptom type appears most

### 3. 📜 Alert History Panel
- **Session tracking** - All alerts from your current session
- **Scrollable list** - Review past detections
- **Timestamp tracking** - See when each alert was triggered
- **Clear history** - Reset for new testing session

## Components You Can Use

### 1. AlertEngineTest Component
Location: `frontend/components/alerts/AlertEngineTest.tsx`

Full testing interface with:
- Input fields for consultation ID and speaker type
- Text area for patient/doctor speech
- Example phrase buttons
- Real-time analysis results
- Server connection status
- **NEW:** Integrated live simulation
- **NEW:** Statistics dashboard
- **NEW:** Alert history tracking

### 2. AlertBanner Component
Location: `frontend/components/alerts/AlertBanner.tsx`

Reusable alert display for consultation room:
- Color-coded by severity
- Pulsing animation for critical alerts
- Acknowledge button
- Auto-dismiss option

**Usage in consultation room:**
```tsx
import AlertBanner from '@/components/alerts/AlertBanner'

{currentAlert && (
  <AlertBanner
    alert={currentAlert}
    onAcknowledge={() => setCurrentAlert(null)}
  />
)}
```

## API Endpoints Available

### POST /analyze
Analyze text for critical symptoms

**Request:**
```json
{
  "text": "I have severe chest pain",
  "consultation_id": "consult-123",
  "speaker_type": "patient"
}
```

**Response:**
```json
{
  "alert_detected": true,
  "alert": {
    "symptom_text": "I have severe chest pain",
    "symptom_type": "chest_pain",
    "severity_score": 5,
    "timestamp": "2024-01-15T10:30:45"
  },
  "message": "Critical symptom detected: chest_pain"
}
```

### GET /patterns
Get all symptom patterns

### POST /clear-cache/{consultation_id}
Clear deduplication cache

## How It Works

```
1. User types text in frontend
        ↓
2. Frontend sends POST to /analyze
        ↓
3. Alert Engine analyzes text
   - Pattern matching (regex)
   - Context extraction
   - Severity calculation
   - Deduplication check
        ↓
4. Backend returns result
        ↓
5. Frontend displays alert (if detected)
```

## Severity Scoring

- **Severity 5** (Red, Pulsing): IMMEDIATE attention
  - Chest pain, breathing issues, loss of consciousness, mental health crisis
  
- **Severity 4** (Orange): URGENT attention
  - Severe bleeding, neurological symptoms
  
- **Severity 3** (Yellow): Medical attention recommended
  - Moderate symptoms with concerning context

- **Below 3**: No alert triggered

## Deduplication

The Alert Engine prevents alert fatigue:
- Same symptom won't trigger again within 5 minutes
- Per consultation tracking
- Cache cleared when consultation ends

## Next Steps for Integration

1. ✅ **Testing** - Use /alert-test page (DONE)
2. ⏳ **WebRTC Integration** - Add to consultation room
3. ⏳ **WebSocket** - Real-time alerts during live calls
4. ⏳ **Database** - Store alerts in Supabase
5. ⏳ **History** - View past alerts in patient records

## Troubleshooting

**"Server not running" message:**
- Make sure backend is started: `cd backend && ./start_server.sh`
- Check if port 8000 is available

**Can't access /alert-test page:**
- Make sure you're logged in
- Frontend must be running on port 3000

**No alerts triggering:**
- Verify speaker type is "patient"
- Try the example phrases
- Check backend logs for errors

## Files Created

### Backend
- `backend/app/alert_engine.py` - Core engine
- `backend/app/main.py` - FastAPI server
- `backend/requirements.txt` - Dependencies
- `backend/start_server.sh` - Startup script

### Frontend
- `frontend/components/alerts/AlertEngineTest.tsx` - Testing interface
- `frontend/components/alerts/AlertBanner.tsx` - Alert display
- `frontend/app/alert-test/page.tsx` - Test page

### Documentation
- `ALERT_ENGINE_SETUP.md` - Detailed setup guide
- `TESTING_INSTRUCTIONS.md` - This file
- `start_alert_engine.sh` - All-in-one startup

## Success Criteria

✅ Backend API running on port 8000
✅ Frontend running on port 3000
✅ Can access /alert-test page
✅ Can type text and get real-time analysis
✅ Critical symptoms trigger alerts
✅ Mild symptoms don't trigger alerts
✅ Doctor speech doesn't trigger alerts

## Demo Flow

### Quick Manual Test
1. Start both servers
2. Navigate to **http://localhost:3000/dashboard** (or /alert-test)
3. Scroll to "🏥 Alert Engine Testing" section
4. Click "Chest Pain (Critical)" example button
5. Click "Analyze for Critical Symptoms"
6. See red alert with severity 5
7. Try "Mild Symptom (No Alert)" example
8. See green "No Critical Symptoms" message

### Live Simulation Demo (NEW!)
1. Navigate to **http://localhost:3000/dashboard**
2. Scroll to "🏥 Alert Engine Testing" section
3. Find "🎬 Live Consultation Simulation" card
4. Select "Emergency - Chest Pain" scenario
5. Click "Start Simulation"
6. Watch as patient speech is typed automatically
7. See alerts trigger in real-time at sentence breaks
8. Check the Statistics Dashboard for metrics
9. Review Alert History panel for all detections

### Testing Different Scenarios
1. **Emergency - Chest Pain**: Tests critical cardiac symptoms
2. **Mental Health Crisis**: Tests suicidal ideation detection
3. **Routine Checkup**: Tests that mild symptoms don't trigger alerts
4. **Breathing Emergency**: Tests respiratory distress detection

**This is fully dynamic - you can type ANYTHING and test it in real-time!**

## Advanced Testing Tips

1. **Test Deduplication**: 
   - Analyze the same critical symptom twice within 5 minutes
   - Second analysis should NOT trigger alert
   - Check Alert History to confirm

2. **Test Severity Scoring**:
   - Try "I have chest pain" (base severity)
   - Try "I have severe chest pain" (intensity modifier +1)
   - Try "I have sudden severe chest pain" (sudden onset +1)
   - Compare severity scores in results

3. **Test Speaker Type**:
   - Set speaker to "doctor"
   - Type "The patient has chest pain"
   - Should NOT trigger alert (only patient speech triggers)

4. **Monitor Statistics**:
   - Run multiple analyses
   - Watch detection rate change
   - See severity distribution update
   - Track most common symptom type
