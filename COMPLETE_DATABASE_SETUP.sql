-- Complete Database Setup for Arogya-AI
-- Run this FIRST in your Supabase SQL Editor to create all tables

-- ============================================================================
-- STEP 1: Enable Extensions
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For text search

-- ============================================================================
-- STEP 2: Create Patients Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.patients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    email TEXT,
    name TEXT NOT NULL,
    date_of_birth DATE NOT NULL,
    preferred_language TEXT DEFAULT 'en',
    emotion_analysis_enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- STEP 3: Create Doctors Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.doctors (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    specialization TEXT,
    license_number TEXT,
    phone TEXT,
    years_of_experience INTEGER DEFAULT 0,
    consultation_fee DECIMAL(10, 2) DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- STEP 4: Create Consultations Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.consultations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    doctor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    consultation_date TIMESTAMPTZ DEFAULT NOW(),
    full_transcript TEXT DEFAULT '',
    raw_soap_note JSONB,
    de_stigma_suggestions JSONB,
    approved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- STEP 5: Create Community Lexicon Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.community_lexicon (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    term_english TEXT NOT NULL,
    term_regional TEXT NOT NULL,
    language TEXT NOT NULL,
    upvotes INTEGER DEFAULT 0,
    downvotes INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(term_english, term_regional, language)
);

-- ============================================================================
-- STEP 6: Create Emotion Logs Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.emotion_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    consultation_id UUID REFERENCES public.consultations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    emotion_type TEXT NOT NULL CHECK (emotion_type IN ('calm', 'anxious', 'distressed', 'pain', 'sad', 'neutral')),
    confidence_score FLOAT NOT NULL CHECK (confidence_score BETWEEN 0 AND 1),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- STEP 7: Create Alerts Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    consultation_id UUID NOT NULL REFERENCES public.consultations(id) ON DELETE CASCADE,
    symptom_text TEXT NOT NULL,
    symptom_type TEXT NOT NULL,
    severity_score INTEGER NOT NULL CHECK (severity_score BETWEEN 1 AND 5),
    acknowledged BOOLEAN DEFAULT FALSE,
    acknowledged_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- STEP 8: Create Indexes for Performance
-- ============================================================================

-- Patients indexes
CREATE INDEX IF NOT EXISTS idx_patients_user_id ON public.patients(user_id);
CREATE INDEX IF NOT EXISTS idx_patients_email ON public.patients(email);

-- Doctors indexes
CREATE INDEX IF NOT EXISTS idx_doctors_email ON public.doctors(email);

-- Consultations indexes
CREATE INDEX IF NOT EXISTS idx_consultations_patient_id ON public.consultations(patient_id);
CREATE INDEX IF NOT EXISTS idx_consultations_doctor_id ON public.consultations(doctor_id);
CREATE INDEX IF NOT EXISTS idx_consultations_date ON public.consultations(consultation_date DESC);

-- Emotion logs indexes
CREATE INDEX IF NOT EXISTS idx_emotion_logs_consultation ON public.emotion_logs(consultation_id);
CREATE INDEX IF NOT EXISTS idx_emotion_logs_user ON public.emotion_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_emotion_logs_created ON public.emotion_logs(created_at DESC);

-- Alerts indexes
CREATE INDEX IF NOT EXISTS idx_alerts_consultation ON public.alerts(consultation_id);
CREATE INDEX IF NOT EXISTS idx_alerts_severity ON public.alerts(severity_score DESC);

-- Community lexicon indexes
CREATE INDEX IF NOT EXISTS idx_community_lexicon_language ON public.community_lexicon(language);

-- ============================================================================
-- STEP 9: Create Views
-- ============================================================================

-- Emotion statistics view
CREATE OR REPLACE VIEW emotion_stats AS
SELECT 
    user_id,
    emotion_type,
    COUNT(*) as detection_count,
    AVG(confidence_score) as avg_confidence,
    MAX(created_at) as last_detected,
    MIN(created_at) as first_detected
FROM emotion_logs
GROUP BY user_id, emotion_type;

-- ============================================================================
-- STEP 10: Create Updated At Trigger Function
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- STEP 11: Add Updated At Triggers
-- ============================================================================

DROP TRIGGER IF EXISTS update_patients_updated_at ON public.patients;
CREATE TRIGGER update_patients_updated_at
    BEFORE UPDATE ON public.patients
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_doctors_updated_at ON public.doctors;
CREATE TRIGGER update_doctors_updated_at
    BEFORE UPDATE ON public.doctors
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_consultations_updated_at ON public.consultations;
CREATE TRIGGER update_consultations_updated_at
    BEFORE UPDATE ON public.consultations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_community_lexicon_updated_at ON public.community_lexicon;
CREATE TRIGGER update_community_lexicon_updated_at
    BEFORE UPDATE ON public.community_lexicon
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- STEP 12: Create User Profile Trigger Function
-- ============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Get the role from user metadata
    IF NEW.raw_user_meta_data->>'role' = 'doctor' THEN
        -- Create doctor profile with experience and fee
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
        -- Create patient profile
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

-- ============================================================================
-- STEP 13: Create User Profile Trigger
-- ============================================================================

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- STEP 14: Enable Row Level Security
-- ============================================================================

ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_lexicon ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emotion_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- STEP 15: Create RLS Policies for Patients
-- ============================================================================

DROP POLICY IF EXISTS "Patients can view own profile" ON public.patients;
CREATE POLICY "Patients can view own profile"
ON public.patients FOR SELECT
USING (auth.uid() = user_id OR auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Doctors can insert patients" ON public.patients;
CREATE POLICY "Doctors can insert patients"
ON public.patients FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can update patients" ON public.patients;
CREATE POLICY "Users can update patients"
ON public.patients FOR UPDATE
USING (auth.uid() = user_id OR auth.role() = 'authenticated')
WITH CHECK (auth.uid() = user_id OR auth.role() = 'authenticated');

-- ============================================================================
-- STEP 16: Create RLS Policies for Doctors
-- ============================================================================

DROP POLICY IF EXISTS "Doctors can view own profile" ON public.doctors;
CREATE POLICY "Doctors can view own profile"
ON public.doctors FOR SELECT
USING (auth.uid() = id);

DROP POLICY IF EXISTS "Authenticated users can view doctors" ON public.doctors;
CREATE POLICY "Authenticated users can view doctors"
ON public.doctors FOR SELECT
USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Doctors can update own profile" ON public.doctors;
CREATE POLICY "Doctors can update own profile"
ON public.doctors FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- ============================================================================
-- STEP 17: Create RLS Policies for Consultations
-- ============================================================================

DROP POLICY IF EXISTS "Doctors can view their consultations" ON public.consultations;
CREATE POLICY "Doctors can view their consultations"
ON public.consultations FOR SELECT
USING (doctor_id = auth.uid());

DROP POLICY IF EXISTS "Doctors can insert consultations" ON public.consultations;
CREATE POLICY "Doctors can insert consultations"
ON public.consultations FOR INSERT
WITH CHECK (doctor_id = auth.uid());

DROP POLICY IF EXISTS "Doctors can update their consultations" ON public.consultations;
CREATE POLICY "Doctors can update their consultations"
ON public.consultations FOR UPDATE
USING (doctor_id = auth.uid())
WITH CHECK (doctor_id = auth.uid());

-- ============================================================================
-- STEP 18: Create RLS Policies for Emotion Logs
-- ============================================================================

DROP POLICY IF EXISTS "Users can view own emotion logs" ON public.emotion_logs;
CREATE POLICY "Users can view own emotion logs"
ON public.emotion_logs FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own emotion logs" ON public.emotion_logs;
CREATE POLICY "Users can insert own emotion logs"
ON public.emotion_logs FOR INSERT
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Doctors can view consultation emotion logs" ON public.emotion_logs;
CREATE POLICY "Doctors can view consultation emotion logs"
ON public.emotion_logs FOR SELECT
USING (
    consultation_id IN (
        SELECT id FROM consultations WHERE doctor_id = auth.uid()
    )
);

-- ============================================================================
-- STEP 19: Create RLS Policies for Alerts
-- ============================================================================

DROP POLICY IF EXISTS "Doctors can view consultation alerts" ON public.alerts;
CREATE POLICY "Doctors can view consultation alerts"
ON public.alerts FOR SELECT
USING (
    consultation_id IN (
        SELECT id FROM consultations WHERE doctor_id = auth.uid()
    )
);

DROP POLICY IF EXISTS "Doctors can insert alerts" ON public.alerts;
CREATE POLICY "Doctors can insert alerts"
ON public.alerts FOR INSERT
WITH CHECK (
    consultation_id IN (
        SELECT id FROM consultations WHERE doctor_id = auth.uid()
    )
);

DROP POLICY IF EXISTS "Doctors can update alerts" ON public.alerts;
CREATE POLICY "Doctors can update alerts"
ON public.alerts FOR UPDATE
USING (
    consultation_id IN (
        SELECT id FROM consultations WHERE doctor_id = auth.uid()
    )
);

-- ============================================================================
-- STEP 20: Create RLS Policies for Community Lexicon
-- ============================================================================

DROP POLICY IF EXISTS "Authenticated users can view lexicon" ON public.community_lexicon;
CREATE POLICY "Authenticated users can view lexicon"
ON public.community_lexicon FOR SELECT
USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can insert lexicon" ON public.community_lexicon;
CREATE POLICY "Authenticated users can insert lexicon"
ON public.community_lexicon FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can update lexicon" ON public.community_lexicon;
CREATE POLICY "Authenticated users can update lexicon"
ON public.community_lexicon FOR UPDATE
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- ============================================================================
-- STEP 21: Insert Sample Data (Optional)
-- ============================================================================

-- Uncomment to add sample lexicon terms
/*
INSERT INTO public.community_lexicon (term_english, term_regional, language) VALUES
('fever', 'बुखार', 'hi'),
('headache', 'सिरदर्द', 'hi'),
('cough', 'खांसी', 'hi'),
('pain', 'दर्द', 'hi'),
('stomach ache', 'पेट दर्द', 'hi'),
('cold', 'सर्दी', 'hi'),
('weakness', 'कमजोरी', 'hi')
ON CONFLICT DO NOTHING;
*/

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- Check all tables were created
SELECT 
    table_name,
    '✅ Created' as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('patients', 'doctors', 'consultations', 'community_lexicon', 'emotion_logs', 'alerts')
ORDER BY table_name;

-- Check trigger was created
SELECT 
    trigger_name,
    event_object_table,
    '✅ Created' as status
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ Database setup complete!';
    RAISE NOTICE 'Tables created: patients, doctors, consultations, community_lexicon, emotion_logs, alerts';
    RAISE NOTICE 'Triggers created: User profile auto-creation';
    RAISE NOTICE 'RLS policies: Enabled and configured';
    RAISE NOTICE '';
    RAISE NOTICE 'Next steps:';
    RAISE NOTICE '1. Sign up as a doctor or patient';
    RAISE NOTICE '2. Profile will be created automatically';
    RAISE NOTICE '3. Start using the application!';
END $$;

