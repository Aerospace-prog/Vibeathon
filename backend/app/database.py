<<<<<<< HEAD
from supabase import create_client, Client
from typing import Optional, List, Dict, Any
import os
from dotenv import load_dotenv

load_dotenv()

class DatabaseClient:
    """Database client for Supabase operations"""
    
    def __init__(self):
        supabase_url = os.getenv("SUPABASE_URL")
        supabase_key = os.getenv("SUPABASE_KEY")
        
        if not supabase_url or not supabase_key:
            raise ValueError("SUPABASE_URL and SUPABASE_KEY must be set")
        
        self.client: Client = create_client(supabase_url, supabase_key)
    
    async def append_transcript(
        self, 
        consultation_id: str, 
        speaker_id: str, 
        original_text: str, 
        translated_text: str
    ) -> None:
        """Append transcript entry to consultation"""
        # Fetch current transcript
        response = self.client.table("consultations").select("full_transcript").eq("id", consultation_id).single().execute()
        
        current_transcript = response.data.get("full_transcript", []) if response.data else []
        
        # Append new entry
        current_transcript.append({
            "speaker_id": speaker_id,
            "original_text": original_text,
            "translated_text": translated_text
        })
        
        # Update consultation
        self.client.table("consultations").update({
            "full_transcript": current_transcript
        }).eq("id", consultation_id).execute()
    
    async def get_full_transcript(self, consultation_id: str) -> List[Dict[str, str]]:
        """Retrieve full transcript for a consultation"""
        response = self.client.table("consultations").select("full_transcript").eq("id", consultation_id).single().execute()
        
        return response.data.get("full_transcript", []) if response.data else []
    
    async def save_soap_note(
        self, 
        consultation_id: str, 
        raw_soap_note: Dict[str, str], 
        de_stigma_suggestions: List[Dict[str, str]]
    ) -> None:
        """Save SOAP note and de-stigmatization suggestions"""
        self.client.table("consultations").update({
            "raw_soap_note": raw_soap_note,
            "de_stigma_suggestions": de_stigma_suggestions
        }).eq("id", consultation_id).execute()
    
    async def search_lexicon(self, query_embedding: List[float], threshold: float = 0.85) -> Optional[str]:
        """Search Community Lexicon using vector similarity"""
        # Note: This requires pgvector extension and proper RPC function in Supabase
        response = self.client.rpc(
            "match_lexicon_terms",
            {
                "query_embedding": query_embedding,
                "match_threshold": threshold,
                "match_count": 1
            }
        ).execute()
        
        if response.data and len(response.data) > 0:
            return response.data[0].get("term_english")
        
        return None
    
    async def add_lexicon_term(
        self, 
        term_english: str, 
        term_regional: str, 
        language: str, 
        embedding: List[float],
        doctor_id: str
    ) -> None:
        """Add new term to Community Lexicon"""
        self.client.table("medical_lexicon").insert({
            "term_english": term_english,
            "term_regional": term_regional,
            "language": language,
            "embedding": embedding,
            "verified_by_doctor_id": doctor_id
        }).execute()

# Singleton instance
db_client = DatabaseClient()
=======
import os
from typing import Optional, List, Dict, Any
from supabase import create_client, Client
from dotenv import load_dotenv
import logging

# Load environment variables
load_dotenv()

logger = logging.getLogger(__name__)

