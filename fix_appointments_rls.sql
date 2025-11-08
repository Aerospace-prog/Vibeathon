-- Fix RLS policies for appointments to allow patients to view their appointments

-- Add policy for patients to view their own appointments
CREATE POLICY "Patients can view their appointments"
ON public.appointments FOR SELECT
USING (patient_id IN (
    SELECT id FROM public.patients WHERE user_id = auth.uid()
));

-- Add policy for patients to insert appointments (for booking)
CREATE POLICY "Patients can insert appointments"
ON public.appointments FOR INSERT
WITH CHECK (patient_id IN (
    SELECT id FROM public.patients WHERE user_id = auth.uid()
));

-- Verify policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies
WHERE tablename = 'appointments'
ORDER BY policyname;
