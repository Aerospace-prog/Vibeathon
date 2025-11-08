# Start Backend - Quick Guide

## Start Backend Server

```bash
cd backend
venv\Scripts\activate
python run.py
```

## Expected Startup Messages

You should see:

```
No sentence-transformers model found with name Supabase/gte-small. Creating a new one with mean pooling.
INFO: Started server process [XXXXX]
INFO: Waiting for application startup.
INFO: Application startup complete.
INFO: Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
```

**Note:** The sentence-transformers message is normal - it's downloading the embedding model for Community Lexicon (only happens once).

## What Each Service Does

When the backend starts, it initializes:

1. **Google Cloud Speech-to-Text** - Transcribes audio
2. **Google Cloud Translation** - Translates text
3. **Sentence Transformers** - For medical term lookup (optional)
4. **Database Client** - Saves transcripts

## If You See Warnings

### "Google Cloud Speech client not initialized"
- Check `backend/.env` has `GOOGLE_CLOUD_PROJECT_ID`
- Check `google-credentials.json` exists
- Run `python test_translation.py`

### "OpenAI client not initialized"
- This is OK - OpenAI Whisper is optional fallback
- Translation will still work with Google Cloud

### "sentence-transformers library not available"
- This is OK - Community Lexicon is optional
- Translation will still work without it

## Verify Backend is Running

Open browser: http://localhost:8000/health

Should show:
```json
{
  "status": "healthy",
  "timestamp": "...",
  "services": {
    "alert_engine": "operational",
    "emotion_analyzer": "operational",
    "database": "operational"
  }
}
```

## Test Translation

Once backend is running, test it:

```bash
# In a new terminal
cd backend
python test_translation.py
```

## Now Test in Browser

1. Open http://localhost:3000
2. Sign in
3. Start a video call
4. **Speak into microphone**
5. Watch backend terminal for:
   ```
   ✅ Video call WebSocket connected: xxx_doctor
   ✅ Received 8192 bytes of audio data from doctor
   ✅ Audio validation passed
   🔄 Converting WebM to PCM...
   ✅ Converted to 16000 bytes PCM
   🔄 Processing through STT pipeline...
   ✅ STT result: {...}
   ✅ Sent caption: Hello, how are you...
   ```

## If No Audio Received

Check:
- [ ] Microphone permissions granted in browser
- [ ] Green "Live translation active" badge showing
- [ ] Browser console shows "Audio streaming started"
- [ ] Speaking loud enough

## If Audio Received But No Captions

Check backend logs for:
- ❌ Audio conversion failed → Install: `pip install soundfile numpy`
- ❌ Google Cloud error → Run: `python test_translation.py`
- ⚠️ No text transcribed → Speak louder/clearer

## Stop Backend

Press `CTRL+C` in the backend terminal

## Restart Backend

If you make changes to backend code:
1. Press `CTRL+C` to stop
2. Run `python run.py` again
3. Uvicorn will auto-reload on file changes (no need to restart manually)

## Common Startup Issues

### Port 8000 Already in Use

```bash
# Windows: Find and kill process
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# Then restart
python run.py
```

### Virtual Environment Not Activated

You should see `(venv)` in your terminal prompt:
```
(venv) PS C:\...\backend>
```

If not:
```bash
venv\Scripts\activate
```

### Missing Dependencies

```bash
pip install -r requirements.txt
```

## Ready to Test!

Once you see:
```
INFO: Uvicorn running on http://0.0.0.0:8000
```

Your backend is ready! Go to the frontend and start a video call.
