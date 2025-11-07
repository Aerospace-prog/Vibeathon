"""
Example usage of the STT Pipeline for Arogya-AI

This file demonstrates how to use the stt_pipeline module in your WebSocket endpoint.
"""

import asyncio
from app.stt_pipeline import get_stt_pipeline
from app.database import get_database_client

async def example_usage():
    """
    Example: Processing audio from a WebSocket connection
    """
    # Initialize pipeline and database client
    stt_pipeline = get_stt_pipeline()
    db_client = get_database_client()
    
    # Simulate audio chunk (in real implementation, this comes from WebSocket)
    audio_chunk = b"..."  # Raw audio bytes from MediaRecorder
    user_type = "doctor"  # or "patient"
    consultation_id = "123e4567-e89b-12d3-a456-426614174000"
    
    # Process the audio through the complete pipeline
    result = await stt_pipeline.process_audio_stream(
        audio_chunk=audio_chunk,
        user_type=user_type,
        consultation_id=consultation_id,
        db_client=db_client
    )
    
    # Result contains:
    # {
    #     "original_text": "मुझे सिर दर्द है",
    #     "translated_text": "I have a headache",
    #     "speaker_id": "patient"
    # }
    
    print(f"Original: {result['original_text']}")
    print(f"Translated: {result['translated_text']}")
    print(f"Speaker: {result['speaker_id']}")
    
    return result


async def example_websocket_handler(websocket, consultation_id: str, user_type: str):
    """
    Example: WebSocket endpoint handler
    
    This shows how to integrate the STT pipeline into your WebSocket endpoint.
    """
    stt_pipeline = get_stt_pipeline()
    db_client = get_database_client()
    
    try:
        while True:
            # Receive audio chunk from WebSocket
            audio_chunk = await websocket.receive_bytes()
            
            # Process through STT pipeline
            result = await stt_pipeline.process_audio_stream(
                audio_chunk=audio_chunk,
                user_type=user_type,
                consultation_id=consultation_id,
                db_client=db_client
            )
            
            # Send translated caption to the other participant
            # (This would use ConnectionManager in the actual implementation)
            caption_message = {
                "speaker_id": result["speaker_id"],
                "original_text": result["original_text"],
                "translated_text": result["translated_text"],
                "timestamp": asyncio.get_event_loop().time()
            }
            
            # Broadcast to other participant
            # await connection_manager.broadcast_to_other(
            #     consultation_id, user_type, caption_message
            # )
            
    except Exception as e:
        print(f"WebSocket error: {e}")


if __name__ == "__main__":
    # Run example
    asyncio.run(example_usage())
