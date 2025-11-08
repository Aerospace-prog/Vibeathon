"""
Audio converter using FFmpeg subprocess.
Simpler than pydub - just calls FFmpeg directly.
"""

import subprocess
import tempfile
import os
import logging
from typing import Optional

logger = logging.getLogger(__name__)


class AudioConverter:
    """Converts audio using FFmpeg subprocess."""
    
    @staticmethod
    def check_ffmpeg() -> bool:
        """Check if FFmpeg is available."""
        try:
            subprocess.run(['ffmpeg', '-version'], 
                         capture_output=True, 
                         check=True,
                         timeout=5)
            return True
        except (subprocess.CalledProcessError, FileNotFoundError, subprocess.TimeoutExpired):
            return False
    
    @staticmethod
    def webm_to_pcm(webm_data: bytes, target_sample_rate: int = 16000) -> Optional[bytes]:
        """
        Convert WebM/Opus to LINEAR16 PCM using FFmpeg.
        
        Args:
            webm_data: Raw WebM audio bytes
            target_sample_rate: Target sample rate (16000 for Google Cloud)
            
        Returns:
            PCM audio bytes or None if conversion fails
        """
        # Check if FFmpeg is available
        if not AudioConverter.check_ffmpeg():
            logger.error("FFmpeg not found - cannot convert audio")
            logger.error("Please install FFmpeg: https://ffmpeg.org/download.html")
            return None
        
        try:
            # Create temporary files
            with tempfile.NamedTemporaryFile(suffix='.webm', delete=False) as input_file:
                input_path = input_file.name
                input_file.write(webm_data)
            
            with tempfile.NamedTemporaryFile(suffix='.wav', delete=False) as output_file:
                output_path = output_file.name
            
            try:
                # Convert using FFmpeg
                # -i input.webm: input file
                # -ar 16000: resample to 16kHz
                # -ac 1: convert to mono
                # -f s16le: output format (signed 16-bit little-endian PCM)
                # -acodec pcm_s16le: PCM codec
                subprocess.run([
                    'ffmpeg',
                    '-i', input_path,
                    '-ar', str(target_sample_rate),
                    '-ac', '1',
                    '-f', 's16le',
                    '-acodec', 'pcm_s16le',
                    output_path,
                    '-y',  # Overwrite output file
                    '-loglevel', 'error'  # Only show errors
                ], check=True, capture_output=True, timeout=10)
                
                # Read converted audio
                with open(output_path, 'rb') as f:
                    pcm_data = f.read()
                
                logger.debug(f"Converted {len(webm_data)} bytes WebM to {len(pcm_data)} bytes PCM")
                return pcm_data
                
            finally:
                # Clean up temp files
                try:
                    os.unlink(input_path)
                    os.unlink(output_path)
                except:
                    pass
                    
        except subprocess.TimeoutExpired:
            logger.error("FFmpeg conversion timed out")
            return None
        except subprocess.CalledProcessError as e:
            logger.error(f"FFmpeg conversion failed: {e.stderr.decode() if e.stderr else str(e)}")
            return None
        except Exception as e:
            logger.error(f"Audio conversion error: {e}")
            return None
    
    @staticmethod
    def is_valid_audio(audio_data: bytes, min_size: int = 1000) -> bool:
        """Check if audio data is valid."""
        return audio_data and len(audio_data) >= min_size


# Singleton
_audio_converter: Optional[AudioConverter] = None

def get_audio_converter() -> AudioConverter:
    """Get or create singleton AudioConverter instance."""
    global _audio_converter
    if _audio_converter is None:
        _audio_converter = AudioConverter()
    return _audio_converter
