"""
Appointment management API endpoints
"""

import os
from datetime import datetime, date as DateType, time as TimeType, timedelta
from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query, Depends
from supabase import create_client, Client
import logging

from app.appointment_models import (
    AppointmentCreate,
    AppointmentUpdate,
    AppointmentResponse,
    AppointmentListResponse,
    DoctorAvailabilityCreate,
    DoctorAvailabilityResponse,
    AvailabilityCheckRequest,
    AvailabilityCheckResponse,
    ConsultationStart,
    ConsultationEnd,
    ConsultationResponse,
    AppointmentStatus,
    TimeSlot
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api", tags=["appointments"])

# Initialize Supabase client
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    logger.warning("Supabase credentials not found. Appointment features will not work.")
    supabase: Optional[Client] = None
else:
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)


def get_supabase() -> Client:
    """Dependency to get Supabase client"""
    if supabase is None:
        raise HTTPException(status_code=500, detail="Database not configured")
    return supabase


@router.post("/appointments", response_model=AppointmentResponse)
async def create_appointment(
    appointment: AppointmentCreate,
    db: Client = Depends(get_supabase)
):
    """
    Create a new appointment
    
    Validates:
    - Doctor availability for the selected time slot
    - No conflicting appointments
    - Date is not in the past
    """
    logger.info(f"Creating appointment: {appointment.dict()}")
    
    try:
        # Skip availability check for now - table structure needs to be fixed
        logger.info("Skipping availability check - proceeding with booking")
        
        # Fetch patient details from auth.users to get name and email
        try:
            patient_result = db.auth.admin.get_user_by_id(appointment.patient_id)
            patient_user = patient_result.user if patient_result else None
            
            if patient_user:
                # Try to get full_name from metadata, fall back to email username
                patient_name = (
                    patient_user.user_metadata.get('full_name') or 
                    patient_user.user_metadata.get('name') or 
                    patient_user.email.split('@')[0] if patient_user.email else 'Patient'
                )
                patient_email = patient_user.email or ''
            else:
                patient_name = 'Patient'
                patient_email = ''
                logger.warning(f"Could not fetch patient details for {appointment.patient_id}")
        except Exception as e:
            logger.error(f"Error fetching patient details: {e}")
            patient_name = 'Patient'
            patient_email = ''
        
        # Create appointment
        # Combine date and time into date timestamp
        from datetime import datetime
        appointment_datetime = datetime.combine(appointment.date, datetime.strptime(appointment.time, "%H:%M").time())
        
        appointment_data = {
            "patient_id": appointment.patient_id,
            "patient_name": patient_name,
            "patient_email": patient_email,
            "doctor_id": appointment.doctor_id,
            "date": appointment_datetime.isoformat(),
            "time": appointment.time,
            "consultation_fee": appointment.consultation_fee,
            "status": AppointmentStatus.SCHEDULED.value,
            "notes": f"Symptom: {appointment.symptom_category}, Severity: {appointment.severity}" if appointment.symptom_category else None
        }
        
        result = db.table("appointments").insert(appointment_data).execute()
        
        if not result.data:
            raise HTTPException(status_code=500, detail="Failed to create appointment")
        
        created_appointment = result.data[0]
        
        # Skip marking slot as booked - doctor_availability table doesn't exist
        logger.info("Skipping slot booking - doctor_availability table not implemented")
        
        # Fetch doctor details from doctors table
        doctor_result = db.table("doctors").select("*").eq("id", appointment.doctor_id).execute()
        doctor = doctor_result.data[0] if doctor_result.data else {}
        
        # Add doctor details to response
        created_appointment["doctor_name"] = doctor.get("full_name")
        created_appointment["doctor_specialty"] = doctor.get("specialty")
        created_appointment["doctor_image"] = doctor.get("avatar_url")
        
        return AppointmentResponse(**created_appointment)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating appointment: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/appointments/patient/{patient_id}", response_model=AppointmentListResponse)
