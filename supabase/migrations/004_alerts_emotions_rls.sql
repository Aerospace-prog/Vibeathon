-- Enable Row Level Security on alerts and emotion_logs tables
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE emotion_logs ENABLE ROW LEVEL SECURITY;

-- Alerts table RLS policies
-- Doctors can only view alerts from their consultations
CREATE POLICY "Doctors can view their consultation alerts"
ON alerts FOR SELECT
USING (
    consultation_id IN (
        SELECT id FROM consultations WHERE doctor_id = auth.uid()
    )
);

-- Doctors can insert alerts for their consultations
CREATE POLICY "Doctors can insert alerts for their consultations"
ON alerts FOR INSERT
WITH CHECK (
    consultation_id IN (
        SELECT id FROM consultations WHERE doctor_id = auth.uid()
    )
);

-- Doctors can update alerts from their consultations
CREATE POLICY "Doctors can update their consultation alerts"
ON alerts FOR UPDATE
USING (
    consultation_id IN (
        SELECT id FROM consultations WHERE doctor_id = auth.uid()
    )
);

-- Emotion Logs table RLS policies
-- Doctors can only view emotion logs from their consultations
CREATE POLICY "Doctors can view their consultation emotion logs"
ON emotion_logs FOR SELECT
USING (
    consultation_id IN (
        SELECT id FROM consultations WHERE doctor_id = auth.uid()
    )
);

-- Doctors can insert emotion logs for their consultations
CREATE POLICY "Doctors can insert emotion logs for their consultations"
ON emotion_logs FOR INSERT
WITH CHECK (
    consultation_id IN (
        SELECT id FROM consultations WHERE doctor_id = auth.uid()
    )
);

-- Doctors can delete emotion logs from their consultations (for patient data deletion requests)
CREATE POLICY "Doctors can delete their consultation emotion logs"
ON emotion_logs FOR DELETE
USING (
    consultation_id IN (
        SELECT id FROM consultations WHERE doctor_id = auth.uid()
    )
);
