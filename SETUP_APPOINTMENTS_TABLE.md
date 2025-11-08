# 🔧 Setup Appointments Table - Quick Guide

## Error: Appointments Table Not Found

If you're seeing this error:
```
Error fetching appointments: {}
⚠️ Appointments table does not exist
```

This means the appointments table hasn't been created in your Supabase database yet.

## Quick Fix (2 Minutes)

### Step 1: Open Supabase SQL Editor
1. Go to your Supabase project: https://supabase.com/dashboard
2. Select your project
3. Click **"SQL Editor"** in the left sidebar
4. Click **"New query"**

### Step 2: Run the Migration
1. Open the file: **`backend/migrations/001_create_appointments_tables.sql`**
2. Copy **ALL** the contents (Ctrl+A, Ctrl+C)
3. Paste into the Supabase SQL Editor
4. Click **"Run"** button (or press Ctrl+Enter)
5. Wait for success message

### Step 3: Verify Setup
Run this test query in Supabase SQL Editor:
```sql
SELECT * FROM appointments LIMIT 1;
```

You should see:
- Empty result (no rows) - This is OK! ✅
- OR actual appointment data if you have any

### Step 4: Refresh Your App
1. Go back to your app
2. Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
3. The error should be gone!

## What This Creates

The migration creates 3 tables:

### 1. Appointments Table
```sql
appointments
├── id (uuid)
├── patient_id (uuid)
├── doctor_id (uuid)
├── date (date)
├── time (time)
├── status (varchar)
├── symptom_category (varchar)
├── severity (integer)
├── consultation_fee (decimal)
└── created_at (timestamp)
```

### 2. Doctor Availability Table
```sql
doctor_availability
├── id (uuid)
├── doctor_id (uuid)
├── date (date)
├── time_slots (jsonb)
└── created_at (timestamp)
```

### 3. Consultations Table (Enhanced)
```sql
consultations
├── id (uuid)
├── appointment_id (uuid)
├── patient_id (uuid)
├── doctor_id (uuid)
├── start_time (timestamp)
├── end_time (timestamp)
├── transcript (text)
├── soap_notes (jsonb)
├── status (varchar)
└── created_at (timestamp)
```

## Troubleshooting

### Error: "relation appointments already exists"
**Solution**: Table already exists! Just refresh your app.

### Error: "permission denied"
**Solution**: Make sure you're logged into Supabase as the project owner.

### Error: "syntax error"
**Solution**: Make sure you copied the ENTIRE SQL file, including all lines.

### Still seeing errors?
1. Check browser console for detailed error messages
2. Verify you're using the correct Supabase project
3. Check that your `.env.local` has correct Supabase credentials
4. Try logging out and back in

## Alternative: Manual Table Creation

If the migration doesn't work, create the table manually:

```sql
-- Minimal appointments table
CREATE TABLE IF NOT EXISTS appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES auth.users(id),
  doctor_id UUID NOT NULL REFERENCES auth.users(id),
  date DATE NOT NULL,
  time TIME NOT NULL,
  status VARCHAR(20) DEFAULT 'scheduled',
  consultation_fee DECIMAL(10, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Allow doctors to see their appointments
CREATE POLICY "Doctors can view their appointments"
  ON appointments FOR SELECT
  USING (auth.uid() = doctor_id);

-- Allow patients to see their appointments
CREATE POLICY "Patients can view their appointments"
  ON appointments FOR SELECT
  USING (auth.uid() = patient_id);

-- Allow patients to create appointments
CREATE POLICY "Patients can create appointments"
  ON appointments FOR INSERT
  WITH CHECK (auth.uid() = patient_id);
```

## Testing

### Create a Test Appointment
```sql
-- Get your doctor ID
SELECT id FROM auth.users WHERE email = 'your-doctor-email@example.com';

-- Get a patient ID
SELECT id FROM auth.users WHERE email = 'patient-email@example.com';

-- Create test appointment
INSERT INTO appointments (patient_id, doctor_id, date, time, status, consultation_fee)
VALUES (
  'patient-uuid-here',
  'doctor-uuid-here',
  CURRENT_DATE + INTERVAL '1 day',
  '10:00:00',
  'scheduled',
  500.00
);
```

### Verify in Dashboard
1. Refresh your doctor dashboard
2. You should see the test appointment
3. Stats should show: Total: 1, Scheduled: 1

## Next Steps

After setting up the table:

1. ✅ **Test Booking Flow** - Book an appointment as a patient
2. ✅ **Test Real-Time Updates** - Open dashboard in two tabs
3. ✅ **Test Join Call** - Click "Join Call" button
4. ✅ **Integrate Razorpay** - Add payment gateway
5. ✅ **Test Complete Flow** - End-to-end booking and consultation

## Files Reference

- **Migration**: `backend/migrations/001_create_appointments_tables.sql`
- **Component**: `components/appointments/doctor-appointments-list.tsx`
- **Dashboard**: `app/dashboard/page.tsx`

## Support

If you're still having issues:
1. Check the browser console for detailed errors
2. Check Supabase logs (Logs section in dashboard)
3. Verify your database connection
4. Make sure you're logged in as a doctor

---

**Quick Command Summary**:
1. Open Supabase SQL Editor
2. Copy `001_create_appointments_tables.sql`
3. Paste and Run
4. Refresh app
5. Done! ✅
