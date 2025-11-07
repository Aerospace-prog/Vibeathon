<<<<<<< HEAD
from pydantic import BaseModel, Field
from typing import List, Optional

class LexiconTerm(BaseModel):
    """Model for Community Lexicon term submission"""
    term_english: str = Field(..., description="Medical term in English")
    term_regional: str = Field(..., description="Medical term in regional language")
    language: str = Field(..., description="Language code (e.g., 'hi' for Hindi)")

class StigmaSuggestion(BaseModel):
    """Model for de-stigmatization suggestion"""
    original_phrase: str = Field(..., description="Original stigmatizing phrase")
    suggested_alternative: str = Field(..., description="Person-first alternative")
    rationale: str = Field(..., description="Explanation for the suggestion")
    section: str = Field(..., description="SOAP section (assessment or plan)")

class SoapNoteResponse(BaseModel):
    """Model for SOAP note structure"""
    subjective: str = Field(..., description="Subjective section")
    objective: str = Field(..., description="Objective section")
    assessment: str = Field(..., description="Assessment section")
    plan: str = Field(..., description="Plan section")

class SoapGenerationResponse(BaseModel):
    """Model for complete SOAP generation response"""
    raw_soap_note: SoapNoteResponse
    de_stigma_suggestions: List[StigmaSuggestion]
    consultation_id: str
=======
from pydantic import BaseModel, Field, field_validator
from typing import List, Optional
from datetime import datetime

class LexiconTerm(BaseModel):
    """Model for Community Lexicon term submission"""
    term_english: str = Field(..., min_length=1, max_length=200, description="English medical term")
    term_regional: str = Field(..., min_length=1, max_length=200, description="Regional language equivalent")
    language: str = Field(..., min_length=2, max_length=10, description="Language code (e.g., 'hi', 'ta', 'te')")
    
    @field_validator('term_english', 'term_regional')
    @classmethod
    def validate_not_empty(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError('Term cannot be empty or whitespace only')
        return v.strip()
    
    @field_validator('language')
    @classmethod
    def validate_language_code(cls, v: str) -> str:
        v = v.lower().strip()
        # Common Indian language codes
        valid_codes = ['hi', 'ta', 'te', 'bn', 'mr', 'gu', 'kn', 'ml', 'pa', 'or']
        if v not in valid_codes:
            raise ValueError(f'Language code must be one of: {", ".join(valid_codes)}')
        return v

class SoapNoteResponse(BaseModel):
    """Model for SOAP note structure"""
    subjective: str = Field(..., description="Subjective section - patient's reported symptoms and history")
    objective: str = Field(..., description="Objective section - observable findings and measurements")
    assessment: str = Field(..., description="Assessment section - diagnosis and clinical impression")
    plan: str = Field(..., description="Plan section - treatment plan and follow-up")
    
    @field_validator('subjective', 'objective', 'assessment', 'plan')
    @classmethod
    def validate_section_not_empty(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError('SOAP note section cannot be empty')
        return v.strip()

class StigmaSuggestion(BaseModel):
    """Model for de-stigmatization suggestion"""
    section: str = Field(..., description="SOAP section where stigmatizing language was found")
    original: str = Field(..., min_length=1, description="Original stigmatizing phrase")
    suggested: str = Field(..., min_length=1, description="Suggested person-first alternative")
    rationale: str = Field(..., min_length=1, description="Explanation for the suggestion")
    
    @field_validator('section')
    @classmethod
    def validate_section(cls, v: str) -> str:
        valid_sections = ['subjective', 'objective', 'assessment', 'plan']
        if v.lower() not in valid_sections:
            raise ValueError(f'Section must be one of: {", ".join(valid_sections)}')
        return v.lower()

class SoapGenerationResponse(BaseModel):
    """Model for complete SOAP note generation response with empathy suggestions"""
    raw_soap_note: SoapNoteResponse = Field(..., description="Generated SOAP note")
    de_stigma_suggestions: List[StigmaSuggestion] = Field(
        default_factory=list,
        description="List of de-stigmatization suggestions (empty if none found)"
    )
    consultation_id: Optional[str] = Field(None, description="Associated consultation ID")
    generated_at: datetime = Field(default_factory=datetime.utcnow, description="Timestamp of generation")

class CaptionMessage(BaseModel):
    """Model for WebSocket caption messages"""
    speaker_id: str = Field(..., description="Speaker identifier: 'doctor' or 'patient'")
    original_text: str = Field(..., description="Original transcribed text")
    translated_text: str = Field(..., description="Translated text")
    timestamp: float = Field(..., description="Unix timestamp of the caption")
    
    @field_validator('speaker_id')
    @classmethod
    def validate_speaker(cls, v: str) -> str:
        if v not in ['doctor', 'patient']:
            raise ValueError('speaker_id must be either "doctor" or "patient"')
        return v

class ErrorResponse(BaseModel):
    """Model for error responses"""
    error: str = Field(..., description="Error message")
    detail: Optional[str] = Field(None, description="Detailed error information")
    timestamp: datetime = Field(default_factory=datetime.utcnow, description="Error timestamp")
>>>>>>> 8c02c68a975937490994437626cbdcc74e65ea28
