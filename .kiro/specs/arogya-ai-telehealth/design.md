# Design Document: Arogya-AI Telehealth Platform

## Overview

Arogya-AI is a full-stack telehealth application built with a modern, scalable architecture. The system uses Next.js for the frontend, FastAPI for the backend, and Supabase (PostgreSQL with pgvector) for data persistence. The design emphasizes real-time communication, AI-powered language processing, and human-in-the-loop clinical documentation.

### Key Design Principles

1. **Real-time First**: WebSocket and WebRTC for low-latency audio/video streaming
2. **AI-Augmented**: Multiple AI services working in concert (ASR, Translation, LLM, Embeddings)
3. **Human-in-the-Loop**: Doctors maintain final authority over clinical documentation
4. **Privacy-by-Design**: Row Level Security and authentication at every layer
5. **Graceful Degradation**: Fallback mechanisms for critical AI services

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Next.js Frontend                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Auth Pages   │  │  Dashboard   │  │ Video Room   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│  ┌──────────────┐  ┌──────────────────────────────────┐    │
│  │ SOAP Review  │  │    Supabase Client (Auth)        │    │
│  └──────────────┘  └──────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ HTTPS / WebSocket
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    FastAPI Backend                           │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  WebSocket Manager (Audio Streaming)                 │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ STT Pipeline │  │ Summarizer   │  │  Database    │      │
│  │              │  │              │  │  Client      │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ SQL / Vector Search
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              Supabase (PostgreSQL + pgvector)                │
│  ┌──────────┐  ┌──────────────┐  ┌──────────────────┐      │
│  │ Patients │  │ Consultations│  │ Medical Lexicon  │      │
│  └──────────┘  └──────────────┘  └──────────────────┘      │
└─────────────────────────────────────────────────────────────┘

External AI Services:
┌──────────────────┐  ┌──────────────────┐  ┌──────────────┐
│ Google Cloud STT │  │ OpenAI Whisper   │  │ Google Gemini│
│ (Primary)        │  │ (Alternative)    │  │ LLM          │
└──────────────────┘  └──────────────────┘  └──────────────┘
┌──────────────────┐
│ Google Translate │
│ API              │
└──────────────────┘
```

### Technology Stack

**Frontend:**
- Next.js 14+ (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui components
- WebRTC (native APIs or simple-peer)
- Supabase JS client

**Backend:**
- FastAPI (Python 3.10+)
- WebSockets (FastAPI native)
- Supabase Python client
- sentence-transformers (gte-small)

**Database:**
- Supabase (PostgreSQL 15+)
- pgvector extension

**AI Services:**
- Google Cloud Speech-to-Text (primary ASR with free tier)
- OpenAI Whisper API (alternative ASR)
- Google Cloud Translation API
- Google Gemini API (LLM)
- Supabase/gte-small (embeddings)

## Components and Interfaces

### Frontend Components

#### 1. Authentication Module (`app/(auth)/page.tsx`)

**Purpose**: Handle user sign-in and sign-up

**Key Features:**
- Email/password authentication via Supabase Auth
- Session management with automatic token refresh
- Protected route middleware

**Interface:**
```typescript
interface AuthForm {
  email: string;
  password: string;
  mode: 'signin' | 'signup';
}
```

#### 2. Dashboard (`app/dashboard/page.tsx`)

**Purpose**: Main landing page for authenticated doctors

**Key Features:**
- List upcoming consultations
- Button to start new consultation
- Quick access to patient records

**Data Flow:**
- Fetches consultations from Supabase filtered by doctor_id
- Real-time subscription to consultation updates

#### 3. VideoCallRoom Component (`components/VideoCallRoom.tsx`)

**Purpose**: Real-time video consultation with live translation

**Key Features:**
- WebRTC peer connection setup
- MediaRecorder for audio capture
- WebSocket connection to backend
- Live caption display
- End call and navigate to SOAP review

**Interface:**
```typescript
interface VideoCallRoomProps {
  consultationId: string;
  userType: 'doctor' | 'patient';
}

