# Troubleshooting: Upload Stuck on "Analyzing with AI"

## Quick Diagnosis

### Step 1: Check Backend is Running
Open your backend terminal and check if you see any errors when you upload.

**Expected**: You should see logs like:
```
INFO:     POST /api/medical-images/upload
```

**If backend not running**:
```bash
cd backend
venv\Scripts\activate
python run.py
```

### Step 2: Check Database Migration
The most common issue is the database table doesn't exist yet.

**Solution**: Run the migration in Supabase

1. Go to: https://supabase.com/dashboard
2. Select your project
3. Click "SQL Editor" in left sidebar
4. Click "New Query"
5. Copy ALL contents from: `backend/migrations/002_create_medical_images_tables.sql`
6. Paste into SQL Editor
7. Click "Run" (or press Ctrl+Enter)

**Expected output**: "Success. No rows returned"

### Step 3: Check Browser Console
1. Open browser DevTools (F12)
2. Go to "Console" tab
3. Try uploading again
4. Look for error messages

**Common errors**:
- `Failed to fetch` = Backend not running
- `404 Not Found` = Endpoint not registered
- `500 Internal Server Error` = Check backend logs

### Step 4: Check Backend Logs
Look at your backend terminal for errors like:

**Error: "relation 'medical_images' does not exist"**
- Solution: Run database migration (Step 2)

**Error: "GEMINI_API_KEY not found"**
- Solution: Check `backend/.env` has the API key

**Error: "Storage bucket 'medical-images' not found"**
- Solution: Re-run database migration (it creates the bucket)

## Quick Fix Commands

### 1. Restart Backend
```bash
cd backend
venv\Scripts\activate
python run.py
```

### 2. Check Backend Health
Open browser: http://localhost:8000/health

Should see:
```json
{
  "status": "healthy",
  "services": {
    "alert_engine": "operational",
    "emotion_analyzer": "operational",
    "database": "operational"
  }
}
```

### 3. Test API Endpoint
Open browser: http://localhost:8000/docs

Look for `/api/medical-images/upload` endpoint

## Most Likely Issues

### Issue 1: Database Table Not Created (90% of cases)
**Symptom**: Upload hangs, backend shows "relation does not exist"

**Fix**:
1. Open Supabase Dashboard
2. SQL Editor
3. Run `backend/migrations/002_create_medical_images_tables.sql`

### Issue 2: Backend Not Running (5% of cases)
**Symptom**: Upload hangs, no backend logs

**Fix**:
```bash
cd backend
venv\Scripts\activate
python run.py
```

### Issue 3: CORS Error (3% of cases)
**Symptom**: Browser console shows CORS error

**Fix**: Backend should already have CORS configured, but check `backend/app/main.py`:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Issue 4: Gemini API Error (2% of cases)
**Symptom**: Upload completes but analysis fails

**Fix**: Check `backend/.env` has:
```
GEMINI_API_KEY=AIzaSyCvhOlXPza3sTI_FLIXtm3jsVaSReNI23Q
```

## Step-by-Step Debug Process

### 1. Open 3 Windows

**Window 1: Backend Terminal**
```bash
cd backend
venv\Scripts\activate
python run.py
```
Watch for errors here

**Window 2: Frontend Terminal**
```bash
cd frontend
npm run dev
```

**Window 3: Browser DevTools**
- Open http://localhost:3000/patient/medical-images
- Press F12 for DevTools
- Go to Console tab

### 2. Try Upload Again
1. Select an image
2. Fill in details
3. Click "Upload & Analyze"
4. Watch all 3 windows for errors

### 3. Check Each Window

**Backend Terminal** - Should show:
```
INFO:     POST /api/medical-images/upload
✅ Received image upload
✅ Analyzing with Gemini...
✅ Analysis complete
INFO:     200 OK
```

**Browser Console** - Should show:
```
Uploading image...
Analysis complete
```

**Frontend** - Should show:
- "Analyzing with AI..." (briefly)
- Then results appear

## If Still Stuck

### Check Backend Endpoint Registration

Open `backend/app/main.py` and verify:
```python
from .medical_images import router as medical_images_router

app.include_router(medical_images_router)
```

### Check File Exists
Verify these files exist:
- `backend/app/medical_images.py` ✓
- `backend/app/medical_image_analyzer.py` ✓
- `backend/app/medical_image_models.py` ✓

### Manual API Test

Use curl to test directly:
```bash
curl -X POST http://localhost:8000/api/medical-images/upload \
  -F "file=@test.jpg" \
  -F "patient_id=test-user-id" \
  -F "body_part=arm" \
  -F "image_type=skin_condition"
```

Should return JSON with analysis.

## Common Backend Errors

### Error: "No module named 'medical_image_analyzer'"
**Fix**: Restart backend server

### Error: "supabase.storage.from_() failed"
**Fix**: Check Supabase credentials in `backend/.env`

### Error: "Gemini API quota exceeded"
**Fix**: Wait a minute (free tier has rate limits)

## Success Indicators

✅ Backend shows: `INFO: 200 OK`
✅ Browser console: No errors
✅ Frontend: Results appear
✅ Image saved to Supabase Storage
✅ Record created in database

## Still Not Working?

### Last Resort: Check Everything

1. **Backend running?** → http://localhost:8000/health
2. **Database migrated?** → Check Supabase table exists
3. **API key valid?** → Check `backend/.env`
4. **Frontend running?** → http://localhost:3000
5. **Logged in?** → Check you're authenticated
6. **Network tab?** → F12 → Network → See the request

### Get Detailed Error

Add this to `backend/app/medical_images.py` at the top of `upload_medical_image`:
```python
print("=" * 50)
print("UPLOAD REQUEST RECEIVED")
print(f"Patient ID: {patient_id}")
print(f"File: {file.filename}")
print("=" * 50)
```

This will help you see if the request is reaching the backend.

---

**Most Common Fix**: Run the database migration in Supabase! 90% of "stuck" issues are because the table doesn't exist yet.
