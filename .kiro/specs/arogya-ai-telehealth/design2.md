# Design Document: Enhanced Clinical Intelligence Features

## Overview

This document details the design for two advanced features that enhance the Arogya-AI telehealth platform: Real-time Medical Alert System and Voice Emotion Analysis. These features integrate seamlessly with the existing STT pipeline and consultation workflow, adding critical safety monitoring and emotional intelligence capabilities.

### Design Principles

1. **Non-Intrusive**: Features enhance without disrupting existing consultation flow
2. **Real-time Performance**: Alerts and emotion updates within 2 seconds
3. **Privacy-First**: Patient consent and data control for emotion analysis
4. **Actionable Insights**: Clear, useful information for doctors
5. **Independent Implementation**: Minimal changes to existing codebase

## Architecture

### System Integration

```
Existing STT Pipeline
    ↓
[Audio Chunk] → ASR → Transcript
    ↓
    ├─→ [NEW] Alert Engine → Alert Detection → WebSocket Alert
    └─→ [NEW] Emotion Analyzer → Emotion Classification → WebSocket Emotion Update
```

### Component Overview

```
┌─────────────────────────────────────────────────────────────┐
│                  FastAPI Backend (NEW)                       │
│  ┌──────────────────┐  ┌──────────────────────────────┐    │
│  │  Alert Engine    │  │  Emotion Analyzer            │    │
│  │  - Pattern Match │  │  - Audio Feature Extraction  │    │
│  │  - Severity Score│  │  - Emotion Classification    │    │
│  └──────────────────┘  └──────────────────────────────┘    │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  New API Endpoints                                   │   │
│  │  - GET /consultation/{id}/alerts                     │   │
│  │  - POST /alerts/{id}/acknowledge                     │   │
│  │  - GET /consultation/{id}/emotions                   │   │
│  │  - GET /patient/{id}/emotion_trends                  │   │
│  │  - GET /analytics/alerts                             │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              Supabase (NEW TABLES)                           │
│  ┌──────────────┐  ┌──────────────────────────────────┐    │
│  │   alerts     │  │      emotion_logs                │    │
│  └──────────────┘  └──────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```


## Components and Interfaces

### Backend Components

#### 1. Alert Engine (`app/alert_engine.py`)

**Purpose**: Real-time detection of critical medical symptoms from transcripts

**Key Features:**
- Pattern matching with regex and keyword detection
- Context-aware severity scoring
- Alert deduplication (avoid repeated alerts for same symptom)
- Configurable symptom patterns

**Interface:**
```python
class AlertEngine:
    def __init__(self):
        self.critical_patterns = self._load_patterns()
        self.alert_cache = {}  # Deduplication cache
    
    async def analyze_transcript(
        self,
        text: str,
        consultation_id: str,
        speaker_type: str
    ) -> Optional[Alert]:
        """
        Analyzes transcript for critical symptoms.
        Returns Alert object if critical pattern detected, None otherwise.
        """
    
    def _calculate_severity(self, pattern_match: dict, context: str) -> int:
        """
        Calculates severity score (1-5) based on:
        - Symptom type (chest pain = 5, headache = 3)
        - Intensity words (severe, mild)
        - Duration mentions (sudden, ongoing)
        """
```

**Critical Symptom Patterns:**
```python
CRITICAL_PATTERNS = {
    "chest_pain": {
        "keywords": ["chest pain", "heart pain", "cardiac", "angina"],
        "base_severity": 5,
        "intensifiers": ["severe", "crushing", "radiating"]
    },
    "breathing": {
        "keywords": ["can't breathe", "difficulty breathing", "shortness of breath", "dyspnea"],
        "base_severity": 5,
        "intensifiers": ["severe", "unable to"]
    },
    "consciousness": {
        "keywords": ["passed out", "fainted", "loss of consciousness", "blackout"],
        "base_severity": 5
    },
    "bleeding": {
        "keywords": ["severe bleeding", "hemorrhage", "blood loss"],
        "base_severity": 4,
        "intensifiers": ["uncontrolled", "heavy"]
    },
    "mental_health": {
        "keywords": ["suicidal", "want to die", "end my life", "harm myself"],
        "base_severity": 5
    },
    "neurological": {
        "keywords": ["severe headache", "worst headache", "vision loss", "paralysis", "stroke"],
        "base_severity": 4,
        "intensifiers": ["sudden", "worst ever"]
    }
}
```

