"""
Simple audio converter that passes WebM directly to Google Cloud.

Google Cloud Speech-to-Text supports WebM/Opus natively, so we don't need to convert!
"""

import logging
from typing import Optional

logger = logging.getLogger(__name__)


class AudioConverter:
    """Simple audio validator - no conversion needed."""
    
    @staticmethod
    def webm_to_pcm(webm_data: bytes, target_sample_rate: int = 16000) -> Optional[bytes]:
        """
        Return WebM data as-is since Google Cloud supports it natively.
        
        Args:
            webm_data: Raw WebM audio bytes from browser
            target_sample_rate: Ignored (kept for compatibility)
            
        Returns:
            Original WebM bytes
        """
        logger.debug(f"Passing through {len(webm_data)} bytes of WebM audio")
        return webm_data
    
    @staticmethod
    def is_valid_audio(audio_data: bytes, min_size: int = 1000) -> bool:
        """
        Check if audio data is valid and has sufficient content.
        
        Args:
            audio_data: Audio bytes to validate
            min_size: Minimum size in bytes
            
        Returns:
            True if audio is valid
        """
        return audio_data and len(audio_data) >= min_size


# Singleton instance
_audio_converter: Optional[AudioConverter] = None

def get_audio_converter() -> AudioConverter:
    """Get or create singleton AudioConverter instance."""
    global _audio_converter
    if _audio_converter is None:
        _audio_converter = AudioConverter()
    return _audio_converter
