# 🔧 Environment Setup Guide

## ⚠️ IMPORTANT: Backend Needs Service Role Key!

The backend requires the **SERVICE_ROLE** key from Supabase, NOT the anon key!

---

## Backend Environment (`.env`)

### Location
`Vibeathon/backend/.env`

### Required Variables
```bash
SUPABASE_URL=https://uqljtqnjanemvdkxnnjj.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key-here
```

### How to Get Service Role Key

1. Go to your Supabase Dashboard
2. Click on your project
3. Go to **Project Settings** (gear icon)
4. Click **API** in the left sidebar
5. Scroll down to **Project API keys**
6. Copy the **`service_role`** key (NOT the `anon` key!)
7. Paste it in `backend/.env`

**Screenshot location:**
```
Supabase Dashboard
  └─ Project Settings
      └─ API
          └─ Project API keys
              └─ service_role (secret) ← Copy this one!
```

---

## Frontend Environment (`.env.local`)

### Location
`Vibeathon/frontend/.env.local`

### Required Variables
```bash
NEXT_PUBLIC_SUPABASE_URL=https://uqljtqnjanemvdkxnnjj.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
```

### How to Get Anon Key

1. Same location as above (Project Settings > API)
2. Copy the **`anon`** key (public key)
3. Paste it in `frontend/.env.local`

---

## Quick Setup Commands

### Backend
```bash
cd Vibeathon/backend

# Create .env file
cat > .env << 'EOF'
SUPABASE_URL=https://uqljtqnjanemvdkxnnjj.supabase.co
SUPABASE_SERVICE_KEY=paste-your-service-role-key-here
EOF

# Verify it was created
cat .env
```

### Frontend
```bash
cd Vibeathon/frontend

# Your .env.local should already exist with:
cat .env.local
```

---

## Verification

### Check Backend Environment
```bash
cd backend
cat .env

# Should show:
# SUPABASE_URL=https://...
# SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Check Frontend Environment
```bash
cd frontend
cat .env.local

# Should show:
# NEXT_PUBLIC_SUPABASE_URL=https://...
# NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
# NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
```

---

## Common Mistakes

### ❌ Wrong: Using anon key in backend
```bash
# backend/.env (WRONG!)
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVxbGp0cW5qYW5lbXZka3hubmpqIiwicm9sZSI6ImFub24i...
# This is the anon key - won't work!
```

### ✅ Correct: Using service_role key in backend
```bash
# backend/.env (CORRECT!)
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVxbGp0cW5qYW5lbXZka3hubmpqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSI...
# This is the service_role key - correct!
```

### ❌ Wrong: Using NEXT_PUBLIC_ prefix in backend
```bash
# backend/.env (WRONG!)
NEXT_PUBLIC_SUPABASE_URL=...
# Backend doesn't use NEXT_PUBLIC_ prefix
```

### ✅ Correct: No prefix in backend
```bash
# backend/.env (CORRECT!)
SUPABASE_URL=...
SUPABASE_SERVICE_KEY=...
```

---

## Key Differences

| Environment | File | Variables | Key Type |
|------------|------|-----------|----------|
| **Backend** | `.env` | `SUPABASE_URL`<br>`SUPABASE_SERVICE_KEY` | service_role (secret) |
| **Frontend** | `.env.local` | `NEXT_PUBLIC_SUPABASE_URL`<br>`NEXT_PUBLIC_SUPABASE_ANON_KEY`<br>`NEXT_PUBLIC_BACKEND_URL` | anon (public) |

---

## Security Notes

⚠️ **NEVER commit `.env` files to git!**

The `.gitignore` should include:
```
.env
.env.local
.env*.local
```

The **service_role** key has full database access - keep it secret!

---

## After Setup

Once you have the correct `.env` file:

```bash
# Start backend
cd backend
./start_server.sh

# Should see:
# ✅ Starting server on http://0.0.0.0:8000
# INFO: Application startup complete.
```

If you still see errors, check:
1. ✅ File is named `.env` (not `.env.local`)
2. ✅ Using `service_role` key (not `anon` key)
3. ✅ No `NEXT_PUBLIC_` prefix
4. ✅ No extra spaces or quotes

---

## Get Your Service Role Key Now!

1. Open: https://supabase.com/dashboard/project/uqljtqnjanemvdkxnnjj/settings/api
2. Scroll to "Project API keys"
3. Click "Reveal" next to `service_role`
4. Copy the key
5. Paste in `backend/.env`

**Then restart the backend server!**

```bash
cd backend
./start_server.sh
```

---

**Once you have the service_role key, everything will work! 🎉**
