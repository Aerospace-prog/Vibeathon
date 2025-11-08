# Live Translation - Setup Checklist

## ✅ Pre-Flight Checklist

### 1. Google Cloud Setup
- [ ] Google Cloud account created
- [ ] Project created (e.g., `assignment-28a79`)
- [ ] Cloud Speech-to-Text API enabled
- [ ] Cloud Translation API enabled
- [ ] Service account created with permissions:
  - [ ] Cloud Speech Client
  - [ ] Cloud Translation API User
- [ ] Credentials JSON downloaded
- [ ] File renamed to `google-credentials.json`
- [ ] File placed in `backend/` folder

### 2. Environment Configuration
- [ ] `backend/.env` has `GOOGLE_CLOUD_PROJECT_ID`
- [ ] `backend/.env` has `GOOGLE_APPLICATION_CREDENTIALS=google-credentials.json`
- [ ] `frontend/.env.local` has `NEXT_PUBLIC_DEBUG_MODE=false`
- [ ] `frontend/.env.local` has `NEXT_PUBLIC_BACKEND_URL=http://localhost:8000`

### 3. Dependencies Installed
- [ ] Backend: `pip install -r requirements.txt` completed
- [ ] Frontend: `npm install` completed
- [ ] No installation errors

## 🧪 Testing Checklist

### Step 1: Verify Setup
```bash
cd backend
python test_translation.py
```

Expected output:
- [ ] ✅ Environment configured
- [ ] ✅ STT Pipeline initialized
- [ ] ✅ Google Cloud Speech-to-Text available
- [ ] ✅ Google Cloud Translation available
- [ ] ✅ Translation working
- [ ] ✅ Audio converter initialized

### Step 2: Start Backend
```bash
cd backend
venv\Scripts\activate
python run.py
```

Check for:
- [ ] "Google Cloud Speech-to-Text initialized (primary ASR)"
- [ ] "Google Cloud Translation initialized"
- [ ] "Uvicorn running on http://0.0.0.0:8000"
- [ ] No error messages

### Step 3: Start Frontend
```bash
cd frontend
npm run dev
```

Check for:
- [ ] "Ready in X ms"
- [ ] "Local: http://localhost:3000"
- [ ] No compilation errors

### Step 4: Test Video Call
- [ ] Open http://localhost:3000
- [ ] Sign in successfully
- [ ] Click "Start New Call"
- [ ] Allow camera permission
- [ ] Allow microphone permission
- [ ] Video feed appears
- [ ] Green badge shows "Live translation active"

### Step 5: Test Translation
- [ ] Speak into microphone: "Hello, how are you?"
- [ ] Caption appears in right panel
- [ ] Translation shows: "नमस्ते, आप कैसे हैं?"
- [ ] Latency is < 5 seconds
- [ ] No errors in browser console (F12)

### Step 6: Verify Backend Logs
Backend terminal should show:
- [ ] "Video call WebSocket connected: {id}_doctor"
- [ ] "Received X bytes of audio data from doctor"
- [ ] "Converted X bytes WebM to Y bytes PCM"
- [ ] "Sent caption: ..."

## 🐛 Troubleshooting Checklist

### If WebSocket Won't Connect
- [ ] Backend is running
- [ ] Frontend is running
- [ ] `NEXT_PUBLIC_DEBUG_MODE=false` in frontend/.env.local
- [ ] No firewall blocking port 8000
- [ ] Browser console shows no CORS errors

### If No Captions Appear
- [ ] Microphone is working (check browser indicator)
- [ ] Speaking loud enough
- [ ] Backend logs show "Received X bytes"
- [ ] Google Cloud credentials are valid
- [ ] APIs are enabled in Google Cloud Console

### If Translation Errors
- [ ] Run `python test_translation.py`
- [ ] Check Google Cloud Console for API errors
- [ ] Verify service account permissions
- [ ] Check API quotas not exceeded

### If Audio Conversion Fails
- [ ] `soundfile` installed: `pip install soundfile`
- [ ] `numpy` installed: `pip install numpy`
- [ ] Audio data is valid (> 1000 bytes)

## 📋 Final Verification

### Browser (http://localhost:3000)
- [ ] ✅ Video feed visible
- [ ] ✅ Green "Live translation active" badge
- [ ] ✅ Captions appear when speaking
- [ ] ✅ Translations are accurate
- [ ] ✅ No errors in console

### Backend Logs
- [ ] ✅ WebSocket connected
- [ ] ✅ Audio chunks received
- [ ] ✅ Audio converted successfully
- [ ] ✅ Captions sent
- [ ] ✅ No error messages

### Functionality
- [ ] ✅ Real-time transcription works
- [ ] ✅ Translation works (Hindi ↔ English)
- [ ] ✅ Captions display correctly
- [ ] ✅ Latency is acceptable (< 5 seconds)
- [ ] ✅ System handles disconnections gracefully

## 🎉 Success!

If all items are checked, your live translation system is working!

## 📚 Documentation Reference

- **Setup Guide:** `LIVE_TRANSLATION_SETUP.md`
- **Quick Start:** `QUICK_START_TRANSLATION.md`
- **Implementation Details:** `IMPLEMENTATION_SUMMARY.md`
- **Google Cloud Setup:** `GOOGLE_CLOUD_SETUP.md`

## 🚀 Next Steps

1. [ ] Test with different accents
2. [ ] Test with medical terminology
3. [ ] Add terms to Community Lexicon
4. [ ] Monitor performance metrics
5. [ ] Optimize audio quality settings
6. [ ] Deploy to production

---

**Date Completed:** _______________

**Tested By:** _______________

**Status:** [ ] PASS  [ ] FAIL

**Notes:**
_________________________________
_________________________________
_________________________________
