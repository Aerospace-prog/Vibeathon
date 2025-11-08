# 🤖 AI-Powered Symptom Checker Setup

## Get Your Free Gemini API Key

1. **Visit Google AI Studio:**
   - Go to: https://makersuite.google.com/app/apikey
   - Or: https://aistudio.google.com/app/apikey

2. **Sign in with your Google Account**

3. **Create API Key:**
   - Click "Create API Key"
   - Copy the generated key

4. **Add to .env file:**
   ```bash
   GEMINI_API_KEY=your_actual_api_key_here
   ```

5. **Restart the backend:**
   ```bash
   python run.py
   ```

## ✨ Features with AI Enabled:

- **Universal Understanding:** Understands symptoms in ANY language
- **Intelligent Analysis:** AI analyzes context, severity, and urgency
- **Smart Recommendations:** Provides specific advice based on symptoms
- **Natural Language:** Patients can describe symptoms naturally
- **Cultural Context:** Understands cultural and linguistic nuances

## 🔄 Fallback Mode:

If no API key is provided, the system automatically falls back to pattern matching mode with critical symptom detection.

## 🆓 Free Tier:

Google Gemini offers a generous free tier:
- 60 requests per minute
- Perfect for testing and small deployments
- No credit card required

## 🚀 Example Usage:

**Patient Input:**
- "मुझे सीने में दर्द हो रहा है" (Hindi: I have chest pain)
- "I can't breathe properly"
- "My head hurts really bad"
- "Je ne peux pas respirer" (French: I can't breathe)

**AI Response:**
- Detects the symptom
- Analyzes severity (1-5)
- Provides recommendations
- Works in ANY language!

## 🔒 Security:

- API key is stored securely in .env file
- Never committed to version control
- Only used for symptom analysis
- HIPAA-compliant usage

---

**Need Help?** Check the Google AI documentation: https://ai.google.dev/docs