**Alert Deduplication Logic:**
- Cache alerts by (consultation_id, symptom_type)
- Only trigger new alert if >5 minutes since last alert of same type
- Reset cache when consultation ends

#### 2. Emotion Analyzer (`app/emotion_analyzer.py`)

**Purpose**: Extract emotional state from audio features

**Key Features:**
- Audio feature extraction (pitch, energy, speech rate, spectral features)
- Pre-trained emotion classification model
- Confidence scoring
- Lightweight processing for real-time performance

**Interface:**
```python
class EmotionAnalyzer:
    def __init__(self):
        self.model = self._load_model()
        self.feature_extractor = AudioFeatureExtractor()
    
    async def analyze_audio(
        self,
        audio_chunk: bytes,
        sample_rate: int = 16000
    ) -> EmotionResult:
        """
        Analyzes audio and returns emotion classification.
        
        Returns:
            EmotionResult with emotion_type, confidence_score
        """
    
    def _extract_features(self, audio: np.ndarray) -> np.ndarray:
        """
        Extracts acoustic features:
        - Pitch (F0)
        - Energy (RMS)
        - Speech rate
        - MFCCs (Mel-frequency cepstral coefficients)
        - Spectral features
        """
```

**Model Selection:**

For hackathon/MVP, use one of these approaches:

**Option 1: Lightweight Pre-trained Model (Recommended)**
- **Model**: `speechbrain/emotion-recognition-wav2vec2-IEMOCAP`
- **Pros**: Pre-trained, good accuracy, moderate size
- **Cons**: ~300MB model size
- **Emotions**: neutral, happy, sad, angry, fear (map to our categories)

**Option 2: Simple Feature-based Classifier**
- **Model**: Custom sklearn model with audio features
- **Pros**: Very lightweight (<1MB), fast inference
- **Cons**: Lower accuracy, needs training data
- **Features**: Pitch variance, energy, speech rate, zero-crossing rate

**Option 3: API-based (Hume AI)**
- **Service**: Hume AI Emotion API
- **Pros**: State-of-the-art accuracy, no model hosting
- **Cons**: API costs, external dependency
- **Pricing**: Free tier available for testing

**Recommendation for Hackathon**: Start with Option 2 (simple classifier) for speed, upgrade to Option 1 if time permits.

**Emotion Mapping:**
```python
EMOTION_CATEGORIES = {
    "calm": {"color": "#10B981", "description": "Patient appears relaxed and comfortable"},
    "anxious": {"color": "#F59E0B", "description": "Patient shows signs of worry or nervousness"},
    "distressed": {"color": "#EF4444", "description": "Patient appears highly stressed or upset"},
    "pain": {"color": "#DC2626", "description": "Patient may be experiencing physical discomfort"},
    "sad": {"color": "#6B7280", "description": "Patient shows signs of sadness or depression"},
    "neutral": {"color": "#9CA3AF", "description": "Baseline emotional state"}
}
```

#### 3. Database Client Extensions (`app/database.py`)

**New Methods:**
```python
class DatabaseClient:
    # ... existing methods ...
    
    async def create_alert(
        self,
        consultation_id: str,
        symptom_text: str,
        symptom_type: str,
        severity_score: int,
        timestamp: datetime
    ) -> str:
        """Creates alert record, returns alert_id"""
    
    async def acknowledge_alert(self, alert_id: str) -> bool:
        """Marks alert as acknowledged"""
    
    async def get_consultation_alerts(self, consultation_id: str) -> List[dict]:
        """Retrieves all alerts for a consultation"""
    
    async def log_emotion(
        self,
        consultation_id: str,
        emotion_type: str,
        confidence_score: float,
        timestamp: datetime
    ):
        """Logs emotion snapshot"""
    
    async def get_emotion_logs(
        self,
        consultation_id: str,
        start_time: Optional[datetime] = None,
        end_time: Optional[datetime] = None
    ) -> List[dict]:
        """Retrieves emotion logs for a consultation"""
    
    async def get_patient_emotion_trends(
        self,
        patient_id: str
    ) -> dict:
        """Calculates emotion distribution across all consultations"""
```

