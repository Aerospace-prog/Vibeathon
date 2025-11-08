# ✅ Simple Doctor Availability - Using is_available Column

## Overview

The doctor availability system now uses the `is_available` boolean column directly from the `doctors` table. This is much simpler than the previous complex view-based approach.

## How It Works

### Database Schema
The `doctors` table has an `is_available` column:
```sql
doctors
├── id (uuid)
├── full_name (text)
├── specialization (text)
├── years_of_experience (int)
├── consultation_fee (numeric)
├── is_available (boolean)  ← This controls availability
└── ...
```

### Frontend Behavior
1. Fetches all doctors from the `doctors` table
2. Reads the `is_available` field directly
3. Displays availability status:
   - `is_available = true` → Green dot + "Available Today" + Enabled button
   - `is_available = false` → Red dot + "Fully Booked" + Disabled button

## Managing Doctor Availability

### Option 1: Manual Update in Supabase
1. Go to Supabase Dashboard
2. Navigate to Table Editor → `doctors`
3. Find the doctor you want to update
4. Toggle the `is_available` checkbox
5. Save changes

### Option 2: SQL Update
```sql
-- Make a doctor unavailable
UPDATE doctors 
SET is_available = false 
WHERE id = 'doctor-uuid-here';

-- Make a doctor available
UPDATE doctors 
SET is_available = true 
WHERE id = 'doctor-uuid-here';

-- Make all doctors available
UPDATE doctors 
SET is_available = true;
```

### Option 3: Automatic Updates (Future Enhancement)
You can create a trigger or scheduled function to automatically update `is_available` based on:
- Number of appointments for the day
- Doctor's working hours
- Holiday calendar
- Manual doctor settings

## Testing

### Test 1: Check Current Status
```sql
SELECT id, full_name, specialization, is_available 
FROM doctors;
```

### Test 2: Toggle Availability
```sql
-- Get a doctor ID
SELECT id, full_name FROM doctors LIMIT 1;

-- Set to unavailable
UPDATE doctors 
SET is_available = false 
WHERE id = 'your-doctor-id';

-- Refresh the app and verify the doctor shows as "Fully Booked"
```

### Test 3: Verify in UI
1. Navigate to `/patient/book-appointment`
2. Click "Find Doctor" tab
3. Check the availability status:
   - Available doctors: Green pulsing dot + "Available Today"
   - Unavailable doctors: Red dot + "Fully Booked" + Disabled button

## Default Behavior

If `is_available` is `NULL` or not set, the system defaults to `true` (available).

```typescript
const isAvailable = doc.is_available !== false // Default to true if null/undefined
```

## Advantages of This Approach

✅ **Simple**: No complex views or functions needed
✅ **Fast**: Single query to fetch all data
✅ **Flexible**: Doctors can be manually controlled
✅ **Real-time**: Changes reflect immediately after refresh
✅ **No Setup Required**: Works out of the box

## Future Enhancements

### 1. Doctor Dashboard Toggle
Add a toggle in the doctor's dashboard to control their availability:
```typescript
const toggleAvailability = async (doctorId: string, isAvailable: boolean) => {
  await supabase
    .from('doctors')
    .update({ is_available: isAvailable })
    .eq('id', doctorId)
}
```

### 2. Automatic Availability Based on Appointments
Create a function to automatically set `is_available` based on bookings:
```sql
CREATE OR REPLACE FUNCTION update_doctor_availability()
RETURNS void AS $
BEGIN
  UPDATE doctors d
  SET is_available = CASE
    WHEN (
      SELECT COUNT(*) 
      FROM appointments a 
      WHERE a.doctor_id = d.id 
        AND a.date = CURRENT_DATE 
        AND a.status IN ('scheduled', 'in-progress')
    ) >= 7 THEN false
    ELSE true
  END;
END;
$ LANGUAGE plpgsql;

-- Run this function periodically or after each booking
```

### 3. Working Hours Integration
```sql
ALTER TABLE doctors ADD COLUMN working_hours JSONB;

-- Example working hours:
-- {"monday": ["09:00-17:00"], "tuesday": ["09:00-17:00"], ...}
```

### 4. Real-time Subscriptions
Use Supabase real-time to update availability without page refresh:
```typescript
useEffect(() => {
  const subscription = supabase
    .channel('doctors-availability')
    .on('postgres_changes', 
      { event: 'UPDATE', schema: 'public', table: 'doctors' },
      (payload) => {
        // Update local state with new availability
      }
    )
    .subscribe()

  return () => subscription.unsubscribe()
}, [])
```

## Comparison with Previous Approach

### Old Approach (Complex)
- ❌ Required database view
- ❌ Required database function
- ❌ Required RLS policy updates
- ❌ Multiple queries
- ❌ Setup needed

### New Approach (Simple)
- ✅ Uses existing column
- ✅ Single query
- ✅ No setup needed
- ✅ Works immediately
- ✅ Easy to understand

## Related Files

- **Frontend**: `frontend/components/patient/DoctorBooking.tsx`
- **Page**: `frontend/app/patient/book-appointment/page.tsx`

## Summary

The availability system now simply reads the `is_available` boolean from the doctors table. To change a doctor's availability, just update this field in Supabase. No complex setup required! 🎉
