"""Quick script to check available Gemini models"""
import os
import google.generativeai as genai
from dotenv import load_dotenv

# Load environment variables
load_dotenv('../.env')

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
    print("Available Gemini models:")
    for model in genai.list_models():
        if 'generateContent' in model.supported_generation_methods:
            print(f"  - {model.name}")
else:
    print("GEMINI_API_KEY not found")