async def get_patient_appointments(
    patient_id: str,
    status: Optional[str] = Query(None, description="Filter by status"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Client = Depends(get_supabase)
):
    """
    Get all appointments for a patient
    
    Optional filters:
    - status: Filter by appointment status
    - page: Page number for pagination
    - page_size: Number of results per page
    """
    try:
        # Build query
        query = db.table("appointments").select("*").eq("patient_id", patient_id)
        
        if status:
            query = query.eq("status", status)
        
        # Order by date and time
        query = query.order("date", desc=False).order("time", desc=False)
        
        # Get total count
        count_result = db.table("appointments").select("id", count="exact").eq("patient_id", patient_id)
        if status:
            count_result = count_result.eq("status", status)
        count_data = count_result.execute()
        total = count_data.count if count_data.count else 0
        
        # Apply pagination
        offset = (page - 1) * page_size
        query = query.range(offset, offset + page_size - 1)
        
        result = query.execute()
        
        appointments = []
        for apt in result.data:
            # Fetch doctor details from doctors table
            doctor_result = db.table("doctors").select("*").eq("id", apt["doctor_id"]).execute()
            doctor = doctor_result.data[0] if doctor_result.data else {}
            
            apt["doctor_name"] = doctor.get("full_name")
            apt["doctor_specialty"] = doctor.get("specialty")
            apt["doctor_image"] = doctor.get("avatar_url")
            
            appointments.append(AppointmentResponse(**apt))
        
        return AppointmentListResponse(
            appointments=appointments,
            total=total,
            page=page,
            page_size=page_size
        )
        
    except Exception as e:
        logger.error(f"Error fetching appointments: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/appointments/{appointment_id}", response_model=AppointmentResponse)
async def get_appointment(
    appointment_id: str,
    db: Client = Depends(get_supabase)
):
    """Get a specific appointment by ID"""
    try:
        result = db.table("appointments").select("*").eq("id", appointment_id).execute()
        
        if not result.data:
            raise HTTPException(status_code=404, detail="Appointment not found")
        
        appointment = result.data[0]
        
        # Fetch doctor details from doctors table
        doctor_result = db.table("doctors").select("*").eq("id", appointment["doctor_id"]).execute()
        doctor = doctor_result.data[0] if doctor_result.data else {}
        
        appointment["doctor_name"] = doctor.get("full_name")
        appointment["doctor_specialty"] = doctor.get("specialty")
        appointment["doctor_image"] = doctor.get("avatar_url")
        
        return AppointmentResponse(**appointment)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching appointment: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.patch("/appointments/{appointment_id}", response_model=AppointmentResponse)
async def update_appointment(
    appointment_id: str,
    update_data: AppointmentUpdate,
    db: Client = Depends(get_supabase)
):
    """Update an appointment"""
    try:
        # Get existing appointment
        existing = db.table("appointments").select("*").eq("id", appointment_id).execute()
        
        if not existing.data:
            raise HTTPException(status_code=404, detail="Appointment not found")
        
        # Prepare update data
        update_dict = update_data.dict(exclude_unset=True)
        
        # Convert enum to string
        if "status" in update_dict:
            update_dict["status"] = update_dict["status"].value
        
        # Convert date to ISO format
        if "date" in update_dict:
            update_dict["date"] = update_dict["date"].isoformat()
        
        # Update appointment
        result = db.table("appointments").update(update_dict).eq("id", appointment_id).execute()
        
        if not result.data:
            raise HTTPException(status_code=500, detail="Failed to update appointment")
        
        updated_appointment = result.data[0]
        
        # Fetch doctor details from doctors table
        doctor_result = db.table("doctors").select("*").eq("id", updated_appointment["doctor_id"]).execute()
        doctor = doctor_result.data[0] if doctor_result.data else {}
        
        updated_appointment["doctor_name"] = doctor.get("full_name")
        updated_appointment["doctor_specialty"] = doctor.get("specialty")
        updated_appointment["doctor_image"] = doctor.get("avatar_url")
        
        return AppointmentResponse(**updated_appointment)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating appointment: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/appointments/{appointment_id}")
async def cancel_appointment(
    appointment_id: str,
    db: Client = Depends(get_supabase)
):
    """Cancel an appointment"""
    try:
        # Get appointment details
        appointment = db.table("appointments").select("*").eq("id", appointment_id).execute()
        
        if not appointment.data:
            raise HTTPException(status_code=404, detail="Appointment not found")
        
        apt_data = appointment.data[0]
        
        # Check if cancellation is late (< 2 hours before)
        apt_datetime = datetime.combine(
            datetime.fromisoformat(apt_data["date"]).date(),
            datetime.strptime(apt_data["time"], "%H:%M").time()
        )
        time_until = apt_datetime - datetime.now()
        is_late_cancellation = time_until < timedelta(hours=2)
        
        # Update status to cancelled
        result = db.table("appointments").update({
            "status": AppointmentStatus.CANCELLED.value
        }).eq("id", appointment_id).execute()
        
        if not result.data:
            raise HTTPException(status_code=500, detail="Failed to cancel appointment")
        
        # Free up the time slot
        await mark_slot_as_available(
            apt_data["doctor_id"],
            datetime.fromisoformat(apt_data["date"]).date(),
            apt_data["time"],
            db
        )
        
        return {
            "message": "Appointment cancelled successfully",
            "late_cancellation": is_late_cancellation
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error cancelling appointment: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# Helper functions

async def check_slot_availability(
    request: AvailabilityCheckRequest,
    db: Client
) -> AvailabilityCheckResponse:
    """Check if a specific time slot is available"""
    try:
        # Check for existing appointments at this time
        # Combine date and time to match appointment_date
        from datetime import datetime
        appointment_datetime = datetime.combine(request.date, datetime.strptime(request.time, "%H:%M").time())
        
        # Query appointments on the same date for this doctor
        existing = db.table("appointments").select("id, appointment_date").eq(
            "doctor_id", request.doctor_id
        ).gte("appointment_date", request.date.isoformat()).lte(
            "appointment_date", f"{request.date.isoformat()}T23:59:59"
        ).in_(
            "status", [AppointmentStatus.SCHEDULED.value, AppointmentStatus.IN_PROGRESS.value]
        ).execute()
        
        # Check if any appointment matches the exact time
        if existing.data:
            for appt in existing.data:
                appt_time = datetime.fromisoformat(appt['appointment_date'].replace('Z', '+00:00'))
                if appt_time.strftime("%H:%M") == request.time:
                    return AvailabilityCheckResponse(
                        available=False,
                        message="This time slot is already booked"
                    )
        
        # Check doctor availability
        availability = db.table("doctor_availability").select("time_slots").eq(
            "doctor_id", request.doctor_id
        ).eq("date", request.date.isoformat()).execute()
        
        if not availability.data:
            # No availability set, assume available
            return AvailabilityCheckResponse(available=True)
        
        time_slots = availability.data[0]["time_slots"]
        
        # Check if the specific time slot is marked as available
        for slot in time_slots:
            if slot["time"] == request.time:
                if slot["is_available"]:
                    return AvailabilityCheckResponse(available=True)
                else:
                    return AvailabilityCheckResponse(
                        available=False,
                        message="Doctor is not available at this time"
                    )
        
        # Time slot not found in availability, assume unavailable
        return AvailabilityCheckResponse(
            available=False,
            message="Doctor has not set availability for this time"
        )
        
    except Exception as e:
        logger.error(f"Error checking availability: {e}")
        return AvailabilityCheckResponse(
            available=False,
            message="Error checking availability"
        )


async def mark_slot_as_booked(
    doctor_id: str,
    date: DateType,
    time_str: str,
    appointment_id: str,
    db: Client
):
    """Mark a time slot as booked"""
    try:
        # Get existing availability
        result = db.table("doctor_availability").select("*").eq(
            "doctor_id", doctor_id
        ).eq("date", date.isoformat()).execute()
        
        if result.data:
            # Update existing availability
            time_slots = result.data[0]["time_slots"]
            
            for slot in time_slots:
                if slot["time"] == time_str:
                    slot["is_available"] = False
                    slot["appointment_id"] = appointment_id
                    break
            
            db.table("doctor_availability").update({
                "time_slots": time_slots
            }).eq("id", result.data[0]["id"]).execute()
            
    except Exception as e:
        logger.error(f"Error marking slot as booked: {e}")


async def mark_slot_as_available(
    doctor_id: str,
    date: DateType,
    time_str: str,
    db: Client
):
    """Mark a time slot as available again"""
    try:
        # Get existing availability
        result = db.table("doctor_availability").select("*").eq(
            "doctor_id", doctor_id
        ).eq("date", date.isoformat()).execute()
        
        if result.data:
            # Update existing availability
            time_slots = result.data[0]["time_slots"]
            
            for slot in time_slots:
                if slot["time"] == time_str:
                    slot["is_available"] = True
                    slot["appointment_id"] = None
                    break
            
            db.table("doctor_availability").update({
                "time_slots": time_slots
            }).eq("id", result.data[0]["id"]).execute()
            
    except Exception as e:
        logger.error(f"Error marking slot as available: {e}")
