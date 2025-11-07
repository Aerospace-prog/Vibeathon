# Troubleshooting Guide

## Common Errors and Solutions

### 1. "Could not find the table 'public.consultations'"

**Cause**: Database tables haven't been created yet.

**Solution**:
1. Go to Supabase SQL Editor
2. Run `database/schema.sql`
3. Verify tables exist in Table Editor
4. Refresh your app

**See**: `QUICK_DATABASE_FIX.md`

---

### 2. "Error creating patient: {}"

**Cause**: Row Level Security (RLS) policies are too restrictive.

**Solution**:
1. Go to Supabase SQL Editor
2. Run `database/fix_rls_policies.sql`
3. Refresh your app
4. Try creating a consultation again

**Alternative**: Check if you're signed in. RLS requires authentication.

---

### 3. "Session expired. Please sign in again"

**Cause**: Supabase session has expired or cookies aren't being set.

**Solution**:
1. Clear browser cookies for localhost
2. Sign out and sign in again
3. Check that `.env.local` has correct Supabase credentials
4. Verify Supabase project is active

---

### 4. "Failed to access camera/microphone"

**Cause**: Browser permissions not granted or devices in use.

**Solutions**:

**Permission Denied**:
1. Click the camera icon in browser address bar
2. Allow camera and microphone access
3. Refresh the page

**Device Already in Use**:
1. Close other apps using camera (Zoom, Teams, etc.)
2. Refresh the page

**No Devices Found**:
1. Connect camera/microphone
2. Check device is working in system settings
3. Refresh the page

---

### 5. "Connection to translation service failed"

**Cause**: Backend server is not running or WebSocket connection failed.

**Solution**:
1. Check backend is running: http://localhost:8000/docs
2. Verify `NEXT_PUBLIC_BACKEND_URL=http://localhost:8000` in `.env.local`
3. Check backend terminal for errors
4. Click "Reconnect" button in the app

**Start Backend**:
```bash
cd backend
venv\Scripts\activate
python run.py
```

---

### 6. "Error loading ASGI app. Could not import module 'main'"

**Cause**: Running uvicorn with wrong module path.

**Solution**:
Use one of these commands:
```bash
# Option 1 (Recommended)
python run.py

# Option 2
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**NOT**: `uvicorn main:app` (this won't work)

---

### 7. Backend Installation Errors (Windows)

**Error**: "Could not install packages due to an OSError"

**Solution**: Use virtual environment
```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

**See**: Previous conversation for detailed steps

---

### 8. "Toast notifications not appearing"

**Cause**: Sonner package not installed or ToastProvider not in layout.

**Solution**:
```bash
cd frontend
npm install sonner
npm run dev
```

Verify `app/layout.tsx` has `<ToastProvider />`.

---

### 9. "WebSocket not retrying after disconnect"

**Cause**: WebSocket hook not properly initialized.

**Solution**:
1. Check browser console for errors
2. Verify backend WebSocket endpoint is correct
3. Check that `useWebSocketWithRetry` hook is being used
4. Restart both frontend and backend

---

### 10. Build Errors in Frontend

**Error**: TypeScript or build errors

**Solution**:
```bash
cd frontend
rm -rf .next node_modules
npm install
npm run build
```

If still failing, check:
- Node.js version (should be 18+)
- TypeScript errors: `npx tsc --noEmit`

---

### 11. "Network request failed" or CORS errors

**Cause**: Backend not configured for CORS or wrong URL.

**Solution**:

**Check Backend CORS** (in `backend/app/main.py`):
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

**Check Frontend URL** (in `frontend/.env.local`):
```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
```

---

### 12. Supabase Authentication Issues

**Error**: "Invalid login credentials" or "User not found"

**Solutions**:

**For Sign Up**:
1. Check email confirmation settings in Supabase
2. Go to Authentication > Settings
3. Disable email confirmation for development
4. Or check your email for confirmation link

**For Sign In**:
1. Verify user exists in Supabase Authentication > Users
2. Check password is correct (min 6 characters)
3. Try password reset if needed

**Check Supabase Keys**:
```bash
# In frontend/.env.local
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
```

Get keys from: Supabase Dashboard > Settings > API

---

### 13. "Failed to load SOAP note"

**Cause**: Consultation doesn't exist or database query failed.

**Solution**:
1. Check consultation exists in Supabase Table Editor
2. Verify you're signed in as the doctor who created it
3. Check RLS policies allow reading consultations
4. Check browser console for detailed error

---

### 14. Port Already in Use

**Error**: "Port 3000/8000 is already in use"

**Solution**:

**Windows**:
```bash
# Find process using port
netstat -ano | findstr :3000
netstat -ano | findstr :8000

# Kill process (replace PID)
taskkill /PID <process_id> /F
```

**Or use different port**:
```bash
# Frontend
PORT=3001 npm run dev

# Backend
uvicorn app.main:app --reload --port 8001
```

---

### 15. Environment Variables Not Loading

**Cause**: `.env.local` not in correct location or not formatted correctly.

**Solution**:

**Check File Location**:
- Frontend: `frontend/.env.local` (NOT in root)
- Backend: `backend/.env` (NOT in root)

**Check Format** (no quotes needed):
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
```

**Restart After Changes**:
```bash
# Stop server (Ctrl+C)
# Start again
npm run dev
```

---

## Debugging Tips

### Check Browser Console
1. Open DevTools (F12)
2. Go to Console tab
3. Look for red error messages
4. Copy full error for troubleshooting

### Check Network Tab
1. Open DevTools (F12)
2. Go to Network tab
3. Look for failed requests (red)
4. Click on failed request to see details

### Check Backend Logs
Look at the terminal running the backend for error messages.

### Check Supabase Logs
1. Go to Supabase Dashboard
2. Click Logs in sidebar
3. Filter by error level
4. Look for recent errors

---

## Getting Help

When asking for help, provide:
1. **Error message** (full text from console)
2. **Steps to reproduce** (what you did before error)
3. **Environment**:
   - OS (Windows/Mac/Linux)
   - Node.js version: `node --version`
   - Python version: `python --version`
4. **What you've tried** (solutions attempted)
5. **Screenshots** (if helpful)

---

## Quick Health Check

Run these to verify everything is set up:

```bash
# Check Node.js
node --version  # Should be 18+

# Check Python
python --version  # Should be 3.8+

# Check frontend dependencies
cd frontend
npm list sonner  # Should show version

# Check backend dependencies
cd backend
pip list | grep fastapi  # Should show version

# Check environment files exist
ls frontend/.env.local  # Should exist
ls backend/.env  # Should exist

# Test backend
curl http://localhost:8000/docs  # Should return HTML

# Test frontend
curl http://localhost:3000  # Should return HTML
```

---

## Still Stuck?

1. Review all documentation files
2. Check GitHub issues for similar problems
3. Verify all prerequisites are installed
4. Try a fresh install (delete node_modules, venv, reinstall)
5. Check Supabase project status
