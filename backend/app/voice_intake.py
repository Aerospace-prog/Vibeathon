"""
Voice-Based Patient Intake API
Converts patient speech (any language) to structured English medical forms
"""

from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from typing import Optional
import google.generativeai as genai
from google.cloud import speech_v1p1beta1 as speech
import os
import json
from datetime import datetime

router = APIRouter(prefix="/api/voice-intake", tags=["voice-intake"])

# Initialize Gemini (lazy - only if API key exists)
def get_gemini_model():
    api_key = os.getenv('GEMINI_API_KEY')
    if not api_key:
        raise HTTPException(status_code=500, detail="GEMINI_API_KEY not configured")
    genai.configure(api_key=api_key)
    return genai.GenerativeModel('models/gemini-2.0-flash-exp')

# Initialize Google Cloud Speech-to-Text (lazy - only when needed)
def get_speech_client():
    try:
        return speech.SpeechClient()
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"Google Cloud Speech credentials not configured. Please set up Application Default Credentials. Error: {str(e)}"
        )

@router.post("/process")
async def process_voice_intake(
    audio: UploadFile = File(...),
    patient_id: str = Form(...),
    language_code: str = Form("hi-IN")  # Default Hindi
):
    """
    Process voice intake: Speech → Text → Structured Data
    
    Supports multiple languages (Hindi, English, etc.)
    Returns structured patient information in English
    """
    try:
        # Initialize clients (lazy)
        speech_client = get_speech_client()
        model = get_gemini_model()
        
        # Read audio data
        audio_content = await audio.read()
        
        # Configure speech recognition with language support
        audio_config = speech.RecognitionAudio(content=audio_content)
        config = speech.RecognitionConfig(
            encoding=speech.RecognitionConfig.AudioEncoding.WEBM_OPUS,
            sample_rate_hertz=48000,
            language_code=language_code,  # Hindi, English, etc.
            enable_automatic_punctuation=True,
            model="medical_conversation",
            use_enhanced=True
        )
        
        # Transcribe audio
        response = speech_client.recognize(config=config, audio=audio_config)
        
        if not response.results:
            raise HTTPException(status_code=400, detail="No speech detected")
        
        # Get transcript
        transcript = " ".join([result.alternatives[0].transcript for result in response.results])
        
        # Extract structured data using Gemini AI
        extraction_prompt = f"""You are a medical intake assistant. Extract patient information from this transcript and translate everything to English.

TRANSCRIPT (may be in Hindi, English, or other languages):
"{transcript}"

Extract and translate the following information to English:
1. Full Name
2. Age
3. Gender
4. Chief Complaint (main problem/symptoms)
5. Duration of symptoms
6. Medical History (chronic conditions, past illnesses)
7. Current Medications
8. Allergies
9. Previous Surgeries
10. Family Medical History
11. Lifestyle (smoking, alcohol, exercise)
12. Additional Notes

IMPORTANT:
- Translate ALL information to English
- If information is not mentioned, use null
- Be accurate with medical terms
- Preserve important details

Return as JSON:
{{
  "full_name": "...",
  "age": number or null,
  "gender": "male/female/other" or null,
  "chief_complaint": "...",
  "symptom_duration": "...",
  "medical_history": ["condition1", "condition2"],
  "current_medications": ["med1", "med2"],
  "allergies": ["allergy1", "allergy2"],
  "previous_surgeries": ["surgery1", "surgery2"],
  "family_history": "...",
  "lifestyle": {{
    "smoking": "yes/no/unknown",
    "alcohol": "yes/no/unknown",
    "exercise": "..."
  }},
  "additional_notes": "...",
  "original_language": "detected language",
  "original_transcript": "original text",
  "english_transcript": "translated text"
}}
"""
        
        # Get AI extraction
        ai_response = model.generate_content(extraction_prompt)
        response_text = ai_response.text.strip()
        
        # Parse JSON
        if response_text.startswith('```json'):
            response_text = response_text.split('```json')[1].split('```')[0].strip()
        elif response_text.startswith('```'):
            response_text = response_text.split('```')[1].split('```')[0].strip()
        
        extracted_data = json.loads(response_text)
        
        # Add metadata
        extracted_data['processed_at'] = datetime.now().isoformat()
        extracted_data['patient_id'] = patient_id
        extracted_data['audio_language_code'] = language_code
        
        return {
            "success": True,
            "data": extracted_data,
            "message": "Voice intake processed successfully"
        }
        
    except json.JSONDecodeError as e:
        return {
            "success": False,
            "error": "Failed to parse AI response",
            "raw_response": response_text if 'response_text' in locals() else None
        }
    except Exception as e:
        print(f"Error processing voice intake: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to process voice intake: {str(e)}")


@router.post("/save-intake")
async def save_intake_to_profile(
    patient_id: str = Form(...),
    intake_data: str = Form(...)  # JSON string
):
    """
    Save extracted intake data to patient profile
    """
    try:
        from .database import DatabaseClient
        from supabase import create_client
        
        supabase = create_client(
            os.getenv("SUPABASE_URL"),
            os.getenv("SUPABASE_SERVICE_KEY")
        )
        
        data = json.loads(intake_data)
        
        # Update patient record
        update_data = {
            'voice_intake_completed': True,
            'voice_intake_data': data,
            'voice_intake_completed_at': datetime.now().isoformat(),
            'chief_complaint': data.get('chief_complaint'),
            'medical_history': data.get('medical_history'),
            'current_medications': data.get('current_medications'),
            'allergies': data.get('allergies')
        }
        
        result = supabase.table('patients').update(update_data).eq('user_id', patient_id).execute()
        
        return {
            "success": True,
            "message": "Intake data saved to profile",
            "data": result.data
        }
        
    except Exception as e:
        print(f"Error saving intake: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
