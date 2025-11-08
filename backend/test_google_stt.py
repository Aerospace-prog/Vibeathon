"""
Test Google Cloud Speech-to-Text with a sample audio file.
"""

import os
from google.cloud import speech_v1 as speech
from dotenv import load_dotenv

load_dotenv()

def test_google_stt():
    """Test if Google Cloud STT is working."""
    
    print("Testing Google Cloud Speech-to-Text...")
    print()
    
    # Check credentials
    project_id = os.getenv("GOOGLE_CLOUD_PROJECT_ID")
    creds_path = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")
    
    print(f"Project ID: {project_id}")
    print(f"Credentials: {creds_path}")
    print()
    
    if not project_id or not creds_path:
        print("❌ Missing credentials!")
        return
    
    if not os.path.exists(creds_path):
        print(f"❌ Credentials file not found: {creds_path}")
        return
    
    try:
        # Initialize client
        client = speech.SpeechClient()
        print("✅ Google Cloud Speech client initialized")
        print()
        
        # Test with a simple audio (silence - should return no results)
        print("Testing with empty audio...")
        config = speech.RecognitionConfig(
            encoding=speech.RecognitionConfig.AudioEncoding.LINEAR16,
            sample_rate_hertz=16000,
            language_code="en-US",
        )
        
        # Create 1 second of silence (16000 samples * 2 bytes = 32000 bytes)
        silence = b'\x00' * 32000
        audio = speech.RecognitionAudio(content=silence)
        
        response = client.recognize(config=config, audio=audio)
        
        if response.results:
            print(f"Results: {response.results}")
        else:
            print("✅ No results (expected for silence)")
        
        print()
        print("Google Cloud Speech-to-Text is working!")
        print()
        print("The issue is likely:")
        print("1. Audio from browser is too quiet")
        print("2. WebM format needs proper conversion")
        print("3. Need to use streaming recognition instead")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_google_stt()
