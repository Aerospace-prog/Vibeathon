-- Update trigger to include specialization from signup
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
            consultation_fee
        )
        VALUES (
            NEW.id,
            NEW.email,
            COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
            NEW.raw_user_meta_data->>'specialization',
            COALESCE((NEW.raw_user_meta_data->>'years_of_experience')::INTEGER, 0),
            COALESCE((NEW.raw_user_meta_data->>'consultation_fee')::DECIMAL, 0.00)
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
