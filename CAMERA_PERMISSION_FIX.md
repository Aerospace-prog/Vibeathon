# Fix Camera/Microphone Permission Issues

## Problem
Browser is not asking for camera/microphone permission when starting a video call.

## Solutions

### Solution 1: Reset Site Permissions (Chrome/Edge)

1. **Click the lock icon** (or info icon) in the address bar next to `http://localhost:3000`
2. **Click "Site settings"**
3. Find **Camera** and **Microphone** settings
4. Change both from "Blocked" or "Ask" to **"Allow"**
5. **Refresh the page** (F5)
6. Try starting a call again

### Solution 2: Reset All Permissions

**Chrome/Edge:**
1. Go to `chrome://settings/content/camera` (or `edge://settings/content/camera`)
2. Find `localhost:3000` in the "Blocked" list
3. Click the trash icon to remove it
4. Do the same for microphone: `chrome://settings/content/microphone`
5. Refresh your app and try again

**Firefox:**
1. Go to `about:preferences#privacy`
2. Scroll to "Permissions" section
3. Click "Settings" next to Camera and Microphone
4. Find `localhost:3000` and remove it
5. Refresh your app

### Solution 3: Clear Browser Data

1. Press `Ctrl + Shift + Delete`
2. Select "Cookies and site data" and "Cached images and files"
3. Time range: "Last hour" or "All time"
4. Click "Clear data"
5. Restart browser
6. Go to `http://localhost:3000` again

### Solution 4: Use Incognito/Private Mode

1. Open a new Incognito/Private window (`Ctrl + Shift + N`)
2. Go to `http://localhost:3000`
3. Sign in
4. Start a call
5. Browser should ask for permissions

### Solution 5: Check System Permissions (Windows)

1. Press `Windows + I` to open Settings
2. Go to **Privacy & Security** > **Camera**
3. Make sure "Camera access" is **ON**
4. Make sure "Let apps access your camera" is **ON**
5. Make sure your browser (Chrome/Edge/Firefox) is allowed
6. Do the same for **Microphone**

### Solution 6: Test Camera/Microphone

Before trying the app, test if your devices work:

**Test in Browser:**
1. Go to https://webcamtests.com/
2. Click "Test my cam"
3. Browser should ask for permission
4. If it works here, the issue is with localhost permissions

**Test in Windows:**
1. Open Camera app (search "Camera" in Start menu)
2. If camera works here, hardware is fine

## After Fixing Permissions

Once permissions are granted:

1. **Refresh the page** (F5)
2. **Start a new call** from dashboard
3. You should see:
   - ✅ Browser permission popup
   - ✅ Your video feed appears
   - ✅ "Live translation active" green alert

## Still Not Working?

### Check Browser Console

1. Press `F12` to open DevTools
2. Go to **Console** tab
3. Look for errors related to:
   - `getUserMedia`
   - `NotAllowedError`
   - `NotFoundError`
   - `NotReadableError`

### Common Error Messages

**"NotAllowedError: Permission denied"**
- Solution: Reset permissions (Solution 1 or 2)

**"NotFoundError: Requested device not found"**
- Solution: Check if camera/mic is connected and working
- Try Solution 6 to test devices

**"NotReadableError: Could not start video source"**
- Solution: Close other apps using camera (Zoom, Teams, Skype)
- Restart browser

**"TypeError: Cannot read property 'getUserMedia'"**
- Solution: Use HTTPS or localhost (you're already on localhost, so this should be fine)

## Quick Test Command

Run this in browser console (F12 > Console):

```javascript
navigator.mediaDevices.getUserMedia({ video: true, audio: true })
  .then(stream => {
    console.log('✅ Camera and microphone access granted!', stream)
    stream.getTracks().forEach(track => track.stop())
  })
  .catch(err => {
    console.error('❌ Error:', err.name, err.message)
  })
```

If this works, your app should work too!

## Prevention

To avoid this in the future:
- Don't click "Block" when browser asks for permissions
- Always click "Allow" for localhost during development
- Use HTTPS in production (required for camera/mic access)
