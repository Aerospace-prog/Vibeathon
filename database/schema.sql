-- Arogya-AI Telehealth Platform Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Patients table
CREATE TABLE IF NOT EXISTS public.patients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    date_of_birth DATE NOT NULL,
    preferred_language TEXT NOT NULL DEFAULT 'en',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Consultations table
CREATE TABLE IF NOT EXISTS public.consultations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    doctor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    consultation_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    full_transcript TEXT DEFAULT '',
    raw_soap_note JSONB,
    de_stigma_suggestions JSONB,
    approved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Community Lexicon table
CREATE TABLE IF NOT EXISTS public.community_lexicon (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    term_english TEXT NOT NULL,
    term_regional TEXT NOT NULL,
    language TEXT NOT NULL,
    upvotes INTEGER DEFAULT 0,
    downvotes INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(term_english, term_regional, language)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_consultations_patient_id ON public.consultations(patient_id);
CREATE INDEX IF NOT EXISTS idx_consultations_doctor_id ON public.consultations(doctor_id);
CREATE INDEX IF NOT EXISTS idx_consultations_date ON public.consultations(consultation_date DESC);
CREATE INDEX IF NOT EXISTS idx_community_lexicon_language ON public.community_lexicon(language);

-- Enable Row Level Security (RLS)
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_lexicon ENABLE ROW LEVEL SECURITY;

-- RLS Policies for patients
-- Doctors can view all patients (simplified for demo)
CREATE POLICY "Authenticated users can view patients"
    ON public.patients FOR SELECT
    USING (auth.role() = 'authenticated');

-- Doctors can insert new patients
CREATE POLICY "Authenticated users can insert patients"
    ON public.patients FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

-- Doctors can update patients
CREATE POLICY "Authenticated users can update patients"
    ON public.patients FOR UPDATE
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

-- RLS Policies for consultations
-- Doctors can view their own consultations
CREATE POLICY "Doctors can view their consultations"
    ON public.consultations FOR SELECT
    USING (doctor_id = auth.uid());

-- Doctors can insert their own consultations
CREATE POLICY "Doctors can insert consultations"
    ON public.consultations FOR INSERT
    WITH CHECK (doctor_id = auth.uid());

-- Doctors can update their own consultations
CREATE POLICY "Doctors can update their consultations"
    ON public.consultations FOR UPDATE
    USING (doctor_id = auth.uid())
    WITH CHECK (doctor_id = auth.uid());

-- RLS Policies for community_lexicon
-- Anyone authenticated can view lexicon
CREATE POLICY "Authenticated users can view lexicon"
    ON public.community_lexicon FOR SELECT
    USING (auth.role() = 'authenticated');

-- Anyone authenticated can insert lexicon terms
CREATE POLICY "Authenticated users can insert lexicon"
    ON public.community_lexicon FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

-- Anyone authenticated can update lexicon (for voting)
CREATE POLICY "Authenticated users can update lexicon"
    ON public.community_lexicon FOR UPDATE
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
CREATE TRIGGER update_patients_updated_at
    BEFORE UPDATE ON public.patients
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_consultations_updated_at
    BEFORE UPDATE ON public.consultations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_community_lexicon_updated_at
    BEFORE UPDATE ON public.community_lexicon
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert some sample data (optional - for testing)
-- Uncomment if you want sample data

-- INSERT INTO public.patients (name, date_of_birth, preferred_language) VALUES
-- ('Demo Patient', '1990-01-01', 'Hindi'),
-- ('Test Patient', '1985-05-15', 'English');

-- INSERT INTO public.community_lexicon (term_english, term_regional, language) VALUES
-- ('fever', 'बुखार', 'hi'),
-- ('headache', 'सिरदर्द', 'hi'),
-- ('cough', 'खांसी', 'hi'),
-- ('pain', 'दर्द', 'hi');
