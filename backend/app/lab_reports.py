"""
Lab Reports API Routes
Handles file upload, text extraction, and AI analysis
"""

from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from fastapi.responses import JSONResponse
from typing import Optional
import os
import uuid
import shutil
from pathlib import Path

from .lab_report_analyzer import get_lab_report_analyzer
from .database import DatabaseClient

router = APIRouter(prefix="/api/lab-reports", tags=["Lab Reports"])

# Create uploads directory if it doesn't exist
UPLOAD_DIR = Path("uploads/lab_reports")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

db_client = DatabaseClient()


@router.post("/upload")
async def upload_lab_report(
    file: UploadFile = File(...),
    patient_id: str = Form(...)
):
    """
    Upload and analyze a lab report (PDF or image)
    """
    try:
        # Validate file type
        file_extension = file.filename.split('.')[-1].lower()
        allowed_extensions = ['pdf', 'jpg', 'jpeg', 'png']
        
        if file_extension not in allowed_extensions:
            raise HTTPException(
                status_code=400,
                detail=f"File type not supported. Allowed types: {', '.join(allowed_extensions)}"
            )
        
        # Generate unique filename
        file_id = str(uuid.uuid4())
        file_name = f"{file_id}.{file_extension}"
        file_path = UPLOAD_DIR / file_name
        
        # Save file
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Determine file type for processing
        file_type = 'pdf' if file_extension == 'pdf' else 'image'
        
        # Process and analyze
        analyzer = get_lab_report_analyzer()
        result = await analyzer.process_lab_report(str(file_path), file_type)
        
        if not result['success']:
            # Clean up file
            os.remove(file_path)
            raise HTTPException(status_code=400, detail=result.get('error', 'Analysis failed'))
        
        # Save to database
        lab_report_data = {
            'patient_id': patient_id,
            'file_name': file.filename,
            'file_path': str(file_path),
            'file_type': file_type,
            'extracted_text': result['extracted_text'],
            'analysis_result': result['analysis'],
            'status': 'completed'
        }
        
        # Insert into database
        db_result = db_client.client.table('lab_reports').insert(lab_report_data).execute()
        
        return JSONResponse(content={
            "success": True,
            "message": "Lab report analyzed successfully",
            "report_id": db_result.data[0]['id'] if db_result.data else None,
            "analysis": result['analysis']
        })
        
    except HTTPException:
        raise
    except Exception as e:
        # Clean up file if it exists
        if 'file_path' in locals() and os.path.exists(file_path):
            os.remove(file_path)
        
        raise HTTPException(status_code=500, detail=f"Error processing lab report: {str(e)}")


@router.get("/patient/{patient_id}")
async def get_patient_lab_reports(patient_id: str):
    """
    Get all lab reports for a patient
    """
    try:
        result = db_client.client.table('lab_reports')\
            .select('*')\
            .eq('patient_id', patient_id)\
            .order('uploaded_at', desc=True)\
            .execute()
        
        return JSONResponse(content={
            "success": True,
            "reports": result.data
        })
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching lab reports: {str(e)}")


@router.get("/{report_id}")
async def get_lab_report(report_id: str):
    """
    Get a specific lab report by ID
    """
    try:
        result = db_client.client.table('lab_reports')\
            .select('*')\
            .eq('id', report_id)\
            .single()\
            .execute()
        
        if not result.data:
            raise HTTPException(status_code=404, detail="Lab report not found")
        
        return JSONResponse(content={
            "success": True,
            "report": result.data
        })
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching lab report: {str(e)}")


@router.delete("/{report_id}")
async def delete_lab_report(report_id: str):
    """
    Delete a lab report
    """
    try:
        # Get report to find file path
        result = db_client.client.table('lab_reports')\
            .select('file_path')\
            .eq('id', report_id)\
            .single()\
            .execute()
        
        if not result.data:
            raise HTTPException(status_code=404, detail="Lab report not found")
        
        # Delete file if it exists
        file_path = result.data.get('file_path')
        if file_path and os.path.exists(file_path):
            os.remove(file_path)
        
        # Delete from database
        db_client.client.table('lab_reports').delete().eq('id', report_id).execute()
        
        return JSONResponse(content={
            "success": True,
            "message": "Lab report deleted successfully"
        })
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting lab report: {str(e)}")