#### 4. WebSocket Message Extensions

**New Message Types:**

```python
# Alert Message (Backend → Frontend)
{
    "type": "alert",
    "data": {
        "alert_id": "uuid",
        "symptom_text": "patient mentioned chest pain",
        "symptom_type": "chest_pain",
        "severity_score": 5,
        "timestamp": "2024-01-15T10:30:45Z"
    }
}

# Emotion Update Message (Backend → Frontend)
{
    "type": "emotion_update",
    "data": {
        "emotion_type": "anxious",
        "confidence_score": 0.85,
        "timestamp": "2024-01-15T10:30:45Z"
    }
}

# Alert Acknowledgment (Frontend → Backend)
{
    "type": "acknowledge_alert",
    "alert_id": "uuid"
}
```

#### 5. API Endpoints (`app/main.py`)

**New Endpoints:**

```python
@app.get("/consultation/{consultation_id}/alerts")
async def get_consultation_alerts(
    consultation_id: str,
    current_user: User = Depends(get_current_user)
) -> List[AlertResponse]:
    """Returns all alerts for a consultation"""

@app.post("/consultation/{consultation_id}/alerts/{alert_id}/acknowledge")
async def acknowledge_alert(
    consultation_id: str,
    alert_id: str,
    current_user: User = Depends(get_current_user)
) -> dict:
    """Marks an alert as acknowledged"""

@app.get("/consultation/{consultation_id}/emotions")
async def get_consultation_emotions(
    consultation_id: str,
    current_user: User = Depends(get_current_user)
) -> List[EmotionLogResponse]:
    """Returns emotion logs for a consultation"""

@app.get("/patient/{patient_id}/emotion_trends")
async def get_patient_emotion_trends(
    patient_id: str,
    current_user: User = Depends(get_current_user)
) -> EmotionTrendsResponse:
    """Returns aggregated emotion statistics for a patient"""

@app.get("/analytics/alerts")
async def get_alert_analytics(
    current_user: User = Depends(get_current_user),
    start_date: Optional[date] = None,
    end_date: Optional[date] = None
) -> AlertAnalyticsResponse:
    """Returns alert statistics for the doctor"""
```

**Pydantic Models:**

```python
class AlertResponse(BaseModel):
    id: str
    consultation_id: str
    symptom_text: str
    symptom_type: str
    severity_score: int
    acknowledged: bool
    timestamp: datetime

class EmotionLogResponse(BaseModel):
    id: str
    consultation_id: str
    emotion_type: str
    confidence_score: float
    timestamp: datetime

class EmotionTrendsResponse(BaseModel):
    patient_id: str
    total_consultations: int
    emotion_distribution: Dict[str, float]  # {"calm": 0.45, "anxious": 0.30, ...}
    high_distress_consultations: List[str]  # consultation_ids

class AlertAnalyticsResponse(BaseModel):
    total_alerts: int
    alerts_by_severity: Dict[int, int]
    alerts_by_type: Dict[str, int]
    average_acknowledgment_time: float  # seconds
```

### Frontend Components

#### 1. Alert Banner Component (`components/alerts/AlertBanner.tsx`)

**Purpose**: Display critical alerts prominently during consultation

**Interface:**
```typescript
interface AlertBannerProps {
  alert: {
    id: string;
    symptomText: string;
    symptomType: string;
    severityScore: number;
    timestamp: string;
  };
  onAcknowledge: (alertId: string) => void;
}
```

**Design:**
- Fixed position at top of video call interface
- Color-coded by severity (red for 5, orange for 3-4, yellow for 1-2)
- Pulsing animation for severity 5
- Large, readable text
- Prominent "Acknowledge" button

#### 2. Alert Sidebar Component (`components/alerts/AlertSidebar.tsx`)

**Purpose**: Show all alerts from current consultation

**Interface:**
```typescript
interface AlertSidebarProps {
  consultationId: string;
  alerts: Alert[];
  onAcknowledge: (alertId: string) => void;
}
```

**Features:**
- Collapsible sidebar
- List of all alerts with timestamps
- Visual indicator for acknowledged vs. active alerts
- Scroll to accommodate many alerts

#### 3. Emotion Indicator Widget (`components/emotions/EmotionIndicator.tsx`)

**Purpose**: Real-time display of patient emotional state

