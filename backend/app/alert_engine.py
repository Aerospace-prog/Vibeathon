"""
AI-Powered Alert Engine using Google Gemini

This module uses Google Gemini AI to intelligently analyze patient symptoms
in ANY language and provide accurate severity assessment and recommendations.
"""

import re
import os
import json
from datetime import datetime, timedelta
from typing import Optional, Dict
from pydantic import BaseModel
import google.generativeai as genai
from dotenv import load_dotenv

# Load environment variables
load_dotenv()


class Alert(BaseModel):
    """Medical alert with AI-analyzed symptom details."""
    symptom_text: str
    symptom_type: str
    severity_score: int
    timestamp: datetime
    ai_analysis: Optional[str] = None
    recommendations: Optional[str] = None
    
    def to_dict(self) -> dict:
        return {
            "symptom_text": self.symptom_text,
            "symptom_type": self.symptom_type,
            "severity_score": self.severity_score,
            "timestamp": self.timestamp.isoformat(),
            "ai_analysis": self.ai_analysis,
            "recommendations": self.recommendations
        }


class AlertEngine:
    """
    AI-Powered medical alert detection engine using Google Gemini.
    
    This engine can understand symptoms described in ANY way, in ANY language,
    and provide intelligent severity assessment and recommendations.
    """
    
    def __init__(self):
        """Initialize the Alert Engine with Gemini AI."""
        self.alert_cache: Dict[tuple, datetime] = {}
        
        # Initialize Gemini AI
        api_key = os.getenv("GEMINI_API_KEY")
        print(f"[AlertEngine] Checking for GEMINI_API_KEY...")
        print(f"[AlertEngine] API Key found: {'Yes' if api_key else 'No'}")
        
        if api_key and api_key != "your_gemini_api_key_here":
            try:
                print(f"[AlertEngine] Configuring Gemini with key: {api_key[:20]}...")
                genai.configure(api_key=api_key)
                # Use Gemini 2.5 Flash for faster, more reliable responses
                self.model = genai.GenerativeModel('models/gemini-2.5-flash')
                self.ai_enabled = True
                print("[AlertEngine] ✅ Gemini 1.5 Flash enabled successfully!")
            except Exception as e:
                print(f"[AlertEngine] ❌ Error initializing Gemini: {e}")
                self.ai_enabled = False
                print("[AlertEngine] Using fallback pattern matching.")
        else:
            self.ai_enabled = False
            print("[AlertEngine] ⚠️ GEMINI_API_KEY not found or not set. Using fallback pattern matching.")
            print("[AlertEngine] Get your free API key from: https://makersuite.google.com/app/apikey")
        
        # Fallback patterns for when AI is not available
        self.critical_keywords = [
            "chest pain", "can't breathe", "heart attack", "stroke", "seizure",
            "passed out", "bleeding", "suicidal", "overdose", "severe pain",
            "unconscious", "paralysis", "can't move", "vision loss",
            "fracture", "broken bone", "broken arm", "broken leg", "head injury",
            "deep cut", "severe burn", "can't walk", "severe injury"
        ]
    
    async def analyze_transcript(
        self,
        text: str,
        consultation_id: str,
        speaker_type: str
    ) -> Optional[Alert]:
        """
        Analyze patient symptoms using AI.
        
        Args:
            text: Patient's symptom description
            consultation_id: ID of the consultation
            speaker_type: 'patient' or 'doctor'
        
        Returns:
            Alert object if critical symptoms detected, None otherwise
        """
        # Only analyze patient speech
        if speaker_type != "patient":
            return None
        
        # Use AI analysis if available
        if self.ai_enabled:
            return await self._ai_analysis(text, consultation_id)
        else:
            return await self._fallback_analysis(text, consultation_id)
    
    async def _ai_analysis(self, text: str, consultation_id: str) -> Optional[Alert]:
        """Use Google Gemini AI to analyze symptoms."""
        
        try:
            # Create a detailed prompt for Gemini
            prompt = f"""You are a medical triage AI assistant. Analyze the following patient symptom description and provide a JSON response.

Patient says: "{text}"

IMPORTANT MEDICAL TRIAGE GUIDELINES:
- ANY injury (fracture, broken bone, severe cut, head injury) = severity 4-5
- ANY severe pain (unbearable, worst ever, 8+/10) = severity 4-5
- Life-threatening (chest pain, can't breathe, stroke, severe bleeding) = severity 5
- Urgent care needed (fractures, deep cuts, high fever, severe pain) = severity 4
- Concerning symptoms (persistent pain, infection signs, moderate injury) = severity 3
- Mild symptoms (minor aches, cold, mild discomfort) = severity 1-2

Respond with ONLY a valid JSON object (no markdown, no extra text):
{{
    "is_critical": boolean (true if severity >= 3, requires medical attention),
    "symptom_type": string (category: "injury", "chest_pain", "breathing_difficulty", "neurological", "mental_health", "pain", "infection", "bleeding", "other"),
    "severity_score": integer (1-5 scale:
        5 = Life-threatening emergency (call 911 immediately)
        4 = Urgent care needed (ER or urgent care within hours)
        3 = Medical attention needed (see doctor within 24-48 hours)
        2 = Mild concern (monitor, see doctor if worsens)
        1 = Minor issue (self-care, monitor)
    ),
    "analysis": string (brief medical analysis explaining the concern),
    "recommendations": string (specific action: "Call 911 immediately", "Go to ER now", "Visit urgent care today", "Schedule doctor appointment", "Monitor symptoms"),
    "emergency_keywords": array of strings (key symptoms found)
}}

EXAMPLES:
- "bone fracture" → severity 4 (urgent care needed)
- "broken arm" → severity 4 (urgent care needed)
- "severe headache" → severity 4 (urgent evaluation)
- "chest pain" → severity 5 (call 911)
- "can't breathe" → severity 5 (call 911)
- "mild headache" → severity 2 (monitor)

Respond with ONLY the JSON object, nothing else."""

            # Call Gemini AI
            response = self.model.generate_content(prompt)
            response_text = response.text.strip()
            
            # Clean up response (remove markdown if present)
            if response_text.startswith("```json"):
                response_text = response_text.replace("```json", "").replace("```", "").strip()
            elif response_text.startswith("```"):
                response_text = response_text.replace("```", "").strip()
            
            # Parse AI response
            ai_result = json.loads(response_text)
            
            # Check if critical
            if not ai_result.get("is_critical", False):
                return None
            
            severity = ai_result.get("severity_score", 3)
            
            # Only create alert if severity >= 3
            if severity < 3:
                return None
            
            # Check deduplication cache
            symptom_type = ai_result.get("symptom_type", "unknown")
            cache_key = (consultation_id, symptom_type)
            current_time = datetime.now()
            
            if cache_key in self.alert_cache:
                last_alert_time = self.alert_cache[cache_key]
                if current_time - last_alert_time < timedelta(minutes=5):
                    return None
            
            self.alert_cache[cache_key] = current_time
            
            # Create alert with AI insights
            return Alert(
                symptom_text=text[:200],  # Limit length
                symptom_type=symptom_type,
                severity_score=severity,
                timestamp=current_time,
                ai_analysis=ai_result.get("analysis", ""),
                recommendations=ai_result.get("recommendations", "")
            )
            
        except json.JSONDecodeError as e:
            print(f"JSON parsing error: {e}")
            print(f"Response was: {response_text}")
            # Fall back to pattern matching
            return await self._fallback_analysis(text, consultation_id)
        except Exception as e:
            print(f"AI analysis error: {e}")
            # Fall back to pattern matching
            return await self._fallback_analysis(text, consultation_id)
    
    async def _fallback_analysis(self, text: str, consultation_id: str) -> Optional[Alert]:
        """Fallback pattern matching when AI is unavailable."""
        
        text_lower = text.lower()
        
        # Check for critical keywords
        for keyword in self.critical_keywords:
            if keyword in text_lower:
                # Determine severity based on keyword
                severity = 4  # Default to urgent
                
                if any(word in text_lower for word in ["severe", "extreme", "unbearable", "worst"]):
                    severity = 5
                elif any(word in text_lower for word in ["mild", "slight", "minor"]):
                    severity = 3
                
                # Determine symptom type
                symptom_type = "unknown"
                if "chest" in text_lower or "heart" in text_lower:
                    symptom_type = "chest_pain"
                elif "breath" in text_lower:
                    symptom_type = "breathing_difficulty"
                elif "head" in text_lower:
                    symptom_type = "neurological"
                elif "suicid" in text_lower or "kill" in text_lower:
                    symptom_type = "mental_health"
                elif "bleed" in text_lower:
                    symptom_type = "bleeding"
                else:
                    symptom_type = "critical_symptom"
                
                # Check deduplication
                cache_key = (consultation_id, symptom_type)
                current_time = datetime.now()
                
                if cache_key in self.alert_cache:
                    last_alert_time = self.alert_cache[cache_key]
                    if current_time - last_alert_time < timedelta(minutes=5):
                        return None
                
                self.alert_cache[cache_key] = current_time
                
                return Alert(
                    symptom_text=text[:200],
                    symptom_type=symptom_type,
                    severity_score=severity,
                    timestamp=current_time,
                    ai_analysis="Pattern-based detection (AI unavailable)",
                    recommendations="Please consult a healthcare provider for proper evaluation."
                )
        
        return None
    
    def clear_consultation_cache(self, consultation_id: str):
        """Clear alert cache for a specific consultation."""
        keys_to_remove = [
            key for key in self.alert_cache.keys()
            if key[0] == consultation_id
        ]
        for key in keys_to_remove:
            del self.alert_cache[key]
