# 🚀 Quick Database Fix (2 Minutes)

## The Problem
Your app is showing: **"Could not find the table 'public.consultations'"**

## The Solution

### 1️⃣ Open Supabase Dashboard
Go to: https://supabase.com/dashboard/project/YOUR_PROJECT_ID/sql

### 2️⃣ Copy & Paste
1. Open the file: `database/schema.sql`
2. Copy ALL the content (Ctrl+A, Ctrl+C)
3. Paste into Supabase SQL Editor
4. Click **RUN** (or press Ctrl+Enter)

### 3️⃣ Verify
Click **Table Editor** in sidebar - you should see:
- ✅ patients
- ✅ consultations  
- ✅ community_lexicon

### 4️⃣ Refresh Your App
Go back to http://localhost:3000 and refresh (F5)

## ✨ Done!

The errors should be gone and you can now:
- View the dashboard
- Start consultations
- View patient records

---

## Getting "Error creating patient" ?

If you already ran the schema and are getting patient creation errors:

1. Open Supabase SQL Editor again
2. Copy content from `database/fix_rls_policies.sql`
3. Paste and click **RUN**
4. Refresh your app

This fixes the Row Level Security policies to allow patient creation.

---

## Still Having Issues?

### Check Your Environment Variables

Make sure `frontend/.env.local` has:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
```

### Get Your Supabase Keys

1. Go to Supabase Dashboard
2. Click **Settings** (gear icon)
3. Click **API**
4. Copy:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - anon/public key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Restart Frontend

```bash
# Stop the frontend (Ctrl+C)
cd frontend
npm run dev
```

---

## What This Does

Creates 3 tables with proper security:
- **patients** - Patient information
- **consultations** - Consultation records with SOAP notes
- **community_lexicon** - Medical term translations

Plus:
- Row Level Security (RLS) policies
- Indexes for performance
- Automatic timestamp updates

---

## Need More Help?

See `DATABASE_SETUP.md` for detailed instructions and troubleshooting.
