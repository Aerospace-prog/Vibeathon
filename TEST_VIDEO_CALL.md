# Video Call Testing Guide

## ✅ What's Been Implemented

1. **Backend Signaling Server** (`backend/app/signaling.py`)
   - WebSocket endpoint: `ws://localhost:8000/ws/signaling/{consultation_id}/{user_type}`
   - Handles offer/answer/ICE candidate exchange
   - Manages rooms and connections

2. **Frontend Component** (`frontend/components/VideoCallRoomWithSignaling.tsx`)
   - WebRTC peer connection
   - Signaling WebSocket connection
   - Automatic offer/answer exchange
   - ICE candidate handling

3. **Integration** (`frontend/app/consultation/[id]/room/page.tsx`)
   - Uses new signaling component
   - Passes consultation ID and user type

## 🚀 How to Test

### Step 1: Start Backend Server

```bash
cd backend
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Expected output:**
```
INFO:     Uvicorn running on http://0.0.0.0:8000
INFO:     Application startup complete.
```

### Step 2: Start Frontend (if not running)

```bash
cd frontend
npm run dev
```

### Step 3: Test on Same WiFi

**Laptop 1 (Doctor):**
1. Open browser: `http://localhost:3000`
2. Login as doctor
3. Go to "My Appointments"
4. Click "Join Call" on any scheduled appointment
5. **Wait** - you should see "Waiting for patient..."

**Laptop 2 (Patient):**
1. Open browser: `http://localhost:3000` (or use the laptop's IP if different machine)
2. Login as patient
3. Go to "My Appointments"  
4. Click "Join Call" on the SAME appointment
5. **Connection should establish in 3-5 seconds**

### Step 4: Watch Console Logs

**Open Browser DevTools (F12) on both laptops**

**Doctor Console Should Show:**
```
✅ Local media obtained
✅ Signaling connected as doctor
👤 patient joined (2 total)
🎬 Patient joined, doctor creating offer...
📤 Creating offer...
✅ Offer sent successfully
📥 Received answer
✅ Answer applied, connection should establish
🔗 Connection state: connected
📹 Received remote track
```

**Patient Console Should Show:**
```
✅ Local media obtained
✅ Signaling connected as patient
📥 Received offer, creating answer...
✅ Answer sent successfully
🔗 Connection state: connected
📹 Received remote track
```

## 🐛 Troubleshooting

### Issue: "Signaling not connected"

**Check:**
- Is backend running on port 8000?
- Check backend logs for WebSocket connection
- Try: `curl http://localhost:8000/docs` (should show API docs)

**Backend logs should show:**
```
INFO:     ('127.0.0.1', xxxxx) - "WebSocket /ws/signaling/{id}/doctor" [accepted]
INFO:     ✅ doctor joined room {id}. Total in room: 1
INFO:     ('127.0.0.1', xxxxx) - "WebSocket /ws/signaling/{id}/patient" [accepted]
INFO:     ✅ patient joined room {id}. Total in room: 2
INFO:     📡 Signaling message from doctor: offer
INFO:     📡 Signaling message from patient: answer
INFO:     📡 Signaling message from doctor: ice-candidate
INFO:     📡 Signaling message from patient: ice-candidate
```

### Issue: "No video/audio"

**Check:**
- Browser permissions for camera/microphone
- Try different browser (Chrome/Edge work best)
- Check if camera is being used by another app

### Issue: "Connection state: failed"

**Check:**
- Both users on same appointment ID?
- Firewall blocking WebRTC?
- Try adding TURN server (for strict NAT)

### Issue: "Offer not being created"

**Check:**
- Is doctor joining first?
- Wait 2-3 seconds after doctor joins
- Check console for error messages

## 📊 Expected Timeline

```
0s  - Doctor joins → Local video shows
2s  - Doctor signaling connects
5s  - Patient joins → Local video shows
6s  - Patient signaling connects
7s  - Doctor creates offer
8s  - Patient receives offer, creates answer
9s  - Doctor receives answer
10s - ICE candidates exchange
12s - ✅ CONNECTION ESTABLISHED
```

## 🔧 Quick Fixes

### If backend not running:
```bash
cd backend
python -m uvicorn app.main:app --reload
```

### If signaling endpoint not found:
Check `backend/app/main.py` includes:
```python
from .signaling import router as signaling_router
app.include_router(signaling_router)
```

### If frontend not using new component:
Check `frontend/app/consultation/[id]/room/page.tsx` imports:
```typescript
import VideoCallRoomWithSignaling from '@/components/VideoCallRoomWithSignaling'
```

## ✅ Success Indicators

1. **Both videos visible** - You see yourself and the other person
2. **Green "Connected" indicator** - Top right of screen
3. **Audio working** - Can hear each other
4. **Controls working** - Can mute/unmute, turn video on/off

## 🎉 If Everything Works

You should see:
- Your own video (mirrored) in one panel
- Other person's video in another panel
- Green "Connected" status
- Working audio
- Functional controls (mute, video toggle, end call)

## 📝 Notes

- **Same WiFi**: Should work immediately
- **Different Networks**: May need TURN server for NAT traversal
- **Mobile**: Works on mobile browsers too (Chrome/Safari)
- **Multiple Calls**: Each appointment ID is a separate room

## 🆘 Still Not Working?

Check these files exist and are correct:
1. `backend/app/signaling.py` - Signaling server
2. `frontend/components/VideoCallRoomWithSignaling.tsx` - Frontend component
3. `backend/app/main.py` - Includes signaling router
4. `frontend/app/consultation/[id]/room/page.tsx` - Uses new component

If all else fails, check browser console for specific error messages!
