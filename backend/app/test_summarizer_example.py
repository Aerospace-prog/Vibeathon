"""
Example script to test the summarizer module.

This demonstrates how to use the SOAP note generation with Compassion Reflex.
Note: Requires GEMINI_API_KEY to be set in environment variables.
"""

import asyncio
import sys
import os

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from summarizer import generate_notes_with_empathy

# Sample multilingual transcript (Hinglish)
SAMPLE_TRANSCRIPT = """
Doctor: Hello, aap kaise hain? How are you feeling today?
Patient: Doctor, mujhe bahut dard ho raha hai. My stomach is hurting a lot.
Doctor: Kab se? Since when?
Patient: Teen din se. For three days.
Doctor: Okay, let me check. Any fever?
Patient: Haan, thoda bukhar bhi hai. Yes, slight fever also.
Doctor: Alright. Aapko gastritis lag raha hai. You seem to have gastritis.
Patient: Kya karna chahiye? What should I do?
Doctor: Main aapko medicine dunga. I'll give you medicine. Take it twice daily.
Patient: Theek hai doctor. Okay doctor.
"""

async def test_soap_generation():
    """Test SOAP note generation with sample transcript."""
    print("Testing SOAP Note Generation with Compassion Reflex")
    print("=" * 60)
    
    try:
        # Generate SOAP note with empathy suggestions
        soap_note, suggestions = await generate_notes_with_empathy(SAMPLE_TRANSCRIPT)
        
        print("\n✓ SOAP Note Generated Successfully!\n")
        
        print("SUBJECTIVE:")
        print(soap_note["subjective"])
        print("\nOBJECTIVE:")
        print(soap_note["objective"])
        print("\nASSESSMENT:")
        print(soap_note["assessment"])
        print("\nPLAN:")
        print(soap_note["plan"])
        
        print("\n" + "=" * 60)
        print(f"\n✓ Compassion Reflex Analysis Complete!")
        print(f"Found {len(suggestions)} de-stigmatization suggestions\n")
        
        if suggestions:
            for i, suggestion in enumerate(suggestions, 1):
                print(f"Suggestion {i}:")
                print(f"  Section: {suggestion['section']}")
                print(f"  Original: {suggestion['original']}")
                print(f"  Suggested: {suggestion['suggested']}")
                print(f"  Rationale: {suggestion['rationale']}")
                print()
        else:
            print("No stigmatizing language detected. Great job!")
        
    except Exception as e:
        print(f"\n✗ Error: {str(e)}")
        print("\nMake sure GEMINI_API_KEY is set in your environment variables.")

if __name__ == "__main__":
    asyncio.run(test_soap_generation())

