-- Check what status values are allowed
-- Run this in Supabase SQL Editor

-- Check the constraint definition
SELECT 
  conname as constraint_name,
  pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint
WHERE conrelid = 'appointments'::regclass
  AND conname LIKE '%status%';

-- Check current status values in use
SELECT DISTINCT status, COUNT(*) as count
FROM appointments
GROUP BY status
ORDER BY count DESC;

-- Check the table definition
SELECT 
  column_name,
  data_type,
  character_maximum_length,
  column_default,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'appointments'
  AND column_name = 'status';
