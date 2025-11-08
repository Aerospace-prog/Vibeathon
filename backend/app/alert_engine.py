"""
Alert Engine Module for Real-time Medical Alert Detection

This module analyzes patient transcripts in real-time to detect critical medical symptoms
and trigger alerts for doctors. It uses pattern matching with severity scoring and
implements deduplication to avoid repeated alerts.
"""

import re
from datetime import datetime, timedelta
from typing import Optional, Dict, List
from pydantic import BaseModel


class Alert(BaseModel):
    """
    Pydantic model representing a medical alert.
    
    Attributes:
        symptom_text: The exact phrase or context where the symptom was detected
        symptom_type: Category of the symptom (e.g., 'chest_pain', 'breathing')
        severity_score: Urgency level from 1-5 (5 being most critical)
        timestamp: When the alert was detected
    """
    symptom_text: str
    symptom_type: str
    severity_score: int
    timestamp: datetime
    
    def to_dict(self) -> dict:
        """Convert Alert to dictionary for serialization."""
        return {
            "symptom_text": self.symptom_text,
            "symptom_type": self.symptom_type,
            "severity_score": self.severity_score,
            "timestamp": self.timestamp.isoformat()
        }


# Critical symptom patterns with keywords, base severity, and intensifiers
CRITICAL_PATTERNS = {
    "chest_pain": {
        "keywords": [
            r"\bchest pain\b",
            r"\bheart pain\b",
            r"\bcardiac\b",
            r"\bangina\b",
            r"\bpain in.*chest\b",
            r"\bchest.*hurt"
        ],
        "base_severity": 5,
        "intensifiers": ["severe", "crushing", "radiating", "sharp", "intense"]
    },
    "breathing": {
        "keywords": [
            r"\bcan'?t breathe\b",
            r"\bdifficulty breathing\b",
            r"\bshortness of breath\b",
            r"\bdyspnea\b",
            r"\bbreathing.*difficult\b",
            r"\bhard to breathe\b",
            r"\bgasping\b"
        ],
        "base_severity": 5,
        "intensifiers": ["severe", "unable to", "can't", "cannot"]
    },
    "consciousness": {
        "keywords": [
            r"\bpassed out\b",
            r"\bfainted\b",
            r"\bloss of consciousness\b",
            r"\bblackout\b",
            r"\blost consciousness\b",
            r"\bunconscious\b"
        ],
        "base_severity": 5,
        "intensifiers": []
    },
    "bleeding": {
        "keywords": [
            r"\bsevere bleeding\b",
            r"\bhemorrhage\b",
            r"\bblood loss\b",
            r"\bbleeding.*heavy\b",
            r"\bbleeding.*won'?t stop\b"
        ],
        "base_severity": 4,
        "intensifiers": ["uncontrolled", "heavy", "profuse", "massive"]
    },
    "mental_health": {
        "keywords": [
            r"\bsuicidal\b",
            r"\bwant to die\b",
            r"\bend my life\b",
            r"\bharm myself\b",
            r"\bkill myself\b",
            r"\bsuicide\b"
        ],
        "base_severity": 5,
        "intensifiers": []
    },
    "neurological": {
        "keywords": [
            r"\bsevere headache\b",
            r"\bworst headache\b",
            r"\bvision loss\b",
            r"\bparalysis\b",
            r"\bstroke\b",
            r"\bnumbness\b",
            r"\bseizure\b"
        ],
        "base_severity": 4,
        "intensifiers": ["sudden", "worst ever", "never felt", "extreme"]
    }
}


