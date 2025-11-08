"""
Emotion Analyzer Module for Voice Emotion Detection

This module extracts emotional states from audio features during patient consultations.
It analyzes acoustic features like pitch, energy, and speech rate to classify emotions
and provide confidence scores for real-time emotional state tracking.
"""

import numpy as np
from datetime import datetime
from typing import Optional
from pydantic import BaseModel
import librosa
import io


# Emotion categories with color coding and descriptions for UI
EMOTION_CATEGORIES = {
    "calm": {
        "color": "#10B981",
        "description": "Patient appears relaxed and comfortable"
    },
    "anxious": {
        "color": "#F59E0B",
        "description": "Patient shows signs of worry or nervousness"
    },
    "distressed": {
        "color": "#EF4444",
        "description": "Patient appears highly stressed or upset"
    },
    "pain": {
        "color": "#DC2626",
        "description": "Patient may be experiencing physical discomfort"
    },
    "sad": {
        "color": "#6B7280",
        "description": "Patient shows signs of sadness or depression"
    },
    "neutral": {
        "color": "#9CA3AF",
        "description": "Baseline emotional state"
    }
}


class EmotionResult(BaseModel):
    """
    Pydantic model representing an emotion analysis result.
    
    Attributes:
        emotion_type: The classified emotion category
        confidence_score: Probability value (0-1) indicating model certainty
        timestamp: When the emotion was detected
    """
    emotion_type: str
    confidence_score: float
    timestamp: datetime
    
    def to_dict(self) -> dict:
        """Convert EmotionResult to dictionary for serialization."""
        return {
            "emotion_type": self.emotion_type,
            "confidence_score": self.confidence_score,
            "timestamp": self.timestamp.isoformat()
        }