interface CaptionMessage {
  speaker_id: string;
  original_text: string;
  translated_text: string;
  timestamp: number;
}
```

**WebSocket Protocol:**
```typescript
// Outgoing: Binary audio chunks
Uint8Array

// Incoming: JSON caption messages
{
  "speaker_id": "doctor" | "patient",
  "original_text": "...",
  "translated_text": "...",
  "timestamp": 1234567890
}
```

#### 4. SoapNoteReview Component (`components/SoapNoteReview.tsx`)

**Purpose**: Review and edit AI-generated SOAP notes with empathy suggestions

**Key Features:**
- Editable textareas for S, O, A, P sections
- Alert components for de-stigmatization suggestions
- "Accept" button to apply suggestions
- Modal for Community Lexicon contributions
- Final approval and save

**Interface:**
```typescript
interface SoapNote {
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
}

interface StigmaSuggestion {
  section: 'assessment' | 'plan';
  original: string;
  suggested: string;
  rationale: string;
}

interface LexiconContribution {
  term_english: string;
  term_regional: string;
  language: string;
}
```

#### 5. Patient Records (`app/records/page.tsx`)

**Purpose**: List patients and consultation history

**Key Features:**
- Searchable patient list
- Consultation history per patient
- Links to SOAP note reviews

### Backend Components

#### 1. FastAPI Main Application (`app/main.py`)

**Purpose**: HTTP and WebSocket server

**Endpoints:**

```python
# WebSocket for audio streaming
@app.websocket("/ws/{consultation_id}/{user_type}")
async def websocket_endpoint(
    websocket: WebSocket,
    consultation_id: str,
    user_type: str
)

# Generate SOAP note post-consultation
@app.post("/consultation/{consultation_id}/generate_soap")
async def generate_soap_note(consultation_id: str)

# Add term to Community Lexicon
@app.post("/community_lexicon/add")
async def add_lexicon_term(term: LexiconTerm)

# Health check
@app.get("/health")
async def health_check()
```

**CORS Configuration:**
```python
origins = [
    "http://localhost:3000",  # Next.js dev
    "https://yourdomain.com"  # Production
]
```

#### 2. Connection Manager (`app/connection_manager.py`)

**Purpose**: Manage WebSocket connections for consultation rooms

**Key Features:**
- Track active connections per consultation
- Broadcast messages to specific participants
- Handle disconnections gracefully

**Interface:**
```python
class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, Dict[str, WebSocket]] = {}
    
    async def connect(self, consultation_id: str, user_type: str, websocket: WebSocket)
    async def disconnect(self, consultation_id: str, user_type: str)
    async def broadcast_to_other(self, consultation_id: str, sender_type: str, message: dict)
```

#### 3. STT Pipeline (`app/stt_pipeline.py`)

**Purpose**: Real-time speech-to-text and translation with lexicon integration

**Key Features:**
- Google Cloud Speech-to-Text primary ASR (free tier: 60 min/month)
- OpenAI Whisper API alternative (pay-per-use, highly accurate)
- Language-specific configuration for Hinglish
- Vector similarity search for Community Lexicon
- Translation via Google Cloud Translation API

**Interface:**
```python
async def process_audio_stream(
    audio_chunk: bytes,
    user_type: str,
    consultation_id: str,
    db_client: SupabaseClient
) -> Dict[str, str]:
    """
    Returns:
    {
        "original_text": "...",
        "translated_text": "...",
        "speaker_id": "doctor" | "patient"
    }
    """
```

**Processing Flow:**
```
Audio Chunk
    ↓
[ASR: Google Cloud STT or Whisper API]
    ↓
Original Transcript (hi-IN or en-IN)
    ↓
[Vector Search: Community Lexicon]
    ↓
Term-Corrected Transcript
    ↓
