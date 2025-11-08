"""
Audio format converter for STT pipeline.

Converts WebM/Opus audio from browser to formats compatible with Google Cloud Speech-to-Text.
Uses pydub for WebM decoding and conversion.
"""

import io
import logging
from typing import Optional
import tempfile
import os

try:
    from pydub import AudioSegment
    import numpy as np
    AUDIO_LIBS_AVAILABLE = True
except ImportError:
    AUDIO_LIBS_AVAILABLE = False
    logging.warning("pydub or numpy not available for audio conversion")

logger = logging.getLogger(__name__)


class AudioConverter:
    """Converts audio formats for STT processing."""
    
    @staticmethod
    def webm_to_pcm(webm_data: bytes, target_sample_rate: int = 16000) -> Optional[bytes]:
        """
        Convert WebM/Opus audio to LINEAR16 PCM.
        
        Args:
            webm_data: Raw WebM audio bytes from browser
            target_sample_rate: Target sample rate (default: 16000 Hz for Google STT)
            
        Returns:
            PCM audio bytes or None if conversion fails
        """
        if not AUDIO_LIBS_AVAILABLE:
            logger.error("Audio libraries not available for conversion")
            return None
        
        try:
            # Load WebM audio using pydub
            audio = AudioSegment.from_file(io.BytesIO(webm_data), format="webm")
            
            # Convert to mono
            if audio.channels > 1:
                audio = audio.set_channels(1)
            
            # Convert to target sample rate
            if audio.frame_rate != target_sample_rate:
                audio = audio.set_frame_rate(target_sample_rate)
            
            # Convert to 16-bit PCM
            audio = audio.set_sample_width(2)  # 2 bytes = 16 bits
            
            # Get raw PCM data
            pcm_bytes = audio.raw_data
            
            logger.debug(f"Converted {len(webm_data)} bytes WebM to {len(pcm_bytes)} bytes PCM")
            return pcm_bytes
            
        except Exception as e:
            logger.error(f"Audio conversion error: {e}")
            return None
    
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