class AlertEngine:
    """
    Real-time medical alert detection engine.
    
    Analyzes patient transcripts for critical symptoms and generates alerts
    with severity scoring. Implements deduplication to prevent alert fatigue.
    """
    
    def __init__(self):
        """
        Initialize the Alert Engine.
        
        Loads critical symptom patterns and initializes the deduplication cache.
        """
        self.critical_patterns = CRITICAL_PATTERNS
        
        # Deduplication cache: {(consultation_id, symptom_type): last_alert_time}
        self.alert_cache: Dict[tuple, datetime] = {}
        
        # Compile regex patterns for efficiency
        self._compiled_patterns = self._compile_patterns()
    
    def _compile_patterns(self) -> Dict[str, List[re.Pattern]]:
        """
        Compile all regex patterns for efficient matching.
        
        Returns:
            Dictionary mapping symptom types to compiled regex patterns
        """
        compiled = {}
        for symptom_type, pattern_data in self.critical_patterns.items():
            compiled[symptom_type] = [
                re.compile(keyword, re.IGNORECASE)
                for keyword in pattern_data["keywords"]
            ]
        return compiled

    async def analyze_transcript(
        self,
        text: str,
        consultation_id: str,
        speaker_type: str
    ) -> Optional[Alert]:
        """
        Analyze transcript text for critical medical symptoms.
        
        Args:
            text: The transcript text to analyze
            consultation_id: ID of the current consultation
            speaker_type: Type of speaker ('patient' or 'doctor')
        
        Returns:
            Alert object if critical symptom detected with severity >= 3, None otherwise
        """
        # Only analyze patient speech
        if speaker_type != "patient":
            return None
        
        # Normalize text for better matching
        text_lower = text.lower()
        
        # Check each symptom pattern
        for symptom_type, patterns in self._compiled_patterns.items():
            for pattern in patterns:
                match = pattern.search(text)
                if match:
                    # Extract context around the match (50 chars before and after)
                    start = max(0, match.start() - 50)
                    end = min(len(text), match.end() + 50)
                    context = text[start:end].strip()
                    
                    # Calculate severity score
                    severity = self._calculate_severity(
                        symptom_type=symptom_type,
                        context=text_lower
                    )
                    
                    # Only trigger alert if severity >= 3
                    if severity >= 3:
                        # Check deduplication cache
                        cache_key = (consultation_id, symptom_type)
                        current_time = datetime.now()
                        
                        if cache_key in self.alert_cache:
                            last_alert_time = self.alert_cache[cache_key]
                            time_diff = current_time - last_alert_time
                            
                            # Skip if alert was triggered within last 5 minutes
                            if time_diff < timedelta(minutes=5):
                                return None
                        
                        # Update cache with current alert time
                        self.alert_cache[cache_key] = current_time
                        
                        # Create and return alert
                        return Alert(
                            symptom_text=context,
                            symptom_type=symptom_type,
                            severity_score=severity,
                            timestamp=current_time
                        )
        
        return None
    
    def clear_consultation_cache(self, consultation_id: str):
        """
        Clear alert cache for a specific consultation.
        
        Should be called when a consultation ends to free memory.
        
        Args:
            consultation_id: ID of the consultation to clear
        """
        keys_to_remove = [
            key for key in self.alert_cache.keys()
            if key[0] == consultation_id
        ]
        for key in keys_to_remove:
            del self.alert_cache[key]

    def _calculate_severity(self, symptom_type: str, context: str) -> int:
        """
        Calculate severity score for a detected symptom.
        
        Severity is calculated based on:
        - Base severity from symptom type
        - Presence of intensity words (severe, mild, sudden)
        - Duration mentions (ongoing, sudden, chronic)
        
        Args:
            symptom_type: Type of symptom detected
            context: Full text context (lowercased)
        
        Returns:
            Severity score from 1-5 (5 being most critical)
        """
        pattern_data = self.critical_patterns[symptom_type]
        severity = pattern_data["base_severity"]
        
        # Check for intensity modifiers
        intensifiers = pattern_data.get("intensifiers", [])
        for intensifier in intensifiers:
            if intensifier in context:
                severity = min(5, severity + 1)  # Cap at 5
                break
        
        # Check for additional intensity words (general)
        high_intensity_words = ["severe", "extreme", "unbearable", "worst", "terrible", "intense"]
        for word in high_intensity_words:
            if word in context:
                severity = min(5, severity + 1)
                break
        
        # Check for low intensity words (reduce severity)
        low_intensity_words = ["mild", "slight", "minor", "little bit"]
        for word in low_intensity_words:
            if word in context:
                severity = max(1, severity - 2)  # Reduce but keep at least 1
                break
        
        # Check for sudden onset (increases urgency)
        sudden_words = ["sudden", "suddenly", "just started", "came on suddenly", "all of a sudden"]
        for word in sudden_words:
            if word in context:
                severity = min(5, severity + 1)
                break
        
        # Check for duration mentions
        chronic_words = ["for days", "for weeks", "for months", "chronic", "ongoing", "persistent"]
        for word in chronic_words:
            if word in context:
                # Chronic symptoms might be less immediately urgent
                # but still important - keep severity as is
                break
        
        return severity
