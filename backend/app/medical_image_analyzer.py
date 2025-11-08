"""
Medical Image Analyzer using Google Gemini Vision API
Analyzes patient-uploaded medical images for preliminary assessment
"""

import google.generativeai as genai
from PIL import Image
import io
import json
import os
from datetime import datetime
from typing import Optional, Dict, Any, List
import base64

class MedicalImageAnalyzer:
    """Analyzes medical images using Gemini Vision API"""
    
    def __init__(self):
        """Initialize Gemini Vision model"""
        api_key = os.getenv('GEMINI_API_KEY')
        if not api_key:
            raise ValueError("GEMINI_API_KEY not found in environment variables")
        
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel('models/gemini-2.0-flash-exp')
        
    def _create_analysis_prompt(
        self,
        body_part: Optional[str] = None,
        symptoms: Optional[List[str]] = None,
        patient_description: Optional[str] = None
    ) -> str:
        """Create detailed prompt for medical image analysis"""
        
        prompt = """You are a medical AI assistant helping with preliminary image analysis for a telehealth platform.

CRITICAL DISCLAIMERS (must include in response):
- This is NOT a medical diagnosis
- For informational and educational purposes only
- Patient MUST consult a licensed healthcare professional
- This analysis is to help patients understand when to seek care

"""
        
        if body_part:
            prompt += f"BODY PART: {body_part}\n"
        
        if symptoms:
            prompt += f"REPORTED SYMPTOMS: {', '.join(symptoms)}\n"
        
        if patient_description:
            prompt += f"PATIENT DESCRIPTION: {patient_description}\n"
        
        prompt += """
Please analyze this medical image and provide a structured assessment:

1. VISUAL OBSERVATION:
   - Describe what you see in clear, simple terms
   - Note: color, size, texture, borders, distribution
   - Location and extent of the condition

2. POSSIBLE CONDITIONS (list 2-3, most to least likely):
   For each condition:
   - Name of condition
   - Why it matches the image
   - Typical characteristics
   - Common causes

3. SEVERITY ASSESSMENT:
   - Level: MILD / MODERATE / SEVERE
   - Reasoning for this assessment
   - Factors that influenced the rating

4. RED FLAGS (if any):
   - Signs requiring IMMEDIATE medical attention
   - Symptoms that suggest urgent care needed
   - When to go to emergency room

5. RECOMMENDATIONS:
   - Should see doctor immediately? (Yes/No and why)
   - Can wait for scheduled appointment? (Yes/No)
   - Home care suggestions (if appropriate)
   - What to monitor
   - When to seek help

6. FOLLOW-UP GUIDANCE:
   - What changes to watch for
   - When to take follow-up photos
   - Signs of improvement vs. worsening

7. QUESTIONS FOR DOCTOR:
   - Suggest 3-4 questions patient should ask their doctor

IMPORTANT:
- Use simple, patient-friendly language
- Be empathetic and reassuring
- Emphasize the importance of professional medical consultation
- If unsure, err on the side of recommending medical evaluation
- Highlight any concerning features clearly

Format your response as JSON with these keys:
{
  "visual_description": "...",
  "possible_conditions": [
    {"name": "...", "likelihood": "high/medium/low", "reasoning": "..."}
  ],
  "severity": "mild/moderate/severe",
  "severity_reasoning": "...",
  "red_flags": ["...", "..."],
  "requires_immediate_attention": true/false,
  "recommendations": {
    "see_doctor_immediately": true/false,
    "urgency_level": "immediate/soon/routine",
    "home_care": ["...", "..."],
    "monitoring": ["...", "..."]
  },
  "follow_up": {
    "watch_for": ["...", "..."],
    "photo_timing": "...",
    "improvement_signs": ["...", "..."],
    "worsening_signs": ["...", "..."]
  },
  "questions_for_doctor": ["...", "...", "..."],
  "disclaimer": "This is not a medical diagnosis. Please consult a healthcare professional."
}
"""
        
        return prompt
    
    async def analyze_image(
        self,
        image_data: bytes,
        body_part: Optional[str] = None,
        symptoms: Optional[List[str]] = None,
        patient_description: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Analyze a medical image using Gemini Vision
        
        Args:
            image_data: Raw image bytes
            body_part: Body part shown in image
            symptoms: List of symptoms patient is experiencing
            patient_description: Patient's description of the condition
            
        Returns:
            Dictionary with analysis results
        """
        try:
            # Load image
            pil_image = Image.open(io.BytesIO(image_data))
            
            # Resize if too large (max 4MB for Gemini)
            max_size = (2048, 2048)
            if pil_image.size[0] > max_size[0] or pil_image.size[1] > max_size[1]:
                pil_image.thumbnail(max_size, Image.Resampling.LANCZOS)
            
            # Create prompt
            prompt = self._create_analysis_prompt(body_part, symptoms, patient_description)
            
            # Generate analysis
            response = self.model.generate_content([prompt, pil_image])
            
            # Parse response
            response_text = response.text.strip()
            
            # Try to extract JSON from response
            try:
                # Remove markdown code blocks if present
                if response_text.startswith('```json'):
                    response_text = response_text.split('```json')[1].split('```')[0].strip()
                elif response_text.startswith('```'):
                    response_text = response_text.split('```')[1].split('```')[0].strip()
                
                analysis = json.loads(response_text)
            except json.JSONDecodeError:
                # If JSON parsing fails, return raw text with basic structure
                analysis = {
                    "visual_description": response_text,
                    "possible_conditions": [],
                    "severity": "unknown",
                    "severity_reasoning": "Unable to parse structured response",
                    "red_flags": [],
                    "requires_immediate_attention": False,
                    "recommendations": {
                        "see_doctor_immediately": True,
                        "urgency_level": "routine",
                        "home_care": [],
                        "monitoring": []
                    },
                    "raw_response": response_text,
                    "disclaimer": "This is not a medical diagnosis. Please consult a healthcare professional."
                }
            
            # Add metadata
            analysis['analyzed_at'] = datetime.now().isoformat()
            analysis['model'] = 'gemini-2.0-flash-exp'
            analysis['analysis_version'] = '1.0'
            
            return analysis
            
        except Exception as e:
            print(f"Error analyzing image: {str(e)}")
            return {
                "error": str(e),
                "visual_description": "Unable to analyze image",
                "severity": "unknown",
                "requires_immediate_attention": False,
                "recommendations": {
                    "see_doctor_immediately": True,
                    "urgency_level": "routine",
                    "home_care": [],
                    "monitoring": []
                },
                "disclaimer": "Analysis failed. Please consult a healthcare professional."
            }
    
    async def compare_images(
        self,
        before_image_data: bytes,
        after_image_data: bytes,
        days_between: int,
        condition_type: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Compare two images to track healing progress
        
        Args:
            before_image_data: Original image bytes
            after_image_data: Follow-up image bytes
            days_between: Number of days between images
            condition_type: Type of condition being tracked
            
        Returns:
            Dictionary with comparison results
        """
        try:
            # Load images
            before_image = Image.open(io.BytesIO(before_image_data))
            after_image = Image.open(io.BytesIO(after_image_data))
            
            # Resize if needed
            max_size = (2048, 2048)
            before_image.thumbnail(max_size, Image.Resampling.LANCZOS)
            after_image.thumbnail(max_size, Image.Resampling.LANCZOS)
            
            prompt = f"""Compare these two medical images taken {days_between} days apart.

FIRST IMAGE: Initial condition (BEFORE)
SECOND IMAGE: Current condition (AFTER)
{f'CONDITION TYPE: {condition_type}' if condition_type else ''}

Provide a detailed comparison:

1. CHANGES OBSERVED:
   - What has improved?
   - What has worsened?
   - What stayed the same?
   - Specific visual differences

2. HEALING PROGRESS:
   - Overall progress: Excellent / Good / Fair / Poor / Worsening
   - Estimated improvement percentage (0-100%)
   - Is healing on expected timeline?

3. ASSESSMENT:
   - Is the condition responding to treatment?
   - Are there any concerning changes?
   - Signs of infection or complications?

4. RECOMMENDATIONS:
   - Continue current treatment?
   - Need to see doctor?
   - Adjust care routine?
   - When to take next follow-up photo?

Format as JSON:
{{
  "overall_progress": "excellent/good/fair/poor/worsening",
  "improvement_percentage": 0-100,
  "changes": {{
    "improved": ["...", "..."],
    "worsened": ["...", "..."],
    "unchanged": ["...", "..."]
  }},
  "healing_assessment": "...",
  "concerns": ["...", "..."],
  "recommendations": {{
    "continue_treatment": true/false,
    "see_doctor": true/false,
    "urgency": "immediate/soon/routine",
    "care_adjustments": ["...", "..."],
    "next_photo_days": 3-7
  }},
  "disclaimer": "This comparison is for tracking purposes only. Consult your healthcare provider."
}}
"""
            
            response = self.model.generate_content([prompt, before_image, after_image])
            response_text = response.text.strip()
            
            # Parse JSON
            try:
                if response_text.startswith('```json'):
                    response_text = response_text.split('```json')[1].split('```')[0].strip()
                elif response_text.startswith('```'):
                    response_text = response_text.split('```')[1].split('```')[0].strip()
                
                comparison = json.loads(response_text)
            except json.JSONDecodeError:
                comparison = {
                    "overall_progress": "unknown",
                    "improvement_percentage": 0,
                    "raw_response": response_text,
                    "disclaimer": "Unable to parse comparison. Please consult your healthcare provider."
                }
            
            comparison['compared_at'] = datetime.now().isoformat()
            comparison['days_between'] = days_between
            comparison['model'] = 'gemini-2.0-flash-exp'
            
            return comparison
            
        except Exception as e:
            print(f"Error comparing images: {str(e)}")
            return {
                "error": str(e),
                "overall_progress": "unknown",
                "disclaimer": "Comparison failed. Please consult your healthcare provider."
            }