**Interface:**
```typescript
interface EmotionIndicatorProps {
  emotion: {
    type: 'calm' | 'anxious' | 'distressed' | 'pain' | 'sad' | 'neutral';
    confidence: number;
  };
}
```

**Design:**
- Circular indicator with color coding
- Smooth transitions between states
- Confidence percentage display
- Tooltip with emotion description
- Positioned near patient video feed

#### 4. Emotion Timeline Chart (`components/emotions/EmotionTimeline.tsx`)

**Purpose**: Visualize emotion changes over consultation

**Interface:**
```typescript
interface EmotionTimelineProps {
  consultationId: string;
  emotionLogs: EmotionLog[];
}
```

**Features:**
- Line chart or area chart showing emotion over time
- Color-coded segments
- Hover to see exact emotion and timestamp
- Used in SOAP note review and patient history

#### 5. Patient Emotion Trends (`components/emotions/EmotionTrends.tsx`)

**Purpose**: Show emotion patterns across multiple consultations

**Interface:**
```typescript
interface EmotionTrendsProps {
  patientId: string;
  trends: {
    emotionDistribution: Record<string, number>;
    highDistressConsultations: string[];
  };
}
```

**Features:**
- Pie chart or bar chart of emotion distribution
- List of consultations with high distress
- Comparison with previous period

### Modified Components

#### VideoCallRoom Component Updates

**New State:**
```typescript
const [alerts, setAlerts] = useState<Alert[]>([]);
const [currentEmotion, setCurrentEmotion] = useState<Emotion | null>(null);
const [showAlertSidebar, setShowAlertSidebar] = useState(false);
```

**WebSocket Message Handling:**
```typescript
useEffect(() => {
  if (!ws) return;
  
  ws.onmessage = (event) => {
    const message = JSON.parse(event.data);
    
    if (message.type === 'alert') {
      setAlerts(prev => [...prev, message.data]);
      // Play alert sound
      playAlertSound(message.data.severityScore);
    }
    
    if (message.type === 'emotion_update') {
      setCurrentEmotion(message.data);
    }
    
    // ... existing caption handling ...
  };
}, [ws]);
```

#### SoapNoteReview Component Updates

**New Features:**
- Fetch and display emotion timeline for the consultation
- Include emotion summary in SOAP note preview
- Option to include/exclude emotion data in final note


## Data Models

### Database Schema

#### Alerts Table
```sql
CREATE TABLE alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    consultation_id UUID NOT NULL REFERENCES consultations(id) ON DELETE CASCADE,
    symptom_text TEXT NOT NULL,
    symptom_type TEXT NOT NULL,
    severity_score INTEGER NOT NULL CHECK (severity_score BETWEEN 1 AND 5),
    acknowledged BOOLEAN DEFAULT FALSE,
    acknowledged_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_alerts_consultation ON alerts(consultation_id);
CREATE INDEX idx_alerts_severity ON alerts(severity_score DESC);
CREATE INDEX idx_alerts_created ON alerts(created_at DESC);
```

#### Emotion Logs Table
```sql
CREATE TABLE emotion_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    consultation_id UUID NOT NULL REFERENCES consultations(id) ON DELETE CASCADE,
    emotion_type TEXT NOT NULL,
    confidence_score FLOAT NOT NULL CHECK (confidence_score BETWEEN 0 AND 1),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_emotion_logs_consultation ON emotion_logs(consultation_id);
CREATE INDEX idx_emotion_logs_created ON emotion_logs(created_at);
```

#### Patients Table Update
```sql
-- Add emotion analysis consent field
ALTER TABLE patients ADD COLUMN emotion_analysis_enabled BOOLEAN DEFAULT TRUE;
```

### Row Level Security Policies

```sql
-- Alerts: Doctors can only view alerts from their consultations
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Doctors can view their consultation alerts"
ON alerts FOR SELECT
USING (
    consultation_id IN (
        SELECT id FROM consultations WHERE doctor_id = auth.uid()
    )
);

CREATE POLICY "Doctors can update their consultation alerts"
ON alerts FOR UPDATE
USING (
    consultation_id IN (
        SELECT id FROM consultations WHERE doctor_id = auth.uid()
    )
);

-- Emotion Logs: Doctors can only view emotion logs from their consultations
ALTER TABLE emotion_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Doctors can view their consultation emotion logs"
ON emotion_logs FOR SELECT
USING (
    consultation_id IN (
        SELECT id FROM consultations WHERE doctor_id = auth.uid()
    )
);
```

