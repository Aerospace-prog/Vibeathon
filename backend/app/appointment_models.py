"""
Pydantic models for appointment management system
"""

from pydantic import BaseModel, Field, validator
from typing import Optional, List
from datetime import date as DateType, time as TimeType, datetime as DateTimeType
from enum import Enum


class AppointmentStatus(str, Enum):
    """Appointment status enum"""
    SCHEDULED = "scheduled"
    IN_PROGRESS = "in-progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"
    MISSED = "missed"


class ConsultationStatus(str, Enum):
    """Consultation status enum"""
    ACTIVE = "active"
    COMPLETED = "completed"


class TimeSlot(BaseModel):
    """Individual time slot model"""
    time: str = Field(..., description="Time in HH:MM format")
    is_available: bool = Field(default=True, description="Whether slot is available")
    appointment_id: Optional[str] = Field(None, description="Appointment ID if booked")


class AppointmentCreate(BaseModel):
    """Model for creating a new appointment"""
    patient_id: str = Field(..., description="Patient user ID")
    doctor_id: str = Field(..., description="Doctor user ID")
    symptom_category: Optional[str] = Field(None, description="Category of symptoms")
    severity: Optional[int] = Field(None, ge=1, le=5, description="Severity score 1-5")
    date: DateType = Field(..., description="Appointment date")
    time: str = Field(..., description="Appointment time in HH:MM format")
    consultation_fee: float = Field(..., description="Consultation fee amount")

    @validator('time')
    def validate_time_format(cls, v):
        """Validate time is in HH:MM format"""
        try:
            DateTimeType.strptime(v, '%H:%M')
            return v
        except ValueError:
            raise ValueError('Time must be in HH:MM format')

    @validator('date')
    def validate_future_date(cls, v):
        """Validate date is not in the past"""
        if v < DateType.today():
            raise ValueError('Cannot book appointments in the past')
        return v


class AppointmentUpdate(BaseModel):
    """Model for updating an appointment"""
    status: Optional[AppointmentStatus] = None
    date: Optional[DateType] = None
    time: Optional[str] = None

    @validator('time')
    def validate_time_format(cls, v):
        """Validate time is in HH:MM format"""
        if v is not None:
            try:
                DateTimeType.strptime(v, '%H:%M')
                return v
            except ValueError:
                raise ValueError('Time must be in HH:MM format')
        return v


class AppointmentResponse(BaseModel):
    """Model for appointment response"""
    id: str
    patient_id: str
    doctor_id: str
    symptom_category: Optional[str]
    severity: Optional[int]
    date: DateType
    time: str
    status: AppointmentStatus
    consultation_fee: float
    created_at: DateTimeType
    updated_at: DateTimeType
    
    # Optional doctor details (populated via join)
    doctor_name: Optional[str] = None
    doctor_specialty: Optional[str] = None
    doctor_image: Optional[str] = None

    class Config:
        from_attributes = True


class DoctorAvailabilityCreate(BaseModel):
    """Model for creating doctor availability"""
    doctor_id: str = Field(..., description="Doctor user ID")
    date: DateType = Field(..., description="Date for availability")
    time_slots: List[TimeSlot] = Field(..., description="List of time slots")


class DoctorAvailabilityResponse(BaseModel):
    """Model for doctor availability response"""
    id: str
    doctor_id: str
    date: DateType
    time_slots: List[TimeSlot]
    created_at: DateTimeType
    updated_at: DateTimeType

    class Config:
        from_attributes = True


class AvailabilityCheckRequest(BaseModel):
    """Model for checking slot availability"""
    doctor_id: str
    date: DateType
    time: str

    @validator('time')
    def validate_time_format(cls, v):
        """Validate time is in HH:MM format"""
        try:
            DateTimeType.strptime(v, '%H:%M')
            return v
        except ValueError:
            raise ValueError('Time must be in HH:MM format')


class AvailabilityCheckResponse(BaseModel):
    """Model for availability check response"""
    available: bool
    message: Optional[str] = None


class ConsultationStart(BaseModel):
    """Model for starting a consultation"""
    appointment_id: str = Field(..., description="Appointment ID")


class ConsultationEnd(BaseModel):
    """Model for ending a consultation"""
    transcript: str = Field(..., description="Full consultation transcript")


class SOAPNotes(BaseModel):
    """SOAP notes model"""
    subjective: str
    objective: str
    assessment: str
    plan: str


class StigmaSuggestion(BaseModel):
    """De-stigmatization suggestion model"""
    section: str = Field(..., description="Section where issue was found")
    original: str = Field(..., description="Original problematic phrase")
    suggested: str = Field(..., description="Suggested alternative")
    rationale: str = Field(..., description="Explanation for the change")


class ConsultationResponse(BaseModel):
    """Model for consultation response"""
    id: str
    appointment_id: str
    patient_id: str
    doctor_id: str
    start_time: DateTimeType
    end_time: Optional[DateTimeType]
    transcript: Optional[str]
    soap_notes: Optional[SOAPNotes]
    stigma_suggestions: List[StigmaSuggestion] = []
    status: ConsultationStatus
    created_at: DateTimeType

    class Config:
        from_attributes = True


class AppointmentListResponse(BaseModel):
    """Model for list of appointments"""
    appointments: List[AppointmentResponse]
    total: int
    page: int
    page_size: int
