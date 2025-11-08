"""
Medical Image Analysis API endpoints
"""

from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Depends
from fastapi.responses import JSONResponse
from typing import Optional, List
from uuid import UUID
import os
from datetime import datetime
import json

from .medical_image_analyzer import MedicalImageAnalyzer
from .medical_image_models import (
    MedicalImageResponse,
    ImageComparisonRequest,
    ImageComparisonResponse,
    DoctorNoteUpdate
)
from supabase import create_client, Client

router = APIRouter(prefix="/api/medical-images", tags=["medical-images"])

# Initialize Supabase client
supabase: Client = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_SERVICE_KEY")
)

# Initialize analyzer
analyzer = MedicalImageAnalyzer()

@router.post("/upload", response_model=MedicalImageResponse)
async def upload_medical_image(
    file: UploadFile = File(...),
    patient_id: str = Form(...),
    body_part: Optional[str] = Form(None),
    symptoms: Optional[str] = Form(None),  # JSON string of array
    patient_description: Optional[str] = Form(None),
    image_type: str = Form("other"),
    appointment_id: Optional[str] = Form(None),
    is_follow_up: bool = Form(False),
    parent_image_id: Optional[str] = Form(None)
):
    """
    Upload and analyze a medical image
    
    - **file**: Image file (JPEG, PNG)
    - **patient_id**: UUID of patient
    - **body_part**: Body part shown in image
    - **symptoms**: JSON array of symptoms
    - **patient_description**: Patient's description
    - **image_type**: Type of image (skin_condition, wound, rash, etc.)
    - **appointment_id**: Related appointment (optional)
    - **is_follow_up**: Is this a follow-up image?
    - **parent_image_id**: Original image ID for follow-ups
    """
    try:
        # Validate file type
        if not file.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail="File must be an image")
        
        # Read image data
        image_data = await file.read()
        
        # Validate file size (max 10MB)
        if len(image_data) > 10 * 1024 * 1024:
            raise HTTPException(status_code=400, detail="Image too large (max 10MB)")
        
        # Parse symptoms if provided
        symptoms_list = None
        if symptoms:
            try:
                symptoms_list = json.loads(symptoms)
            except json.JSONDecodeError:
                symptoms_list = [symptoms]
        
        # Upload to Supabase Storage
        file_extension = file.filename.split('.')[-1] if '.' in file.filename else 'jpg'
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        storage_path = f"{patient_id}/{timestamp}_{file.filename}"
        
        storage_response = supabase.storage.from_('medical-images').upload(
            storage_path,
            image_data,
            file_options={"content-type": file.content_type}
        )
        
        # Get public URL
        image_url = supabase.storage.from_('medical-images').get_public_url(storage_path)
        
        # Analyze image with Gemini Vision
        analysis = await analyzer.analyze_image(
            image_data=image_data,
            body_part=body_part,
            symptoms=symptoms_list,
            patient_description=patient_description
        )
        
        # Ensure analysis is a dict, not a string
        if isinstance(analysis, str):
            try:
                analysis = json.loads(analysis)
            except json.JSONDecodeError:
                analysis = {
                    "visual_description": analysis,
                    "severity": "unknown",
                    "possible_conditions": [],
                    "recommendations": {},
                    "disclaimer": "This is not a medical diagnosis. Please consult a healthcare professional."
                }
        
        # Extract key information from analysis
        severity_level = analysis.get('severity', 'unknown')
        detected_conditions = [
            cond.get('name', '') 
            for cond in analysis.get('possible_conditions', [])
        ]
        recommendations_list = []
        if 'recommendations' in analysis:
            recs = analysis['recommendations']
            if isinstance(recs, dict):
                recommendations_list = recs.get('home_care', []) + recs.get('monitoring', [])
        
        requires_immediate = analysis.get('requires_immediate_attention', False)
        
        # Calculate days since previous if follow-up
        days_since_previous = None
        if is_follow_up and parent_image_id:
            try:
                parent = supabase.table('medical_images').select('uploaded_at').eq('id', parent_image_id).single().execute()
                if parent.data:
                    parent_date = datetime.fromisoformat(parent.data['uploaded_at'].replace('Z', '+00:00'))
                    days_since_previous = (datetime.now() - parent_date).days
            except Exception as e:
                print(f"Error calculating days since previous: {e}")
        
        # Save to database
        image_record = {
            'patient_id': patient_id,
            'appointment_id': appointment_id if appointment_id else None,
            'image_url': image_url,
            'storage_path': storage_path,
            'image_type': image_type,
            'body_part': body_part,
            'patient_description': patient_description,
            'symptoms': symptoms_list,
            'ai_analysis': analysis,
            'severity_level': severity_level,
            'detected_conditions': detected_conditions,
            'recommendations': recommendations_list,
            'requires_immediate_attention': requires_immediate,
            'analyzed_at': datetime.now().isoformat(),
            'is_follow_up': is_follow_up,
            'parent_image_id': parent_image_id if parent_image_id else None,
            'days_since_previous': days_since_previous
        }
        
        result = supabase.table('medical_images').insert(image_record).execute()
        
        if not result.data:
            raise HTTPException(status_code=500, detail="Failed to save image record")
        
        return result.data[0]
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error uploading medical image: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to upload image: {str(e)}")