class EmotionAnalyzer:
    """
    Voice emotion detection analyzer.
    
    Extracts acoustic features from audio and classifies emotional states
    using a lightweight feature-based approach for real-time performance.
    """
    
    def __init__(self):
        """
        Initialize the Emotion Analyzer.
        
        Loads the emotion classification model and initializes the feature extractor.
        For MVP/hackathon, uses a simple rule-based classifier based on audio features.
        """
        self.emotion_categories = EMOTION_CATEGORIES
        
        # Feature extraction parameters
        self.sample_rate = 16000
        self.n_mfcc = 13
        
        # Simple thresholds for rule-based classification (MVP approach)
        # In production, this would be replaced with a trained ML model
        self._init_simple_classifier()
    
    def _init_simple_classifier(self):
        """
        Initialize simple rule-based classifier for MVP.
        
        This uses audio feature thresholds to classify emotions.
        In production, replace with a trained model (sklearn, speechbrain, etc.)
        """
        # These thresholds are approximate and should be tuned with real data
        self.thresholds = {
            "pitch_mean_high": 200,  # Hz
            "pitch_mean_low": 100,   # Hz
            "energy_high": 0.05,
            "energy_low": 0.01,
            "pitch_variance_high": 1000,
            "speech_rate_high": 4.0,  # syllables per second
            "speech_rate_low": 2.0
        }

    def _extract_features(self, audio: np.ndarray) -> dict:
        """
        Extract acoustic features from audio signal.
        
        Extracts multiple audio features for emotion classification:
        - Pitch (F0): Fundamental frequency
        - Energy (RMS): Root mean square energy
        - Speech rate: Estimated speaking rate
        - MFCCs: Mel-frequency cepstral coefficients
        - Spectral features: Spectral centroid, rolloff, etc.
        
        Args:
            audio: Audio signal as numpy array
        
        Returns:
            Dictionary containing extracted features
        """
        features = {}
        
        try:
            # 1. Extract Pitch (F0) using librosa
            pitches, magnitudes = librosa.piptrack(
                y=audio,
                sr=self.sample_rate,
                fmin=50,
                fmax=400
            )
            
            # Get pitch values where magnitude is highest
            pitch_values = []
            for t in range(pitches.shape[1]):
                index = magnitudes[:, t].argmax()
                pitch = pitches[index, t]
                if pitch > 0:  # Only consider valid pitch values
                    pitch_values.append(pitch)
            
            if len(pitch_values) > 0:
                features['pitch_mean'] = np.mean(pitch_values)
                features['pitch_std'] = np.std(pitch_values)
                features['pitch_variance'] = np.var(pitch_values)
            else:
                features['pitch_mean'] = 0
                features['pitch_std'] = 0
                features['pitch_variance'] = 0
            
            # 2. Extract Energy (RMS)
            rms = librosa.feature.rms(y=audio)[0]
            features['energy_mean'] = np.mean(rms)
            features['energy_std'] = np.std(rms)
            features['energy_max'] = np.max(rms)
            
            # 3. Estimate Speech Rate
            # Use zero-crossing rate as a proxy for speech rate
            zcr = librosa.feature.zero_crossing_rate(audio)[0]
            features['speech_rate'] = np.mean(zcr) * self.sample_rate / 2
            
            # 4. Extract MFCCs (Mel-frequency cepstral coefficients)
            mfccs = librosa.feature.mfcc(
                y=audio,
                sr=self.sample_rate,
                n_mfcc=self.n_mfcc
            )
            
            # Statistical features from MFCCs
            features['mfcc_mean'] = np.mean(mfccs, axis=1)
            features['mfcc_std'] = np.std(mfccs, axis=1)
            
            # 5. Extract Spectral Features
            spectral_centroids = librosa.feature.spectral_centroid(
                y=audio,
                sr=self.sample_rate
            )[0]
            features['spectral_centroid_mean'] = np.mean(spectral_centroids)
            features['spectral_centroid_std'] = np.std(spectral_centroids)
            
            spectral_rolloff = librosa.feature.spectral_rolloff(
                y=audio,
                sr=self.sample_rate
            )[0]
            features['spectral_rolloff_mean'] = np.mean(spectral_rolloff)
            
            # 6. Spectral Bandwidth
            spectral_bandwidth = librosa.feature.spectral_bandwidth(
                y=audio,
                sr=self.sample_rate
            )[0]
            features['spectral_bandwidth_mean'] = np.mean(spectral_bandwidth)
            
            # Normalize features for consistent scale
            features = self._normalize_features(features)
            
        except Exception as e:
            # If feature extraction fails, return default features
            print(f"Feature extraction error: {e}")
            features = self._get_default_features()
        
        return features
    
    def _normalize_features(self, features: dict) -> dict:
        """
        Normalize features to a consistent scale.
        
        Args:
            features: Dictionary of extracted features
        
        Returns:
            Dictionary of normalized features
        """
        # Simple min-max normalization for key features
        # In production, use StandardScaler fitted on training data
        
        normalized = features.copy()
        
        # Normalize pitch (typical range 80-300 Hz)
        if features['pitch_mean'] > 0:
            normalized['pitch_mean'] = (features['pitch_mean'] - 80) / 220
        
        # Normalize energy (typical range 0-0.1)
        normalized['energy_mean'] = min(features['energy_mean'] / 0.1, 1.0)
        
        # Normalize speech rate (typical range 0-10)
        normalized['speech_rate'] = min(features['speech_rate'] / 10, 1.0)
        
        return normalized
    
    def _get_default_features(self) -> dict:
        """
        Return default features when extraction fails.
        
        Returns:
            Dictionary with default feature values
        """
        return {
            'pitch_mean': 0,
            'pitch_std': 0,
            'pitch_variance': 0,
            'energy_mean': 0,
            'energy_std': 0,
            'energy_max': 0,
            'speech_rate': 0,
            'mfcc_mean': np.zeros(self.n_mfcc),
            'mfcc_std': np.zeros(self.n_mfcc),
            'spectral_centroid_mean': 0,
            'spectral_centroid_std': 0,
            'spectral_rolloff_mean': 0,
            'spectral_bandwidth_mean': 0
        }

    async def analyze_audio(
        self,
        audio_chunk: bytes,
        sample_rate: int = 16000
    ) -> EmotionResult:
        """
        Analyze audio chunk and classify emotional state.
        
        Converts audio bytes to numpy array, extracts features, and runs
        emotion classification to determine the patient's emotional state.
        
        Args:
            audio_chunk: Raw audio data as bytes
            sample_rate: Sample rate of the audio (default: 16000 Hz)
        
        Returns:
            EmotionResult with emotion_type and confidence_score
        """
        try:
            # Convert bytes to numpy array
            audio = self._bytes_to_audio(audio_chunk, sample_rate)
            
            # Check if audio is valid (not silent or too short)
            if len(audio) < sample_rate * 0.5:  # At least 0.5 seconds
                return EmotionResult(
                    emotion_type="neutral",
                    confidence_score=0.5,
                    timestamp=datetime.now()
                )
            
            # Extract features from audio
            features = self._extract_features(audio)
            
            # Run emotion classification
            emotion_type, confidence_score = self._classify_emotion(features)
            
            # Create and return result
            return EmotionResult(
                emotion_type=emotion_type,
                confidence_score=confidence_score,
                timestamp=datetime.now()
            )
            
        except Exception as e:
            print(f"Error analyzing audio: {e}")
            # Return neutral emotion with low confidence on error
            return EmotionResult(
                emotion_type="neutral",
                confidence_score=0.3,
                timestamp=datetime.now()
            )
    
    def _bytes_to_audio(self, audio_bytes: bytes, sample_rate: int) -> np.ndarray:
        """
        Convert audio bytes to numpy array.
        
        Args:
            audio_bytes: Raw audio data as bytes
            sample_rate: Sample rate of the audio
        
        Returns:
            Audio signal as numpy array
        """
        try:
            # Try to load using librosa (handles various formats)
            audio, sr = librosa.load(
                io.BytesIO(audio_bytes),
                sr=sample_rate,
                mono=True
            )
            return audio
        except Exception:
            # Fallback: assume raw PCM 16-bit audio
            audio = np.frombuffer(audio_bytes, dtype=np.int16)
            # Normalize to [-1, 1]
            audio = audio.astype(np.float32) / 32768.0
            return audio
    
    def _classify_emotion(self, features: dict) -> tuple[str, float]:
        """
        Classify emotion based on extracted features.
        
        Uses a simple rule-based classifier for MVP. In production, this would
        be replaced with a trained ML model (sklearn, neural network, etc.)
        
        Args:
            features: Dictionary of extracted audio features
        
        Returns:
            Tuple of (emotion_type, confidence_score)
        """
        # Extract key features for classification
        pitch_mean = features.get('pitch_mean', 0)
        pitch_variance = features.get('pitch_variance', 0)
        energy_mean = features.get('energy_mean', 0)
        speech_rate = features.get('speech_rate', 0)
        
        # Rule-based classification logic
        # These rules are simplified for MVP and should be replaced with ML model
        
        # High pitch + high variance + high energy = anxious/distressed
        if pitch_mean > self.thresholds['pitch_mean_high'] and \
           pitch_variance > self.thresholds['pitch_variance_high'] and \
           energy_mean > self.thresholds['energy_high']:
            if speech_rate > self.thresholds['speech_rate_high']:
                return ("anxious", 0.75)
            else:
                return ("distressed", 0.78)
        
        # High pitch + high energy + moderate variance = pain
        if pitch_mean > self.thresholds['pitch_mean_high'] and \
           energy_mean > self.thresholds['energy_high'] and \
           pitch_variance < self.thresholds['pitch_variance_high']:
            return ("pain", 0.72)
        
        # Low pitch + low energy + slow speech = sad
        if pitch_mean < self.thresholds['pitch_mean_low'] and \
           energy_mean < self.thresholds['energy_low'] and \
           speech_rate < self.thresholds['speech_rate_low']:
            return ("sad", 0.70)
        
        # Moderate pitch + moderate energy + steady variance = calm
        if self.thresholds['pitch_mean_low'] <= pitch_mean <= self.thresholds['pitch_mean_high'] and \
           self.thresholds['energy_low'] <= energy_mean <= self.thresholds['energy_high'] and \
           pitch_variance < self.thresholds['pitch_variance_high'] / 2:
            return ("calm", 0.80)
        
        # High variance + high speech rate = anxious
        if pitch_variance > self.thresholds['pitch_variance_high'] and \
           speech_rate > self.thresholds['speech_rate_high']:
            return ("anxious", 0.73)
        
        # Default to neutral with moderate confidence
        return ("neutral", 0.65)
    
    def get_emotion_info(self, emotion_type: str) -> dict:
        """
        Get color and description for an emotion type.
        
        Args:
            emotion_type: The emotion category
        
        Returns:
            Dictionary with color and description
        """
        return self.emotion_categories.get(
            emotion_type,
            self.emotion_categories["neutral"]
        )
