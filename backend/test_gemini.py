"""Test script to verify Gemini API is working"""
import os
from dotenv import load_dotenv
import google.generativeai as genai

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")

print(f"API Key found: {'Yes' if api_key else 'No'}")
print(f"API Key starts with: {api_key[:20] if api_key else 'None'}")

if api_key:
    try:
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel('models/gemini-2.5-flash')
        
        print("\nTesting Gemini API...")
        response = model.generate_content("Say 'Hello, I am working!' if you can read this.")
        print(f"Response: {response.text}")
        print("\n✅ Gemini API is working!")
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        print("\nPossible issues:")
        print("1. Invalid API key")
        print("2. API key not activated")
        print("3. Network connection issue")
        print("\nGet a new API key from: https://makersuite.google.com/app/apikey")
else:
    print("\n❌ No API key found in .env file")
