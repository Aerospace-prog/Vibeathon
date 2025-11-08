-- Add time column to appointments table to store the selected time slot
ALTER TABLE public.appointments 
ADD COLUMN IF NOT EXISTS time TIME;

-- Add comment
COMMENT ON COLUMN public.appointments.time IS 'Selected appointment time slot (e.g., 09:00, 14:30)';
