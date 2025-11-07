"""
Speech-to-Text Pipeline with Hinglish Support for Arogya-AI

This module handles real-time audio transcription, translation, and Community Lexicon
integration for multilingual medical consultations.

Features:
- Google Cloud Speech-to-Text (primary ASR with free tier)
- OpenAI Whisper API (fallback ASR)
- Google Cloud Translation API
- Community Lexicon vector similarity search
- Language-specific configuration for Hindi and Hinglish code-switching
"""

import os
import logging
from typing import Dict, Optional, Tuple
from io import BytesIO
import asyncio

# Google Cloud imports
try:
    from google.cloud import speech_v1 as speech
    from google.cloud import translate_v2 as translate
    GOOGLE_CLOUD_AVAILABLE = True
except ImportError:
    GOOGLE_CLOUD_AVAILABLE = False
    logging.warning("Google Cloud libraries not available")

# OpenAI imports
try:
    from openai import OpenAI
    OPENAI_AVAILABLE = True
except ImportError:
    OPENAI_AVAILABLE = False
    logging.warning("OpenAI library not available")

# Sentence transformers for embeddings
try:
    from sentence_transformers import SentenceTransformer
    SENTENCE_TRANSFORMERS_AVAILABLE = True
except ImportError:
    SENTENCE_TRANSFORMERS_AVAILABLE = False
    logging.warning("sentence-transformers library not available")

from dotenv import load_dotenv
from .database import DatabaseClient

# Load environment variables
load_dotenv()

logger = logging.getLogger(__name__)