[Translation: Google Translate API]
    ↓
Translated Text
    ↓
Return to WebSocket
```

**ASR Service Selection for Hackathon:**
- **Google Cloud STT**: Free tier (60 min/month), excellent Hindi support, streaming capable
- **OpenAI Whisper API**: $0.006/minute, extremely accurate for code-switching, simple REST API
- **Recommendation**: Start with Google Cloud STT for demo, can switch to Whisper if needed

**Language Configuration:**
- Patient (Hindi speaker): `language_code='hi-IN'` → Translate to English
- Doctor (Hinglish speaker): `language_code='en-IN'`, `alternative_language_codes=['hi-IN']` → Translate to Hindi

#### 4. Summarizer (`app/summarizer.py`)

**Purpose**: Generate SOAP notes and de-stigmatization suggestions using LLM chain

**Key Features:**
- Two-step LLM chain with Google Gemini
- SOAP note generation from multilingual transcript
- Compassion Reflex analysis for stigmatizing language

**Interface:**
```python
async def generate_notes_with_empathy(
    full_transcript: str
) -> Tuple[Dict[str, str], Dict[str, Any]]:
    """
    Returns:
    (
        {
            "subjective": "...",
            "objective": "...",
            "assessment": "...",
            "plan": "..."
        },
        {
            "suggestions": [
                {
                    "section": "assessment",
                    "original": "patient is non-compliant",
                    "suggested": "patient reports difficulty adhering to medication",
                    "rationale": "Person-first language"
                }
            ]
        }
    )
    """
```

**LLM Chain:**

**Step 1: SOAP Note Generation**
```
Prompt: "You are an expert, HIPAA-compliant AI medical scribe for the Indian 
healthcare context. Analyze this multilingual, code-switched (Hinglish) transcript 
and generate a structured, professional, English-only SOAP note. Output MUST be a 
valid JSON object with keys 'subjective', 'objective', 'assessment', and 'plan'. 
Extract only clinically relevant facts."