## Integration with Existing System

### STT Pipeline Integration

**Modified `process_audio_stream` function:**

```python
async def process_audio_stream(
    audio_chunk: bytes,
    user_type: str,
    consultation_id: str,
    db_client: SupabaseClient,
    alert_engine: AlertEngine,  # NEW
    emotion_analyzer: EmotionAnalyzer  # NEW
) -> Dict[str, Any]:
    """
    Enhanced pipeline with alert detection and emotion analysis
    """
    
    # Existing STT and translation logic
    original_text = await asr_transcribe(audio_chunk, user_type)
    translated_text = await translate(original_text, user_type)
    
    # NEW: Alert detection (only for patient speech)
    alert = None
    if user_type == "patient":
        alert = await alert_engine.analyze_transcript(
            text=original_text,
            consultation_id=consultation_id,
            speaker_type=user_type
        )
        if alert:
            await db_client.create_alert(
                consultation_id=consultation_id,
                symptom_text=alert.symptom_text,
                symptom_type=alert.symptom_type,
                severity_score=alert.severity_score,
                timestamp=datetime.now()
            )
    
    # NEW: Emotion analysis (only for patient audio)
    emotion = None
    if user_type == "patient":
        # Check if patient has emotion analysis enabled
        patient = await db_client.get_patient_for_consultation(consultation_id)
        if patient.emotion_analysis_enabled:
            emotion = await emotion_analyzer.analyze_audio(audio_chunk)
            if emotion.confidence_score > 0.7:
                await db_client.log_emotion(
                    consultation_id=consultation_id,
                    emotion_type=emotion.emotion_type,
                    confidence_score=emotion.confidence_score,
                    timestamp=datetime.now()
                )
    
    return {
        "original_text": original_text,
        "translated_text": translated_text,
        "speaker_id": user_type,
        "alert": alert.to_dict() if alert else None,  # NEW
        "emotion": emotion.to_dict() if emotion else None  # NEW
    }
```

### WebSocket Endpoint Integration

**Modified WebSocket handler:**

```python
@app.websocket("/ws/{consultation_id}/{user_type}")
async def websocket_endpoint(
    websocket: WebSocket,
    consultation_id: str,
    user_type: str
):
    await connection_manager.connect(consultation_id, user_type, websocket)
    
    # Initialize new components
    alert_engine = AlertEngine()
    emotion_analyzer = EmotionAnalyzer()
    
    try:
        while True:
            audio_chunk = await websocket.receive_bytes()
            
            # Process with enhanced pipeline
            result = await process_audio_stream(
                audio_chunk=audio_chunk,
                user_type=user_type,
                consultation_id=consultation_id,
                db_client=db_client,
                alert_engine=alert_engine,
                emotion_analyzer=emotion_analyzer
            )
            
            # Broadcast caption to other participant
            await connection_manager.broadcast_to_other(
                consultation_id=consultation_id,
                sender_type=user_type,
                message={
                    "type": "caption",
                    "data": {
                        "speaker_id": result["speaker_id"],
                        "original_text": result["original_text"],
                        "translated_text": result["translated_text"]
                    }
                }
            )
            
            # NEW: Broadcast alert to doctor if detected
            if result["alert"] and user_type == "patient":
                await connection_manager.broadcast_to_other(
                    consultation_id=consultation_id,
                    sender_type=user_type,
                    message={
                        "type": "alert",
                        "data": result["alert"]
                    }
                )
            
            # NEW: Broadcast emotion update to doctor if detected
            if result["emotion"] and user_type == "patient":
                await connection_manager.broadcast_to_other(
                    consultation_id=consultation_id,
                    sender_type=user_type,
                    message={
                        "type": "emotion_update",
                        "data": result["emotion"]
                    }
                )
    
    except WebSocketDisconnect:
        await connection_manager.disconnect(consultation_id, user_type)
```

## Error Handling

### Alert Engine Errors

**Pattern Matching Failures:**
- Log error and continue without alert
- Don't block transcript processing

