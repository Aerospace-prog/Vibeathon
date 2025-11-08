-- ============================================================================
-- QUICK SETUP: Doctor Availability System
-- Run this entire script in your Supabase SQL Editor
-- ============================================================================

-- Step 1: Ensure appointments table exists (if not already created)
CREATE TABLE IF NOT EXISTS appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  doctor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  symptom_category VARCHAR(100),
  severity INTEGER CHECK (severity BETWEEN 1 AND 5),
  date DATE NOT NULL,
  time TIME NOT NULL,
  status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in-progress', 'completed', 'cancelled', 'missed')),
  consultation_fee DECIMAL(10, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_doctor_slot UNIQUE(doctor_id, date, time)
);

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_appointments_patient ON appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_doctor ON appointments(doctor_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(date);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);

-- Enable RLS
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Step 2: Drop and recreate policies for proper access control
DROP POLICY IF EXISTS "Patients can view their own appointments" ON appointments;
DROP POLICY IF EXISTS "Doctors can view their appointments" ON appointments;
DROP POLICY IF EXISTS "Authenticated users can view appointment availability" ON appointments;
DROP POLICY IF EXISTS "Patients can create appointments" ON appointments;
DROP POLICY IF EXISTS "Patients can update their appointments" ON appointments;
DROP POLICY IF EXISTS "Doctors can update their appointments" ON appointments;

-- Patients can view their own appointments (full details)
CREATE POLICY "Patients can view their own appointments"
  ON appointments FOR SELECT
  USING (auth.uid() = patient_id);

-- Doctors can view their appointments (full details)
CREATE POLICY "Doctors can view their appointments"
  ON appointments FOR SELECT
  USING (auth.uid() = doctor_id);

-- Allow authenticated users to view appointment availability (for checking slots)
CREATE POLICY "Authenticated users can view appointment availability"
  ON appointments FOR SELECT
  TO authenticated
  USING (true);

-- Patients can create appointments
CREATE POLICY "Patients can create appointments"
  ON appointments FOR INSERT
  WITH CHECK (auth.uid() = patient_id);

-- Patients can update their appointments
CREATE POLICY "Patients can update their appointments"
  ON appointments FOR UPDATE
  USING (auth.uid() = patient_id);

-- Doctors can update their appointments
CREATE POLICY "Doctors can update their appointments"
  ON appointments FOR UPDATE
  USING (auth.uid() = doctor_id);

-- Step 3: Create availability function
CREATE OR REPLACE FUNCTION get_doctor_availability_today()
RETURNS TABLE (
  doctor_id UUID,
  booked_slots INTEGER,
  is_available BOOLEAN
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $
BEGIN
  RETURN QUERY
  SELECT 
    d.id as doctor_id,
    COALESCE(COUNT(a.id)::INTEGER, 0) as booked_slots,
    CASE 
      WHEN COALESCE(COUNT(a.id), 0) < 7 THEN true 
      ELSE false 
    END as is_available
  FROM doctors d
  LEFT JOIN appointments a ON a.doctor_id = d.id 
    AND a.date = CURRENT_DATE 
    AND a.status IN ('scheduled', 'in-progress')
  GROUP BY d.id;
END;
$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_doctor_availability_today() TO authenticated;

-- Step 4: Create availability view
DROP VIEW IF EXISTS doctor_availability_view;
CREATE VIEW doctor_availability_view AS
SELECT * FROM get_doctor_availability_today();

-- Grant select on the view
GRANT SELECT ON doctor_availability_view TO authenticated;

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- Check if everything is set up correctly
DO $
BEGIN
  RAISE NOTICE '✅ Setup complete!';
  RAISE NOTICE '';
  RAISE NOTICE 'Verify the setup:';
  RAISE NOTICE '1. Check if view exists: SELECT * FROM doctor_availability_view;';
  RAISE NOTICE '2. Check if function works: SELECT * FROM get_doctor_availability_today();';
  RAISE NOTICE '3. Test in your app by navigating to /patient/book-appointment';
  RAISE NOTICE '';
  RAISE NOTICE 'The availability system is now active!';
END $;

-- Test query (optional - uncomment to run)
-- SELECT * FROM doctor_availability_view;