@router.get("/patient/{patient_id}", response_model=List[MedicalImageResponse])
async def get_patient_images(patient_id: str, limit: int = 50):
    """Get all medical images for a patient"""
    try:
        result = supabase.table('medical_images')\
            .select('*')\
            .eq('patient_id', patient_id)\
            .order('uploaded_at', desc=True)\
            .limit(limit)\
            .execute()
        
        return result.data
        
    except Exception as e:
        print(f"Error fetching patient images: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{image_id}", response_model=MedicalImageResponse)
async def get_image(image_id: str):
    """Get a specific medical image"""
    try:
        result = supabase.table('medical_images')\
            .select('*')\
            .eq('id', image_id)\
            .single()\
            .execute()
        
        if not result.data:
            raise HTTPException(status_code=404, detail="Image not found")
        
        return result.data
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error fetching image: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/compare")
async def compare_images(request: ImageComparisonRequest):
    """Compare two images to track healing progress"""
    try:
        # Get both images
        before = supabase.table('medical_images').select('*').eq('id', str(request.before_image_id)).single().execute()
        after = supabase.table('medical_images').select('*').eq('id', str(request.after_image_id)).single().execute()
        
        if not before.data or not after.data:
            raise HTTPException(status_code=404, detail="One or both images not found")
        
        # Download images from storage
        before_data = supabase.storage.from_('medical-images').download(before.data['storage_path'])
        after_data = supabase.storage.from_('medical-images').download(after.data['storage_path'])
        
        # Calculate days between
        before_date = datetime.fromisoformat(before.data['uploaded_at'].replace('Z', '+00:00'))
        after_date = datetime.fromisoformat(after.data['uploaded_at'].replace('Z', '+00:00'))
        days_between = (after_date - before_date).days
        
        # Compare images
        comparison = await analyzer.compare_images(
            before_image_data=before_data,
            after_image_data=after_data,
            days_between=days_between,
            condition_type=request.condition_type
        )
        
        return comparison
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error comparing images: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/{image_id}/doctor-notes")
async def add_doctor_notes(image_id: str, notes: DoctorNoteUpdate, doctor_id: str):
    """Add doctor's notes to a medical image"""
    try:
        update_data = {
            'doctor_notes': notes.doctor_notes,
            'doctor_reviewed_at': datetime.now().isoformat(),
            'doctor_reviewed_by': doctor_id
        }
        
        result = supabase.table('medical_images')\
            .update(update_data)\
            .eq('id', image_id)\
            .execute()
        
        if not result.data:
            raise HTTPException(status_code=404, detail="Image not found")
        
        return result.data[0]
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error adding doctor notes: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{image_id}")
async def delete_image(image_id: str, patient_id: str):
    """Delete a medical image"""
    try:
        # Get image to get storage path
        image = supabase.table('medical_images').select('storage_path, patient_id').eq('id', image_id).single().execute()
        
        if not image.data:
            raise HTTPException(status_code=404, detail="Image not found")
        
        # Verify patient owns the image
        if image.data['patient_id'] != patient_id:
            raise HTTPException(status_code=403, detail="Not authorized to delete this image")
        
        # Delete from storage
        supabase.storage.from_('medical-images').remove([image.data['storage_path']])
        
        # Delete from database
        supabase.table('medical_images').delete().eq('id', image_id).execute()
        
        return {"message": "Image deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error deleting image: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/appointment/{appointment_id}", response_model=List[MedicalImageResponse])
async def get_appointment_images(appointment_id: str):
    """Get all images related to an appointment"""
    try:
        result = supabase.table('medical_images')\
            .select('*')\
            .eq('appointment_id', appointment_id)\
            .order('uploaded_at', desc=True)\
            .execute()
        
        return result.data
        
    except Exception as e:
        print(f"Error fetching appointment images: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
