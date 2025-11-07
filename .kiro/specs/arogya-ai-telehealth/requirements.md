# Requirements Document

## Introduction

Arogya-AI is a state-of-the-art telehealth assistant designed for the Indian healthcare market. The system provides live bi-directional translation between Hinglish (Hindi-English code-switching) and English during medical consultations, automated SOAP note generation with de-stigmatization suggestions, and a community-driven medical lexicon for regional terminology. The platform aims to bridge language barriers in healthcare while promoting empathetic, person-first clinical documentation.

## Glossary

- **Arogya-AI System**: The complete telehealth platform including frontend, backend, and database components
- **WebRTC Module**: The real-time communication component handling video and audio streaming
- **ASR Engine**: Automatic Speech Recognition engine (Google Cloud Speech-to-Text primary, OpenAI Whisper API alternative)
- **Translation Service**: The component that converts between Hindi and English languages
- **SOAP Note Generator**: The AI module that creates Structured Clinical Notes (Subjective, Objective, Assessment, Plan)
- **Compassion Reflex Module**: The LLM chain that identifies and suggests alternatives for stigmatizing language
- **Community Lexicon Database**: The pgvector-powered database storing verified regional medical terminology
- **Consultation Session**: A single video call between a doctor and patient with associated transcripts and notes
- **Hinglish**: Code-switched language mixing Hindi and English commonly used in India
- **User Type**: Classification of participant as either 'doctor' or 'patient'

## Requirements

### Requirement 1: User Authentication and Authorization

**User Story:** As a healthcare provider, I want to securely authenticate and access only my patient data, so that patient privacy is protected and HIPAA compliance is maintained.

#### Acceptance Criteria

1. THE Arogya-AI System SHALL provide email and password authentication using Supabase Auth
2. WHEN a user successfully authenticates, THE Arogya-AI System SHALL create a secure session token valid for the duration of their access
3. THE Arogya-AI System SHALL implement Row Level Security policies ensuring doctors can access only their own patient records and consultations
4. WHEN an unauthenticated user attempts to access protected routes, THE Arogya-AI System SHALL redirect them to the sign-in page
5. THE Arogya-AI System SHALL maintain user session state across page navigation within the application

### Requirement 2: Real-Time Video Consultation

**User Story:** As a doctor, I want to conduct live video consultations with patients, so that I can provide remote healthcare services effectively.

#### Acceptance Criteria

1. WHEN a consultation session is initiated, THE WebRTC Module SHALL establish a peer-to-peer video and audio connection between doctor and patient
2. THE Arogya-AI System SHALL display both local and remote video feeds simultaneously during the consultation
3. WHEN either participant's network connection degrades, THE WebRTC Module SHALL maintain audio quality as priority over video quality
4. THE Arogya-AI System SHALL provide a control to end the consultation session
5. WHEN the consultation ends, THE Arogya-AI System SHALL navigate the doctor to the SOAP note review interface

### Requirement 3: Real-Time Audio Streaming and Transcription

**User Story:** As a system component, I want to capture and transcribe audio in real-time, so that live translation and documentation can be provided during consultations.

#### Acceptance Criteria

1. WHEN a consultation session is active, THE Arogya-AI System SHALL capture audio from each participant using the MediaRecorder API
2. THE Arogya-AI System SHALL stream audio chunks to the FastAPI backend via WebSocket connection at intervals not exceeding 1 second
3. WHEN audio chunks are received, THE ASR Engine SHALL transcribe the audio to text within 2 seconds
4. IF the primary Google Cloud Speech-to-Text fails, THEN THE Arogya-AI System SHALL fallback to OpenAI Whisper API
5. THE Arogya-AI System SHALL append all transcribed text to the consultation's full transcript in the database

### Requirement 4: Hinglish Code-Switching Translation

**User Story:** As a patient who speaks primarily Hindi, I want to see English translations of the doctor's speech in real-time, so that I can understand the medical consultation despite language barriers.

#### Acceptance Criteria

1. WHEN the user type is 'patient' and audio is received, THE ASR Engine SHALL configure language detection for 'hi-IN' (Hindi)
2. WHEN Hindi text is transcribed from a patient, THE Translation Service SHALL translate the text to English within 1 second
3. THE Arogya-AI System SHALL broadcast the translated English caption to the doctor participant
4. WHEN the user type is 'doctor' and audio is received, THE ASR Engine SHALL configure language detection for 'en-IN' with alternative language code 'hi-IN' to handle code-switching
5. WHEN English or Hinglish text is transcribed from a doctor, THE Translation Service SHALL translate the text to Hindi within 1 second
6. THE Arogya-AI System SHALL broadcast the translated Hindi caption to the patient participant
7. THE Arogya-AI System SHALL display live captions in a dedicated UI component with speaker identification

