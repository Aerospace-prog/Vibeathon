# Install FFmpeg on Windows - Easy Method

## Quick Download & Install

### Step 1: Download FFmpeg

1. Go to: https://www.gyan.dev/ffmpeg/builds/
2. Click on **"ffmpeg-release-essentials.zip"** (about 80MB)
3. Download will start automatically

### Step 2: Extract FFmpeg

1. Open the downloaded ZIP file
2. Extract to `C:\ffmpeg`
3. You should have: `C:\ffmpeg\bin\ffmpeg.exe`

### Step 3: Add to PATH

**Option A: Using PowerShell (Quick)**

Open PowerShell as Administrator and run:

```powershell
[Environment]::SetEnvironmentVariable("Path", $env:Path + ";C:\ffmpeg\bin", "Machine")
```

**Option B: Using GUI**

1. Press `Win + X` → Select "System"
2. Click "Advanced system settings"
3. Click "Environment Variables"
4. Under "System variables", find "Path"
5. Click "Edit"
6. Click "New"
7. Add: `C:\ffmpeg\bin`
8. Click "OK" on all windows

### Step 4: Verify Installation

**Close and reopen your terminal**, then run:

```bash
ffmpeg -version
```

Should show:
```
ffmpeg version 6.x.x
```

### Step 5: Install pydub

```bash
cd backend
pip install pydub
```

### Step 6: Restart Backend

```bash
python run.py
```

### Step 7: Test!

Speak into microphone. You should see:

```
✅ Received X bytes of audio data
✅ Audio validation passed
✅ Converted to X bytes PCM  ← Should work now!
🔄 Processing through STT pipeline...
```

## Alternative: Portable FFmpeg (No PATH needed)

If you don't want to modify PATH:

### Step 1: Download and Extract

Same as above - extract to `C:\ffmpeg`

### Step 2: Tell pydub where FFmpeg is

Create a file `backend/ffmpeg_config.py`:

```python
import os
from pydub import AudioSegment

# Set FFmpeg path
AudioSegment.converter = r"C:\ffmpeg\bin\ffmpeg.exe"
AudioSegment.ffprobe = r"C:\ffmpeg\bin\ffprobe.exe"
```

### Step 3: Import in audio_converter.py

Add at the top of `backend/app/audio_converter.py`:

```python
try:
    import ffmpeg_config  # Configure FFmpeg path
except:
    pass
```

## Troubleshooting

### "ffmpeg not found" after installation

1. **Restart your terminal** (important!)
2. Verify PATH: `echo %PATH%` should include `C:\ffmpeg\bin`
3. Try: `where ffmpeg` - should show the path

### "Access denied" when adding to PATH

Run PowerShell as Administrator:
1. Right-click PowerShell
2. Select "Run as Administrator"
3. Run the SetEnvironmentVariable command

### Still not working?

Use the portable method (no PATH needed) described above.

## Quick Test

After installation:

```bash
# Test FFmpeg
ffmpeg -version

# Test pydub
python -c "from pydub import AudioSegment; print('✅ pydub works')"

# Restart backend
python run.py
```

Then speak into microphone and check logs!
