# 🔧 Troubleshooting Appointments Not Showing

## Issue: Empty Error When Fetching Appointments

If you see this error in the console:
```
Error fetching appointments: {}
Error details: {}
```

This usually means one of these issues:

### 1. RLS Policy Issue (Most Common)

The Row Level Security policies might not allow the doctor to view appointments.

**Quick Fix:**
1. Open Supabase SQL Editor
2. Run this query to check current policies:
```sql
SELECT * FROM pg_policies WHERE tablename = 'appointments';
```

3. If no policies exist or they're wrong, run: `FIX_APPOINTMENTS_RLS.sql`

### 2. Doctor ID Mismatch

The `doctor_id` in the appointments table might not match your logged-in user ID.

**Check:**
```sql
-- Get your current user ID
SELECT auth.uid();

-- Check appointments
SELECT id, doctor_id, patient_id, date, time, status 
FROM appointments 
LIMIT 5;

-- See if doctor_id matches your user ID
```

**Fix:**
If the IDs don't match, update them:
```sql
UPDATE appointments 
SET doctor_id = 'your-actual-doctor-uuid'
WHERE doctor_id = 'wrong-uuid';
```

### 3. Table Doesn't Exist

**Check:**
```sql
SELECT * FROM appointments LIMIT 1;
```

If you get "relation does not exist", run:
```sql
-- Run the full migration
-- File: backend/migrations/001_create_appointments_tables.sql
```

### 4. No Appointments Yet

**Check:**
```sql
SELECT COUNT(*) FROM appointments;
```

If count is 0, create a test appointment:
```sql
-- Get your doctor ID
SELECT id FROM auth.users WHERE email = 'your-doctor-email@example.com';

-- Create test appointment
INSERT INTO appointments (
  patient_id, 
  doctor_id, 
  date, 
  time, 
  status, 
  consultation_fee
)
VALUES (
  'patient-uuid-here',
  'your-doctor-uuid-here',
  CURRENT_DATE + INTERVAL '1 day',
  '10:00:00',
  'scheduled',
  500.00
);
```

## Debug Steps

### Step 1: Check Browser Console
Look for these logs:
```
Fetching appointments for doctor: [uuid]
Appointments query result: { data: ..., error: ... }
```

### Step 2: Check Supabase Logs
1. Go to Supabase Dashboard
2. Click "Logs" → "Postgres Logs"
3. Look for errors related to appointments table

### Step 3: Test Direct Query
In Supabase SQL Editor:
```sql
-- Replace with your doctor ID
SELECT * FROM appointments 
WHERE doctor_id = 'your-doctor-uuid-here';
```

If this works but the app doesn't, it's an RLS issue.

### Step 4: Temporarily Disable RLS (Testing Only!)
```sql
-- ONLY FOR TESTING - DO NOT USE IN PRODUCTION
ALTER TABLE appointments DISABLE ROW LEVEL SECURITY;

-- Test if appointments show up now
-- If yes, the issue is RLS policies

-- Re-enable RLS
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
```

## Common Solutions

### Solution 1: Fix RLS Policies
Run `FIX_APPOINTMENTS_RLS.sql` in Supabase SQL Editor

### Solution 2: Check User Role
```sql
-- Check if you're logged in as a doctor
SELECT 
  id,
  email,
  raw_user_meta_data->>'role' as role
FROM auth.users
WHERE id = auth.uid();
```

Should show `role: 'doctor'`

### Solution 3: Verify Table Structure
```sql
-- Check table columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'appointments';
```

Should have: id, patient_id, doctor_id, date, time, status, etc.

## Still Not Working?

### Check These:
1. ✅ Supabase URL and keys in `.env.local` are correct
2. ✅ You're logged in as a doctor (not patient)
3. ✅ The appointments table exists
4. ✅ RLS is enabled with correct policies
5. ✅ Doctor ID in appointments matches your user ID
6. ✅ At least one appointment exists in the table

### Get More Info:
Add this to your browser console:
```javascript
// Check current user
const { data: { user } } = await supabase.auth.getUser()
console.log('Current user:', user)

// Try direct query
const { data, error } = await supabase
  .from('appointments')
  .select('*')
console.log('Direct query:', { data, error })
```

## Quick Test

Create a test appointment that you know will work:
```sql
-- Use your actual user ID as both patient and doctor for testing
INSERT INTO appointments (
  patient_id, 
  doctor_id, 
  date, 
  time, 
  status
)
VALUES (
  auth.uid(),  -- Your user ID
  auth.uid(),  -- Same user ID
  CURRENT_DATE,
  '14:00:00',
  'scheduled'
);
```

Then refresh the dashboard. If this shows up, the issue is with the actual appointment data.

---

**Most Common Fix**: Run `FIX_APPOINTMENTS_RLS.sql` ✅
