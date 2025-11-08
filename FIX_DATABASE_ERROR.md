# Fix Database Schema Error

## Error
```
Could not find the 'preferred_language' column of 'patients' in the schema cache
```

## Root Cause
Your Supabase `patients` table is missing required columns. This happens when migrations weren't run or the table was created manually.

## Quick Fix (2 minutes)

### Step 1: Run the SQL Migration

1. **Open Supabase Dashboard:**
   - Go to: https://supabase.com/dashboard
   - Select your project: `assignment-28a79`

2. **Open SQL Editor:**
   - Click "SQL Editor" in the left sidebar
   - Click "New Query"

3. **Run this SQL:**
   ```sql
   -- Add missing columns to patients table
   ALTER TABLE patients 
   ADD COLUMN IF NOT EXISTS emotion_analysis_enabled BOOLEAN DEFAULT TRUE;

   ALTER TABLE patients 
   ADD COLUMN IF NOT EXISTS preferred_language TEXT DEFAULT 'en';

   -- Verify columns exist
   SELECT column_name, data_type, column_default
   FROM information_schema.columns
   WHERE table_name = 'patients'
   ORDER BY ordinal_position;
   ```

4. **Click "Run"** (or press Ctrl+Enter)

5. **Verify the output** shows both columns:
   - `emotion_analysis_enabled` (boolean)
   - `preferred_language` (text)

### Step 2: Restart Your Backend

```bash
cd backend
python run.py
```

## Alternative: Run Full Schema Setup

If you want to ensure all tables are correct:

1. **Open Supabase SQL Editor**

2. **Run the complete schema:**
   ```bash
   # Copy the content from database/schema.sql
   # Then run all emotion migrations:
   # - supabase/migrations/002_emotion_logs.sql
   # - supabase/migrations/003_alerts_and_emotions.sql
   ```

3. **Or use the provided file:**
   - Open `FIX_PATIENTS_TABLE.sql` in this directory
   - Copy all content
   - Paste in Supabase SQL Editor
   - Run it

## Verify It Works

After running the migration:

1. **Check the backend logs:**
   ```bash
   cd backend
   python run.py
   ```
   
   You should NOT see the error anymore.

2. **Test the application:**
   - Open http://localhost:3000
   - Try to access any page
   - The error should be gone

## What These Columns Do

- **`preferred_language`**: Stores the patient's preferred language (e.g., 'en', 'hi')
- **`emotion_analysis_enabled`**: Boolean flag to enable/disable emotion analysis for privacy

## Common Issues

### "Column already exists"
- This is fine! The `IF NOT EXISTS` clause prevents errors
- Just means the column was already there

### "Permission denied"
- Make sure you're logged into the correct Supabase project
- Use the service role key if needed

### Still getting the error?
1. Clear your backend cache: Delete `backend/__pycache__` folder
2. Restart the backend server
3. Check Supabase logs for any RLS policy issues

## Need More Help?

If the error persists:
1. Check your `.env` file has correct `SUPABASE_URL` and `SUPABASE_SERVICE_KEY`
2. Verify you're connected to the right Supabase project
3. Check if the `patients` table exists at all in Supabase
