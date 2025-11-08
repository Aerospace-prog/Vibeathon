"""List all available Gemini models for your API key"""
import os
from dotenv import load_dotenv
import google.generativeai as genai

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")

if api_key:
    try:
        genai.configure(api_key=api_key)
        
        print("Fetching available models...\n")
        models = genai.list_models()
        
        print("Available models that support generateContent:")
        print("-" * 60)
        
        for model in models:
            if 'generateContent' in model.supported_generation_methods:
                print(f"✓ {model.name}")
                print(f"  Display Name: {model.display_name}")
                print(f"  Description: {model.description}")
                print()
        
    except Exception as e:
        print(f"❌ Error: {e}")
else:
    print("❌ No API key found")
