-- Check Appointments Data - Diagnose Issues
-- Run this in Supabase SQL Editor

-- 1. Check what columns exist in appointments table
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'appointments' 
ORDER BY ordinal_position;

-- 2. Check actual appointment data
SELECT 
  id,
  patient_id,
  doctor_id,
  date,
  status,
  consultation_fee,
  symptom_category,
  severity,
  created_at
FROM appointments
LIMIT 5;

-- 3. Check if patients table exists and has data
SELECT 
  id,
  user_id,
  name,
  email,
  date_of_birth
FROM patients
LIMIT 5;

-- 4. Check if patient_id in appointments matches user_id in patients
SELECT 
  a.id as appointment_id,
  a.patient_id,
  a.consultation_fee,
  p.id as patient_table_id,
  p.user_id as patient_user_id,
  p.name as patient_name,
  p.email as patient_email,
  CASE 
    WHEN p.id IS NULL THEN '❌ No matching patient record'
    ELSE '✅ Patient found'
  END as status
FROM appointments a
LEFT JOIN patients p ON p.user_id = a.patient_id
LIMIT 10;

-- 5. Check auth.users for patient info
SELECT 
  id,
  email,
  raw_user_meta_data->>'full_name' as full_name,
  raw_user_meta_data->>'role' as role
FROM auth.users
WHERE raw_user_meta_data->>'role' = 'patient'
LIMIT 5;

-- 6. Find appointments with missing patient records
SELECT 
  a.patient_id,
  COUNT(*) as appointment_count,
  'Missing in patients table' as issue
FROM appointments a
LEFT JOIN patients p ON p.user_id = a.patient_id
WHERE p.id IS NULL
GROUP BY a.patient_id;
