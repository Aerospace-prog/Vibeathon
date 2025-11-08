"""
Pydantic Models for Arogya-AI Backend API

This module defines all request and response models used in the API.
"""

from pydantic import BaseModel, Field, field_validator
from typing import List, Optional
from datetime import datetime


class LexiconTerm(BaseModel):
    """Model for Community Lexicon term submission"""
    term_english: str = Field(..., min_length=1, max_length=200, description="English medical term")
    term_regional: str = Field(..., min_length=1, max_length=200, description="Regional language equivalent")
    language: str = Field(..., min_length=2, max_length=10, description="Language code (e.g., 'hi', 'ta', 'te')")
    
    @field_validator('language')
    @classmethod
    def validate_language(cls, v):
        allowed_languages = ['hi', 'ta', 'te', 'bn', 'mr', 'gu', 'kn', 'ml', 'pa', 'or']
        if v not in allowed_languages:
            raise ValueError(f'Language must be one of: {", ".join(allowed_languages)}')
        return v


class StigmaSuggestion(BaseModel):
    """Model for de-stigmatization suggestion"""
    original_phrase: str = Field(..., description="Original stigmatizing phrase")
    suggested_alternative: str = Field(..., description="Person-first alternative")
    rationale: str = Field(..., description="Explanation for the suggestion")
    section: str = Field(..., description="SOAP section (assessment or plan)")
    
    @field_validator('section')
    @classmethod
    def validate_section(cls, v):
        if v not in ['assessment', 'plan']:
            raise ValueError('Section must be either "assessment" or "plan"')
        return v


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


class ErrorResponse(BaseModel):
    """Model for error responses"""
    error: str = Field(..., description="Error message")
    detail: Optional[str] = Field(None, description="Detailed error information")
    timestamp: datetime = Field(default_factory=datetime.now, description="Error timestamp")
