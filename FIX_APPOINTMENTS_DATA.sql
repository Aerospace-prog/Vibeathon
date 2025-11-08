-- Fix Appointments Table - Add Missing Columns and Data
-- Run this in Supabase SQL Editor

-- 1. Add time column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'appointments' AND column_name = 'time'
  ) THEN
    ALTER TABLE appointments ADD COLUMN time TIME;
    RAISE NOTICE '✅ Added time column';
  ELSE
    RAISE NOTICE 'ℹ️ Time column already exists';
  END IF;
END $$;

-- 2. Add consultation_fee column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'appointments' AND column_name = 'consultation_fee'
  ) THEN
    ALTER TABLE appointments ADD COLUMN consultation_fee DECIMAL(10, 2) DEFAULT 500.00;
    RAISE NOTICE '✅ Added consultation_fee column';
  ELSE
    RAISE NOTICE 'ℹ️ Consultation_fee column already exists';
  END IF;
END $$;

-- 3. Update existing appointments with default values
UPDATE appointments 
SET time = '10:00:00' 
WHERE time IS NULL;

UPDATE appointments 
SET consultation_fee = 500.00 
WHERE consultation_fee IS NULL;

-- 4. Check current appointments structure
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'appointments' 
ORDER BY ordinal_position;

-- 5. View current appointments
SELECT 
  id,
  patient_id,
  doctor_id,
  date,
  time,
  status,
  consultation_fee,
  created_at
FROM appointments
ORDER BY date DESC, time DESC
LIMIT 5;

-- 6. Check if patients table exists and has data
SELECT COUNT(*) as patient_count FROM patients;

-- 7. If patients table is empty, you might need to create patient records
-- This query shows appointments without matching patients
SELECT DISTINCT 
  a.patient_id,
  'Missing patient record' as issue
FROM appointments a
LEFT JOIN patients p ON p.user_id = a.patient_id
WHERE p.id IS NULL;

-- 8. Create missing patient records (if needed)
-- Uncomment and run if you have appointments without patient records
/*
INSERT INTO patients (user_id, name, email, date_of_birth, preferred_language)
SELECT DISTINCT 
  a.patient_id,
  'Patient ' || SUBSTRING(a.patient_id::text, 1, 8),
  'patient@example.com',
  CURRENT_DATE - INTERVAL '30 years',
  'en'
FROM appointments a
LEFT JOIN patients p ON p.user_id = a.patient_id
WHERE p.id IS NULL
ON CONFLICT (user_id) DO NOTHING;
*/

-- 9. Verify everything is set up
SELECT 
  'Appointments' as table_name,
  COUNT(*) as row_count
FROM appointments
UNION ALL
SELECT 
  'Patients' as table_name,
  COUNT(*) as row_count
FROM patients;

RAISE NOTICE '✅ Setup complete! Refresh your dashboard.';
