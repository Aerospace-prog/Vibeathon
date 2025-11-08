-- Add missing columns to doctors table
ALTER TABLE public.doctors 
ADD COLUMN IF NOT EXISTS years_of_experience INTEGER DEFAULT 0;

ALTER TABLE public.doctors 
ADD COLUMN IF NOT EXISTS consultation_fee DECIMAL(10, 2) DEFAULT 0.00;

-- Verify columns were added
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'doctors'
AND column_name IN ('years_of_experience', 'consultation_fee');
