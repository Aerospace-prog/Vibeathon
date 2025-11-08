# Doctor Availability Setup Guide

This guide explains how to set up real-time doctor availability checking in the Arogya-AI platform.

## Overview

The system tracks doctor availability by counting booked appointment slots for each doctor on the current day. Doctors have 7 available time slots per day (09:00, 10:00, 11:00, 14:00, 15:00, 16:00, 17:00).

## Database Setup

### Step 1: Run the Appointments Table Migration

First, ensure the appointments table exists by running:

```sql
-- File: backend/migrations/001_create_appointments_tables.sql
-- This creates the appointments, doctor_availability, and consultations tables
```

Run this in your Supabase SQL Editor.

### Step 2: Add Availability Policies

Run the following migration to allow patients to check doctor availability:

```sql
-- File: backend/migrations/002_add_appointments_availability_policy.sql
-- This adds policies for viewing appointment availability
```

### Step 3: Create Availability Function and View

Run this migration to create a privacy-friendly availability checking system:

```sql
-- File: backend/migrations/003_add_doctor_availability_function.sql
-- This creates a function and view for efficient availability checking
```

## How It Works

### Database Function

The `get_doctor_availability_today()` function:
- Counts booked appointments for each doctor on the current date
- Only counts appointments with status 'scheduled' or 'in-progress'
- Returns doctor_id, booked_slots count, and is_available boolean
- Maximum 7 slots per day (if booked_slots >= 7, is_available = false)

### Frontend Integration

The DoctorBooking component:
1. Fetches all doctors from the `doctors` table
2. Queries the `doctor_availability_view` to get availability data
3. Maps availability data to each doctor
4. Displays availability status with visual indicators:
   - Green pulsing dot = Available
   - Red dot = Fully Booked
5. Disables booking button when doctor is fully booked

## Testing

### 1. Check if migrations are applied:

```sql
-- Check if the view exists
SELECT * FROM doctor_availability_view;

-- Check if the function exists
SELECT * FROM get_doctor_availability_today();
```

### 2. Test with sample data:

```sql
-- Get a doctor ID
SELECT id, full_name FROM doctors LIMIT 1;

-- Create test appointments (replace doctor_id and patient_id with actual UUIDs)
INSERT INTO appointments (patient_id, doctor_id, date, time, status)
VALUES 
  ('your-patient-uuid', 'your-doctor-uuid', CURRENT_DATE, '09:00', 'scheduled'),
  ('your-patient-uuid', 'your-doctor-uuid', CURRENT_DATE, '10:00', 'scheduled'),
  ('your-patient-uuid', 'your-doctor-uuid', CURRENT_DATE, '11:00', 'scheduled');

-- Check availability
SELECT * FROM doctor_availability_view WHERE doctor_id = 'your-doctor-uuid';
```

### 3. Verify in the UI:

1. Navigate to `/patient/book-appointment`
2. Click on "Find Doctor" tab
3. Check the availability status for each doctor
4. Open browser console to see debug logs:
   - Doctor availability data
   - Booked slots per doctor
   - Availability status

## Troubleshooting

### Issue: All doctors show as "Available" even when fully booked

**Solution:**
1. Check if the migrations are applied in Supabase
2. Verify the view exists: `SELECT * FROM doctor_availability_view;`
3. Check browser console for errors
4. Verify RLS policies allow reading from the view

### Issue: "relation doctor_availability_view does not exist"

**Solution:**
Run migration 003 in Supabase SQL Editor:
```sql
-- Copy and paste the contents of:
-- backend/migrations/003_add_doctor_availability_function.sql
```

### Issue: Availability not updating in real-time

**Solution:**
The availability is fetched when the component loads. To see updates:
1. Refresh the page
2. Or implement real-time subscriptions (advanced)

## Privacy Considerations

The system is designed with privacy in mind:
- Patients cannot see other patients' appointment details
- Only aggregate counts (booked slots) are exposed
- The database function uses SECURITY DEFINER to safely aggregate data
- No personal information is leaked through the availability check

## Future Enhancements

1. **Real-time Updates**: Use Supabase real-time subscriptions to update availability automatically
2. **Time-specific Availability**: Show which specific time slots are available
3. **Multi-day Availability**: Check availability for upcoming days
4. **Doctor-set Availability**: Allow doctors to set their own working hours
5. **Holiday Management**: Mark days when doctors are unavailable

## Related Files

- Frontend: `frontend/components/patient/DoctorBooking.tsx`
- Migrations: `backend/migrations/001_create_appointments_tables.sql`
- Migrations: `backend/migrations/002_add_appointments_availability_policy.sql`
- Migrations: `backend/migrations/003_add_doctor_availability_function.sql`
