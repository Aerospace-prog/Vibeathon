# Debug: No Captions Appearing

## Quick Checklist

Follow these steps in order:

### ✅ Step 1: Backend Running?

```bash
cd backend
venv\Scripts\activate
python run.py
```

**Look for:**
```
INFO: Uvicorn running on http://0.0.0.0:8000
```

- [ ] Backend is running
- [ ] No error messages

---

### ✅ Step 2: WebSocket Connected?

**In backend terminal, you should see:**
```
✅ Video call WebSocket connected: {consultation_id}_doctor
```

**If you DON'T see this:**

**Check frontend `.env.local`:**
```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
NEXT_PUBLIC_DEBUG_MODE=false
```

**Restart frontend:**
```bash
cd frontend
npm run dev
```

- [ ] WebSocket connected message appears

---

### ✅ Step 3: Audio Being Sent?

**Speak into your microphone for 2-3 seconds**

**Backend should show:**
```
✅ Received 8192 bytes of audio data from doctor
```

**If you DON'T see this:**

1. **Check browser console (F12):**
   - Should see: "Audio streaming started"
   - Should see: "WebSocket connected"

2. **Check microphone:**
   - Browser should show microphone icon
   - Grant permissions if asked
   - Try speaking louder

3. **Check MediaRecorder:**
   - Browser console should NOT show MediaRecorder errors

- [ ] Audio chunks being received

---

### ✅ Step 4: Audio Validation Passing?

**Backend should show:**
```
✅ Audio validation passed
```

**If you see "Audio data too small":**
- Speak louder
- Speak for longer (2-3 seconds minimum)
- Move closer to microphone

- [ ] Audio validation passed

---

### ✅ Step 5: Audio Conversion Working?

**Backend should show:**
```
🔄 Converting WebM to PCM...
✅ Converted to 16000 bytes PCM
```

**If you see "Audio conversion failed":**

```bash
cd backend
pip install soundfile numpy librosa
# Restart backend
python run.py
```

- [ ] Audio conversion successful

---

### ✅ Step 6: STT Processing Working?

**Backend should show:**
```
🔄 Processing through STT pipeline...
✅ STT result: {'original_text': '...', 'translated_text': '...'}
```

**If you see errors here:**

**Test Google Cloud setup:**
```bash
cd backend
python test_translation.py
```

**Should show all ✅ checkmarks**

**If test fails:**

1. **Check credentials:**
   - File exists: `backend/google-credentials.json`
   - `.env` has: `GOOGLE_CLOUD_PROJECT_ID=assignment-28a79`
   - `.env` has: `GOOGLE_APPLICATION_CREDENTIALS=google-credentials.json`

2. **Check APIs enabled:**
   - Go to: https://console.cloud.google.com/apis/library
   - Search: "Cloud Speech-to-Text API" → Enable
   - Search: "Cloud Translation API" → Enable

3. **Check service account permissions:**
   - Go to: https://console.cloud.google.com/iam-admin/serviceaccounts
   - Your service account should have:
     - Cloud Speech Client
     - Cloud Translation API User

- [ ] STT processing successful

---

### ✅ Step 7: Caption Sent?

**Backend should show:**
```
✅ Sent caption: Hello, how are you...
```

**If you see "No text transcribed":**
- Audio is too quiet
- Background noise too loud
- Wrong language (patient should speak Hindi, doctor English)
- Speak more clearly

- [ ] Caption sent to frontend

---

### ✅ Step 8: Frontend Receiving?

**Check browser:**
- Right panel should show "Live Translations"
- Captions should appear

**Check browser console (F12):**
- Should NOT show WebSocket errors
- Should NOT show JSON parsing errors

- [ ] Captions appearing in browser

---

## Still Not Working?

### Full Debug Output

**Backend Terminal:**
Copy and paste the full output when you speak, starting from:
```
✅ Video call WebSocket connected...
```

**Browser Console:**
1. Open DevTools (F12)
2. Go to Console tab
3. Copy any errors

**Browser Network Tab:**
1. Open DevTools (F12)
2. Go to Network tab
3. Filter by "WS"
4. Click on the WebSocket connection
5. Go to "Messages" tab
6. Check if messages are being sent/received

---

## Most Common Issues

### 1. Google Cloud Not Set Up

**Symptom:** Backend shows "Google Cloud Speech client not initialized"

**Fix:**
```bash
cd backend
python test_translation.py
```

Follow the output to fix credentials.

### 2. Audio Libraries Missing

**Symptom:** "Audio conversion failed"

**Fix:**
```bash
pip install soundfile numpy librosa
```

### 3. Microphone Not Working

**Symptom:** No "Received X bytes" messages

**Fix:**
- Check browser permissions
- Try different browser
- Check microphone in system settings

### 4. Wrong Language

**Symptom:** "No text transcribed" but audio is being received

**Fix:**
- Patient should speak Hindi
- Doctor should speak English/Hinglish
- Speak clearly and loudly

### 5. APIs Not Enabled

**Symptom:** Google Cloud errors in backend

**Fix:**
- https://console.cloud.google.com/apis/library
- Enable both Speech-to-Text and Translation APIs

---

## Test Without Audio

To test if translation works without audio:

```bash
cd backend
python
```

```python
from app.stt_pipeline import get_stt_pipeline
import asyncio

stt = get_stt_pipeline()
result = asyncio.run(stt.translate_text("Hello", "en", "hi"))
print(result)  # Should print: नमस्ते
```

If this works, the issue is with audio processing, not translation.

---

## Expected Full Flow

When everything works, you should see:

**Backend:**
```
✅ Video call WebSocket connected: xxx_doctor
✅ Received 8192 bytes of audio data from doctor
✅ Audio validation passed
🔄 Converting WebM to PCM...
✅ Converted to 16000 bytes PCM
🔄 Processing through STT pipeline...
✅ STT result: {'original_text': 'Hello', 'translated_text': 'नमस्ते', 'speaker_id': 'doctor'}
✅ Sent caption: Hello...
```

**Browser:**
- Green badge: "Live translation active"
- Right panel shows: "You (doctor)"
- Caption: "नमस्ते"
- Original: "Hello"

---

## Get Help

If you've gone through all steps and it's still not working, provide:

1. Output of `python test_translation.py`
2. Backend logs (full output when speaking)
3. Browser console errors
4. Screenshot of Google Cloud Console showing enabled APIs

This will help diagnose the exact issue.
