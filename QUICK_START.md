# Quick Start Guide - Testing Error Handling

## Prerequisites

⚠️ **IMPORTANT: Set up the database first!**

If you see errors like "Could not find the table 'public.consultations'", you need to create the database tables.

**Quick Fix (2 minutes):**
1. Go to https://supabase.com/dashboard/project/YOUR_PROJECT_ID/sql
2. Copy all content from `database/schema.sql`
3. Paste and click **RUN**
4. See `QUICK_DATABASE_FIX.md` for detailed steps

## Fastest Way to Test

### 1. Start Backend (Terminal 1)

```bash
cd backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

**Expected Output:**
```
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
INFO:     Started reloader process
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

### 2. Start Frontend (Terminal 2)

```bash
cd frontend
npm run dev
```

**Expected Output:**
```
  ▲ Next.js 16.0.1
  - Local:        http://localhost:3000
  - Environments: .env.local

 ✓ Starting...
 ✓ Ready in 2.3s
```

### 3. Open Browser

Navigate to: **http://localhost:3000**

## Quick Test Checklist

### ✅ Test 1: Toast Notifications (2 minutes)
1. Go to http://localhost:3000/auth
2. Try signing in with wrong password
3. **Look for**: Red error toast in top-right corner
4. Sign in with correct credentials
5. **Look for**: Green success toast

### ✅ Test 2: Loading Spinners (1 minute)
1. On dashboard, click "Start New Call"
2. **Look for**: 
   - Spinner in button
   - "Starting..." text
   - Toast notifications

### ✅ Test 3: WebSocket Retry (3 minutes)
1. Start a video call
2. Wait for "Live translation active" green alert
3. **Stop backend** (Ctrl+C in Terminal 1)
4. **Look for**:
   - Toast warnings: "Connection lost. Retrying..."
   - Red alert: "Translation service disconnected"
5. **Restart backend** (run uvicorn command again)
6. Click "Reconnect" button
7. **Look for**: Green "Live translation active" alert

### ✅ Test 4: Media Permissions (2 minutes)
1. In browser, block camera/microphone permissions
2. Start a new call
3. **Look for**:
   - Red error alert with specific message
   - "Refresh Page" button
4. Grant permissions and refresh

### ✅ Test 5: Error Recovery (2 minutes)
1. Stop backend server
2. Try to load SOAP note review page
3. **Look for**:
   - Error card with "Failed to Load SOAP Note"
   - "Retry" button
   - "Back to Dashboard" button
4. Restart backend
5. Click "Retry"
6. **Look for**: SOAP note loads successfully

## Total Testing Time: ~10 minutes

## What You Should See

### ✅ Success Indicators
- Green toasts for successful operations
- Smooth loading states
- Automatic reconnection after network issues
- Clear error messages with recovery options
- No application crashes

### ❌ Red Flags
- Application crashes
- No error messages
- Stuck loading states
- Console errors
- White screen of death

## Troubleshooting

### Backend Won't Start
```bash
# Check if port 8000 is in use
netstat -ano | findstr :8000

# Kill the process if needed (Windows)
taskkill /PID <process_id> /F

# Or use a different port
uvicorn main:app --reload --port 8001
```

### Frontend Won't Start
```bash
# Clear cache and reinstall
cd frontend
rm -rf .next node_modules
npm install
npm run dev
```

### WebSocket Not Connecting
1. Check backend is running: http://localhost:8000/docs
2. Verify .env.local has: `NEXT_PUBLIC_BACKEND_URL=http://localhost:8000`
3. Check browser console for WebSocket errors

### No Toast Notifications
1. Check browser console for errors
2. Verify `sonner` is installed: `npm list sonner`
3. Clear browser cache and reload

## Environment Check

Before testing, verify:

```bash
# Check Node.js version (should be 18+)
node --version

# Check npm version
npm --version

# Check Python version (should be 3.8+)
python --version

# Check if backend dependencies installed
cd backend
pip list | grep fastapi

# Check if frontend dependencies installed
cd frontend
npm list sonner
```

## Quick Demo Flow

For a complete demo of all features:

1. **Sign In** → See success toast
2. **Start Call** → See loading states and toasts
3. **Allow Media** → See video feed
4. **Wait for Connection** → See green "Live translation active"
5. **Stop Backend** → See retry attempts and red alert
6. **Restart Backend** → Click reconnect, see green alert
7. **End Call** → See loading overlay
8. **Review SOAP Note** → See loaded data
9. **Save Note** → See loading button and success toast
10. **Return to Dashboard** → See consultation in list

## Next Steps

After quick testing:
1. Read full TESTING_GUIDE.md for comprehensive tests
2. Check ERROR_HANDLING.md for implementation details
3. Review IMPLEMENTATION_SUMMARY.md for what was built

## Need Help?

Common commands:
```bash
# View backend logs
cd backend
uvicorn main:app --reload --log-level debug

# View frontend build
cd frontend
npm run build

# Check for TypeScript errors
cd frontend
npx tsc --noEmit

# View all running processes
# Windows
netstat -ano | findstr :3000
netstat -ano | findstr :8000

# Linux/Mac
lsof -i :3000
lsof -i :8000
```

## Success!

If you can complete the Quick Test Checklist without issues, the error handling implementation is working correctly! 🎉
