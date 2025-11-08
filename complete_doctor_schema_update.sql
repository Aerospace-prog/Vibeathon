-- Complete doctor schema update
-- Run this in Supabase SQL Editor

-- Step 1: Remove phone and license_number columns
ALTER TABLE public.doctors 
DROP COLUMN IF EXISTS phone;

ALTER TABLE public.doctors 
DROP COLUMN IF EXISTS license_number;

-- Step 2: Ensure all required columns exist
ALTER TABLE public.doctors 
ADD COLUMN IF NOT EXISTS specialization TEXT;

ALTER TABLE public.doctors 
ADD COLUMN IF NOT EXISTS years_of_experience INTEGER DEFAULT 0;

ALTER TABLE public.doctors 
ADD COLUMN IF NOT EXISTS consultation_fee DECIMAL(10, 2) DEFAULT 0.00;

ALTER TABLE public.doctors 
ADD COLUMN IF NOT EXISTS is_available BOOLEAN DEFAULT true;

-- Step 3: Update trigger to include specialization
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.raw_user_meta_data->>'role' = 'doctor' THEN
        INSERT INTO public.doctors (
            id,
            email,
            full_name,
            specialization,
            years_of_experience,
            consultation_fee,
            is_available
        )
        VALUES (
            NEW.id,
            NEW.email,
            COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
            NEW.raw_user_meta_data->>'specialization',
            COALESCE((NEW.raw_user_meta_data->>'years_of_experience')::INTEGER, 0),
            COALESCE((NEW.raw_user_meta_data->>'consultation_fee')::DECIMAL, 0.00),
            true
        );
    ELSIF NEW.raw_user_meta_data->>'role' = 'patient' THEN
        INSERT INTO public.patients (user_id, email, name, date_of_birth, preferred_language)
        VALUES (
            NEW.id,
            NEW.email,
            COALESCE(NEW.raw_user_meta_data->>'full_name', 'Patient'),
            COALESCE((NEW.raw_user_meta_data->>'date_of_birth')::DATE, CURRENT_DATE - INTERVAL '30 years'),
            COALESCE(NEW.raw_user_meta_data->>'preferred_language', 'en')
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 4: Verify the schema
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'doctors'
ORDER BY ordinal_position;
