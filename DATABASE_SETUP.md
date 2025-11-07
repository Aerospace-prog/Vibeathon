# Database Setup Guide

## Error You're Seeing

```
Error fetching consultations: {
  code: 'PGRST205',
  message: "Could not find the table 'public.consultations' in the schema cache"
}
```

This means the database tables haven't been created yet in your Supabase project.

## Quick Fix (5 minutes)

### Step 1: Open Supabase SQL Editor

1. Go to your Supabase project dashboard: https://supabase.com/dashboard
2. Select your project
3. Click on **SQL Editor** in the left sidebar (or go to https://supabase.com/dashboard/project/YOUR_PROJECT_ID/sql)

### Step 2: Run the Schema Script

1. Click **New Query** button
2. Copy the entire contents of `database/schema.sql`
3. Paste it into the SQL editor
4. Click **Run** button (or press Ctrl+Enter)

You should see: ✅ Success. No rows returned

### Step 3: Verify Tables Were Created

1. Click on **Table Editor** in the left sidebar
2. You should now see three tables:
   - `patients`
   - `consultations`
   - `community_lexicon`

### Step 4: Refresh Your Application

1. Go back to your browser with the app running
2. Refresh the page (F5)
3. The errors should be gone!

## What the Schema Creates

### Tables

1. **patients** - Stores patient information
   - id (UUID)
   - name
   - date_of_birth
   - preferred_language
   - timestamps

2. **consultations** - Stores consultation records
   - id (UUID)
   - patient_id (foreign key)
   - doctor_id (foreign key to auth.users)
   - consultation_date
   - full_transcript
   - raw_soap_note (JSONB)
   - de_stigma_suggestions (JSONB)
   - approved (boolean)
   - timestamps

3. **community_lexicon** - Stores medical term translations
   - id (UUID)
   - term_english
   - term_regional
   - language
   - upvotes/downvotes
   - timestamps

### Security (Row Level Security)

The schema includes RLS policies so:
- Doctors can only see their own consultations
- Doctors can only see patients they've consulted with
- All authenticated users can view and contribute to the lexicon

### Indexes

Performance indexes are created on:
- consultation patient_id and doctor_id
- consultation date (for sorting)
- lexicon language (for filtering)

## Alternative: Using Supabase CLI

If you have Supabase CLI installed:

```bash
# Login to Supabase
supabase login

# Link your project
supabase link --project-ref YOUR_PROJECT_REF

# Run migrations
supabase db push
```

## Troubleshooting

### Issue: "permission denied for schema public"

**Solution**: Make sure you're running the SQL as the project owner, not as a service role.

### Issue: "relation already exists"

**Solution**: The tables are already created. You can skip this step or drop them first:

```sql
DROP TABLE IF EXISTS public.community_lexicon CASCADE;
DROP TABLE IF EXISTS public.consultations CASCADE;
DROP TABLE IF EXISTS public.patients CASCADE;
```

Then run the schema.sql again.

### Issue: Still seeing errors after creating tables

**Solution**: 
1. Check that RLS policies are enabled
2. Verify your user is authenticated
3. Check the Supabase logs in the dashboard
4. Make sure your `.env.local` has the correct Supabase URL and anon key

## Verify Setup

After running the schema, test with this SQL query:

```sql
-- Check tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('patients', 'consultations', 'community_lexicon');

-- Should return 3 rows
```

## Next Steps

Once the database is set up:

1. ✅ Refresh your application
2. ✅ Sign in with your account
3. ✅ Try creating a consultation
4. ✅ The dashboard should load without errors

## Sample Data (Optional)

If you want to test with sample data, run this after the schema:

```sql
-- Insert a demo patient
INSERT INTO public.patients (name, date_of_birth, preferred_language) 
VALUES ('Demo Patient', '1990-01-01', 'Hindi');

-- Insert some lexicon terms
INSERT INTO public.community_lexicon (term_english, term_regional, language) VALUES
('fever', 'बुखार', 'hi'),
('headache', 'सिरदर्द', 'hi'),
('cough', 'खांसी', 'hi'),
('pain', 'दर्द', 'hi');
```

## Need Help?

If you're still having issues:
1. Check Supabase project logs
2. Verify environment variables in `.env.local`
3. Make sure you're signed in to the application
4. Check browser console for detailed error messages