**Database Write Failures:**
- Retry once with exponential backoff
- Log error for manual review
- Continue consultation without interruption

### Emotion Analyzer Errors

**Model Loading Failures:**
- Fall back to disabled emotion analysis
- Log error and notify admin
- Display message to doctor that emotion analysis is unavailable

**Audio Processing Errors:**
- Skip emotion analysis for that chunk
- Continue with next audio chunk
- Log error for debugging

**Low Confidence Scores:**
- Don't update UI if confidence < 0.7
- Log all predictions for later analysis

### API Endpoint Errors

**Authorization Failures:**
- Return 403 Forbidden
- Log unauthorized access attempt

**Resource Not Found:**
- Return 404 with clear error message

**Database Query Timeouts:**
- Return 503 Service Unavailable
- Implement retry logic on client side

## Performance Optimization

### Alert Engine Optimization

**Pattern Matching:**
- Compile regex patterns once at initialization
- Use efficient string matching algorithms (Aho-Corasick for multiple patterns)
- Cache recent transcript segments to avoid reprocessing

**Deduplication:**
- Use in-memory cache (Redis for production)
- TTL of 5 minutes per alert type
- Clear cache on consultation end

### Emotion Analyzer Optimization

**Model Inference:**
- Batch processing if multiple audio chunks queued
- Use GPU if available (CUDA)
- Quantize model for faster inference (INT8)

**Feature Extraction:**
- Downsample audio to 16kHz if higher
- Use efficient FFT libraries (numpy.fft)
- Cache feature extraction results for 1 second

**Sampling Strategy:**
- Analyze every 2nd or 3rd audio chunk (reduce load by 50-66%)
- Interpolate emotions between analyzed chunks
- Full analysis only when emotion change detected

### Database Optimization

**Indexing:**
- Composite index on (consultation_id, created_at) for time-range queries
- Partial index on high-severity alerts for quick access

**Batch Inserts:**
- Buffer emotion logs and insert in batches of 10
- Reduces database round trips

**Query Optimization:**
- Use connection pooling (PgBouncer)
- Implement read replicas for analytics queries
- Cache emotion trends for 5 minutes

## Testing Strategy

### Alert Engine Testing

**Unit Tests:**
- Test each symptom pattern with positive and negative cases
- Test severity calculation with various contexts
- Test deduplication logic

**Integration Tests:**
- Test alert creation in database
- Test WebSocket alert broadcasting
- Test alert acknowledgment flow

**Test Cases:**
```python
# Positive cases
"I have severe chest pain" → Alert (severity 5)
"Can't breathe properly" → Alert (severity 5)
"Feeling suicidal thoughts" → Alert (severity 5)

# Negative cases
"No chest pain today" → No alert
"Breathing is fine" → No alert

# Context-aware
"Severe headache for 3 days" → Alert (severity 4)
"Mild headache" → No alert (severity 2, below threshold)
```

### Emotion Analyzer Testing

**Unit Tests:**
- Test feature extraction with sample audio
- Test emotion classification with known samples
- Test confidence score calculation

**Integration Tests:**
- Test emotion logging to database
- Test WebSocket emotion broadcasting
- Test emotion trend calculation

**Test Data:**
- Use public emotion datasets (RAVDESS, IEMOCAP)
- Record sample audio for each emotion category
- Test with various audio qualities and noise levels

### Frontend Testing

**Component Tests:**
- AlertBanner renders correctly with different severity levels
- EmotionIndicator updates smoothly
- Alert acknowledgment triggers correct API call

**E2E Tests:**
- Complete consultation with alert triggering
- Verify alert appears in doctor's interface
- Verify emotion indicator updates in real-time
- Check alert history in patient records

## Deployment Considerations

### Environment Variables

**Backend (.env):**
```
# Existing variables...

# Alert Engine
ALERT_THRESHOLD_SEVERITY=3
ALERT_DEDUP_TIMEOUT=300  # seconds

# Emotion Analyzer
EMOTION_MODEL_PATH=/models/emotion_classifier
EMOTION_CONFIDENCE_THRESHOLD=0.7
EMOTION_ANALYSIS_ENABLED=true
```

### Dependencies

**New Python Packages:**
```
# requirements.txt additions
librosa==0.10.1  # Audio feature extraction
soundfile==0.12.1  # Audio file handling
numpy==1.24.3  # Numerical operations
scikit-learn==1.3.0  # ML utilities
speechbrain==0.5.16  # Optional: for pre-trained emotion model
```