class STTPipeline:
    """
    Speech-to-Text pipeline with ASR fallback, translation, and lexicon integration.
    """
    
    def __init__(self):
        """Initialize STT pipeline with ASR services and translation."""
        self.google_speech_client = None
        self.google_translate_client = None
        self.openai_client = None
        self.embedding_model = None
        
        # Initialize Google Cloud Speech-to-Text (primary ASR)
        if GOOGLE_CLOUD_AVAILABLE:
            try:
                self.google_speech_client = speech.SpeechClient()
                logger.info("Google Cloud Speech-to-Text initialized (primary ASR)")
            except Exception as e:
                logger.warning(f"Failed to initialize Google Cloud Speech: {str(e)}")
        
        # Initialize Google Cloud Translation
        if GOOGLE_CLOUD_AVAILABLE:
            try:
                self.google_translate_client = translate.Client()
                logger.info("Google Cloud Translation initialized")
            except Exception as e:
                logger.warning(f"Failed to initialize Google Cloud Translation: {str(e)}")
        
        # Initialize OpenAI Whisper API (fallback ASR)
        if OPENAI_AVAILABLE:
            api_key = os.getenv("OPENAI_API_KEY")
            if api_key:
                try:
                    self.openai_client = OpenAI(api_key=api_key)
                    logger.info("OpenAI Whisper API initialized (fallback ASR)")
                except Exception as e:
                    logger.warning(f"Failed to initialize OpenAI client: {str(e)}")
        
        # Initialize embedding model for Community Lexicon
        if SENTENCE_TRANSFORMERS_AVAILABLE:
            try:
                self.embedding_model = SentenceTransformer('Supabase/gte-small')
                logger.info("Embedding model initialized (gte-small)")
            except Exception as e:
                logger.warning(f"Failed to initialize embedding model: {str(e)}")
    
    async def transcribe_audio_google(
        self,
        audio_chunk: bytes,
        language_code: str,
        alternative_language_codes: Optional[list] = None
    ) -> Optional[str]:
        """
        Transcribe audio using Google Cloud Speech-to-Text.
        
        Args:
            audio_chunk: Raw audio bytes
            language_code: Primary language code (e.g., 'hi-IN', 'en-IN')
            alternative_language_codes: Alternative language codes for code-switching
            
        Returns:
            Transcribed text or None if transcription fails
        """
        if not self.google_speech_client:
            logger.error("Google Cloud Speech client not initialized")
            return None
        
        try:
            # Configure recognition
            config = speech.RecognitionConfig(
                encoding=speech.RecognitionConfig.AudioEncoding.LINEAR16,
                sample_rate_hertz=16000,
                language_code=language_code,
                alternative_language_codes=alternative_language_codes or [],
                enable_automatic_punctuation=True,
                model='latest_long',  # Best for medical terminology
            )
            
            audio = speech.RecognitionAudio(content=audio_chunk)
            
            # Perform synchronous recognition
            response = self.google_speech_client.recognize(config=config, audio=audio)
            
            # Extract transcript from response
            if response.results:
                transcript = ' '.join([
                    result.alternatives[0].transcript
                    for result in response.results
                    if result.alternatives
                ])
                logger.debug(f"Google STT transcribed: {transcript[:50]}...")
                return transcript
            
            logger.debug("Google STT returned no results")
            return None
            
        except Exception as e:
            logger.error(f"Google Cloud Speech-to-Text error: {str(e)}")
            return None
    
    async def transcribe_audio_whisper(self, audio_chunk: bytes) -> Optional[str]:
        """
        Transcribe audio using OpenAI Whisper API (fallback).
        
        Args:
            audio_chunk: Raw audio bytes
            
        Returns:
            Transcribed text or None if transcription fails
        """
        if not self.openai_client:
            logger.error("OpenAI client not initialized")
            return None
        
        try:
            # Create a file-like object from audio bytes
            audio_file = BytesIO(audio_chunk)
            audio_file.name = "audio.wav"
            
            # Call Whisper API
            response = self.openai_client.audio.transcriptions.create(
                model="whisper-1",
                file=audio_file,
                response_format="text"
            )
            
            transcript = response if isinstance(response, str) else response.text
            logger.debug(f"Whisper API transcribed: {transcript[:50]}...")
            return transcript
            
        except Exception as e:
            logger.error(f"OpenAI Whisper API error: {str(e)}")
            return None
    
    async def transcribe_audio(
        self,
        audio_chunk: bytes,
        user_type: str
    ) -> Optional[str]:
        """
        Transcribe audio with ASR fallback logic and language-specific configuration.
        
        Args:
            audio_chunk: Raw audio bytes
            user_type: 'doctor' or 'patient'
            
        Returns:
            Transcribed text or None if all ASR services fail
        """
        # Configure language based on user type
        if user_type == 'patient':
            # Patient speaks primarily Hindi
            language_code = 'hi-IN'
            alternative_codes = None
        elif user_type == 'doctor':
            # Doctor speaks Hinglish (code-switching between English and Hindi)
            language_code = 'en-IN'
            alternative_codes = ['hi-IN']
        else:
            logger.error(f"Invalid user_type: {user_type}")
            return None
        
        # Try primary ASR: Google Cloud Speech-to-Text
        transcript = await self.transcribe_audio_google(
            audio_chunk,
            language_code,
            alternative_codes
        )
        
        if transcript:
            return transcript
        
        # Fallback to OpenAI Whisper API
        logger.warning("Google Cloud STT failed, falling back to Whisper API")
        transcript = await self.transcribe_audio_whisper(audio_chunk)
        
        if transcript:
            return transcript
        
        logger.error("All ASR services failed")
        return None
    
    async def translate_text(
        self,
        text: str,
        source_language: str,
        target_language: str
    ) -> Optional[str]:
        """
        Translate text using Google Cloud Translation API.
        
        Args:
            text: Text to translate
            source_language: Source language code ('hi', 'en')
            target_language: Target language code ('hi', 'en')
            
        Returns:
            Translated text or original text if translation fails
        """
        if not self.google_translate_client:
            logger.warning("Google Translate client not initialized, returning original text")
            return text
        
        # Skip translation if source and target are the same
        if source_language == target_language:
            return text
        
        try:
            result = self.google_translate_client.translate(
                text,
                source_language=source_language,
                target_language=target_language
            )
            
            translated_text = result['translatedText']
            logger.debug(f"Translated: {text[:30]}... -> {translated_text[:30]}...")
            return translated_text
            
        except Exception as e:
            logger.error(f"Translation error: {str(e)}")
            return text  # Return original text on error
    
    async def lookup_lexicon_term(
        self,
        text: str,
        db_client: DatabaseClient
    ) -> str:
        """
        Perform Community Lexicon lookup and replace regional terms.
        
        Args:
            text: Text containing potential regional medical terms
            db_client: Database client for lexicon search
            
        Returns:
            Text with regional terms replaced by verified English equivalents
        """
        if not text or not text.strip():
            return text
        
        try:
            # Split text into words for term-by-term lookup
            words = text.split()
            replaced_words = []
            
            for word in words:
                # Clean word (remove punctuation for matching)
                clean_word = word.strip('.,!?;:')
                
                # Search lexicon for this term
                english_equivalent = await db_client.search_lexicon(
                    clean_word,
                    threshold=0.85
                )
                
                if english_equivalent:
                    # Replace with English equivalent, preserve punctuation
                    replaced_word = word.replace(clean_word, english_equivalent)
                    replaced_words.append(replaced_word)
                    logger.debug(f"Lexicon replacement: {clean_word} -> {english_equivalent}")
                else:
                    replaced_words.append(word)
            
            return ' '.join(replaced_words)
            
        except Exception as e:
            logger.error(f"Lexicon lookup error: {str(e)}")
            return text  # Return original text on error
    
    async def process_audio_stream(
        self,
        audio_chunk: bytes,
        user_type: str,
        consultation_id: str,
        db_client: DatabaseClient
    ) -> Dict[str, str]:
        """
        Main pipeline: ASR → Lexicon Lookup → Translation.
        
        This function orchestrates the complete STT pipeline for real-time
        audio processing during consultations.
        
        Args:
            audio_chunk: Raw audio bytes from MediaRecorder
            user_type: 'doctor' or 'patient'
            consultation_id: UUID of the consultation session
            db_client: Database client for transcript storage and lexicon lookup
            
        Returns:
            Dictionary with:
                - original_text: Transcribed text in original language
                - translated_text: Translated text for the other participant
                - speaker_id: 'doctor' or 'patient'
        """
        try:
            # Step 1: Transcribe audio with ASR fallback
            original_text = await self.transcribe_audio(audio_chunk, user_type)
            
            if not original_text:
                logger.warning("Transcription failed, returning empty result")
                return {
                    "original_text": "",
                    "translated_text": "",
                    "speaker_id": user_type
                }
            
            # Step 2: Community Lexicon lookup (before translation)
            # Replace regional medical terms with verified English equivalents
            lexicon_corrected_text = await self.lookup_lexicon_term(
                original_text,
                db_client
            )
            
            # Step 3: Translate based on user type
            if user_type == 'patient':
                # Patient speaks Hindi → Translate to English for doctor
                source_lang = 'hi'
                target_lang = 'en'
            elif user_type == 'doctor':
                # Doctor speaks English/Hinglish → Translate to Hindi for patient
                source_lang = 'en'
                target_lang = 'hi'
            else:
                logger.error(f"Invalid user_type: {user_type}")
                return {
                    "original_text": original_text,
                    "translated_text": original_text,
                    "speaker_id": user_type
                }
            
            translated_text = await self.translate_text(
                lexicon_corrected_text,
                source_lang,
                target_lang
            )
            
            # Step 4: Append to consultation transcript
            transcript_entry = f"[{user_type.upper()}]: {original_text}"
            await db_client.append_transcript(consultation_id, transcript_entry)
            
            # Return result
            result = {
                "original_text": original_text,
                "translated_text": translated_text or original_text,
                "speaker_id": user_type
            }
            
            logger.info(f"Processed audio for {user_type} in consultation {consultation_id}")
            return result
            
        except Exception as e:
            logger.error(f"Error in process_audio_stream: {str(e)}")
            return {
                "original_text": "",
                "translated_text": "",
                "speaker_id": user_type
            }


# Singleton instance
_stt_pipeline: Optional[STTPipeline] = None

def get_stt_pipeline() -> STTPipeline:
    """
    Get or create singleton STT pipeline instance.
    
    Returns:
        STTPipeline instance
    """
    global _stt_pipeline
    if _stt_pipeline is None:
        _stt_pipeline = STTPipeline()
    return _stt_pipeline
