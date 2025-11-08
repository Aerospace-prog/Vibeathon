-- Create health_tips table for Daily Wellness Tips feature
CREATE TABLE IF NOT EXISTS health_tips (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    category TEXT NOT NULL CHECK (category IN ('nutrition', 'exercise', 'mental_health')),
    tip_text TEXT NOT NULL,
    generated_date DATE NOT NULL DEFAULT CURRENT_DATE,
    is_saved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_health_tips_user_date ON health_tips(user_id, generated_date);
CREATE INDEX IF NOT EXISTS idx_health_tips_category ON health_tips(category);

-- Enable Row Level Security
ALTER TABLE health_tips ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own health tips" ON health_tips;
DROP POLICY IF EXISTS "Users can insert own health tips" ON health_tips;
DROP POLICY IF EXISTS "Users can update own health tips" ON health_tips;

-- RLS Policy: Users can only see their own tips
CREATE POLICY "Users can view own health tips"
    ON health_tips FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own health tips"
    ON health_tips FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own health tips"
    ON health_tips FOR UPDATE
    USING (auth.uid() = user_id);
