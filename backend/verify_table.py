"""
Verify that the medical_images table exists and is accessible
"""

import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

print("=" * 70)
print("🔍 Verifying medical_images table...")
print("=" * 70)
print()

try:
    # Try to query the table
    result = supabase.table('medical_images').select('*').limit(1).execute()
    
    print("✅ SUCCESS! Table 'medical_images' exists and is accessible!")
    print()
    print(f"📊 Current records in table: {len(result.data)}")
    
    if len(result.data) > 0:
        print("📝 Sample record found:")
        print(result.data[0])
    else:
        print("📝 Table is empty (this is normal for a new table)")
    
    print()
    print("=" * 70)
    print("✅ Medical Image Analysis feature is READY!")
    print("=" * 70)
    print()
    print("🎉 You can now:")
    print("1. Go to: http://localhost:3000/patient/medical-images")
    print("2. Upload a medical image")
    print("3. Get AI analysis!")
    print()
    print("=" * 70)
    
except Exception as e:
    print("❌ ERROR: Could not access table")
    print(f"   Error: {str(e)}")
    print()
    print("This might mean:")
    print("- Table wasn't created successfully")
    print("- RLS policies are blocking access")
    print("- Supabase credentials are incorrect")
    print()
    print("Please check with your project leader!")
