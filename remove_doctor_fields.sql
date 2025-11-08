-- Remove phone and license_number from doctors table
ALTER TABLE public.doctors 
DROP COLUMN IF EXISTS phone;

ALTER TABLE public.doctors 
DROP COLUMN IF EXISTS license_number;

-- Verify columns were removed
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'doctors'
ORDER BY ordinal_position;
