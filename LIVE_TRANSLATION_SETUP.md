# Live Translation Setup - Complete Guide

## 🎯 What's Been Implemented

Live translation is now fully integrated into your video call system with:

- ✅ **Real-time Speech-to-Text** using Google Cloud Speech-to-Text
- ✅ **Automatic Translation** using Google Cloud Translation API
- ✅ **Audio Format Conversion** (WebM → PCM)
- ✅ **WebSocket Integration** for live captions
- ✅ **Fallback ASR** with OpenAI Whisper (optional)
- ✅ **Community Lexicon** support for medical terms
- ✅ **Bilingual Support** (Hindi ↔ English)

## 📋 Prerequisites

1. **Google Cloud Account** with:
   - Cloud Speech-to-Text API enabled
   - Cloud Translation API enabled
   - Service account with proper permissions
   - Credentials JSON file downloaded

2. **Python Dependencies** installed:
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

## 🚀 Quick Start

### Step 1: Test Your Setup

```bash
cd backend
python test_translation.py
```

This will verify:
- Environment variables are set
- Google Cloud credentials are valid
- STT pipeline initializes correctly
- Translation service works

**Expected Output:**
```
============================================================
Testing Arogya-AI Translation Services
============================================================

1. Checking environment variables...
   Project ID: assignment-28a79
   Credentials: google-credentials.json
   ✅ Environment configured

2. Initializing STT Pipeline...
   ✅ STT Pipeline initialized
   ✅ Google Cloud Speech-to-Text available
   ✅ Google Cloud Translation available

3. Testing translation...
   Original: Hello, how are you feeling today?
   Translated: नमस्ते, आज आप कैसा महसूस कर रहे हैं?
   ✅ Translation working

4. Testing audio converter...
   ✅ Audio converter initialized

============================================================
Setup Complete!
============================================================
```

### Step 2: Start the Backend

```bash
cd backend
venv\Scripts\activate
python run.py
```

**Look for these log messages:**
```
INFO: Google Cloud Speech-to-Text initialized (primary ASR)
INFO: Google Cloud Translation initialized
INFO: Uvicorn running on http://0.0.0.0:8000
```

### Step 3: Start the Frontend

```bash
cd frontend
npm run dev
```

### Step 4: Test Live Translation

1. Open http://localhost:3000
2. Sign in to your account
3. Click "Start New Call"
4. Allow camera and microphone access
5. **Speak into your microphone**
6. Watch live captions appear on the right side!

## 🎤 How It Works

### Audio Flow

```
Microphone
    ↓
MediaRecorder (WebM/Opus, 1-second chunks)
    ↓
WebSocket → Backend
    ↓
Audio Converter (WebM → PCM 16kHz)
    ↓
Google Cloud Speech-to-Text
    ↓
Community Lexicon Lookup (medical terms)
    ↓
Google Cloud Translation
    ↓
WebSocket → Frontend
    ↓
Live Captions Display
```

### Language Configuration

**Patient (speaks Hindi):**
- Input: Hindi audio
- STT: Hindi → Hindi text
- Translation: Hindi → English
- Output: English captions for doctor

**Doctor (speaks English/Hinglish):**
- Input: English/Hinglish audio
- STT: English → English text (with Hindi code-switching)
- Translation: English → Hindi
- Output: Hindi captions for patient

## 🔧 Configuration

### Backend Configuration (`backend/.env`)

```env
# Google Cloud Configuration
GOOGLE_CLOUD_PROJECT_ID=assignment-28a79
GOOGLE_APPLICATION_CREDENTIALS=google-credentials.json

# Optional: OpenAI Whisper fallback
OPENAI_API_KEY=your_openai_api_key

# Mock mode (for testing without Google Cloud)
MOCK_MODE=false
```

### Frontend Configuration (`frontend/.env.local`)

```env
# Backend API URL
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000

# Debug mode (disable WebSocket for testing)
NEXT_PUBLIC_DEBUG_MODE=false
```

## 📊 What You'll See

### In the Browser

**Video Call Interface:**
- Left side: Video feeds (local and remote)
- Right side: Live captions panel
- Top: Connection status indicators

**Live Captions Panel:**
```
┌─────────────────────────────────┐
│ Live Translations               │
├─────────────────────────────────┤
│ You (doctor)                    │
│ नमस्ते, आज आप कैसा महसूस कर   │
│ रहे हैं?                        │
│ Original: Hello, how are you... │
├─────────────────────────────────┤
│ Other Participant               │
│ I have a fever                  │
│ Original: मुझे बुखार है         │
└─────────────────────────────────┘
```

### In Backend Logs