### Requirement 5: Community Lexicon Integration

**User Story:** As a doctor, I want to contribute verified regional medical terms to improve translation accuracy, so that the AI better serves patients in my region.

#### Acceptance Criteria

1. THE Arogya-AI System SHALL provide an interface for doctors to submit English-Regional term pairs with language specification
2. WHEN a regional term is submitted, THE Arogya-AI System SHALL generate a 384-dimension vector embedding using the Supabase/gte-small model
3. THE Arogya-AI System SHALL store the term pair and embedding in the Community Lexicon Database with the submitting doctor's ID
4. WHEN translating text during a consultation, THE Arogya-AI System SHALL perform vector similarity search on the Community Lexicon Database
5. IF a regional term match is found with similarity score above 0.85, THEN THE Arogya-AI System SHALL replace it with the verified English equivalent before generating clinical notes

### Requirement 6: SOAP Note Generation

**User Story:** As a doctor, I want the system to automatically generate structured SOAP notes from consultation transcripts, so that I can save time on documentation and focus on patient care.

#### Acceptance Criteria

1. WHEN a doctor requests SOAP note generation, THE SOAP Note Generator SHALL retrieve the complete consultation transcript from the database
2. THE SOAP Note Generator SHALL process the multilingual transcript and generate a structured note with Subjective, Objective, Assessment, and Plan sections in English
3. THE SOAP Note Generator SHALL output the note as a JSON object with keys 'subjective', 'objective', 'assessment', and 'plan'
4. THE SOAP Note Generator SHALL extract only clinically relevant information from the transcript
5. THE Arogya-AI System SHALL store the generated SOAP note in JSONB format in the consultations table

### Requirement 7: Compassion Reflex De-Stigmatization

**User Story:** As a healthcare ethics advocate, I want the system to identify stigmatizing language in clinical notes and suggest person-first alternatives, so that patient dignity is preserved in medical documentation.

#### Acceptance Criteria

1. WHEN a SOAP note is generated, THE Compassion Reflex Module SHALL analyze the assessment and plan sections for stigmatizing language
2. THE Compassion Reflex Module SHALL identify non-person-first language patterns including judgmental terms and deficit-focused descriptions
3. IF stigmatizing language is detected, THEN THE Compassion Reflex Module SHALL generate objective, person-first alternative phrasing
4. THE Compassion Reflex Module SHALL return suggestions as a JSON object mapping original phrases to recommended alternatives
5. THE Arogya-AI System SHALL store the de-stigmatization suggestions in JSONB format in the consultations table

### Requirement 8: SOAP Note Review and Editing

**User Story:** As a doctor, I want to review, edit, and approve AI-generated SOAP notes with empathy suggestions, so that I maintain clinical accuracy and control over patient documentation.

#### Acceptance Criteria

1. WHEN a doctor accesses the note review page, THE Arogya-AI System SHALL retrieve and display the SOAP note sections in editable text areas
2. WHERE de-stigmatization suggestions exist, THE Arogya-AI System SHALL display alert components below the relevant text areas with the suggested alternative language
3. WHEN a doctor clicks "Accept" on a suggestion, THE Arogya-AI System SHALL replace the text in the corresponding text area with the suggested alternative
4. THE Arogya-AI System SHALL allow doctors to manually edit any section of the SOAP note
5. WHEN a doctor approves the final note, THE Arogya-AI System SHALL save the edited note to the database and mark it as approved

### Requirement 9: Patient Records Management

**User Story:** As a doctor, I want to view a list of my patients and their consultation history, so that I can track patient care over time.

#### Acceptance Criteria

1. THE Arogya-AI System SHALL display a list of all patients associated with the authenticated doctor
2. WHEN a doctor selects a patient, THE Arogya-AI System SHALL display all past consultations for that patient in chronological order
3. THE Arogya-AI System SHALL provide navigation to view the SOAP notes for any past consultation
4. THE Arogya-AI System SHALL display patient preferred language in the patient record
5. THE Arogya-AI System SHALL enforce Row Level Security ensuring doctors can only view their own patients

### Requirement 10: Database Schema and Vector Search

**User Story:** As a system architect, I want a robust database schema with vector search capabilities, so that the application can efficiently store and retrieve medical terminology and consultation data.

#### Acceptance Criteria

1. THE Arogya-AI System SHALL use PostgreSQL with the pgvector extension enabled
2. THE Arogya-AI System SHALL maintain tables for patients, consultations, and medical lexicon with appropriate foreign key relationships
3. THE Community Lexicon Database SHALL store 384-dimension vector embeddings for regional medical terms
4. THE Arogya-AI System SHALL create an IVFFlat index on the embedding column for similarity search performance
5. THE Arogya-AI System SHALL complete vector similarity searches within 100 milliseconds for real-time translation support
