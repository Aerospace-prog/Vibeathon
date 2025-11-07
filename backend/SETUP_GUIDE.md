# Backend Setup Guide

## ✅ Completed Steps

- [x] Virtual environment created (`venv/`)
- [x] All Python dependencies installed
- [x] `.env` file created

## 🔑 Required: Add Your API Keys

You need to add two API keys to `backend/.env` before running the application:

### 1. Google Gemini API Key (Required for Task 9)

**Get your key:**
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the key

**Add to `.env`:**
```bash
GEMINI_API_KEY=AIzaSy...your_actual_key_here
```

### 2. Supabase Service Key (Required for database)

**Get your key:**
1. Go to [Supabase Dashboard](https://supabase.com/dashboard/project/uqljtqnjanemvdkxnnjj)
2. Click Settings → API
3. Copy the `service_role` key (NOT the anon key)

**Add to `.env`:**
```bash
SUPABASE_SERVICE_KEY=eyJhbGci...your_service_role_key_here
```

## 🧪 Test Your Setup

Once you've added the API keys, test the SOAP note generator:

### Activate Virtual Environment

```bash
# In the backend directory
.\venv\Scripts\activate
```

You should see `(venv)` in your terminal prompt.

### Run Test Script

```bash
cd app
python test_summarizer_example.py
```

If everything is configured correctly, you'll see:
- ✓ SOAP Note Generated Successfully!
- The four SOAP sections (Subjective, Objective, Assessment, Plan)
- Any de-stigmatization suggestions found

## 🚀 Running the Backend Server

Once testing is successful, you can start the FastAPI server:

```bash
# Make sure you're in the backend directory with venv activated
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at: `http://localhost:8000`

## 📝 Optional Setup (for later tasks)

These are not needed for Task 9 but will be required for other features:

### Google Cloud Speech-to-Text (Task 4)
- Set `GOOGLE_CLOUD_PROJECT_ID`
- Download service account JSON and set `GOOGLE_APPLICATION_CREDENTIALS`

### OpenAI Whisper API (Alternative to Google STT)
- Set `OPENAI_API_KEY`

## 🔍 Troubleshooting

### "GEMINI_API_KEY not configured" error
- Make sure you've added the key to `backend/.env`
- Ensure there are no extra spaces or quotes around the key
- Restart your terminal/script after adding the key

### "Module not found" errors
- Make sure virtual environment is activated: `.\venv\Scripts\activate`
- Reinstall dependencies: `pip install -r requirements.txt`

### Import errors in test script
- Make sure you're in the `backend/app` directory when running tests
- Python needs to find the modules in the same directory

## 📂 Project Structure

```
backend/
├── venv/                          # Virtual environment (don't commit)
├── app/
│   ├── __init__.py
│   ├── main.py                    # FastAPI application
│   ├── models.py                  # Pydantic models
│   ├── summarizer.py              # SOAP note generation (Task 9)
│   ├── test_summarizer_example.py # Test script
│   └── ...
├── .env                           # Environment variables (don't commit)
├── .env.example                   # Template for .env
├── requirements.txt               # Python dependencies
└── SETUP_GUIDE.md                 # This file
```

## 🎯 Next Steps

After completing setup:
1. Add your API keys to `.env`
2. Test with `python test_summarizer_example.py`
3. Continue with Task 10 (API endpoints)

