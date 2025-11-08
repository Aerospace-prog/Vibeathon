"""
WebRTC Signaling Server for Video Calls
Handles offer/answer/ICE candidate exchange between peers
"""

from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from typing import Dict, Set
import json
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

class SignalingServer:
    def __init__(self):
        # Store active connections per consultation room
        # Format: {room_id: {websocket1, websocket2}}
        self.rooms: Dict[str, Set[WebSocket]] = {}
        # Track user types per connection
        self.user_types: Dict[WebSocket, str] = {}
    
    async def connect(self, websocket: WebSocket, room_id: str, user_type: str):
        """Add a new connection to a room"""
        await websocket.accept()
        
        if room_id not in self.rooms:
            self.rooms[room_id] = set()
        
        self.rooms[room_id].add(websocket)
        self.user_types[websocket] = user_type
        
        logger.info(f"✅ {user_type} joined room {room_id}. Total in room: {len(self.rooms[room_id])}")
        
        # Notify others in the room
        await self.broadcast(room_id, {
            "type": "user-joined",
            "userType": user_type,
            "totalUsers": len(self.rooms[room_id])
        }, websocket)
    
    def disconnect(self, websocket: WebSocket, room_id: str):
        """Remove a connection from a room"""
        if room_id in self.rooms:
            self.rooms[room_id].discard(websocket)
            user_type = self.user_types.pop(websocket, "unknown")
            
            logger.info(f"❌ {user_type} left room {room_id}. Remaining: {len(self.rooms[room_id])}")
            
            # Clean up empty rooms
            if not self.rooms[room_id]:
                del self.rooms[room_id]
    
    async def broadcast(self, room_id: str, message: dict, sender: WebSocket):
        """Send message to all peers in room except sender"""
        if room_id not in self.rooms:
            return
        
        disconnected = []
        for connection in self.rooms[room_id]:
            if connection != sender:
                try:
                    await connection.send_json(message)
                except Exception as e:
                    logger.error(f"Error sending to peer: {e}")
                    disconnected.append(connection)
        
        # Clean up disconnected peers
        for conn in disconnected:
            self.disconnect(conn, room_id)

# Global signaling server instance
signaling = SignalingServer()


@router.websocket("/ws/signaling/{consultation_id}/{user_type}")
async def signaling_endpoint(
    websocket: WebSocket,
    consultation_id: str,
    user_type: str
):
    """
    WebRTC signaling endpoint
    Handles offer/answer/ICE candidate exchange between peers
    """
    await signaling.connect(websocket, consultation_id, user_type)
    
    try:
        while True:
            # Receive signaling message from client
            data = await websocket.receive_json()
            
            logger.info(f"📡 Signaling message from {user_type}: {data.get('type')}")
            
            # Forward message to other peer(s) in the room
            await signaling.broadcast(consultation_id, data, websocket)
            
    except WebSocketDisconnect:
        logger.info(f"🔌 {user_type} disconnected from signaling")
        signaling.disconnect(websocket, consultation_id)
    except Exception as e:
        logger.error(f"❌ Signaling error: {e}")
        signaling.disconnect(websocket, consultation_id)
