# 🔑 How to Get Your Supabase Service Role Key

## ⚠️ CRITICAL: You Need the SERVICE_ROLE Key!

The backend **CANNOT** start without the `service_role` key. The `anon` key won't work!

---

## Step-by-Step Instructions

### 1. Open Supabase Dashboard

Click this link (or copy to browser):
```
https://supabase.com/dashboard/project/uqljtqnjanemvdkxnnjj/settings/api
```

### 2. Find "Project API keys" Section

Scroll down until you see a section titled **"Project API keys"**

You'll see two keys:
- ✅ **`anon` / `public`** - This is for the frontend (you already have this)
- ✅ **`service_role`** - This is what you need for the backend!

### 3. Reveal the Service Role Key

Next to `service_role`, click the **"Reveal"** or **"Copy"** button

The key will look something like:
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVxbGp0cW5qYW5lbXZka3hubmpqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjU0NTE0NiwiZXhwIjoyMDc4MTIxMTQ2fQ.XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

**Note:** It's MUCH longer than the anon key and contains `"role":"service_role"` when decoded.

### 4. Copy the Key

Click the copy button or select all and copy (Cmd+C / Ctrl+C)

### 5. Paste in .env File

Open `Vibeathon/backend/.env` and replace `YOUR_SERVICE_ROLE_KEY_HERE`:

**Before:**
```bash
SUPABASE_SERVICE_KEY=YOUR_SERVICE_ROLE_KEY_HERE
```

**After:**
```bash
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVxbGp0cW5qYW5lbXZka3hubmpqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjU0NTE0NiwiZXhwIjoyMDc4MTIxMTQ2fQ.XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

### 6. Save the File

Save `backend/.env` (Cmd+S / Ctrl+S)

### 7. Restart Backend

```bash
cd backend
./start_server.sh
```

You should now see:
```
✅ Starting server on http://0.0.0.0:8000
INFO: Application startup complete.
```

---

## Visual Guide

```
Supabase Dashboard
  └─ Your Project (uqljtqnjanemvdkxnnjj)
      └─ Settings (⚙️ gear icon)
          └─ API
              └─ Project API keys
                  ├─ anon / public (for frontend) ❌ Not this one!
                  └─ service_role (for backend) ✅ Copy this one!
```

---

## Quick Check

### How to Know You Have the Right Key

**Anon Key (WRONG for backend):**
- Contains: `"role":"anon"`
- Shorter
- Safe to expose in frontend

**Service Role Key (CORRECT for backend):**
- Contains: `"role":"service_role"`
- Longer
- Must be kept secret!
- Has full database access

---

## Security Warning

⚠️ **NEVER commit the service_role key to git!**

The `.gitignore` should already include `.env` files, but double-check:
```bash
# Check if .env is ignored
git status

# .env should NOT appear in the list
```

---

## Still Having Issues?

### Error: "SUPABASE_URL and SUPABASE_SERVICE_KEY must be set"

**Solution:** You haven't replaced `YOUR_SERVICE_ROLE_KEY_HERE` yet!

1. Open `backend/.env`
2. Make sure line 5 has your actual service_role key
3. Save the file
4. Restart backend

### Error: "Invalid JWT"

**Solution:** You might have copied the anon key instead of service_role key

1. Go back to Supabase Dashboard
2. Make sure you're copying the **service_role** key (not anon)
3. Replace in `backend/.env`
4. Restart backend

---

## After You Add the Key

Once you have the correct service_role key in `backend/.env`:

```bash
cd backend
./start_server.sh
```

Expected output:
```
🚀 Starting FastAPI server...
✅ Starting server on http://0.0.0.0:8000
📊 API docs available at http://0.0.0.0:8000/docs

INFO:     Uvicorn running on http://0.0.0.0:8000
INFO:     Application startup complete.
```

Then open: http://localhost:3000/dashboard

---

**Get your service_role key now and the backend will start! 🚀**
