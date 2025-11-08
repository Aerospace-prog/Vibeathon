# Arogya-AI Backend

<<<<<<< Updated upstream
FastAPI backend for the Arogya-AI telehealth platform with real-time translation and SOAP note generation.

## Setup

1. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Configure environment variables:
```bash
cp .env.example .env
# Edit .env with your API keys
```

4. Run the development server:
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
=======
Backend services for the Arogya-AI telehealth platform, including real-time medical alert detection and voice emotion analysis.

## Modules

### Alert Engine (`app/alert_engine.py`)

Real-time medical alert detection system that analyzes patient transcripts for critical symptoms.

**Features:**
- Pattern-based symptom detection using regex
- Context-aware severity scoring (1-5 scale)
- Alert deduplication (5-minute timeout)
- Support for multiple symptom categories

**Supported Symptom Types:**
- `chest_pain` - Chest pain, cardiac symptoms (severity: 5)
- `breathing` - Difficulty breathing, shortness of breath (severity: 5)
- `consciousness` - Loss of consciousness, fainting (severity: 5)
- `bleeding` - Severe bleeding, hemorrhage (severity: 4)
- `mental_health` - Suicidal ideation, self-harm (severity: 5)
- `neurological` - Severe headache, stroke symptoms (severity: 4)

**Usage Example:**
```python
from app.alert_engine import AlertEngine

# Initialize engine
engine = AlertEngine()

# Analyze transcript
alert = await engine.analyze_transcript(
    text="I'm having severe chest pain",
    consultation_id="consultation-123",
    speaker_type="patient"
)

if alert:
    print(f"Alert: {alert.symptom_type} (severity: {alert.severity_score})")
    print(f"Context: {alert.symptom_text}")
```

**Severity Calculation:**
- Base severity from symptom type
- +1 for intensity words (severe, extreme, unbearable)
- +1 for sudden onset (sudden, just started)
- -2 for mild indicators (mild, slight, minor)
- Capped at 1-5 range

**Deduplication:**
- Alerts are cached by (consultation_id, symptom_type)
- Same symptom type won't trigger alert within 5 minutes
- Cache is cleared when consultation ends

## Installation

```bash
cd backend

# Create virtual environment
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate  # On macOS/Linux
# or
venv\Scripts\activate  # On Windows

# Install dependencies
pip install -r requirements.txt
```

## Quick Start - Testing the Alert Engine

### Option 1: Frontend Integration (Recommended for Dynamic Testing)

1. **Start the backend API server:**
```bash
cd backend
./start_server.sh
```

2. **Start the frontend (in a new terminal):**
```bash
cd frontend
npm run dev
```

3. **Access the Alert Engine Test Page:**
   - Open your browser to: http://localhost:3000/alert-test
   - Login with your credentials
   - Test dynamically with real-time input!

**Try these examples:**
- "I have severe chest pain" → Should trigger severity 5 alert
- "I can't breathe properly" → Should trigger severity 5 alert
- "I have a mild headache" → Should NOT trigger alert
- "The patient looks fine" (as doctor) → Should NOT trigger alert

### Option 2: API Testing with curl

```bash
# Start the server first
./start_server.sh

# In another terminal, test the API
curl -X POST http://localhost:8000/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "text": "I have severe chest pain",
    "consultation_id": "test-001",
    "speaker_type": "patient"
  }'
```

### Option 3: Run Example Script

```bash
# Make sure virtual environment is activated
source venv/bin/activate

# Run the example usage script
python example_usage.py
```

This will demonstrate the Alert Engine detecting various critical symptoms.

## Testing

```bash
# Run tests (when implemented)
pytest tests/
>>>>>>> Stashed changes
```

## API Endpoints

<<<<<<< Updated upstream
- `GET /health` - Health check
- `GET /` - Root endpoint
- `WS /ws/{consultation_id}/{user_type}` - WebSocket for audio streaming (coming soon)
- `POST /consultation/{consultation_id}/generate_soap` - Generate SOAP notes (coming soon)
- `POST /community_lexicon/add` - Add lexicon term (coming soon)

## Architecture

- **FastAPI**: Modern async web framework
- **WebSockets**: Real-time audio streaming
- **Supabase**: Database and authentication
- **Google Cloud**: Speech-to-Text and Translation
- **Google Gemini**: SOAP note generation
- **Sentence Transformers**: Vector embeddings for lexicon search

## Development

The backend is organized into modules:
- `main.py` - FastAPI app and routes
- `models.py` - Pydantic data models
- `database.py` - Supabase client
- `connection_manager.py` - WebSocket manager
- `stt_pipeline.py` - Speech-to-text pipeline (coming soon)
- `summarizer.py` - SOAP note generation (coming soon)
# Arogya-AI Backend

FastAPI backend for the Arogya-AI telehealth platform.

## Features

- Real-time audio streaming via WebSocket
- Speech-to-text with Hinglish support
- Live translation (Hindi ↔ English)
- AI-powered SOAP note generation
- Compassion Reflex de-stigmatization
- Community medical lexicon with vector search

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Configure environment variables:
```bash
cp .env.example .env
# Edit .env with your API keys and credentials
```

3. Run the development server:
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## API Documentation

Once running, visit:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Environment Variables

See `.env.example` for required configuration.

## Project Structure

```
backend/
├── app/
│   ├── main.py              # FastAPI app initialization
│   ├── models.py            # Pydantic models
│   ├── database.py          # Supabase client
│   ├── connection_manager.py # WebSocket manager
│   ├── stt_pipeline.py      # Speech-to-text pipeline
│   └── summarizer.py        # SOAP note generation
├── requirements.txt
├── .env.example
└── README.md
```
=======
Once the server is running, you can access:

- **API Documentation**: http://localhost:8000/docs (Swagger UI)
- **Alternative Docs**: http://localhost:8000/redoc (ReDoc)

### Available Endpoints:

**POST /analyze**
- Analyzes transcript text for critical symptoms
- Request body:
  ```json
  {
    "text": "patient speech text",
    "consultation_id": "consultation-id",
    "speaker_type": "patient"
  }
  ```
- Response:
  ```json
  {
    "alert_detected": true,
    "alert": {
      "symptom_text": "detected context",
      "symptom_type": "chest_pain",
      "severity_score": 5,
      "timestamp": "2024-01-15T10:30:45"
    },
    "message": "Critical symptom detected: chest_pain"
  }
  ```

**POST /clear-cache/{consultation_id}**
- Clears alert deduplication cache for a consultation
- Useful when consultation ends

**GET /patterns**
- Returns all configured symptom patterns
- Useful for debugging and understanding detection rules

## Requirements

See `requirements.txt` for full dependency list.

## Future Modules

- **Emotion Analyzer** - Voice emotion detection from audio features
- **Database Client** - Supabase integration for data persistence
- **API Endpoints** - FastAPI REST and WebSocket endpoints
- **STT Pipeline** - Speech-to-text integration
>>>>>>> Stashed changes
