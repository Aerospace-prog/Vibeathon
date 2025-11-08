-- Medical Images Feature
-- Run this in Supabase SQL Editor

-- Create medical_images table
CREATE TABLE IF NOT EXISTS medical_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
  image_url TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  image_type VARCHAR(50) DEFAULT 'other', -- 'skin_condition', 'wound', 'rash', 'burn', 'other'
  body_part VARCHAR(100), -- 'arm', 'leg', 'face', 'chest', 'back', etc.
  patient_description TEXT, -- What patient says about the condition
  symptoms TEXT[], -- Array of symptoms
  ai_analysis JSONB, -- Store full AI response
  severity_level VARCHAR(20), -- 'mild', 'moderate', 'severe', 'unknown'
  detected_conditions TEXT[], -- Array of possible conditions
  recommendations TEXT[], -- Array of recommendations
  requires_immediate_attention BOOLEAN DEFAULT FALSE,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  analyzed_at TIMESTAMP WITH TIME ZONE,
  is_follow_up BOOLEAN DEFAULT FALSE,
  parent_image_id UUID REFERENCES medical_images(id) ON DELETE SET NULL, -- For tracking progress
  days_since_previous INTEGER, -- Days between follow-up images
  doctor_notes TEXT, -- Doctor can add notes after reviewing
  doctor_reviewed_at TIMESTAMP WITH TIME ZONE,
  doctor_reviewed_by UUID REFERENCES auth.users(id),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_medical_images_patient ON medical_images(patient_id);
CREATE INDEX idx_medical_images_appointment ON medical_images(appointment_id);
CREATE INDEX idx_medical_images_uploaded ON medical_images(uploaded_at DESC);
CREATE INDEX idx_medical_images_parent ON medical_images(parent_image_id);
CREATE INDEX idx_medical_images_severity ON medical_images(severity_level);

-- Enable Row Level Security
ALTER TABLE medical_images ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Patients can view their own images
CREATE POLICY "Patients can view own medical images"
  ON medical_images FOR SELECT
  USING (auth.uid() = patient_id);

-- Patients can insert their own images
CREATE POLICY "Patients can upload medical images"
  ON medical_images FOR INSERT
  WITH CHECK (auth.uid() = patient_id);

-- Patients can update their own images (description, etc.)
CREATE POLICY "Patients can update own medical images"
  ON medical_images FOR UPDATE
  USING (auth.uid() = patient_id)
  WITH CHECK (auth.uid() = patient_id);

-- Patients can delete their own images
CREATE POLICY "Patients can delete own medical images"
  ON medical_images FOR DELETE
  USING (auth.uid() = patient_id);

-- Doctors can view images from their appointments
CREATE POLICY "Doctors can view patient medical images"
  ON medical_images FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM appointments
      WHERE appointments.id = medical_images.appointment_id
      AND appointments.doctor_id = auth.uid()
    )
  );

-- Doctors can add notes to images
CREATE POLICY "Doctors can add notes to medical images"
  ON medical_images FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM appointments
      WHERE appointments.id = medical_images.appointment_id
      AND appointments.doctor_id = auth.uid()
    )
  );

-- Create storage bucket for medical images (if not exists)
INSERT INTO storage.buckets (id, name, public)
VALUES ('medical-images', 'medical-images', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for medical images bucket
CREATE POLICY "Patients can upload medical images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'medical-images' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Patients can view own medical images"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'medical-images' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Doctors can view patient medical images"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'medical-images'
  );

CREATE POLICY "Patients can delete own medical images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'medical-images' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_medical_images_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
CREATE TRIGGER update_medical_images_timestamp
  BEFORE UPDATE ON medical_images
  FOR EACH ROW
  EXECUTE FUNCTION update_medical_images_updated_at();

-- Comments for documentation
COMMENT ON TABLE medical_images IS 'Stores patient-uploaded medical images with AI analysis';
COMMENT ON COLUMN medical_images.ai_analysis IS 'Full JSON response from Gemini Vision API';
COMMENT ON COLUMN medical_images.parent_image_id IS 'Links follow-up images to original for progress tracking';
COMMENT ON COLUMN medical_images.requires_immediate_attention IS 'AI-detected red flags requiring urgent care';
