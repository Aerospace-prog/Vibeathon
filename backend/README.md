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
