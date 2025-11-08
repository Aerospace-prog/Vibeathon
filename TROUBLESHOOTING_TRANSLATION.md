# Troubleshooting Live Translation

## Issue: No Captions Appearing

### Step 1: Check Backend is Running

```bash
# Make sure backend is running
cd backend
venv\Scripts\activate
python run.py
```

**Look for:**
```
INFO: Google Cloud Speech-to-Text initialized (primary ASR)
INFO: Google Cloud Translation initialized
INFO: Uvicorn running on http://0.0.0.0:8000
```

### Step 2: Check WebSocket Connection

**In backend logs, you should see:**
```
✅ Video call WebSocket connected: {consultation_id}_doctor
```

**If you don't see this:**
- Frontend isn't connecting
- Check `NEXT_PUBLIC_BACKEND_URL` in `frontend/.env.local`
- Check `NEXT_PUBLIC_DEBUG_MODE=false`

### Step 3: Check Audio is Being Sent

**In backend logs, you should see:**
```
✅ Received 8192 bytes of audio data from doctor
✅ Audio validation passed
🔄 Converting WebM to PCM...
✅ Converted to 16000 bytes PCM
🔄 Processing through STT pipeline...
```

**If you don't see "Received X bytes":**
- Microphone not working
- Check browser permissions
- Check browser console for errors

**If you see "Audio data too small":**
- Speak louder or closer to microphone
- Audio chunks are < 1000 bytes (too quiet)

### Step 4: Check Audio Conversion

**You should see:**
```
✅ Converted to X bytes PCM
```

**If you see "Audio conversion failed":**
```bash
# Install missing dependencies
cd backend
pip install soundfile numpy librosa
```

### Step 5: Check STT Processing

**You should see:**
```
✅ STT result: {'original_text': '...', 'translated_text': '...', 'speaker_id': 'doctor'}
```

**If you see errors here:**

#### Error: "Google Cloud Speech client not initialized"
```bash
# Check credentials
cd backend
python test_translation.py
```

Fix:
- Verify `GOOGLE_CLOUD_PROJECT_ID` in `.env`
- Verify `google-credentials.json` exists
- Check Google Cloud APIs are enabled

#### Error: "No module named 'google.cloud'"
```bash
# Install Google Cloud libraries
pip install google-cloud-speech google-cloud-translate
```

#### Error: "Permission denied" or "API not enabled"
- Go to https://console.cloud.google.com/apis/library
- Enable "Cloud Speech-to-Text API"
- Enable "Cloud Translation API"

### Step 6: Check Caption Sending

**You should see:**
```
✅ Sent caption: Hello, how are you feeling today?...
```

**If you see "No text transcribed":**
- Audio is too quiet or unclear
- Background noise is too loud
- Speak more clearly
- Try speaking in the configured language (Hindi for patient, English for doctor)

### Step 7: Check Frontend Receives Captions

**Open browser console (F12) and check for:**
```
WebSocket connected
Audio streaming started
```

**Check for errors:**
- WebSocket errors
- JSON parsing errors
- Caption display errors

## Common Issues & Solutions

### Issue: "Audio conversion failed"

**Cause:** Missing audio processing libraries

**Solution:**
```bash
cd backend
pip install soundfile numpy librosa
python run.py
```

### Issue: "Google Cloud Speech client not initialized"

**Cause:** Missing or invalid credentials

**Solution:**
1. Check `backend/.env` has correct `GOOGLE_CLOUD_PROJECT_ID`
2. Verify `backend/google-credentials.json` exists
3. Run `python test_translation.py` to verify setup

### Issue: Audio received but no transcription

**Cause:** Audio too quiet or unclear

**Solution:**
- Speak louder
- Move closer to microphone
- Reduce background noise
- Check microphone quality

### Issue: Transcription works but no translation

**Cause:** Translation API not enabled or quota exceeded

**Solution:**
1. Go to https://console.cloud.google.com/apis/library
2. Search "Cloud Translation API"
3. Click "Enable"
4. Check quotas: https://console.cloud.google.com/iam-admin/quotas

### Issue: Wrong language detected

**Cause:** User type mismatch

**Solution:**
- Verify URL: `/consultation/{id}/doctor` or `/consultation/{id}/patient`
- Patient should speak Hindi
- Doctor should speak English/Hinglish

## Debug Checklist

Run through this checklist:

- [ ] Backend running without errors
- [ ] Google Cloud credentials valid
- [ ] APIs enabled (Speech-to-Text, Translation)
- [ ] WebSocket connected (check backend logs)
- [ ] Audio being received (check backend logs)
- [ ] Audio conversion successful
- [ ] STT processing successful
- [ ] Captions being sent
- [ ] Frontend receiving captions
- [ ] Microphone working
- [ ] Speaking clearly in correct language

## Test Commands

### 1. Test Backend Setup
```bash
cd backend
python test_translation.py
```

### 2. Test Google Cloud Connection
```bash
cd backend
python -c "from google.cloud import speech; print('✅ Speech-to-Text OK')"
python -c "from google.cloud import translate; print('✅ Translation OK')"
```

### 3. Check Backend Health
```bash
curl http://localhost:8000/health
```

### 4. Monitor Backend Logs
Watch the backend terminal for the emoji indicators:
- ✅ = Success
- ❌ = Error
- ⚠️ = Warning
- 🔄 = Processing

## Still Not Working?

### Enable Detailed Logging

Edit `backend/app/stt_pipeline.py` and add at the top:
```python
import logging
logging.basicConfig(level=logging.DEBUG)
```

### Check Browser Console

1. Open browser console (F12)
2. Go to Network tab
3. Filter by "WS" (WebSocket)
4. Check WebSocket messages
5. Look for errors

### Verify Audio Format

The frontend sends:
- Format: WebM with Opus codec
- Chunk size: 1 second
- Sample rate: Browser default (usually 48kHz)

The backend expects:
- Format: LINEAR16 PCM
- Sample rate: 16kHz
- Mono audio

The `audio_converter.py` handles this conversion.

## Quick Test

To quickly test if translation works without audio:

```python
# In backend directory
python

>>> from app.stt_pipeline import get_stt_pipeline
>>> import asyncio
>>> stt = get_stt_pipeline()
>>> result = asyncio.run(stt.translate_text("Hello", "en", "hi"))
>>> print(result)
# Should print: नमस्ते
```

If this works, the issue is with audio processing, not translation.

## Contact Support

If none of these solutions work, provide:
1. Backend logs (full output)
2. Browser console errors
3. Output of `python test_translation.py`
4. Google Cloud Console screenshots showing enabled APIs
