-- Add consultation_fee column to appointments table
ALTER TABLE public.appointments 
ADD COLUMN IF NOT EXISTS consultation_fee DECIMAL(10, 2);

-- Add comment
COMMENT ON COLUMN public.appointments.consultation_fee IS 'Consultation fee amount paid for this appointment';

-- Update existing appointments with default fee (optional)
-- UPDATE public.appointments 
-- SET consultation_fee = 500.00 
-- WHERE consultation_fee IS NULL;
