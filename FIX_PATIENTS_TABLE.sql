-- Fix patients table schema
-- Run this in your Supabase SQL Editor to fix the missing columns

-- Add emotion_analysis_enabled column if it doesn't exist
ALTER TABLE patients 
ADD COLUMN IF NOT EXISTS emotion_analysis_enabled BOOLEAN DEFAULT TRUE;

-- Add preferred_language column if it doesn't exist  
ALTER TABLE patients 
ADD COLUMN IF NOT EXISTS preferred_language TEXT DEFAULT 'en';

-- Verify the columns exist
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'patients'
ORDER BY ordinal_position;
