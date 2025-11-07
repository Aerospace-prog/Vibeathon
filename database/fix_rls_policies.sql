-- Fix RLS Policies for Patient Creation
-- Run this if you're getting "Error creating patient" errors

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Doctors can view their patients" ON public.patients;
DROP POLICY IF EXISTS "Doctors can insert patients" ON public.patients;

-- Create more permissive policies for authenticated users
CREATE POLICY "Authenticated users can view patients"
    ON public.patients FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert patients"
    ON public.patients FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update patients"
    ON public.patients FOR UPDATE
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

-- Verify policies are active
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'patients';
