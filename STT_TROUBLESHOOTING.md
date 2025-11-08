# Speech-to-Text Troubleshooting Guide

## Issues Identified

Based on your logs, there are two main issues:

### 1. Google Cloud STT Returning No Results
**Symptom:** `⚠️ Google STT returned no results (silence or unclear audio)`

**Root Causes:**
- Audio chunks too short (1 second) - not enough context for STT
- Possible silence detection being too aggressive
- Audio quality or encoding issues

**Fixes Applied:**
✅ Increased audio chunk duration from 1s to 2s in `VideoCallRoom.tsx`
✅ Enhanced Google Cloud STT configuration with better audio processing settings
✅ Added `use_enhanced=True` for improved accuracy
✅ Configured mono audio channel settings

### 2. OpenAI Whisper API Key Invalid
**Symptom:** `Error code: 401 - Incorrect API key provided`

**Root Cause:**
- `.env` file contains placeholder: `OPENAI_API_KEY=your_openai_api_key`

**Fix Applied:**
✅ Commented out the invalid key in `.env` to prevent fallback errors

## How to Fix Completely

### Option 1: Use Only Google Cloud STT (Recommended)
Your Google Cloud credentials are working, but STT needs better audio:

1. **Test with longer, clearer speech:**
   - Speak for at least 2-3 seconds continuously
   - Speak clearly and avoid background noise
   - Ensure microphone permissions are granted

2. **Restart the backend:**
   ```bash
   cd backend
   python run.py
   ```

3. **Test the frontend:**
   - Clear browser cache
   - Reload the page
   - Try speaking longer phrases

### Option 2: Add OpenAI Whisper as Fallback
If you want the Whisper API fallback to work:

1. **Get an OpenAI API key:**
   - Go to: https://platform.openai.com/account/api-keys
   - Create a new API key
   - Copy the key (starts with `sk-`)

2. **Update `.env`:**
   ```bash
   OPENAI_API_KEY=sk-your-actual-key-here
   ```

3. **Restart backend:**
   ```bash
   cd backend
   python run.py
   ```

## Testing STT

### Test Google Cloud STT Directly
```bash
cd backend
python test_google_stt.py
```

### Test Through WebSocket
1. Start backend: `python run.py`
2. Open frontend: `http://localhost:3000`
3. Join a video call
4. Speak clearly for 2-3 seconds
5. Check backend logs for transcription results

## Expected Behavior

**Good Audio (2+ seconds of speech):**
```
✅ Received 32876 bytes of audio data from doctor
✅ Audio validation passed
✅ Sending 32876 bytes directly to Google Cloud (OGG Opus)
🔄 Processing through STT pipeline...
✅ Google STT transcribed: Hello, how are you feeling today?
✅ Sent caption: Hello, how are you feeling today?
```

**Silent/Short Audio:**
```
✅ Received 16438 bytes of audio data from doctor
✅ Audio validation passed
⚠️ Google STT returned no results (silence or unclear audio)
⚠️ No text transcribed (silence or unclear audio)
```

## Audio Quality Tips

1. **Microphone Quality:**
   - Use a good quality microphone
   - Avoid built-in laptop mics if possible
   - Test microphone in browser settings first

2. **Environment:**
   - Minimize background noise
   - Speak in a quiet room
   - Avoid echo or reverb

3. **Speech Patterns:**
   - Speak clearly and at normal pace
   - Avoid very short utterances (< 1 second)
   - Pause briefly between sentences

4. **Browser Settings:**
   - Grant microphone permissions
   - Use Chrome or Edge (best WebRTC support)
   - Check browser console for errors

## Common Issues

### "No text transcribed" repeatedly
- **Cause:** Audio too short or silent
- **Fix:** Speak for 2+ seconds continuously

### "All ASR services failed"
- **Cause:** Both Google Cloud and Whisper failed
- **Fix:** Check Google Cloud credentials and audio quality

### "OpenAI Whisper API error: 401"
- **Cause:** Invalid or missing OpenAI API key
- **Fix:** Either add valid key or ignore (Google Cloud is primary)

## Configuration Summary

### Current Settings
- **Audio Format:** OGG Opus (browser native)
- **Sample Rate:** 48kHz
- **Chunk Duration:** 2 seconds (increased from 1s)
- **Primary ASR:** Google Cloud Speech-to-Text
- **Fallback ASR:** OpenAI Whisper (optional)
- **Enhanced Model:** Enabled for better accuracy

### Files Modified
1. `frontend/components/VideoCallRoom.tsx` - Increased chunk duration to 2s
2. `backend/app/stt_pipeline.py` - Enhanced Google Cloud STT config
3. `backend/.env` - Commented out invalid OpenAI key

## Next Steps

1. **Restart both services:**
   ```bash
   # Backend
   cd backend
   python run.py

   # Frontend (new terminal)
   cd frontend
   npm run dev
   ```

2. **Test with clear speech:**
   - Join a video call
   - Speak clearly for 2-3 seconds
   - Check if captions appear

3. **Monitor logs:**
   - Watch backend terminal for STT results
   - Check browser console for errors

If issues persist, the audio might actually be silent or the microphone isn't capturing properly. Test your microphone in browser settings first!
