<<<<<<< HEAD
from fastapi import WebSocket
from typing import Dict, List

class ConnectionManager:
    """Manages WebSocket connections for consultations"""
    
    def __init__(self):
        # Structure: {consultation_id: {user_type: WebSocket}}
        self.active_connections: Dict[str, Dict[str, WebSocket]] = {}
    
    async def connect(self, websocket: WebSocket, consultation_id: str, user_type: str):
        """Accept and track WebSocket connection"""
        await websocket.accept()
        
        if consultation_id not in self.active_connections:
            self.active_connections[consultation_id] = {}
        
        self.active_connections[consultation_id][user_type] = websocket
    
    def disconnect(self, consultation_id: str, user_type: str):
        """Remove WebSocket connection"""
        if consultation_id in self.active_connections:
            if user_type in self.active_connections[consultation_id]:
                del self.active_connections[consultation_id][user_type]
            
            # Clean up empty consultation entries
            if not self.active_connections[consultation_id]:
                del self.active_connections[consultation_id]
=======
"""
WebSocket Connection Manager for Arogya-AI Telehealth Platform

This module manages WebSocket connections for real-time audio streaming and caption
broadcasting during video consultations. It tracks active connections per consultation
and enables bidirectional communication between doctors and patients.

Requirements: 3.2, 4.3, 4.7
"""

from fastapi import WebSocket
from typing import Dict, Optional
import logging
import json

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class ConnectionManager:
    """
    Manages WebSocket connections for consultation rooms.
    
    Each consultation can have up to two active connections:
    - One for the doctor
    - One for the patient
    
    The manager handles connection tracking, message broadcasting, and cleanup.
    """
    
    def __init__(self):
        """Initialize the connection manager with empty connection tracking."""
        # Structure: {consultation_id: {user_type: WebSocket}}
        # Example: {"uuid-123": {"doctor": WebSocket, "patient": WebSocket}}
        self.active_connections: Dict[str, Dict[str, WebSocket]] = {}
        logger.info("ConnectionManager initialized")
    
    async def connect(self, consultation_id: str, user_type: str, websocket: WebSocket) -> None:
        """
        Accept and track a new WebSocket connection for a consultation.
        
        Args:
            consultation_id: Unique identifier for the consultation session
            user_type: Type of user connecting ('doctor' or 'patient')
            websocket: The WebSocket connection instance
            
        Raises:
            ValueError: If user_type is not 'doctor' or 'patient'
        """
        # Validate user_type
        if user_type not in ['doctor', 'patient']:
            raise ValueError(f"Invalid user_type: {user_type}. Must be 'doctor' or 'patient'")
        
        # Accept the WebSocket connection
        await websocket.accept()
        
        # Initialize consultation room if it doesn't exist
        if consultation_id not in self.active_connections:
            self.active_connections[consultation_id] = {}
            logger.info(f"Created new consultation room: {consultation_id}")
        
        # Store the connection
        self.active_connections[consultation_id][user_type] = websocket
        
        logger.info(
            f"Connected: consultation_id={consultation_id}, user_type={user_type}, "
            f"active_in_room={len(self.active_connections[consultation_id])}"
        )
        
        # Notify the other participant if they're already connected
        other_type = 'patient' if user_type == 'doctor' else 'doctor'
        if other_type in self.active_connections[consultation_id]:
            await self.broadcast_to_other(
                consultation_id=consultation_id,
                sender_type=user_type,
                message={
                    "type": "participant_joined",
                    "user_type": user_type,
                    "message": f"{user_type.capitalize()} has joined the consultation"
                }
            )
    
    async def disconnect(self, consultation_id: str, user_type: str) -> None:
        """
        Remove a WebSocket connection and perform cleanup.
        
        Args:
            consultation_id: Unique identifier for the consultation session
            user_type: Type of user disconnecting ('doctor' or 'patient')
        """
        # Check if consultation exists
        if consultation_id not in self.active_connections:
            logger.warning(f"Disconnect called for non-existent consultation: {consultation_id}")
            return
        
        # Remove the specific connection
        if user_type in self.active_connections[consultation_id]:
            del self.active_connections[consultation_id][user_type]
            logger.info(f"Disconnected: consultation_id={consultation_id}, user_type={user_type}")
            
            # Notify the other participant if they're still connected
            other_type = 'patient' if user_type == 'doctor' else 'doctor'
            if other_type in self.active_connections[consultation_id]:
                try:
                    await self.broadcast_to_other(
                        consultation_id=consultation_id,
                        sender_type=user_type,
                        message={
                            "type": "participant_left",
                            "user_type": user_type,
                            "message": f"{user_type.capitalize()} has left the consultation"
                        }
                    )
                except Exception as e:
                    logger.error(f"Error notifying participant of disconnect: {e}")
        
        # Clean up empty consultation rooms
        if not self.active_connections[consultation_id]:
            del self.active_connections[consultation_id]
            logger.info(f"Cleaned up empty consultation room: {consultation_id}")
