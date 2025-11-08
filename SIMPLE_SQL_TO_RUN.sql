-- Copy this ENTIRE file and paste into Supabase SQL Editor
-- Then click "Run"

CREATE TABLE IF NOT EXISTS public.medical_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL,
    appointment_id UUID,
    image_url TEXT NOT NULL,
    storage_path TEXT NOT NULL,
    image_type VARCHAR(50) DEFAULT 'other',
    body_part VARCHAR(100),
    patient_description TEXT,
    symptoms TEXT[],
    ai_analysis JSONB,
    severity_level VARCHAR(20),
    detected_conditions TEXT[],
    recommendations TEXT[],
    requires_immediate_attention BOOLEAN DEFAULT FALSE,
    uploaded_at TIMESTAMPTZ DEFAULT NOW(),
    analyzed_at TIMESTAMPTZ,
    is_follow_up BOOLEAN DEFAULT FALSE,
    parent_image_id UUID,
    days_since_previous INTEGER,
    doctor_notes TEXT,
    doctor_reviewed_at TIMESTAMPTZ,
    doctor_reviewed_by UUID,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_medical_images_patient ON public.medical_images(patient_id);
CREATE INDEX IF NOT EXISTS idx_medical_images_uploaded ON public.medical_images(uploaded_at DESC);

ALTER TABLE public.medical_images ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own images" ON public.medical_images;
CREATE POLICY "Users can view own images" ON public.medical_images
    FOR SELECT USING (auth.uid() = patient_id);

DROP POLICY IF EXISTS "Users can insert own images" ON public.medical_images;
CREATE POLICY "Users can insert own images" ON public.medical_images
    FOR INSERT WITH CHECK (auth.uid() = patient_id);

DROP POLICY IF EXISTS "Users can update own images" ON public.medical_images;
CREATE POLICY "Users can update own images" ON public.medical_images
    FOR UPDATE USING (auth.uid() = patient_id);

DROP POLICY IF EXISTS "Users can delete own images" ON public.medical_images;
CREATE POLICY "Users can delete own images" ON public.medical_images
    FOR DELETE USING (auth.uid() = patient_id);