```
INFO: Video call WebSocket connected: 1273df59-771a-4dc7-bea0-d7ab24c330c6_doctor
Received 8192 bytes of audio data from doctor
Converted 8192 bytes WebM to 16000 bytes PCM
DEBUG: Google STT transcribed: Hello, how are you feeling today?
DEBUG: Translated: Hello, how are you... -> नमस्ते, आज आप कैसा महसूस कर रहे हैं?
Sent caption: Hello, how are you feeling today?...
```

## 🐛 Troubleshooting

### Issue: "Google Cloud Speech client not initialized"

**Cause:** Missing or invalid credentials

**Solution:**
1. Check `backend/.env` has correct `GOOGLE_CLOUD_PROJECT_ID`
2. Verify `google-credentials.json` exists in `backend/` folder
3. Run `python test_translation.py` to diagnose

### Issue: "Audio conversion failed"

**Cause:** Missing audio processing libraries

**Solution:**
```bash
cd backend
pip install soundfile numpy librosa
```

### Issue: No captions appearing

**Possible causes:**
1. **Microphone not working** - Check browser permissions
2. **Audio too quiet** - Speak louder or closer to mic
3. **Audio chunks too small** - Backend filters out chunks < 1000 bytes

**Debug steps:**
1. Open browser console (F12)
2. Check for "Audio streaming started" message
3. Look for WebSocket errors
4. Check backend logs for "Received X bytes of audio data"

### Issue: "Translation error"

**Cause:** Google Cloud Translation API not enabled or quota exceeded

**Solution:**
1. Go to https://console.cloud.google.com/apis/library
2. Search "Cloud Translation API"
3. Click "Enable"
4. Check quotas: https://console.cloud.google.com/iam-admin/quotas

### Issue: Captions in wrong language

**Cause:** User type mismatch

**Solution:**
- Verify you're joining as the correct user type (doctor/patient)
- Check URL: `/consultation/{id}/doctor` or `/consultation/{id}/patient`

## 📈 Performance Optimization

### Reduce Latency

1. **Adjust audio chunk size** (frontend):
   ```typescript
   // In VideoCallRoom.tsx
   mediaRecorder.start(500)  // Send every 500ms instead of 1000ms
   ```

2. **Use streaming recognition** (backend):
   - Current: Synchronous recognition
   - Upgrade: Streaming recognition for lower latency

### Improve Accuracy

1. **Add medical terms to Community Lexicon**
2. **Fine-tune language models** (Google Cloud)
3. **Adjust audio quality settings**

## 💰 Cost Estimation

**Google Cloud Free Tier:**
- Speech-to-Text: 60 minutes/month free
- Translation: 500,000 characters/month free

**After Free Tier:**
- Speech-to-Text: ~$0.024/minute
- Translation: ~$20/million characters

**Example:** 1-hour consultation
- STT: $1.44
- Translation: ~$0.10
- **Total: ~$1.54 per hour**

## 🔒 Security Best Practices

1. ✅ Never commit `google-credentials.json` to Git
2. ✅ Add to `.gitignore`
3. ✅ Use service accounts (not personal credentials)
4. ✅ Rotate keys periodically
5. ✅ Use environment variables for sensitive data

## 🎯 Testing Checklist

- [ ] Backend starts without errors
- [ ] Frontend connects to backend
- [ ] WebSocket connection established
- [ ] Audio chunks being sent (check logs)
- [ ] Captions appear in real-time
- [ ] Translations are accurate
- [ ] Both languages work (Hindi ↔ English)
- [ ] No errors in browser console
- [ ] No errors in backend logs

## 📚 Key Files

**Backend:**
- `backend/app/main.py` - WebSocket endpoint
- `backend/app/stt_pipeline.py` - Speech-to-text and translation
- `backend/app/audio_converter.py` - Audio format conversion
- `backend/app/database.py` - Database and lexicon
- `backend/test_translation.py` - Setup verification

**Frontend:**
- `frontend/components/VideoCallRoom.tsx` - Video call UI
- `frontend/lib/useWebSocketWithRetry.ts` - WebSocket hook
- `frontend/.env.local` - Frontend configuration

## 🚀 Next Steps

1. **Test with real conversations** - Try different accents and speeds
2. **Add more medical terms** - Populate Community Lexicon
3. **Monitor performance** - Check latency and accuracy
4. **Optimize audio quality** - Adjust bitrate and sample rate
5. **Deploy to production** - Use production Google Cloud credentials

## 🎉 Success!

If you see live captions appearing as you speak, congratulations! Your live translation system is working. The system will:

- Transcribe your speech in real-time
- Translate between Hindi and English
- Display captions with < 3 seconds latency
- Save transcripts to the database
- Support medical terminology via Community Lexicon

**Enjoy your multilingual telehealth platform!** 🏥🌍