Input: full_transcript
Output: raw_soap_note (JSON)
```

**Step 2: Compassion Reflex**
```
Prompt: "You are a medical ethics expert based on EMNLP 2024 'Words Matter' 
research. Review this clinical note. Identify any stigmatizing, judgmental, or 
non-person-first language (e.g., 'patient is non-compliant,' 'drug abuser'). 
For each instance, provide an objective, non-judgmental alternative (e.g., 
'patient reports difficulty adhering to medication,' 'patient has a substance 
use disorder'). Return a JSON object of suggestions or an empty object if no 
issues are found."

Input: assessment + plan sections from raw_soap_note
Output: de_stigma_suggestions (JSON)
```

#### 5. Database Client (`app/database.py`)

**Purpose**: Supabase client wrapper for backend operations

**Key Features:**
- Connection pooling
- Helper methods for common queries
- Vector similarity search for lexicon

**Interface:**
```python
class DatabaseClient:
    def __init__(self, supabase_url: str, supabase_key: str)
    
    async def append_transcript(self, consultation_id: str, text: str)
    async def get_full_transcript(self, consultation_id: str) -> str
    async def save_soap_note(self, consultation_id: str, soap: dict, suggestions: dict)
    async def search_lexicon(self, term: str, threshold: float = 0.85) -> Optional[str]
    async def add_lexicon_term(self, term_english: str, term_regional: str, 
                                language: str, doctor_id: str, embedding: List[float])
```

#### 6. Models (`app/models.py`)

**Purpose**: Pydantic models for request/response validation

```python
from pydantic import BaseModel
from typing import Optional, List

class LexiconTerm(BaseModel):
    term_english: str
    term_regional: str
    language: str

class SoapNoteResponse(BaseModel):
    subjective: str
    objective: str
    assessment: str
    plan: str

class StigmaSuggestion(BaseModel):
    section: str
    original: str
    suggested: str
    rationale: str

class SoapGenerationResponse(BaseModel):
    raw_soap_note: SoapNoteResponse
    de_stigma_suggestions: List[StigmaSuggestion]
```

## Data Models

### Database Schema

#### Patients Table
```sql
CREATE TABLE patients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    date_of_birth DATE NOT NULL,
    preferred_language TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### Consultations Table
```sql
CREATE TABLE consultations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    doctor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    consultation_date TIMESTAMPTZ DEFAULT NOW(),
    full_transcript TEXT DEFAULT '',
    raw_soap_note JSONB,
    de_stigma_suggestions JSONB,
    approved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_consultations_doctor ON consultations(doctor_id);
CREATE INDEX idx_consultations_patient ON consultations(patient_id);
```

#### Medical Lexicon Table
```sql
CREATE TABLE medical_lexicon (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    term_english TEXT NOT NULL,
    term_regional TEXT NOT NULL,
    language TEXT NOT NULL,
    verified_by_doctor_id UUID NOT NULL REFERENCES auth.users(id),
    embedding vector(384) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_lexicon_embedding ON medical_lexicon 
USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
```

### Row Level Security Policies

```sql
-- Patients: Doctors can only see patients they've consulted
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Doctors can view their patients"
ON patients FOR SELECT
USING (
    id IN (
        SELECT patient_id FROM consultations 
        WHERE doctor_id = auth.uid()
    )
);

-- Consultations: Doctors can only access their own consultations
ALTER TABLE consultations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Doctors can view their consultations"
ON consultations FOR SELECT
USING (doctor_id = auth.uid());

CREATE POLICY "Doctors can update their consultations"
ON consultations FOR UPDATE
USING (doctor_id = auth.uid());

-- Medical Lexicon: All authenticated users can read, only doctors can insert
ALTER TABLE medical_lexicon ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view lexicon"
ON medical_lexicon FOR SELECT
USING (auth.role() = 'authenticated');

CREATE POLICY "Doctors can add to lexicon"
ON medical_lexicon FOR INSERT
WITH CHECK (verified_by_doctor_id = auth.uid());
```

## Error Handling

### Frontend Error Handling

**WebSocket Errors:**
- Connection failure: Display error toast, retry with exponential backoff (max 3 attempts)
- Disconnection during call: Attempt reconnection, notify user if unsuccessful
- Audio capture failure: Alert user to check microphone permissions

**API Errors:**
- 401 Unauthorized: Redirect to sign-in page
- 500 Server Error: Display user-friendly message, log to error tracking service
- Network timeout: Retry with exponential backoff

**WebRTC Errors:**
- Peer connection failure: Display troubleshooting steps (firewall, NAT)
- Media device errors: Prompt user to grant permissions

### Backend Error Handling

**ASR Failures:**
- Google Cloud STT unavailable: Automatically fallback to OpenAI Whisper API
- Both ASR services fail: Log error, return empty transcript, notify via WebSocket
- Free tier exhausted: Switch to Whisper API or notify user

**Translation Failures:**
- API rate limit: Queue request for retry
- Translation error: Return original text with error flag

**Database Errors:**
- Connection failure: Retry with exponential backoff
- Query timeout: Log slow query, return cached data if available

**LLM Failures:**
- Gemini API error: Retry once, if fails return structured error message
- Invalid JSON response: Parse with error recovery, fill missing fields with placeholders

### Logging Strategy

**Frontend:**
- Console errors in development
- Structured logging to service (e.g., Sentry) in production
- User action tracking for analytics

**Backend:**
- Structured JSON logging with log levels (DEBUG, INFO, WARNING, ERROR)
- Request/response logging with correlation IDs
- Performance metrics (latency, throughput)
- AI service usage tracking

## Testing Strategy

### Frontend Testing

**Unit Tests (Vitest + React Testing Library):**
- Component rendering and props
- User interaction handlers
- Utility functions
- Supabase client mocks

**Integration Tests:**
- Authentication flow
- WebSocket connection and message handling
- Form submissions and validation

**E2E Tests (Playwright):**
- Complete consultation workflow
- SOAP note review and approval
- Community Lexicon contribution

### Backend Testing

**Unit Tests (pytest):**
- Pydantic model validation
- Database client methods (mocked)
- Utility functions

**Integration Tests:**
- WebSocket connection handling
- API endpoint responses
- Database operations with test database

**AI Pipeline Tests:**
- Mock ASR responses
- Translation accuracy spot checks
- LLM prompt validation with sample transcripts

### Performance Testing

**Load Testing:**
- Concurrent WebSocket connections (target: 100 simultaneous consultations)
- Database query performance under load
- Vector similarity search latency

**Stress Testing:**
- Maximum audio chunk throughput
- Database connection pool exhaustion
- API rate limit handling

### Security Testing

**Authentication:**
- Token expiration and refresh
- Unauthorized access attempts
- SQL injection prevention

**Data Privacy:**
- RLS policy enforcement
- HIPAA compliance audit
- PII handling in logs

## Deployment Considerations

### Environment Variables

**Frontend (.env.local):**
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_BACKEND_URL=
```

**Backend (.env):**
```
SUPABASE_URL=
SUPABASE_SERVICE_KEY=
GOOGLE_CLOUD_PROJECT_ID=
GOOGLE_APPLICATION_CREDENTIALS=
GEMINI_API_KEY=
OPENAI_API_KEY=  # Optional: for Whisper API alternative
```

### Infrastructure

**Frontend Hosting:**
- Vercel or Netlify for Next.js deployment
- CDN for static assets
- Edge functions for API routes

**Backend Hosting:**
- Docker container on Cloud Run, AWS ECS, or similar
- Auto-scaling based on WebSocket connections
- Health check endpoint for load balancer

**Database:**
- Supabase managed PostgreSQL
- Regular backups
- Connection pooling (PgBouncer)

### Monitoring

**Metrics to Track:**
- WebSocket connection count and duration
- ASR/Translation API latency and error rates
- SOAP note generation success rate
- Database query performance
- User authentication success rate

**Alerts:**
- High error rate (>5% in 5 minutes)
- API latency >2 seconds
- Database connection pool exhaustion
- ASR service unavailability

## Hackathon Implementation Notes

**Quick Start Recommendations:**

1. **ASR Setup**: 
   - Start with Google Cloud STT (free tier: 60 min/month, easy setup)
   - Enable Google Cloud Speech-to-Text API in console
   - Download service account JSON credentials
   - Set GOOGLE_APPLICATION_CREDENTIALS environment variable

2. **Alternative ASR** (if needed):
   - OpenAI Whisper API is simpler (just API key, $0.006/min)
   - No complex setup, REST API only
   - Better for code-switching scenarios

3. **Simplifications for Demo**:
   - Can use mock data for initial Community Lexicon
   - Pre-seed database with common medical terms
   - Use shorter consultation demos (2-3 minutes)
   - Focus on 2-3 key medical scenarios

4. **Cost Management**:
   - Google Cloud: $300 free credit for new accounts
   - Gemini API: Free tier available
   - Supabase: Free tier sufficient for hackathon
   - OpenAI: ~$5 should cover entire hackathon

## Future Enhancements

1. **Multi-language Support**: Extend beyond Hindi/English to regional languages (Tamil, Telugu, Bengali)
2. **Offline Mode**: Cache consultations for areas with poor connectivity
3. **Voice Biometrics**: Patient identification via voice
4. **Prescription Generation**: Auto-generate prescriptions from SOAP notes
5. **Analytics Dashboard**: Insights on consultation patterns, common diagnoses
6. **Mobile Apps**: Native iOS/Android apps for better performance
7. **Integration**: EHR/EMR system integration via HL7 FHIR
