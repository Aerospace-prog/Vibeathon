# Quick Start - Live Translation

## ⚡ 3-Step Setup

### 1. Test Setup (30 seconds)
```bash
cd backend
python test_translation.py
```
✅ Should show all green checkmarks

### 2. Start Backend
```bash
cd backend
venv\Scripts\activate
python run.py
```
✅ Look for: "Google Cloud Speech-to-Text initialized"

### 3. Start Frontend
```bash
cd frontend
npm run dev
```
✅ Open http://localhost:3000

## 🎤 Test Translation

1. Sign in
2. Click "Start New Call"
3. Allow microphone
4. **Speak**: "Hello, how are you?"
5. **See caption**: "नमस्ते, आप कैसे हैं?"

## ✅ Success Indicators

**Browser:**
- ✅ Green badge: "Live translation active"
- ✅ Captions appear as you speak
- ✅ No WebSocket errors in console

**Backend Logs:**
- ✅ "Video call WebSocket connected"
- ✅ "Received X bytes of audio data"
- ✅ "Sent caption: ..."

## 🐛 Quick Fixes

**No captions?**
- Speak louder
- Check microphone permissions
- Verify backend is running

**Translation errors?**
- Check Google Cloud credentials
- Run `python test_translation.py`
- Verify APIs are enabled

**WebSocket errors?**
- Restart backend
- Clear browser cache
- Check `.env.local` has `NEXT_PUBLIC_DEBUG_MODE=false`

## 📖 Full Documentation

See `LIVE_TRANSLATION_SETUP.md` for complete guide.
