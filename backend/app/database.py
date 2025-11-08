"""
Database Client Module for Supabase Integration

This module provides methods for interacting with the Supabase database,
including emotion logging, statistics retrieval, and consultation management.
"""

from typing import List, Dict, Optional
from datetime import datetime
import os
from dotenv import load_dotenv
from supabase import create_client, Client

# Load environment variables from .env file
load_dotenv()


class DatabaseClient:
    """
    Database client for Supabase operations.
    
    Handles emotion logs, consultation data, and user statistics.
    """
    
    def __init__(self):
        """Initialize Supabase client with environment variables."""
        supabase_url = os.getenv("SUPABASE_URL")
        supabase_key = os.getenv("SUPABASE_SERVICE_KEY")
        
        if not supabase_url or not supabase_key:
            raise ValueError("SUPABASE_URL and SUPABASE_SERVICE_KEY must be set")
        
        self.client: Client = create_client(supabase_url, supabase_key)
    
    async def log_emotion(
        self,
        user_id: str,
        emotion_type: str,
        confidence_score: float,
        consultation_id: Optional[str] = None
    ) -> Dict:
        """
        Log an emotion detection to the database.
        
        Args:
            user_id: ID of the user (patient)
            emotion_type: Type of emotion detected
            confidence_score: Confidence score (0-1)
            consultation_id: Optional consultation ID
        
        Returns:
            Dictionary with the created emotion log
        """
        try:
            data = {
                "user_id": user_id,
                "emotion_type": emotion_type,
                "confidence_score": confidence_score,
                "created_at": datetime.now().isoformat()
            }
            
            if consultation_id:
                data["consultation_id"] = consultation_id
            
            result = self.client.table("emotion_logs").insert(data).execute()
            return result.data[0] if result.data else {}
        
        except Exception as e:
            print(f"Error logging emotion: {e}")
            return {}
    
    async def get_emotion_stats(self, user_id: str) -> List[Dict]:
        """
        Get aggregated emotion statistics for a user.
        
        Args:
            user_id: ID of the user
        
        Returns:
            List of emotion statistics
        """
        try:
            result = self.client.from_("emotion_stats")\
                .select("*")\
                .eq("user_id", user_id)\
                .execute()
            
            return result.data if result.data else []
        
        except Exception as e:
            print(f"Error fetching emotion stats: {e}")
            return []
    
    async def get_recent_emotions(
        self,
        user_id: str,
        limit: int = 50
    ) -> List[Dict]:
        """
        Get recent emotion detections for a user.
        
        Args:
            user_id: ID of the user
            limit: Maximum number of records to return
        
        Returns:
            List of recent emotion logs
        """
        try:
            result = self.client.table("emotion_logs")\
                .select("*")\
                .eq("user_id", user_id)\
                .order("created_at", desc=True)\
                .limit(limit)\
                .execute()
            
            return result.data if result.data else []
        
        except Exception as e:
            print(f"Error fetching recent emotions: {e}")
            return []
    
    async def get_consultation_emotions(
        self,
        consultation_id: str
    ) -> List[Dict]:
        """
        Get all emotion logs for a specific consultation.
        
        Args:
            consultation_id: ID of the consultation
        
        Returns:
            List of emotion logs for the consultation
        """
        try:
            result = self.client.table("emotion_logs")\
                .select("*")\
                .eq("consultation_id", consultation_id)\
                .order("created_at", desc=False)\
                .execute()
            
            return result.data if result.data else []
        
        except Exception as e:
            print(f"Error fetching consultation emotions: {e}")
            return []
    
    async def get_emotion_summary(self, user_id: str) -> Dict:
        """
        Get a summary of emotion detections for dashboard display.
        
        Args:
            user_id: ID of the user
        
        Returns:
            Dictionary with emotion summary statistics
        """
        try:
            # Get stats from view
            stats = await self.get_emotion_stats(user_id)
            
            # Calculate totals
            total_detections = sum(stat.get("detection_count", 0) for stat in stats)
            
            # Create distribution
            distribution = {}
            for stat in stats:
                emotion_type = stat.get("emotion_type")
                count = stat.get("detection_count", 0)
                if total_detections > 0:
                    distribution[emotion_type] = round((count / total_detections) * 100, 1)
                else:
                    distribution[emotion_type] = 0
            
            # Get most recent emotion
            recent = await self.get_recent_emotions(user_id, limit=1)
            last_emotion = recent[0] if recent else None
            
            return {
                "total_detections": total_detections,
                "distribution": distribution,
                "last_emotion": last_emotion,
                "stats": stats
            }
        
        except Exception as e:
            print(f"Error getting emotion summary: {e}")
            return {
                "total_detections": 0,
                "distribution": {},
                "last_emotion": None,
                "stats": []
            }
    
    async def check_emotion_consent(self, user_id: str) -> bool:
        """
        Check if user has enabled emotion analysis.
        
        Args:
            user_id: ID of the user
        
        Returns:
            True if emotion analysis is enabled, False otherwise
        """
        try:
            result = self.client.table("patients")\
                .select("emotion_analysis_enabled")\
                .eq("id", user_id)\
                .single()\
                .execute()
            
            if result.data:
                return result.data.get("emotion_analysis_enabled", True)
            return True  # Default to enabled
        
        except Exception as e:
            print(f"Error checking emotion consent: {e}")
            return True  # Default to enabled on error
    
    async def delete_user_emotions(self, user_id: str) -> bool:
        """
        Delete all emotion logs for a user (for privacy/GDPR compliance).
        
        Args:
            user_id: ID of the user
        
        Returns:
            True if successful, False otherwise
        """
        try:
            self.client.table("emotion_logs")\
                .delete()\
                .eq("user_id", user_id)\
                .execute()
            
            return True
        
        except Exception as e:
            print(f"Error deleting user emotions: {e}")
            return False
