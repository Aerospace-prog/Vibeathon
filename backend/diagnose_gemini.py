"""Comprehensive Gemini API diagnostic"""
import os
from dotenv import load_dotenv
import google.generativeai as genai

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")

print("=" * 60)
print("GEMINI API DIAGNOSTIC")
print("=" * 60)
print(f"\n1. API Key Status:")
print(f"   Found: {'Yes' if api_key else 'No'}")
if api_key:
    print(f"   Starts with: {api_key[:20]}...")
    print(f"   Length: {len(api_key)} characters")

if not api_key:
    print("\n❌ No API key found!")
    exit(1)

print(f"\n2. Configuring Gemini...")
try:
    genai.configure(api_key=api_key)
    print("   ✓ Configuration successful")
except Exception as e:
    print(f"   ❌ Configuration failed: {e}")
    exit(1)

print(f"\n3. Listing available models...")
try:
    models = list(genai.list_models())
    print(f"   ✓ Found {len(models)} total models")
    
    generate_models = [m for m in models if 'generateContent' in m.supported_generation_methods]
    print(f"   ✓ {len(generate_models)} models support generateContent")
    
    print(f"\n4. Models that support generateContent:")
    for model in generate_models:
        print(f"   • {model.name}")
    
except Exception as e:
    print(f"   ❌ Failed to list models: {e}")
    print(f"\n   This usually means:")
    print(f"   - API key is invalid")
    print(f"   - API key hasn't been activated")
    print(f"   - Gemini API isn't enabled for your project")
    print(f"\n   Get a new key from: https://aistudio.google.com/app/apikey")
    exit(1)

print(f"\n5. Testing generateContent with gemini-1.5-flash...")
try:
    model = genai.GenerativeModel('gemini-1.5-flash')
    response = model.generate_content("Say 'Hello' if you can read this.")
    print(f"   ✓ Response: {response.text}")
    print(f"\n✅ SUCCESS! Gemini API is working correctly!")
    
except Exception as e:
    print(f"   ❌ Test failed: {e}")
    print(f"\n   Trying alternative models...")
    
    # Try other models
    for model_name in ['gemini-pro', 'gemini-1.0-pro', 'models/gemini-1.5-flash']:
        try:
            print(f"\n   Testing {model_name}...")
            model = genai.GenerativeModel(model_name)
            response = model.generate_content("Say 'Hello'")
            print(f"   ✓ {model_name} works! Response: {response.text}")
            print(f"\n✅ Use this model name in your code: {model_name}")
            break
        except Exception as e2:
            print(f"   ❌ {model_name} failed: {e2}")

print("\n" + "=" * 60)
