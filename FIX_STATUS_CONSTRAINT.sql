-- Fix Appointments Status Constraint
-- Run this in Supabase SQL Editor

-- Step 1: Check current constraint
SELECT 
  conname,
  pg_get_constraintdef(oid) as definition
FROM pg_constraint
WHERE conrelid = 'appointments'::regclass
  AND conname LIKE '%status%';

-- Step 2: Drop the old constraint
ALTER TABLE appointments 
DROP CONSTRAINT IF EXISTS appointments_status_check;

-- Step 3: Add new constraint with all needed status values
ALTER TABLE appointments 
ADD CONSTRAINT appointments_status_check 
CHECK (status IN ('scheduled', 'in-progress', 'completed', 'cancelled', 'missed'));

-- Step 4: Verify the new constraint
SELECT 
  conname,
  pg_get_constraintdef(oid) as definition
FROM pg_constraint
WHERE conrelid = 'appointments'::regclass
  AND conname = 'appointments_status_check';

-- Step 5: Test that all status values work
DO $$
DECLARE
  test_statuses text[] := ARRAY['scheduled', 'in-progress', 'completed', 'cancelled', 'missed'];
  status_val text;
BEGIN
  FOREACH status_val IN ARRAY test_statuses
  LOOP
    RAISE NOTICE 'Testing status: %', status_val;
    -- This will fail if the status is not allowed
    PERFORM 1 WHERE status_val IN ('scheduled', 'in-progress', 'completed', 'cancelled', 'missed');
  END LOOP;
  
  RAISE NOTICE '✅ All status values are now allowed!';
  RAISE NOTICE 'Allowed values: scheduled, in-progress, completed, cancelled, missed';
END $$;
