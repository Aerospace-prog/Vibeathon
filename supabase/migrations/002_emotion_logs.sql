-- Emotion logs table for storing real-time emotion detections
CREATE TABLE emotion_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    consultation_id UUID REFERENCES consultations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    emotion_type TEXT NOT NULL CHECK (emotion_type IN ('calm', 'anxious', 'distressed', 'pain', 'sad', 'neutral')),
    confidence_score FLOAT NOT NULL CHECK (confidence_score BETWEEN 0 AND 1),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_emotion_logs_consultation ON emotion_logs(consultation_id);
CREATE INDEX idx_emotion_logs_user ON emotion_logs(user_id);
CREATE INDEX idx_emotion_logs_created ON emotion_logs(created_at DESC);
CREATE INDEX idx_emotion_logs_user_created ON emotion_logs(user_id, created_at DESC);

-- View for aggregated emotion statistics per user
CREATE VIEW emotion_stats AS
SELECT 
    user_id,
    emotion_type,
    COUNT(*) as detection_count,
    AVG(confidence_score) as avg_confidence,
    MAX(created_at) as last_detected,
    MIN(created_at) as first_detected
FROM emotion_logs
GROUP BY user_id, emotion_type;

-- Row Level Security for emotion_logs
ALTER TABLE emotion_logs ENABLE ROW LEVEL SECURITY;

-- Users can only view their own emotion logs
CREATE POLICY "Users can view own emotion logs"
ON emotion_logs FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own emotion logs
CREATE POLICY "Users can insert own emotion logs"
ON emotion_logs FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Doctors can view emotion logs from their consultations
CREATE POLICY "Doctors can view consultation emotion logs"
ON emotion_logs FOR SELECT
USING (
    consultation_id IN (
        SELECT id FROM consultations WHERE doctor_id = auth.uid()
    )
);

-- Add emotion_analysis_enabled field to patients table
ALTER TABLE patients ADD COLUMN IF NOT EXISTS emotion_analysis_enabled BOOLEAN DEFAULT TRUE;

-- Comment for documentation
COMMENT ON TABLE emotion_logs IS 'Stores real-time emotion detections during consultations';
COMMENT ON COLUMN emotion_logs.emotion_type IS 'One of: calm, anxious, distressed, pain, sad, neutral';
COMMENT ON COLUMN emotion_logs.confidence_score IS 'AI confidence score between 0 and 1';
