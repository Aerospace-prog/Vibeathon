-- Fix Appointments Update RLS Policy
-- Run this in Supabase SQL Editor

-- Check current UPDATE policies
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'appointments' 
  AND cmd = 'UPDATE';

-- Drop existing update policies
DROP POLICY IF EXISTS "Patients can update their appointments" ON appointments;
DROP POLICY IF EXISTS "Doctors can update their appointments" ON appointments;

-- Create new update policies that allow doctors to update appointment status
CREATE POLICY "Doctors can update their appointments"
  ON appointments FOR UPDATE
  TO authenticated
  USING (doctor_id = auth.uid())
  WITH CHECK (doctor_id = auth.uid());

CREATE POLICY "Patients can update their appointments"
  ON appointments FOR UPDATE
  TO authenticated
  USING (patient_id = auth.uid())
  WITH CHECK (patient_id = auth.uid());

-- Verify policies were created
SELECT 
  policyname, 
  cmd,
  'Created' as status
FROM pg_policies 
WHERE tablename = 'appointments' 
  AND cmd = 'UPDATE';

-- Test update (replace with your actual IDs)
-- UPDATE appointments 
-- SET status = 'in-progress' 
-- WHERE id = 'appointment-id-here' 
--   AND doctor_id = auth.uid();

DO $$
BEGIN
  RAISE NOTICE '✅ Update policies fixed!';
  RAISE NOTICE 'Doctors can now update their appointments.';
END $$;
