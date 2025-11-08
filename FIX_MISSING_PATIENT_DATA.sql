-- Fix Missing Patient Data and Consultation Fees
-- Run this in Supabase SQL Editor

-- Step 1: Check current situation
SELECT 
  'Appointments without patient records' as issue,
  COUNT(DISTINCT a.patient_id) as count
FROM appointments a
LEFT JOIN patients p ON p.user_id = a.patient_id
WHERE p.id IS NULL;

-- Step 2: First, add unique constraint on user_id if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'patients_user_id_key'
  ) THEN
    ALTER TABLE patients ADD CONSTRAINT patients_user_id_key UNIQUE (user_id);
    RAISE NOTICE '✅ Added unique constraint on user_id';
  ELSE
    RAISE NOTICE 'ℹ️ Unique constraint already exists';
  END IF;
END $$;

-- Step 3: Create patient records for appointments that don't have them
-- This uses data from auth.users if available, or creates placeholder data
INSERT INTO patients (user_id, name, email, date_of_birth, preferred_language)
SELECT DISTINCT 
  a.patient_id as user_id,
  COALESCE(
    u.raw_user_meta_data->>'full_name',
    u.email,
    'Patient ' || SUBSTRING(a.patient_id::text, 1, 8)
  ) as name,
  COALESCE(u.email, 'patient@example.com') as email,
  COALESCE(
    (u.raw_user_meta_data->>'date_of_birth')::date,
    CURRENT_DATE - INTERVAL '30 years'
  ) as date_of_birth,
  COALESCE(
    u.raw_user_meta_data->>'preferred_language',
    'en'
  ) as preferred_language
FROM appointments a
LEFT JOIN patients p ON p.user_id = a.patient_id
LEFT JOIN auth.users u ON u.id = a.patient_id
WHERE p.id IS NULL
ON CONFLICT (user_id) DO UPDATE SET
  name = EXCLUDED.name,
  email = EXCLUDED.email;

-- Step 4: Update consultation fees for appointments that have NULL or 0
UPDATE appointments 
SET consultation_fee = 500.00 
WHERE consultation_fee IS NULL OR consultation_fee = 0;

-- Step 5: Verify the fixes
SELECT 
  a.id,
  a.patient_id,
  p.name as patient_name,
  p.email as patient_email,
  a.consultation_fee,
  a.date,
  a.status
FROM appointments a
LEFT JOIN patients p ON p.user_id = a.patient_id
ORDER BY a.created_at DESC
LIMIT 10;

-- Step 6: Summary
SELECT 
  'Total Appointments' as metric,
  COUNT(*) as value
FROM appointments
UNION ALL
SELECT 
  'Total Patients' as metric,
  COUNT(*) as value
FROM patients
UNION ALL
SELECT 
  'Appointments with Patient Records' as metric,
  COUNT(*) as value
FROM appointments a
INNER JOIN patients p ON p.user_id = a.patient_id
UNION ALL
SELECT 
  'Appointments with Fees' as metric,
  COUNT(*) as value
FROM appointments
WHERE consultation_fee > 0;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Patient records created and consultation fees updated!';
  RAISE NOTICE 'Refresh your dashboard to see the changes.';
END $$;
