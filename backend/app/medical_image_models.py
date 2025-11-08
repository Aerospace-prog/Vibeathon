"""
Pydantic models for medical image analysis
"""

from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from uuid import UUID

class MedicalImageUpload(BaseModel):
    """Request model for uploading medical image"""
    body_part: Optional[str] = Field(None, description="Body part shown in image")
    symptoms: Optional[List[str]] = Field(None, description="List of symptoms")
    patient_description: Optional[str] = Field(None, description="Patient's description")
    image_type: Optional[str] = Field("other", description="Type of image")
    appointment_id: Optional[UUID] = Field(None, description="Related appointment ID")
    is_follow_up: bool = Field(False, description="Is this a follow-up image?")
    parent_image_id: Optional[UUID] = Field(None, description="Original image ID for follow-ups")

class AnalysisRecommendations(BaseModel):
    """Recommendations from AI analysis"""
    see_doctor_immediately: bool
    urgency_level: str  # immediate, soon, routine
    home_care: List[str]
    monitoring: List[str]

class FollowUpGuidance(BaseModel):
    """Follow-up guidance from analysis"""
    watch_for: List[str]
    photo_timing: str
    improvement_signs: List[str]
    worsening_signs: List[str]

class PossibleCondition(BaseModel):
    """A possible medical condition"""
    name: str
    likelihood: str  # high, medium, low
    reasoning: str

class MedicalImageAnalysis(BaseModel):
    """Complete analysis result"""
    visual_description: str
    possible_conditions: List[PossibleCondition]
    severity: str  # mild, moderate, severe, unknown
    severity_reasoning: str
    red_flags: List[str]
    requires_immediate_attention: bool
    recommendations: AnalysisRecommendations
    follow_up: Optional[FollowUpGuidance] = None
    questions_for_doctor: Optional[List[str]] = None
    disclaimer: str
    analyzed_at: Optional[str] = None
    model: Optional[str] = None

class MedicalImageResponse(BaseModel):
    """Response model for medical image"""
    id: UUID
    patient_id: UUID
    appointment_id: Optional[UUID]
    image_url: str
    image_type: str
    body_part: Optional[str]
    patient_description: Optional[str]
    symptoms: Optional[List[str]]
    ai_analysis: Optional[Dict[str, Any]]
    severity_level: Optional[str]
    detected_conditions: Optional[List[str]]
    recommendations: Optional[List[str]]
    requires_immediate_attention: bool
    uploaded_at: datetime
    analyzed_at: Optional[datetime]
    is_follow_up: bool
    parent_image_id: Optional[UUID]
    days_since_previous: Optional[int]
    doctor_notes: Optional[str]
    doctor_reviewed_at: Optional[datetime]

class ImageComparisonRequest(BaseModel):
    """Request to compare two images"""
    before_image_id: UUID
    after_image_id: UUID
    condition_type: Optional[str] = None

class ImageComparisonResponse(BaseModel):
    """Response from image comparison"""
    overall_progress: str
    improvement_percentage: int
    changes: Dict[str, List[str]]
    healing_assessment: str
    concerns: List[str]
    recommendations: Dict[str, Any]
    compared_at: str
    days_between: int
    disclaimer: str

class DoctorNoteUpdate(BaseModel):
    """Doctor's notes on medical image"""
    doctor_notes: str
    requires_follow_up: Optional[bool] = None
