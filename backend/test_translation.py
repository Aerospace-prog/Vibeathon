"""
Quick test script for translation services.

Run this to verify Google Cloud credentials and translation setup.
"""

import asyncio
import os
from dotenv import load_dotenv

load_dotenv()

async def test_translation():
    """Test the STT pipeline and translation services."""
    
    print("=" * 60)
    print("Testing Arogya-AI Translation Services")
    print("=" * 60)
    print()
    
    # Check environment variables
    print("1. Checking environment variables...")
    project_id = os.getenv("GOOGLE_CLOUD_PROJECT_ID")
    credentials_path = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")
    
    print(f"   Project ID: {project_id or 'NOT SET'}")
    print(f"   Credentials: {credentials_path or 'NOT SET'}")
    
    if not project_id or not credentials_path:
        print("   ❌ Missing Google Cloud configuration!")
        print("   Please set GOOGLE_CLOUD_PROJECT_ID and GOOGLE_APPLICATION_CREDENTIALS in .env")
        return
    
    # Check credentials file exists
    if not os.path.exists(credentials_path):
        print(f"   ❌ Credentials file not found: {credentials_path}")
        return
    
    print("   ✅ Environment configured")
    print()
    
    # Test STT Pipeline initialization
    print("2. Initializing STT Pipeline...")
    try:
        from app.stt_pipeline import get_stt_pipeline
        stt = get_stt_pipeline()
        print("   ✅ STT Pipeline initialized")
        
        # Check which services are available
        if stt.google_speech_client:
            print("   ✅ Google Cloud Speech-to-Text available")
        else:
            print("   ❌ Google Cloud Speech-to-Text not available")
        
        if stt.google_translate_client:
            print("   ✅ Google Cloud Translation available")
        else:
            print("   ❌ Google Cloud Translation not available")
        
        if stt.openai_client:
            print("   ✅ OpenAI Whisper API available")
        else:
            print("   ⚠️  OpenAI Whisper API not available (optional)")
        
        print()
        
    except Exception as e:
        print(f"   ❌ Failed to initialize: {e}")
        return
    
    # Test translation
    print("3. Testing translation...")
    try:
        test_text = "Hello, how are you feeling today?"
        translated = await stt.translate_text(test_text, "en", "hi")
        print(f"   Original: {test_text}")
        print(f"   Translated: {translated}")
        print("   ✅ Translation working")
        print()
    except Exception as e:
        print(f"   ❌ Translation failed: {e}")
        print()
    
    # Test audio converter
    print("4. Testing audio converter...")
    try:
        from app.audio_converter import get_audio_converter
        converter = get_audio_converter()
        print("   ✅ Audio converter initialized")
        print()
    except Exception as e:
        print(f"   ❌ Audio converter failed: {e}")
        print()
    
    print("=" * 60)
    print("Setup Complete!")
    print("=" * 60)
    print()
    print("Next steps:")
    print("1. Start the backend: python run.py")
    print("2. Start the frontend: npm run dev")
    print("3. Open http://localhost:3000 and start a video call")
    print("4. Speak into your microphone to see live translations!")
    print()

if __name__ == "__main__":
    asyncio.run(test_translation())
