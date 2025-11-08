-- Lab Reports Table Schema
-- Run this in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS public.lab_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_type TEXT NOT NULL CHECK (file_type IN ('pdf', 'image')),
    extracted_text TEXT,
    analysis_result JSONB,
    status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('processing', 'completed', 'failed')),
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_lab_reports_patient_id ON public.lab_reports(patient_id);
CREATE INDEX IF NOT EXISTS idx_lab_reports_uploaded_at ON public.lab_reports(uploaded_at DESC);

-- Enable Row Level Security
ALTER TABLE public.lab_reports ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Patients can view their own lab reports
CREATE POLICY "Patients can view their own lab reports"
ON public.lab_reports
FOR SELECT
USING (auth.uid() = patient_id);

-- Patients can insert their own lab reports
CREATE POLICY "Patients can insert their own lab reports"
ON public.lab_reports
FOR INSERT
WITH CHECK (auth.uid() = patient_id);

-- Patients can delete their own lab reports
CREATE POLICY "Patients can delete their own lab reports"
ON public.lab_reports
FOR DELETE
USING (auth.uid() = patient_id);

-- Doctors can view lab reports of their patients (through consultations)
CREATE POLICY "Doctors can view patient lab reports"
ON public.lab_reports
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.consultations
        WHERE consultations.patient_id = lab_reports.patient_id
        AND consultations.doctor_id = auth.uid()
    )
);

-- Add comment
COMMENT ON TABLE public.lab_reports IS 'Stores uploaded lab reports and their AI analysis results';
