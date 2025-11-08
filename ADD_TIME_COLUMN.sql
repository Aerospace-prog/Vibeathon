-- Add time column to appointments table if it doesn't exist
-- Run this in Supabase SQL Editor

-- Check if time column exists
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'appointments' 
  AND column_name = 'time';

-- Add time column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'appointments' 
      AND column_name = 'time'
  ) THEN
    ALTER TABLE appointments ADD COLUMN time TIME;
    RAISE NOTICE 'Added time column to appointments table';
  ELSE
    RAISE NOTICE 'Time column already exists';
  END IF;
END $$;

-- Verify the column was added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'appointments' 
ORDER BY ordinal_position;

-- Optional: Set default time for existing appointments
UPDATE appointments 
SET time = '10:00:00' 
WHERE time IS NULL;
