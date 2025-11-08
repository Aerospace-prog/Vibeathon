"""
Health Tips Generator using Gemini AI
Generates personalized daily wellness tips for patients
"""

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional, List
import google.generativeai as genai
from datetime import date
import os
from dotenv import load_dotenv

load_dotenv()

# Configure Gemini AI
genai.configure(api_key=os.getenv('GEMINI_API_KEY'))

router = APIRouter()

class HealthTip(BaseModel):
    category: str
    tip_text: str
    generated_date: Optional[date] = None

class HealthTipResponse(BaseModel):
    success: bool
    tip: Optional[HealthTip] = None
    error: Optional[str] = None

# Initialize Gemini model
model = genai.GenerativeModel('gemini-2.0-flash-exp')

def generate_health_tip(category: str) -> str:
    """Generate a health tip using Gemini AI"""
    
    prompts = {
        'nutrition': """Generate a single, practical nutrition tip for maintaining good health. 
        The tip should be:
        - Actionable and easy to follow
        - Based on scientific evidence
        - 2-3 sentences maximum
        - Focused on daily habits
        - Positive and encouraging
        
        Do not include any introduction or explanation, just the tip itself.""",
        
        'exercise': """Generate a single, practical exercise tip for staying active and healthy.
        The tip should be:
        - Suitable for most people
        - Easy to incorporate into daily routine
        - 2-3 sentences maximum
        - Motivating and achievable
        - Safe and evidence-based
        
        Do not include any introduction or explanation, just the tip itself.""",
        
        'mental_health': """Generate a single, practical mental health tip for emotional wellbeing.
        The tip should be:
        - Focused on stress management or mindfulness
        - Easy to practice daily
        - 2-3 sentences maximum
        - Calming and supportive
        - Evidence-based
        
        Do not include any introduction or explanation, just the tip itself."""
    }
    
    try:
        prompt = prompts.get(category, prompts['nutrition'])
        response = model.generate_content(prompt)
        return response.text.strip()
    except Exception as e:
        # Fallback tips if AI fails
        fallback_tips = {
            'nutrition': "Start your day with a glass of water and a balanced breakfast. Include protein, whole grains, and fruits to fuel your body and mind.",
            'exercise': "Take a 10-minute walk after meals to improve digestion and boost energy. Even small movements throughout the day add up to better health.",
            'mental_health': "Practice deep breathing for 5 minutes when feeling stressed. Inhale for 4 counts, hold for 4, exhale for 4 - this activates your body's relaxation response."
        }
        return fallback_tips.get(category, fallback_tips['nutrition'])

@router.get("/health-tips/{category}", response_model=HealthTipResponse)
async def get_health_tip(category: str):
    """
    Get a daily health tip for the specified category
    Categories: nutrition, exercise, mental_health
    """
    
    valid_categories = ['nutrition', 'exercise', 'mental_health']
    
    if category not in valid_categories:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid category. Must be one of: {', '.join(valid_categories)}"
        )
    
    try:
        tip_text = generate_health_tip(category)
        
        tip = HealthTip(
            category=category,
            tip_text=tip_text,
            generated_date=date.today()
        )
        
        return HealthTipResponse(success=True, tip=tip)
        
    except Exception as e:
        return HealthTipResponse(
            success=False,
            error=f"Failed to generate health tip: {str(e)}"
        )

@router.get("/health-tips/all/today", response_model=dict)
async def get_all_daily_tips():
    """Get all three categories of tips for today"""
    
    try:
        tips = {}
        for category in ['nutrition', 'exercise', 'mental_health']:
            tip_text = generate_health_tip(category)
            tips[category] = {
                'category': category,
                'tip_text': tip_text,
                'generated_date': str(date.today())
            }
        
        return {
            'success': True,
            'tips': tips
        }
        
    except Exception as e:
        return {
            'success': False,
            'error': f"Failed to generate tips: {str(e)}"
        }
