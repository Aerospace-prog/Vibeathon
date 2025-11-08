"""
Create medical_images table using Supabase Python client
Run this script to set up the database table
"""

import os
from supabase import create_client, Client
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY")

if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
    print("❌ Error: Missing Supabase credentials")
    exit(1)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

print("=" * 70)
print("🚀 Creating medical_images table...")
print("=" * 70)
print()

# SQL to create the table
create_table_sql = """
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
"""

try:
    # Try to execute SQL using PostgREST
    print("📝 Attempting to create table...")
    
    # Method 1: Try using query
    response = supabase.postgrest.rpc('exec', {'sql': create_table_sql}).execute()
    print("✅ Table created successfully!")
    
except Exception as e:
    print(f"⚠️  Method 1 failed: {str(e)}")
    print()
    print("=" * 70)
    print("📋 MANUAL SETUP REQUIRED")
    print("=" * 70)
    print()
    print("Please follow these steps:")
    print()
    print("1. Go to: https://supabase.com/dashboard")
    print("2. Select your project")
    print("3. Click 'SQL Editor' in the left sidebar")
    print("4. Click 'New Query'")
    print("5. Copy and paste this SQL:")
    print()
    print("-" * 70)
    print(create_table_sql)
    print("-" * 70)
    print()
    print("6. Click 'Run' (or press Ctrl+Enter)")
    print()
    print("You should see: 'Success. No rows returned'")
    print()
    print("=" * 70)

print()
print("📦 Creating storage bucket...")
try:
    # Check if bucket exists
    buckets = supabase.storage.list_buckets()
    bucket_names = [b.name if hasattr(b, 'name') else b.get('name', '') for b in buckets]
    
    if 'medical-images' in bucket_names:
        print("✅ Storage bucket 'medical-images' already exists!")
    else:
        # Create bucket
        result = supabase.storage.create_bucket('medical-images', {'public': False})
        print("✅ Storage bucket 'medical-images' created!")
except Exception as e:
    print(f"⚠️  Storage bucket creation: {str(e)}")
    print("   You may need to create it manually in Supabase Dashboard")
    print("   Go to: Storage → Create bucket → Name: 'medical-images' → Public: OFF")

print()
print("=" * 70)
print("✅ Setup process complete!")
print("=" * 70)
print()
print("Next steps:")
print("1. If you see 'MANUAL SETUP REQUIRED' above, follow those instructions")
print("2. Restart your backend server")
print("3. Try uploading an image again")
print()
