-- ============================================================================
-- Set Default Availability for Doctors
-- Run this in Supabase SQL Editor to ensure all doctors have availability set
-- ============================================================================

-- Set all doctors to available by default (if is_available is NULL)
UPDATE doctors 
SET is_available = true 
WHERE is_available IS NULL;

-- Verify the update
SELECT 
    id,
    full_name,
    email,
    specialization,
    is_available,
    CASE 
        WHEN is_available = true THEN '✅ Available'
        WHEN is_available = false THEN '❌ Unavailable'
        ELSE '⚠️ Not Set'
    END as status
FROM doctors
ORDER BY full_name;

-- Success message
DO $
BEGIN
    RAISE NOTICE '✅ All doctors now have availability status set!';
    RAISE NOTICE 'Default: All doctors are set to AVAILABLE (is_available = true)';
    RAISE NOTICE '';
    RAISE NOTICE 'To make a doctor unavailable, run:';
    RAISE NOTICE 'UPDATE doctors SET is_available = false WHERE id = ''doctor-uuid'';';
END $;
