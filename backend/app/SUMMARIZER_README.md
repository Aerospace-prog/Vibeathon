# SOAP Note Summarizer with Compassion Reflex

This module implements AI-powered SOAP note generation with automatic de-stigmatization suggestions for clinical documentation.

## Features

- **Two-Step LLM Chain**: Uses Google Gemini API for both SOAP generation and empathy analysis
- **Multilingual Support**: Handles Hinglish (Hindi-English code-switching) transcripts
- **HIPAA Compliance**: Generates professional, privacy-conscious clinical notes
- **Compassion Reflex**: Identifies and suggests alternatives for stigmatizing language
- **Person-First Language**: Based on EMNLP 2024 'Words Matter' research

## Requirements

- Python 3.10+
- Google Gemini API key
- Dependencies: `google-generativeai`, `pydantic`

## Setup

1. Set environment variable:
```bash
export GEMINI_API_KEY="your_api_key_here"
```

2. Install dependencies:
```bash
pip install google-generativeai pydantic
```

## Usage

### Basic Usage

```python
from app.summarizer import generate_notes_with_empathy

# Sample transcript (can be multilingual/Hinglish)
transcript = """
Doctor: Hello, how are you feeling?
Patient: Mujhe bahut dard ho raha hai. I have a lot of pain.
Doctor: Where is the pain?
Patient: Pet mein. In my stomach.
"""

# Generate SOAP note with empathy suggestions
soap_note, suggestions = await generate_notes_with_empathy(transcript)

# Access SOAP sections
print(soap_note["subjective"])
print(soap_note["objective"])
print(soap_note["assessment"])
print(soap_note["plan"])

# Review de-stigmatization suggestions
for suggestion in suggestions:
    print(f"Section: {suggestion['section']}")
    print(f"Original: {suggestion['original']}")
    print(f"Suggested: {suggestion['suggested']}")
    print(f"Rationale: {suggestion['rationale']}")
```

### Integration with FastAPI

```python
from fastapi import FastAPI, HTTPException
from app.summarizer import generate_notes_with_empathy
from app.models import SoapGenerationResponse

app = FastAPI()

@app.post("/consultation/{consultation_id}/generate_soap")
async def generate_soap_endpoint(consultation_id: str):
    try:
        # Fetch transcript from database
        transcript = await db.get_full_transcript(consultation_id)
        
        # Generate SOAP note with empathy suggestions
        soap_note, suggestions = await generate_notes_with_empathy(transcript)
        
        # Save to database
        await db.save_soap_note(consultation_id, soap_note, suggestions)
        
        return SoapGenerationResponse(
            raw_soap_note=soap_note,
            de_stigma_suggestions=suggestions,
            consultation_id=consultation_id
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
```

## API Reference

### `generate_notes_with_empathy(full_transcript: str)`

Main function that orchestrates the two-step LLM chain.

**Parameters:**
- `full_transcript` (str): Complete consultation transcript (may be multilingual)

**Returns:**
- Tuple containing:
  - `Dict[str, str]`: SOAP note with keys 'subjective', 'objective', 'assessment', 'plan'
  - `List[Dict[str, Any]]`: De-stigmatization suggestions (empty list if none found)

**Raises:**
- `ValueError`: If transcript is empty or API key not configured
- `RuntimeError`: If LLM API calls fail

### Response Format

**SOAP Note:**
```python
{
    "subjective": "Patient's reported symptoms and history",
    "objective": "Observable findings and measurements",
    "assessment": "Clinical diagnosis and impression",
    "plan": "Treatment plan and follow-up"
}
```

**De-stigmatization Suggestions:**
```python
[
    {
        "section": "assessment",  # or "plan"
        "original": "patient is non-compliant",
        "suggested": "patient reports difficulty adhering to medication",
        "rationale": "Person-first language avoids judgmental terms"
    }
]
```

## Error Handling

The module includes robust error handling:

- **Invalid JSON**: Automatically strips markdown code blocks and retries parsing
- **Missing Fields**: Validates all required SOAP sections are present
- **API Failures**: Logs errors and provides meaningful error messages
- **Stigma Analysis Errors**: Returns empty suggestions list rather than failing

## Testing

Run the example test script:

```bash
cd backend/app
python test_summarizer_example.py
```

## Implementation Details

### Step 1: SOAP Note Generation

Uses a carefully crafted prompt that:
- Handles multilingual/Hinglish input
- Extracts only clinically relevant information
- Maintains HIPAA compliance
- Outputs structured JSON

### Step 2: Compassion Reflex Analysis

Analyzes the assessment and plan sections for:
- Non-person-first language (e.g., "diabetic patient")
- Judgmental terms (e.g., "non-compliant")
- Deficit-focused descriptions (e.g., "drug abuser")
- Blame-oriented language (e.g., "patient refuses")

## Best Practices

1. **Always validate input**: Ensure transcript is not empty
2. **Handle errors gracefully**: Catch exceptions and provide user feedback
3. **Log for debugging**: Use the built-in logging for troubleshooting
4. **Review suggestions**: Doctors should always review and approve changes
5. **Monitor API usage**: Track Gemini API calls for cost management

## Limitations

- Requires active internet connection for API calls
- Subject to Gemini API rate limits
- LLM responses may vary slightly between calls
- Best results with clear, medical-focused transcripts

## Future Enhancements

- Support for additional languages beyond Hindi/English
- Fine-tuned models for medical terminology
- Caching for common phrases
- Batch processing for multiple consultations
- Custom stigma detection rules per organization