### Model Deployment

**Emotion Model:**
- Store model files in `/models` directory
- Use model versioning for updates
- Implement lazy loading (load on first use)
- Consider model serving service (TensorFlow Serving) for production

### Monitoring

**Metrics to Track:**
- Alert trigger rate (alerts per consultation)
- Alert acknowledgment time
- Emotion analysis latency
- Emotion confidence score distribution
- False positive rate (manual review)

**Alerts:**
- High alert rate (>5 per consultation)
- Emotion analysis failures (>10% of chunks)
- Database write failures
- Model inference latency >2 seconds

## Privacy and Compliance

### Data Retention

**Alerts:**
- Retain for 7 years (HIPAA compliance)
- Include in patient record exports
- Anonymize for research with patient consent

**Emotion Logs:**
- Retain for duration specified in patient consent
- Allow patient-initiated deletion
- Exclude from default data exports (opt-in only)

### Consent Management

**Initial Consent:**
- Display consent form before first consultation
- Explain emotion analysis clearly
- Provide opt-out option

**Ongoing Control:**
- Patient settings page to toggle emotion analysis
- Immediate effect (no analysis in next consultation)
- Historical data deletion option

### Audit Logging

**Log Events:**
- Alert creation and acknowledgment
- Emotion analysis enable/disable
- Emotion data access by doctors
- Emotion data deletion requests

## Future Enhancements

1. **Predictive Alerts**: ML model to predict critical events before explicit mention
2. **Multi-language Alert Patterns**: Extend to regional languages beyond Hindi
3. **Emotion-based Recommendations**: Suggest communication strategies based on patient emotion
4. **Alert Escalation**: Automatic notification to emergency contacts for severity 5 alerts
5. **Voice Stress Analysis**: Detect stress beyond emotion (useful for mental health)
6. **Integration with Wearables**: Combine emotion analysis with heart rate, SpO2 data
7. **Alert Analytics Dashboard**: Visualize alert patterns across patient population
8. **Customizable Alert Patterns**: Allow doctors to define custom symptom patterns

## Implementation Notes for Hackathon

### Quick Start Recommendations

**Alert Engine:**
- Start with simple keyword matching (regex)
- Use predefined pattern dictionary
- Implement severity scoring with basic rules
- Can enhance with NLP later if time permits

**Emotion Analyzer:**
- **Fastest**: Use simple audio features + sklearn classifier
- **Better**: Use pre-trained SpeechBrain model
- **Best**: Use Hume AI API (if budget allows)

**Frontend:**
- Use shadcn/ui Alert component for alert banner
- Simple CSS animations for emotion indicator
- Chart.js or Recharts for emotion timeline

### Time Estimates

**Backend (8-10 hours):**
- Alert Engine: 3 hours
- Emotion Analyzer: 4 hours
- API Endpoints: 2 hours
- Database migrations: 1 hour

**Frontend (6-8 hours):**
- Alert components: 3 hours
- Emotion components: 3 hours
- Integration with VideoCallRoom: 2 hours

**Testing & Polish (4-6 hours):**
- Unit tests: 2 hours
- Integration testing: 2 hours
- UI polish and bug fixes: 2 hours

**Total: 18-24 hours** (can be parallelized between team members)

### Demo Strategy

**Showcase Scenarios:**

1. **Critical Alert Demo:**
   - Patient mentions "severe chest pain"
   - Alert banner appears immediately
   - Doctor acknowledges and responds

2. **Emotion Tracking Demo:**
   - Patient starts calm, becomes anxious discussing symptoms
   - Emotion indicator changes color
   - Show emotion timeline after consultation

3. **Analytics Demo:**
   - Show alert history for a patient
   - Display emotion trends across consultations
   - Highlight high-distress sessions

### Cost Considerations

**Free Tier Usage:**
- Supabase: Free tier sufficient
- Google Cloud: Use existing STT credits
- Emotion Model: Self-hosted (free)

**Paid Options (if needed):**
- Hume AI: ~$0.01 per minute of audio
- Additional compute: ~$20 for hackathon duration

**Total Estimated Cost: $0-50** for entire hackathon
