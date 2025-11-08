-- Add missing columns to appointments table
ALTER TABLE public.appointments 
ADD COLUMN IF NOT EXISTS patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE;

ALTER TABLE public.appointments 
ADD COLUMN IF NOT EXISTS doctor_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Make them NOT NULL after adding
ALTER TABLE public.appointments 
ALTER COLUMN patient_id SET NOT NULL;

ALTER TABLE public.appointments 
ALTER COLUMN doctor_id SET NOT NULL;

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_appointments_patient ON public.appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_doctor ON public.appointments(doctor_id);

-- Verify the table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'appointments'
ORDER BY ordinal_position;