>>>>>>> 8c02c68a975937490994437626cbdcc74e65ea28
    
    async def broadcast_to_other(
        self, 
        consultation_id: str, 
        sender_type: str, 
        message: dict
<<<<<<< HEAD
    ):
        """Send message to the other participant in the consultation"""
        if consultation_id not in self.active_connections:
            return
        
        # Determine recipient type
        recipient_type = "patient" if sender_type == "doctor" else "doctor"
        
        # Send to recipient if connected
        if recipient_type in self.active_connections[consultation_id]:
            recipient_ws = self.active_connections[consultation_id][recipient_type]
            await recipient_ws.send_json(message)

# Singleton instance
manager = ConnectionManager()
=======
    ) -> bool:
        """
        Send a message to the other participant in a consultation.
        
        This method broadcasts messages from one participant to the other.
        For example, when a doctor speaks, the translated caption is sent to the patient.
        
        Args:
            consultation_id: Unique identifier for the consultation session
            sender_type: Type of user sending the message ('doctor' or 'patient')
            message: Dictionary containing the message data to broadcast
            
        Returns:
            bool: True if message was sent successfully, False otherwise
            
        Raises:
            ValueError: If sender_type is not 'doctor' or 'patient'
        """
        # Validate sender_type
        if sender_type not in ['doctor', 'patient']:
            raise ValueError(f"Invalid sender_type: {sender_type}. Must be 'doctor' or 'patient'")
        
        # Check if consultation exists
        if consultation_id not in self.active_connections:
            logger.warning(
                f"Broadcast attempted for non-existent consultation: {consultation_id}"
            )
            return False
        
        # Determine the recipient (the other participant)
        recipient_type = 'patient' if sender_type == 'doctor' else 'doctor'
        
        # Check if recipient is connected
        if recipient_type not in self.active_connections[consultation_id]:
            logger.debug(
                f"Recipient not connected: consultation_id={consultation_id}, "
                f"recipient_type={recipient_type}"
            )
            return False
        
        # Get the recipient's WebSocket connection
        recipient_websocket = self.active_connections[consultation_id][recipient_type]
        
        try:
            # Send the message as JSON
            await recipient_websocket.send_json(message)
            logger.debug(
                f"Broadcast successful: consultation_id={consultation_id}, "
                f"from={sender_type}, to={recipient_type}"
            )
            return True
            
        except Exception as e:
            logger.error(
                f"Error broadcasting message: consultation_id={consultation_id}, "
                f"from={sender_type}, to={recipient_type}, error={str(e)}"
            )
            # Connection might be broken, clean it up
            await self.disconnect(consultation_id, recipient_type)
            return False
    
    def get_active_consultations(self) -> Dict[str, list]:
        """
        Get a summary of all active consultations.
        
        Returns:
            Dictionary mapping consultation IDs to lists of connected user types
        """
        return {
            consultation_id: list(connections.keys())
            for consultation_id, connections in self.active_connections.items()
        }
    
    def is_consultation_active(self, consultation_id: str) -> bool:
        """
        Check if a consultation has any active connections.
        
        Args:
            consultation_id: Unique identifier for the consultation session
            
        Returns:
            bool: True if consultation has at least one active connection
        """
        return consultation_id in self.active_connections and \
               len(self.active_connections[consultation_id]) > 0
    
    def get_connection_count(self, consultation_id: str) -> int:
        """
        Get the number of active connections for a consultation.
        
        Args:
            consultation_id: Unique identifier for the consultation session
            
        Returns:
            int: Number of active connections (0-2)
        """
        if consultation_id not in self.active_connections:
            return 0
        return len(self.active_connections[consultation_id])
>>>>>>> 8c02c68a975937490994437626cbdcc74e65ea28
