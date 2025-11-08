"""
SOAP Note Generation and Compassion Reflex Module

This module implements a two-step LLM chain using Google Gemini API:
1. Generate HIPAA-compliant SOAP notes from multilingual transcripts
2. Identify and suggest alternatives for stigmatizing language (Compassion Reflex)

Based on EMNLP 2024 'Words Matter' research for person-first clinical documentation.
"""

import os
import json
import logging
from typing import Dict, List, Tuple, Any, Optional
import google.generativeai as genai

# Handle imports for both direct execution and module import
try:
    from app.models import SoapNoteResponse, StigmaSuggestion
except ImportError:
    from models import SoapNoteResponse, StigmaSuggestion

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Configure Gemini API
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
else:
    logger.warning("GEMINI_API_KEY not found in environment variables")


# Prompts for the two-step LLM chain
SOAP_GENERATION_PROMPT = """You are an expert, HIPAA-compliant AI medical scribe for the Indian healthcare context. 

Analyze this multilingual, code-switched (Hinglish) transcript from a doctor-patient consultation and generate a structured, professional, English-only SOAP note.

IMPORTANT: Your output MUST be a valid JSON object with EXACTLY these keys: 'subjective', 'objective', 'assessment', and 'plan'.

Guidelines:
- Extract only clinically relevant facts from the transcript
- Use professional medical terminology
- Be concise but comprehensive
- Maintain patient confidentiality (no identifying information beyond clinical relevance)
- Handle code-switching between Hindi and English naturally
- Focus on medical content, ignore casual conversation

Transcript:
{transcript}

Output the SOAP note as a JSON object with this exact structure:
{{
  "subjective": "Patient's reported symptoms, history, and concerns",
  "objective": "Observable findings, vital signs, physical examination results",
  "assessment": "Clinical diagnosis and medical impression",
  "plan": "Treatment plan, medications, follow-up instructions"
}}

Return ONLY the JSON object, no additional text or explanation."""

COMPASSION_REFLEX_PROMPT = """You are a medical ethics expert specializing in person-first language and de-stigmatization in clinical documentation, based on EMNLP 2024 'Words Matter' research.

Review the following clinical note sections (Assessment and Plan) for stigmatizing, judgmental, or non-person-first language.

Common issues to identify:
- Non-person-first language (e.g., "diabetic patient" → "patient with diabetes")
- Judgmental terms (e.g., "non-compliant" → "reports difficulty adhering to")
- Deficit-focused descriptions (e.g., "drug abuser" → "patient with substance use disorder")
- Blame-oriented language (e.g., "patient refuses" → "patient declines")
- Stigmatizing mental health terms (e.g., "crazy", "psycho" → clinical terms)

Assessment Section:
{assessment}

Plan Section:
{plan}

For each instance of stigmatizing language found, provide:
1. The section where it appears ('assessment' or 'plan')
2. The original problematic phrase
3. A suggested objective, person-first alternative
4. A brief rationale explaining why the change promotes dignity

IMPORTANT: Output MUST be a valid JSON object with this structure:
{{
  "suggestions": [
    {{
      "section": "assessment",
      "original": "exact phrase from the note",
      "suggested": "person-first alternative",
      "rationale": "brief explanation"
    }}
  ]
}}

If NO stigmatizing language is found, return:
{{
  "suggestions": []
}}

Return ONLY the JSON object, no additional text or explanation."""


async def generate_notes_with_empathy(
    full_transcript: str
) -> Tuple[Dict[str, str], List[Dict[str, Any]]]:
    """
    Generate SOAP notes with Compassion Reflex de-stigmatization suggestions.
    
    This function implements a two-step LLM chain:
    1. Generate SOAP note from multilingual transcript
    2. Analyze for stigmatizing language and provide suggestions
    
    Args:
        full_transcript: Complete consultation transcript (may be multilingual/Hinglish)
        
    Returns:
        Tuple containing:
        - Dictionary with SOAP note sections (subjective, objective, assessment, plan)
        - List of de-stigmatization suggestions (empty if none found)
        
    Raises:
        ValueError: If transcript is empty or API key not configured
        RuntimeError: If LLM API calls fail
    """
    if not full_transcript or not full_transcript.strip():
        raise ValueError("Transcript cannot be empty")
    
    if not GEMINI_API_KEY:
        raise ValueError("GEMINI_API_KEY not configured")
    
    logger.info("Starting SOAP note generation with Compassion Reflex")
    
    # Step 1: Generate SOAP note
    logger.info("Step 1: Generating SOAP note from transcript")
    raw_soap_note = await _generate_soap_note(full_transcript)
    
    # Step 2: Run Compassion Reflex analysis
    logger.info("Step 2: Running Compassion Reflex de-stigmatization analysis")
    de_stigma_suggestions = await _analyze_for_stigma(
        raw_soap_note["assessment"],
        raw_soap_note["plan"]
    )
    
    logger.info(f"SOAP generation complete. Found {len(de_stigma_suggestions)} suggestions")
    
    return raw_soap_note, de_stigma_suggestions


