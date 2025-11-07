# Arogya-AI Backend

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
```

## API Endpoints

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