class DatabaseClient:
    """
    Supabase database client for Arogya-AI backend operations.
    Handles consultations, transcripts, SOAP notes, and Community Lexicon.
    """
    
    def __init__(self, supabase_url: Optional[str] = None, supabase_key: Optional[str] = None):
        """
        Initialize Supabase client.
        
        Args:
            supabase_url: Supabase project URL (defaults to env var)
            supabase_key: Supabase service key (defaults to env var)
        """
        self.url = supabase_url or os.getenv("SUPABASE_URL")
        self.key = supabase_key or os.getenv("SUPABASE_SERVICE_KEY")
        
        if not self.url or not self.key:
            raise ValueError("SUPABASE_URL and SUPABASE_SERVICE_KEY must be set")
        
        self.client: Client = create_client(self.url, self.key)
        logger.info("Database client initialized successfully")
    
    async def append_transcript(self, consultation_id: str, text: str) -> bool:
        """
        Append transcribed text to consultation's full transcript.
        
        Args:
            consultation_id: UUID of the consultation
            text: Transcribed text to append
            
        Returns:
            True if successful, False otherwise
        """
        try:
            # Fetch current transcript
            response = self.client.table("consultations").select("full_transcript").eq("id", consultation_id).execute()
            
            if not response.data:
                logger.error(f"Consultation {consultation_id} not found")
                return False
            
            current_transcript = response.data[0].get("full_transcript", "")
            
            # Append new text with newline separator
            updated_transcript = current_transcript + "\n" + text if current_transcript else text
            
            # Update consultation
            self.client.table("consultations").update({
                "full_transcript": updated_transcript
            }).eq("id", consultation_id).execute()
            
            logger.debug(f"Appended transcript to consultation {consultation_id}")
            return True
            
        except Exception as e:
            logger.error(f"Error appending transcript: {str(e)}")
            return False
    
    async def get_full_transcript(self, consultation_id: str) -> Optional[str]:
        """
        Retrieve the complete transcript for a consultation.
        
        Args:
            consultation_id: UUID of the consultation
            
        Returns:
            Full transcript text or None if not found
        """
        try:
            response = self.client.table("consultations").select("full_transcript").eq("id", consultation_id).execute()
            
            if not response.data:
                logger.error(f"Consultation {consultation_id} not found")
                return None
            
            transcript = response.data[0].get("full_transcript", "")
            logger.debug(f"Retrieved transcript for consultation {consultation_id}")
            return transcript
            
        except Exception as e:
            logger.error(f"Error retrieving transcript: {str(e)}")
            return None
    
    async def save_soap_note(
        self,
        consultation_id: str,
        soap: Dict[str, str],
        suggestions: Dict[str, Any]
    ) -> bool:
        """
        Save SOAP note and de-stigmatization suggestions to consultation.
        
        Args:
            consultation_id: UUID of the consultation
            soap: Dictionary with subjective, objective, assessment, plan keys
            suggestions: Dictionary with de-stigmatization suggestions
            
        Returns:
            True if successful, False otherwise
        """
        try:
            self.client.table("consultations").update({
                "raw_soap_note": soap,
                "de_stigma_suggestions": suggestions
            }).eq("id", consultation_id).execute()
            
            logger.info(f"Saved SOAP note for consultation {consultation_id}")
            return True
            
        except Exception as e:
            logger.error(f"Error saving SOAP note: {str(e)}")
            return False
    
    async def search_lexicon(self, term: str, threshold: float = 0.85) -> Optional[str]:
        """
        Search Community Lexicon for regional term using vector similarity.
        
        Args:
            term: Regional medical term to search for
            threshold: Minimum similarity score (0-1)
            
        Returns:
            English equivalent if found above threshold, None otherwise
        """
        try:
            # Note: This requires the embedding to be generated first
            # In production, we'd generate embedding here using sentence-transformers
            # For now, we'll use a simple text search as placeholder
            
            # Vector similarity search using pgvector
            # The actual implementation would use RPC function or direct SQL
            response = self.client.rpc(
                "search_lexicon_by_similarity",
                {
                    "query_term": term,
                    "similarity_threshold": threshold
                }
            ).execute()
            
            if response.data and len(response.data) > 0:
                english_term = response.data[0].get("term_english")
                logger.debug(f"Found lexicon match: {term} -> {english_term}")
                return english_term
            
            return None
            
        except Exception as e:
            logger.warning(f"Error searching lexicon (may need RPC function setup): {str(e)}")
            # Fallback: simple text match
            try:
                response = self.client.table("medical_lexicon").select("term_english").eq("term_regional", term).execute()
                if response.data and len(response.data) > 0:
                    return response.data[0].get("term_english")
            except:
                pass
            return None
    
    async def add_lexicon_term(
        self,
        term_english: str,
        term_regional: str,
        language: str,
        doctor_id: str,
        embedding: List[float]
    ) -> bool:
        """
        Add a new term to the Community Lexicon.
        
        Args:
            term_english: English medical term
            term_regional: Regional language equivalent
            language: Language code (e.g., 'hi', 'ta')
            doctor_id: UUID of the doctor submitting the term
            embedding: 384-dimension vector embedding
            
        Returns:
            True if successful, False otherwise
        """
        try:
            self.client.table("medical_lexicon").insert({
                "term_english": term_english,
                "term_regional": term_regional,
                "language": language,
                "verified_by_doctor_id": doctor_id,
                "embedding": embedding
            }).execute()
            
            logger.info(f"Added lexicon term: {term_regional} ({language}) -> {term_english}")
            return True
            
        except Exception as e:
            logger.error(f"Error adding lexicon term: {str(e)}")
            return False
    
    async def create_consultation(
        self,
        patient_id: str,
        doctor_id: str
    ) -> Optional[str]:
        """
        Create a new consultation record.
        
        Args:
            patient_id: UUID of the patient
            doctor_id: UUID of the doctor
            
        Returns:
            Consultation ID if successful, None otherwise
        """
        try:
            response = self.client.table("consultations").insert({
                "patient_id": patient_id,
                "doctor_id": doctor_id,
                "full_transcript": "",
                "approved": False
            }).execute()
            
            if response.data and len(response.data) > 0:
                consultation_id = response.data[0].get("id")
                logger.info(f"Created consultation {consultation_id}")
                return consultation_id
            
            return None
            
        except Exception as e:
            logger.error(f"Error creating consultation: {str(e)}")
            return None
    
    async def get_consultation(self, consultation_id: str) -> Optional[Dict[str, Any]]:
        """
        Retrieve consultation details.
        
        Args:
            consultation_id: UUID of the consultation
            
        Returns:
            Consultation data dictionary or None if not found
        """
        try:
            response = self.client.table("consultations").select("*").eq("id", consultation_id).execute()
            
            if response.data and len(response.data) > 0:
                return response.data[0]
            
            return None
            
        except Exception as e:
            logger.error(f"Error retrieving consultation: {str(e)}")
            return None
    
    async def approve_consultation(self, consultation_id: str) -> bool:
        """
        Mark consultation as approved after doctor review.
        
        Args:
            consultation_id: UUID of the consultation
            
        Returns:
            True if successful, False otherwise
        """
        try:
            self.client.table("consultations").update({
                "approved": True
            }).eq("id", consultation_id).execute()
            
            logger.info(f"Approved consultation {consultation_id}")
            return True
            
        except Exception as e:
            logger.error(f"Error approving consultation: {str(e)}")
            return False


# Singleton instance
_db_client: Optional[DatabaseClient] = None

def get_database_client() -> DatabaseClient:
    """
    Get or create singleton database client instance.
    
    Returns:
        DatabaseClient instance
    """
    global _db_client
    if _db_client is None:
        _db_client = DatabaseClient()
    return _db_client
>>>>>>> 8c02c68a975937490994437626cbdcc74e65ea28