async def _generate_soap_note(transcript: str) -> Dict[str, str]:
    """
    Step 1: Generate SOAP note from transcript using Gemini API.
    
    Args:
        transcript: Full consultation transcript
        
    Returns:
        Dictionary with keys: subjective, objective, assessment, plan
        
    Raises:
        RuntimeError: If API call fails or response is invalid
    """
    try:
        # Initialize Gemini model (using gemini-2.5-flash for better availability)
        model = genai.GenerativeModel('models/gemini-2.5-flash')
        
        # Format prompt with transcript
        prompt = SOAP_GENERATION_PROMPT.format(transcript=transcript)
        
        # Generate content
        logger.debug("Calling Gemini API for SOAP note generation")
        response = model.generate_content(prompt)
        
        # Extract text from response
        response_text = response.text.strip()
        logger.debug(f"Received response: {response_text[:200]}...")
        
        # Parse JSON response
        soap_note = _parse_json_response(response_text)
        
        # Validate required fields
        required_fields = ['subjective', 'objective', 'assessment', 'plan']
        for field in required_fields:
            if field not in soap_note:
                raise ValueError(f"Missing required field: {field}")
            if not soap_note[field] or not soap_note[field].strip():
                raise ValueError(f"Field '{field}' cannot be empty")
        
        # Validate using Pydantic model
        validated_note = SoapNoteResponse(**soap_note)
        
        return {
            "subjective": validated_note.subjective,
            "objective": validated_note.objective,
            "assessment": validated_note.assessment,
            "plan": validated_note.plan
        }
        
    except Exception as e:
        logger.error(f"Error generating SOAP note: {str(e)}")
        raise RuntimeError(f"Failed to generate SOAP note: {str(e)}")


async def _analyze_for_stigma(
    assessment: str,
    plan: str
) -> List[Dict[str, Any]]:
    """
    Step 2: Analyze SOAP note for stigmatizing language using Gemini API.
    
    Args:
        assessment: Assessment section of SOAP note
        plan: Plan section of SOAP note
        
    Returns:
        List of suggestion dictionaries (empty if no issues found)
        
    Raises:
        RuntimeError: If API call fails or response is invalid
    """
    try:
        # Initialize Gemini model (using gemini-2.5-flash for better availability)
        model = genai.GenerativeModel('models/gemini-2.5-flash')
        
        # Format prompt with assessment and plan sections
        prompt = COMPASSION_REFLEX_PROMPT.format(
            assessment=assessment,
            plan=plan
        )
        
        # Generate content
        logger.debug("Calling Gemini API for Compassion Reflex analysis")
        response = model.generate_content(prompt)
        
        # Extract text from response
        response_text = response.text.strip()
        logger.debug(f"Received response: {response_text[:200]}...")
        
        # Parse JSON response
        result = _parse_json_response(response_text)
        
        # Extract suggestions array
        suggestions = result.get("suggestions", [])
        
        # Validate each suggestion using Pydantic model
        validated_suggestions = []
        for suggestion in suggestions:
            try:
                validated = StigmaSuggestion(**suggestion)
                validated_suggestions.append({
                    "section": validated.section,
                    "original": validated.original,
                    "suggested": validated.suggested,
                    "rationale": validated.rationale
                })
            except Exception as e:
                logger.warning(f"Invalid suggestion format, skipping: {e}")
                continue
        
        return validated_suggestions
        
    except Exception as e:
        logger.error(f"Error analyzing for stigma: {str(e)}")
        # Return empty list on error rather than failing the entire process
        logger.warning("Returning empty suggestions due to error")
        return []


def _parse_json_response(response_text: str) -> Dict[str, Any]:
    """
    Parse JSON from LLM response, handling common formatting issues.
    
    Args:
        response_text: Raw text response from LLM
        
    Returns:
        Parsed JSON dictionary
        
    Raises:
        ValueError: If JSON cannot be parsed
    """
    # Remove markdown code blocks if present
    text = response_text.strip()
    if text.startswith("```json"):
        text = text[7:]
    elif text.startswith("```"):
        text = text[3:]
    if text.endswith("```"):
        text = text[:-3]
    text = text.strip()
    
    try:
        return json.loads(text)
    except json.JSONDecodeError as e:
        logger.error(f"Failed to parse JSON: {e}")
        logger.error(f"Response text: {text}")
        raise ValueError(f"Invalid JSON response from LLM: {str(e)}")


# Synchronous wrapper for backward compatibility
def generate_notes_with_empathy_sync(full_transcript: str) -> Tuple[Dict[str, str], List[Dict[str, Any]]]:
    """
    Synchronous wrapper for generate_notes_with_empathy.
    
    Note: This is a convenience function. Prefer using the async version in async contexts.
    """
    import asyncio
    return asyncio.run(generate_notes_with_empathy(full_transcript))

