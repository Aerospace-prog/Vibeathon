# Fix Audio Conversion Error

## Problem

You're seeing:
```
❌ Audio conversion failed, skipping...
Audio conversion error: Error opening <_io.BytesIO object>: Format not recognised.
```

This means `soundfile` can't read WebM format directly.

## Solution

### Step 1: Install pydub

```bash
cd backend
pip install pydub
```

### Step 2: Install FFmpeg (Required by pydub)

**Windows:**

**Option A: Using Chocolatey (Recommended)**
```bash
choco install ffmpeg
```

**Option B: Manual Installation**
1. Download FFmpeg from: https://www.gyan.dev/ffmpeg/builds/
2. Download "ffmpeg-release-essentials.zip"
3. Extract to `C:\ffmpeg`
4. Add to PATH:
   - Open System Properties → Environment Variables
   - Edit "Path" variable
   - Add: `C:\ffmpeg\bin`
5. Restart terminal

**Option C: Using Scoop**
```bash
scoop install ffmpeg
```

### Step 3: Verify FFmpeg Installation

```bash
ffmpeg -version
```

Should show FFmpeg version info.

### Step 4: Restart Backend

```bash
# Stop backend (Ctrl+C)
cd backend
venv\Scripts\activate
python run.py
```

### Step 5: Test Again

Speak into microphone. You should now see:

```
✅ Received X bytes of audio data from doctor
✅ Audio validation passed
🔄 Converting WebM to PCM...
✅ Converted to X bytes PCM
🔄 Processing through STT pipeline...
✅ STT result: {...}
✅ Sent caption: ...
```

## Why This Fix Works

**Before:**
- Used `soundfile` library
- Can't read WebM/Opus format
- Only supports WAV, FLAC, OGG

**After:**
- Uses `pydub` library
- Supports WebM/Opus via FFmpeg
- Converts to PCM for Google Cloud STT

## Alternative: Change Frontend Audio Format

If you can't install FFmpeg, you can change the frontend to send WAV instead:

**Edit `frontend/components/VideoCallRoom.tsx`:**

```typescript
// Change from:
const mediaRecorder = new MediaRecorder(audioStream, {
  mimeType: 'audio/webm;codecs=opus'
})

// To:
const mediaRecorder = new MediaRecorder(audioStream, {
  mimeType: 'audio/wav'
})
```

But this will increase bandwidth usage significantly.

## Verify Installation

```bash
cd backend
python
```

```python
from pydub import AudioSegment
print("✅ pydub installed correctly")
```

If you see an error about FFmpeg, install FFmpeg first.

## Quick Test

After installing pydub and FFmpeg:

1. Restart backend
2. Start video call
3. Speak into microphone
4. Check backend logs for ✅ "Converted to X bytes PCM"

## Still Having Issues?

### Error: "ffmpeg not found"

FFmpeg is not in your PATH. Add it:

1. Find where FFmpeg is installed
2. Add the `bin` folder to PATH
3. Restart terminal
4. Run `ffmpeg -version` to verify

### Error: "pydub not installed"

```bash
pip install pydub
```

### Error: Still can't convert

Try the alternative approach (change frontend to WAV format).
