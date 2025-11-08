"""
Lab Report Analyzer Module
Extracts text from PDF/images and analyzes using Gemini AI
"""

import os
import json
from typing import Dict, List, Optional
import google.generativeai as genai
from dotenv import load_dotenv

# PDF processing
import PyPDF2
import pdfplumber

# Image OCR - Google Cloud Vision
try:
    from google.cloud import vision
    from PIL import Image
    VISION_API_AVAILABLE = True
except ImportError:
    VISION_API_AVAILABLE = False

load_dotenv()

# Configure Gemini
genai.configure(api_key=os.getenv('GEMINI_API_KEY'))


class LabReportAnalyzer:
    """Analyzes lab reports from PDF or image files"""
    
    def __init__(self):
        self.model = genai.GenerativeModel('gemini-2.5-flash')
    
    def extract_text_from_pdf(self, file_path: str) -> str:
        """Extract text from PDF using pdfplumber"""
        try:
            text = ""
            with pdfplumber.open(file_path) as pdf:
                for page in pdf.pages:
                    page_text = page.extract_text()
                    if page_text:
                        text += page_text + "\n"
            return text.strip()
        except Exception as e:
            raise Exception(f"Error extracting text from PDF: {str(e)}")
    
    def extract_text_from_image(self, file_path: str) -> str:
        """Extract text from image using Google Cloud Vision API"""
        if not VISION_API_AVAILABLE:
            raise Exception("Google Cloud Vision API is not available. Please install google-cloud-vision.")
        
        try:
            # Initialize Vision API client
            client = vision.ImageAnnotatorClient()
            
            # Read image file
            with open(file_path, 'rb') as image_file:
                content = image_file.read()
            
            image = vision.Image(content=content)
            
            # Perform text detection
            response = client.text_detection(image=image)
            texts = response.text_annotations
            
            if response.error.message:
                raise Exception(f"Vision API error: {response.error.message}")
            
            # Extract full text (first annotation contains all text)
            if texts:
                return texts[0].description.strip()
            else:
                return ""
                
        except Exception as e:
            raise Exception(f"Error extracting text from image: {str(e)}")
    
    def extract_text(self, file_path: str, file_type: str) -> str:
        """Extract text based on file type"""
        if file_type.lower() == 'pdf':
            return self.extract_text_from_pdf(file_path)
        elif file_type.lower() in ['jpg', 'jpeg', 'png', 'image']:
            return self.extract_text_from_image(file_path)
        else:
            raise Exception(f"Unsupported file type: {file_type}")
    
    async def analyze_lab_report(self, extracted_text: str) -> Dict:
        """Analyze lab report text using Gemini AI"""
        
        prompt = f"""
You are a medical AI assistant specialized in analyzing lab reports. Analyze the following lab report text and provide a structured analysis.

Lab Report Text:
{extracted_text}

Please analyze this lab report and provide:

1. Extract all lab test values with their units
2. Identify which values are abnormal (outside normal ranges)
3. For each abnormal value, provide a simple explanation in patient-friendly language
4. Provide an overall health summary

Format your response as a valid JSON object with this exact structure:
{{
  "values": [
    {{"name": "Test Name", "value": "numeric value", "unit": "unit", "status": "normal/high/low", "normal_range": "range"}}
  ],
  "abnormal_values": [
    {{
      "name": "Test Name",
      "value": "numeric value",
      "unit": "unit",
      "normal_range": "expected range",
      "status": "high/low",
      "explanation": "Simple explanation of what this means for the patient",
      "recommendation": "What the patient should do"
    }}
  ],
  "summary": "Overall health summary in simple, patient-friendly language",
  "urgent_attention": false,
  "urgent_message": "Message if urgent attention is needed"
}}

Important:
- Use simple, non-medical language for explanations
- Be encouraging and not alarming
- Always recommend consulting a doctor for abnormal values
- If you cannot extract clear values, indicate that in the summary
"""
        
        try:
            response = await self.model.generate_content_async(prompt)
            result_text = response.text
            
            # Try to extract JSON from response
            # Sometimes Gemini wraps JSON in markdown code blocks
            if "```json" in result_text:
                result_text = result_text.split("```json")[1].split("```")[0].strip()
            elif "```" in result_text:
                result_text = result_text.split("```")[1].split("```")[0].strip()
            
            # Parse JSON
            analysis = json.loads(result_text)
            return analysis
            
        except json.JSONDecodeError as e:
            # If JSON parsing fails, return a structured error
            return {
                "values": [],
                "abnormal_values": [],
                "summary": "Unable to parse lab report. The text may not contain clear lab values or the format is not recognized.",
                "urgent_attention": False,
                "error": f"JSON parsing error: {str(e)}",
                "raw_response": response.text if 'response' in locals() else None
            }
        except Exception as e:
            raise Exception(f"Error analyzing lab report: {str(e)}")
    
    async def process_lab_report(self, file_path: str, file_type: str) -> Dict:
        """Complete pipeline: extract text and analyze"""
        try:
            # Step 1: Extract text
            extracted_text = self.extract_text(file_path, file_type)
            
            if not extracted_text or len(extracted_text) < 50:
                return {
                    "success": False,
                    "error": "Could not extract sufficient text from the file. Please ensure the image is clear or the PDF is not scanned.",
                    "extracted_text": extracted_text
                }
            
            # Step 2: Analyze with Gemini
            analysis = await self.analyze_lab_report(extracted_text)
            
            return {
                "success": True,
                "extracted_text": extracted_text,
                "analysis": analysis
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }


# Singleton instance
_analyzer = None

def get_lab_report_analyzer() -> LabReportAnalyzer:
    """Get or create lab report analyzer instance"""
    global _analyzer
    if _analyzer is None:
        _analyzer = LabReportAnalyzer()
    return _analyzer
