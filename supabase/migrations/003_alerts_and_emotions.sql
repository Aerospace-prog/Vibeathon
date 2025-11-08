-- Add emotion analysis consent field to patients table
ALTER TABLE patients ADD COLUMN emotion_analysis_enabled BOOLEAN DEFAULT TRUE;

-- Create alerts table
CREATE TABLE alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    consultation_id UUID NOT NULL REFERENCES consultations(id) ON DELETE CASCADE,
    symptom_text TEXT NOT NULL,
    symptom_type TEXT NOT NULL,
    severity_score INTEGER NOT NULL CHECK (severity_score BETWEEN 1 AND 5),
    acknowledged BOOLEAN DEFAULT FALSE,
    acknowledged_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create emotion_logs table
CREATE TABLE emotion_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    consultation_id UUID NOT NULL REFERENCES consultations(id) ON DELETE CASCADE,
    emotion_type TEXT NOT NULL,
    confidence_score FLOAT NOT NULL CHECK (confidence_score BETWEEN 0 AND 1),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for alerts table
CREATE INDEX idx_alerts_consultation ON alerts(consultation_id);
CREATE INDEX idx_alerts_severity ON alerts(severity_score DESC);
CREATE INDEX idx_alerts_created ON alerts(created_at DESC);

-- Create indexes for emotion_logs table
CREATE INDEX idx_emotion_logs_consultation ON emotion_logs(consultation_id);
CREATE INDEX idx_emotion_logs_created ON emotion_logs(created_at);
