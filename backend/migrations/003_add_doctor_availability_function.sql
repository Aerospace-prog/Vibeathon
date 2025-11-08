-- Create a function to get doctor availability counts without exposing appointment details
-- This is a more privacy-friendly approach

CREATE OR REPLACE FUNCTION get_doctor_availability_today()
RETURNS TABLE (
  doctor_id UUID,
  booked_slots INTEGER,
  is_available BOOLEAN
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $
BEGIN
  RETURN QUERY
  SELECT 
    d.id as doctor_id,
    COALESCE(COUNT(a.id)::INTEGER, 0) as booked_slots,
    CASE 
      WHEN COALESCE(COUNT(a.id), 0) < 7 THEN true 
      ELSE false 
    END as is_available
  FROM doctors d
  LEFT JOIN appointments a ON a.doctor_id = d.id 
    AND a.date = CURRENT_DATE 
    AND a.status IN ('scheduled', 'in-progress')
  GROUP BY d.id;
END;
$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_doctor_availability_today() TO authenticated;

-- Create a view for easier querying
CREATE OR REPLACE VIEW doctor_availability_view AS
SELECT * FROM get_doctor_availability_today();

-- Grant select on the view
GRANT SELECT ON doctor_availability_view TO authenticated;
