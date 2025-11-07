<<<<<<< HEAD
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

load_dotenv()

app = FastAPI(title="Arogya-AI Backend", version="1.0.0")

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("FRONTEND_URL", "http://localhost:3000")],
=======
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
import os
import logging
import time
from typing import Optional

# Import modules
from app.connection_manager import ConnectionManager
from app.models import (
    LexiconTerm,
    SoapGenerationResponse,
    SoapNoteResponse,
    StigmaSuggestion,
    ErrorResponse
)
from app.stt_pipeline import get_stt_pipeline
from app.summarizer import generate_notes_with_empathy
from app.database import get_database_client

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Arogya-AI Telehealth API",
    description="Backend API for Arogya-AI telehealth platform with real-time translation and SOAP note generation",
    version="1.0.0"
)

# Initialize WebSocket connection manager
manager = ConnectionManager()

# Configure CORS for Next.js frontend
origins = [
    "http://localhost:3000",  # Next.js development server
    "http://127.0.0.1:3000",
    # Add production domain when deployed
    # "https://yourdomain.com"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
>>>>>>> 8c02c68a975937490994437626cbdcc74e65ea28
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

<<<<<<< HEAD
@app.get("/health")
async def health_check():
    """Health check endpoint for monitoring"""
    return {
        "status": "healthy",
        "service": "arogya-ai-backend",
        "version": "1.0.0"
    }

@app.get("/")
async def root():
    return {"message": "Arogya-AI Backend API"}
=======
@app.get("/")
async def root():
    """Root endpoint"""
    return {"message": "Arogya-AI Telehealth API", "status": "running"}

@app.get("/health")
async def health_check():
    """
    Health check endpoint for monitoring.
    Returns service status and dependencies health.
    
    Requirements: Task 10.4
    """
    # Check database connectivity
    db_status = "unknown"
    try:
        db_client = get_database_client()
        db_status = "healthy"
    except Exception as e:
        logger.error(f"Database health check failed: {e}")
        db_status = "unhealthy"
    
    # Check STT pipeline initialization
    stt_status = "unknown"
    try:
        stt_pipeline = get_stt_pipeline()
        stt_status = "healthy"
    except Exception as e:
        logger.error(f"STT pipeline health check failed: {e}")
        stt_status = "unhealthy"
    
    # Overall status
    overall_status = "healthy" if db_status == "healthy" and stt_status == "healthy" else "degraded"
    
    return {
        "status": overall_status,
        "service": "arogya-ai-backend",
        "version": "1.0.0",
        "dependencies": {
            "database": db_status,
            "stt_pipeline": stt_status
        },
        "active_consultations": len(manager.get_active_consultations())
    }


@app.websocket("/ws/{consultation_id}/{user_type}")
async def websocket_endpoint(websocket: WebSocket, consultation_id: str, user_type: str):
    """
    WebSocket endpoint for real-time audio streaming and caption broadcasting.
    
    This endpoint:
    1. Accepts binary audio chunks from the client
    2. Processes audio through STT pipeline (ASR → Lexicon → Translation)
    3. Broadcasts translated captions to the other participant
    4. Appends transcripts to the database in real-time
    
    Args:
        websocket: WebSocket connection
        consultation_id: UUID of the consultation session
        user_type: 'doctor' or 'patient'
    
    Requirements: 3.1, 3.2, 3.5, 4.3, 4.6, 4.7
    """
    # Validate user_type
    if user_type not in ['doctor', 'patient']:
        await websocket.close(code=1008, reason="Invalid user_type. Must be 'doctor' or 'patient'")
        return
    
    # Connect to WebSocket manager
    try:
        await manager.connect(consultation_id, user_type, websocket)
        logger.info(f"WebSocket connected: consultation={consultation_id}, user={user_type}")
    except Exception as e:
        logger.error(f"Failed to connect WebSocket: {e}")
        await websocket.close(code=1011, reason="Connection failed")
        return
    
    # Get dependencies
    try:
        stt_pipeline = get_stt_pipeline()
        db_client = get_database_client()
    except Exception as e:
        logger.error(f"Failed to initialize dependencies: {e}")
        await manager.disconnect(consultation_id, user_type)
        await websocket.close(code=1011, reason="Service initialization failed")
        return
    
    try:
        while True:
            # Receive binary audio chunk from client
            audio_chunk = await websocket.receive_bytes()
            
            logger.debug(f"Received audio chunk: {len(audio_chunk)} bytes from {user_type}")
            
            # Process audio through STT pipeline
            result = await stt_pipeline.process_audio_stream(
                audio_chunk=audio_chunk,
                user_type=user_type,
                consultation_id=consultation_id,
                db_client=db_client
            )
            
            # Check if transcription was successful
            if not result.get("original_text"):
                logger.warning(f"Empty transcription for {user_type}")
                continue
            
            # Prepare caption message
            caption_message = {
                "type": "caption",
                "speaker_id": result["speaker_id"],
                "original_text": result["original_text"],
                "translated_text": result["translated_text"],
                "timestamp": time.time()
            }
            
            # Broadcast translated caption to the other participant
            broadcast_success = await manager.broadcast_to_other(
                consultation_id=consultation_id,
                sender_type=user_type,
                message=caption_message
            )
            
            if broadcast_success:
                logger.debug(f"Caption broadcasted from {user_type} to other participant")
            else:
                logger.debug(f"Other participant not connected for consultation {consultation_id}")
            
            # Send acknowledgment back to sender (optional)
            await websocket.send_json({
                "type": "ack",
                "message": "Audio processed successfully"
            })
            
    except WebSocketDisconnect:
        logger.info(f"WebSocket disconnected: consultation={consultation_id}, user={user_type}")
    except Exception as e:
        logger.error(f"Error in WebSocket handler: {e}")
    finally:
        # Clean up connection
        await manager.disconnect(consultation_id, user_type)
        logger.info(f"WebSocket cleanup complete: consultation={consultation_id}, user={user_type}")


@app.post("/consultation/{consultation_id}/generate_soap", response_model=SoapGenerationResponse)
async def generate_soap_note(consultation_id: str):
    """
    Generate SOAP note with Compassion Reflex de-stigmatization suggestions.
    
    This endpoint:
    1. Fetches the full transcript from the database
    2. Calls the summarizer to generate SOAP note and empathy suggestions
    3. Saves the results to the consultations table
    4. Returns the complete response
    
    Args:
        consultation_id: UUID of the consultation session
    
    Returns:
        SoapGenerationResponse with raw_soap_note and de_stigma_suggestions
    
    Requirements: 6.1, 6.5, 7.5
    """
    try:
        # Get database client
        db_client = get_database_client()
        
        # Fetch full transcript
        logger.info(f"Fetching transcript for consultation {consultation_id}")
        full_transcript = await db_client.get_full_transcript(consultation_id)
        
        if not full_transcript or not full_transcript.strip():
            raise HTTPException(
                status_code=404,
                detail="Transcript not found or empty for this consultation"
            )
        
        # Generate SOAP note with Compassion Reflex
        logger.info(f"Generating SOAP note for consultation {consultation_id}")
        raw_soap_note, de_stigma_suggestions = await generate_notes_with_empathy(full_transcript)
        
        # Save to database
        logger.info(f"Saving SOAP note to database for consultation {consultation_id}")
        save_success = await db_client.save_soap_note(
            consultation_id=consultation_id,
            soap=raw_soap_note,
            suggestions={"suggestions": de_stigma_suggestions}
        )
        
        if not save_success:
            logger.error(f"Failed to save SOAP note for consultation {consultation_id}")
            raise HTTPException(
                status_code=500,
                detail="Failed to save SOAP note to database"
            )
        
        # Prepare response
        soap_response = SoapNoteResponse(**raw_soap_note)
        stigma_suggestions = [StigmaSuggestion(**s) for s in de_stigma_suggestions]
        
        response = SoapGenerationResponse(
            raw_soap_note=soap_response,
            de_stigma_suggestions=stigma_suggestions,
            consultation_id=consultation_id
        )
        
        logger.info(f"SOAP note generated successfully for consultation {consultation_id}")
        return response
        
    except HTTPException:
        raise
    except ValueError as e:
        logger.error(f"Validation error: {e}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error generating SOAP note: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )


@app.post("/community_lexicon/add")
async def add_lexicon_term(term: LexiconTerm, doctor_id: Optional[str] = None):
    """
    Add a new term to the Community Lexicon.
    
    This endpoint:
    1. Accepts a LexiconTerm with English and regional equivalents
    2. Generates a 384-dimension embedding using sentence-transformers (gte-small)
    3. Inserts the term and embedding into the medical_lexicon table
    
    Args:
        term: LexiconTerm with term_english, term_regional, language
        doctor_id: UUID of the doctor submitting the term (from auth in production)
    
    Returns:
        Success message with term details
    
    Requirements: 5.1, 5.2, 5.3
    """
    try:
        # Get dependencies
        db_client = get_database_client()
        stt_pipeline = get_stt_pipeline()
        
        # Check if embedding model is available
        if not stt_pipeline.embedding_model:
            raise HTTPException(
                status_code=503,
                detail="Embedding model not available. Please check server configuration."
            )
        
        # Generate embedding for the regional term
        logger.info(f"Generating embedding for term: {term.term_regional}")
        embedding = stt_pipeline.embedding_model.encode(term.term_regional)
        embedding_list = embedding.tolist()
        
        # Validate embedding dimension (should be 384 for gte-small)
        if len(embedding_list) != 384:
            raise HTTPException(
                status_code=500,
                detail=f"Invalid embedding dimension: {len(embedding_list)}. Expected 384."
            )
        
        # Use placeholder doctor_id if not provided (in production, get from auth)
        # TODO: Replace with actual authenticated user ID from JWT token
        if not doctor_id:
            doctor_id = "00000000-0000-0000-0000-000000000000"  # Placeholder
            logger.warning("Using placeholder doctor_id. Implement authentication in production.")
        
        # Add term to database
        logger.info(f"Adding lexicon term: {term.term_regional} ({term.language}) -> {term.term_english}")
        success = await db_client.add_lexicon_term(
            term_english=term.term_english,
            term_regional=term.term_regional,
            language=term.language,
            doctor_id=doctor_id,
            embedding=embedding_list
        )
        
        if not success:
            raise HTTPException(
                status_code=500,
                detail="Failed to add term to database"
            )
        
        logger.info(f"Successfully added lexicon term: {term.term_regional}")
        return {
            "status": "success",
            "message": "Term added to Community Lexicon",
            "term": {
                "english": term.term_english,
                "regional": term.term_regional,
                "language": term.language
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error adding lexicon term: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )
>>>>>>> 8c02c68a975937490994437626cbdcc74e65ea28
