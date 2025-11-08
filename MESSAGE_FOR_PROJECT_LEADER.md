# Message for Project Leader - Database Setup Needed

Hi! We've implemented a new **AI Medical Image Analysis** feature that needs a database table created in Supabase.

## What's Needed:
A new table called `medical_images` needs to be created in our Supabase database.

## How to Do It (Takes 30 seconds):

1. Go to: https://supabase.com/dashboard
2. Select our project
3. Click **"SQL Editor"** in the left sidebar
4. Click **"New Query"**
5. Copy the SQL from the file: `Vibeathon/SIMPLE_SQL_TO_RUN.sql`
6. Paste it into the SQL Editor
7. Click **"Run"** (or press Ctrl+Enter)

You should see: "Success. No rows returned"

## What This Does:
- Creates the `medical_images` table for storing patient-uploaded medical images
- Sets up proper security policies (patients can only see their own images)
- Creates indexes for performance
- Enables the AI image analysis feature

## Why We Need This:
The feature is already built and integrated into the patient dashboard, but it can't work without this database table. Once you run this SQL, the feature will be fully functional!

## File Location:
The SQL file is at: `Vibeathon/SIMPLE_SQL_TO_RUN.sql`

Or you can copy it from here:

```sql
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
```

Thanks! Once this is done, the AI image analysis feature will be ready to demo! 🚀

---

**Feature Preview:**
- Patients can upload photos of skin conditions, rashes, wounds
- AI (Google Gemini Vision) analyzes the image
- Provides preliminary assessment, severity level, and recommendations
- All with proper disclaimers that it's not a medical diagnosis
- Looks great on the dashboard with a purple gradient card!
