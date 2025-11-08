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
        # Track connections by user type to prevent duplicates
        self.connections_by_type: Dict[str, Dict[str, WebSocket]] = {}  # {room_id: {user_type: websocket}}
    
    async def connect(self, websocket: WebSocket, room_id: str, user_type: str):
        """Add a new connection to a room"""
        await websocket.accept()
        
        # Initialize room if needed
        if room_id not in self.rooms:
            self.rooms[room_id] = set()
            self.connections_by_type[room_id] = {}
        
        # Remove old connection for this user type if exists (prevent duplicates)
        if room_id in self.connections_by_type and user_type in self.connections_by_type[room_id]:
            old_ws = self.connections_by_type[room_id][user_type]
            if old_ws in self.rooms[room_id]:
                logger.info(f"🔄 Removing old connection for {user_type} in room {room_id}")
                self.rooms[room_id].discard(old_ws)
                self.user_types.pop(old_ws, None)
                try:
                    await old_ws.close()
                except:
                    pass
        
        # Add new connection
        self.rooms[room_id].add(websocket)
        self.user_types[websocket] = user_type
        self.connections_by_type[room_id][user_type] = websocket
        
        logger.info(f"✅ {user_type} joined room {room_id}. Total in room: {len(self.rooms[room_id])}")
        
        # Notify others in the room (exclude sender)
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
            
            # Remove from connections_by_type
            if room_id in self.connections_by_type:
                if user_type in self.connections_by_type[room_id]:
                    if self.connections_by_type[room_id][user_type] == websocket:
                        del self.connections_by_type[room_id][user_type]
            
            logger.info(f"❌ {user_type} left room {room_id}. Remaining: {len(self.rooms[room_id])}")
            
            # Clean up empty rooms
            if not self.rooms[room_id]:
                del self.rooms[room_id]
                if room_id in self.connections_by_type:
                    del self.connections_by_type[room_id]
    
    async def broadcast(self, room_id: str, message: dict, sender: WebSocket):
        """Send message to all peers in room except sender"""
        if room_id not in self.rooms:
            logger.warning(f"⚠️ Room {room_id} not found for broadcast")
            return
        
        sender_type = self.user_types.get(sender, "unknown")
        logger.info(f"📤 Broadcasting {message.get('type')} from {sender_type} to room {room_id}")
        
        disconnected = []
        sent_count = 0
        for connection in list(self.rooms[room_id]):  # Create a copy to iterate safely
            if connection != sender:
                try:
                    await connection.send_json(message)
                    sent_count += 1
                    logger.info(f"✅ Sent {message.get('type')} to {self.user_types.get(connection, 'unknown')}")
                except Exception as e:
                    logger.error(f"❌ Error sending to peer: {e}")
                    disconnected.append(connection)
        
        logger.info(f"📊 Broadcast complete: sent to {sent_count} peer(s)")
        
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
