-- Add is_available field to doctors table
ALTER TABLE public.doctors 
ADD COLUMN IF NOT EXISTS is_available BOOLEAN DEFAULT true;

-- Add comment
COMMENT ON COLUMN public.doctors.is_available IS 'Whether the doctor is currently available for consultations';

-- Verify
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'doctors'
AND column_name = 'is_available';
