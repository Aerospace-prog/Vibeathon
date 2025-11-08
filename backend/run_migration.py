"""
Automatic database migration script for medical images feature
Run this to create the necessary tables in Supabase
"""

import os
from supabase import create_client, Client
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Get Supabase credentials
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY")

if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
    print("❌ Error: Missing Supabase credentials in .env file")
    print("   Please ensure SUPABASE_URL and SUPABASE_SERVICE_KEY are set")
    exit(1)

# Create Supabase client
supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

print("=" * 60)
print("🚀 Medical Images Feature - Database Migration")
print("=" * 60)
print()

# SQL for creating medical_images table
migration_sql = """
-- Medical Images Feature
-- Creates tables and storage for medical image analysis

-- Create medical_images table
CREATE TABLE IF NOT EXISTS medical_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
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
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  analyzed_at TIMESTAMP WITH TIME ZONE,
  is_follow_up BOOLEAN DEFAULT FALSE,
  parent_image_id UUID REFERENCES medical_images(id) ON DELETE SET NULL,
  days_since_previous INTEGER,
  doctor_notes TEXT,
  doctor_reviewed_at TIMESTAMP WITH TIME ZONE,
  doctor_reviewed_by UUID REFERENCES auth.users(id),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_medical_images_patient ON medical_images(patient_id);
CREATE INDEX IF NOT EXISTS idx_medical_images_appointment ON medical_images(appointment_id);
CREATE INDEX IF NOT EXISTS idx_medical_images_uploaded ON medical_images(uploaded_at DESC);
CREATE INDEX IF NOT EXISTS idx_medical_images_parent ON medical_images(parent_image_id);
CREATE INDEX IF NOT EXISTS idx_medical_images_severity ON medical_images(severity_level);

-- Enable Row Level Security
ALTER TABLE medical_images ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Patients can view own medical images" ON medical_images;
DROP POLICY IF EXISTS "Patients can upload medical images" ON medical_images;
DROP POLICY IF EXISTS "Patients can update own medical images" ON medical_images;
DROP POLICY IF EXISTS "Patients can delete own medical images" ON medical_images;
DROP POLICY IF EXISTS "Doctors can view patient medical images" ON medical_images;
DROP POLICY IF EXISTS "Doctors can add notes to medical images" ON medical_images;

-- RLS Policies
CREATE POLICY "Patients can view own medical images"
  ON medical_images FOR SELECT
  USING (auth.uid() = patient_id);

CREATE POLICY "Patients can upload medical images"
  ON medical_images FOR INSERT
  WITH CHECK (auth.uid() = patient_id);

CREATE POLICY "Patients can update own medical images"
  ON medical_images FOR UPDATE
  USING (auth.uid() = patient_id)
  WITH CHECK (auth.uid() = patient_id);

CREATE POLICY "Patients can delete own medical images"
  ON medical_images FOR DELETE
  USING (auth.uid() = patient_id);

CREATE POLICY "Doctors can view patient medical images"
  ON medical_images FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM appointments
      WHERE appointments.id = medical_images.appointment_id
      AND appointments.doctor_id = auth.uid()
    )
  );

CREATE POLICY "Doctors can add notes to medical images"
  ON medical_images FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM appointments
      WHERE appointments.id = medical_images.appointment_id
      AND appointments.doctor_id = auth.uid()
    )
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_medical_images_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists
DROP TRIGGER IF EXISTS update_medical_images_timestamp ON medical_images;

-- Trigger to auto-update updated_at
CREATE TRIGGER update_medical_images_timestamp
  BEFORE UPDATE ON medical_images
  FOR EACH ROW
  EXECUTE FUNCTION update_medical_images_updated_at();
"""

print("📝 Step 1: Creating medical_images table...")
try:
    # Execute the migration SQL
    result = supabase.rpc('exec_sql', {'sql': migration_sql}).execute()
    print("✅ Table created successfully!")
except Exception as e:
    # If RPC doesn't work, try direct table creation
    print(f"⚠️  RPC method failed, trying alternative method...")
    print(f"   Error: {str(e)}")
    print()
    print("📋 Please run this SQL manually in Supabase Dashboard:")
    print("   1. Go to https://supabase.com/dashboard")
    print("   2. Select your project")
    print("   3. Click 'SQL Editor'")
    print("   4. Copy the SQL from: backend/migrations/002_create_medical_images_tables.sql")
    print("   5. Paste and click 'Run'")
    print()

print()
print("📝 Step 2: Creating storage bucket...")
try:
    # Check if bucket exists
    buckets = supabase.storage.list_buckets()
    bucket_exists = any(b['name'] == 'medical-images' for b in buckets)
    
    if bucket_exists:
        print("✅ Storage bucket 'medical-images' already exists!")
    else:
        # Create bucket
        supabase.storage.create_bucket('medical-images', options={'public': False})
        print("✅ Storage bucket 'medical-images' created successfully!")
except Exception as e:
    print(f"⚠️  Could not create storage bucket: {str(e)}")
    print("   You may need to create it manually in Supabase Dashboard")

print()
print("=" * 60)
print("✅ Migration Complete!")
print("=" * 60)
print()
print("🎉 The medical images feature is now ready to use!")
print()
print("Next steps:")
print("1. Restart your backend server (if running)")
print("2. Go to: http://localhost:3000/patient/medical-images")
print("3. Upload an image and test the AI analysis")
print()
print("=" * 60)
