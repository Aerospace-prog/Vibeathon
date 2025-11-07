# Implementation Plan: Arogya-AI Telehealth Platform

## Task List

- [x] 1. Initialize Next.js frontend project with dependencies





  - Create Next.js 14+ project with TypeScript and App Router
  - Install and configure Tailwind CSS
  - Set up shadcn/ui component library (Button, Textarea, Alert, Modal, Card, Input)
  - Install Supabase JS client and configure environment variables
  - Create lib/supabase.ts for Supabase client initialization
  - _Requirements: 1.1, 1.2_

- [x] 2. Set up Supabase database schema






  - [x] 2.1 Create database migration script

    - Enable pgvector extension
    - Create patients table with columns: id, name, date_of_birth, preferred_language
    - Create consultations table with columns: id, patient_id, doctor_id, consultation_date, full_transcript, raw_soap_note, de_stigma_suggestions, approved
    - Create medical_lexicon table with columns: id, term_english, term_regional, language, verified_by_doctor_id, embedding (vector 384)
    - Create indexes on foreign keys and vector column (IVFFlat)
    - _Requirements: 10.1, 10.2, 10.3, 10.4_

  - [x] 2.2 Implement Row Level Security policies

    - Create RLS policy for patients table (doctors see only their patients)
    - Create RLS policies for consultations table (doctors access only their consultations)
    - Create RLS policies for medical_lexicon table (all read, doctors insert)
    - _Requirements: 1.3, 9.5_

- [x] 3. Implement authentication pages and middleware





  - [x] 3.1 Create sign-in/sign-up page


    - Build authentication form component with email/password fields
    - Implement Supabase Auth sign-in and sign-up handlers
    - Add form validation and error display
    - Redirect to dashboard on successful authentication
    - _Requirements: 1.1, 1.2_
  - [x] 3.2 Create authentication middleware


    - Implement middleware to check session on protected routes
    - Redirect unauthenticated users to sign-in page
    - Handle session refresh automatically
    - _Requirements: 1.4, 1.5_

- [x] 4. Build dashboard page




  - Create dashboard layout with navigation
  - Fetch and display list of upcoming consultations from Supabase
  - Implement "Start New Call" button that creates consultation record and navigates to room
  - Add quick links to patient records page
  - _Requirements: 9.1, 9.2_

- [x] 5. Build patient records page








  - Fetch and display list of patients for authenticated doctor
  - Implement patient search/filter functionality
  - Display consultation history for selected patient
  - Create links to SOAP note review pages for past consultations
  - _Requirements: 9.1, 9.2, 9.3, 9.4_

- [x] 6. Initialize FastAPI backend project
<<<<<<< HEAD
  - [x] 6.1 Create FastAPI project structure
=======






  - [x] 6.1 Create FastAPI project structure

>>>>>>> 8c02c68a975937490994437626cbdcc74e65ea28
    - Set up backend/ directory with app/ subdirectory
    - Create main.py with FastAPI app initialization
    - Configure CORS middleware for Next.js frontend
    - Create requirements.txt with dependencies (fastapi, uvicorn, websockets, supabase, google-cloud-speech, google-cloud-translate, google-generativeai, sentence-transformers, openai)
    - _Requirements: 3.2_
<<<<<<< HEAD
  - [x] 6.2 Create Pydantic models
    - Define LexiconTerm, SoapNoteResponse, StigmaSuggestion, SoapGenerationResponse models
    - Add validation rules for all fields
    - _Requirements: 5.2, 6.3, 7.4_
  - [x] 6.3 Implement database client module
=======

  - [x] 6.2 Create Pydantic models

    - Define LexiconTerm, SoapNoteResponse, StigmaSuggestion, SoapGenerationResponse models
    - Add validation rules for all fields
    - _Requirements: 5.2, 6.3, 7.4_

  - [x] 6.3 Implement database client module

>>>>>>> 8c02c68a975937490994437626cbdcc74e65ea28
    - Create database.py with Supabase client initialization
    - Implement append_transcript method
    - Implement get_full_transcript method
    - Implement save_soap_note method
    - Implement search_lexicon method with vector similarity search
    - Implement add_lexicon_term method
    - _Requirements: 3.5, 5.4, 5.5, 6.5, 7.5, 10.5_

- [x] 7. Implement WebSocket connection manager
<<<<<<< HEAD
=======




>>>>>>> 8c02c68a975937490994437626cbdcc74e65ea28
  - Create connection_manager.py with ConnectionManager class
  - Implement connect method to track WebSocket connections per consultation
  - Implement disconnect method with cleanup
  - Implement broadcast_to_other method to send messages to specific participant
  - _Requirements: 3.2, 4.3, 4.7_

- [x] 8. Build STT pipeline with Hinglish support





  - [x] 8.1 Implement ASR with fallback logic

    - Create stt_pipeline.py module
    - Implement Google Cloud Speech-to-Text as primary ASR (streaming API with free tier)
    - Implement OpenAI Whisper API as fallback option
    - Add error handling to switch between ASR services
    - Configure streaming recognition for real-time transcription

    - _Requirements: 3.3, 3.4_

  - [x] 8.2 Implement language-specific configuration

    - Configure 'hi-IN' language code for patient audio (Hindi)

    - Configure 'en-IN' with alternative 'hi-IN' for doctor audio (Hinglish code-switching)

    - _Requirements: 4.1, 4.4_

  - [x] 8.3 Integrate translation service

    - Implement Google Cloud Translation API integration
    - Translate Hindi to English for patient speech
    - Translate English/Hinglish to Hindi for doctor speech



    - _Requirements: 4.2, 4.5_


  - [x] 8.4 Integrate Community Lexicon lookup


    - Before translation, perform vector similarity search on medical_lexicon table
    - Replace regional terms with verified English equivalents when similarity > 0.85




    - _Requirements: 5.4, 5.5_
  - [x] 8.5 Create process_audio_stream function

    - Accept audio chunk, user_type, consultation_id, db_client as parameters
    - Orchestrate ASR → Lexicon Lookup → Translation pipeline
    - Return dictionary with original_text, translated_text, speaker_id
    - _Requirements: 3.3, 4.6_

- [x] 9. Implement SOAP note generation with Compassion Reflex



  - [x] 9.1 Create summarizer module


    - Create summarizer.py with generate_notes_with_empathy function
    - _Requirements: 6.1, 7.1_
  - [x] 9.2 Implement SOAP note generation (Step 1)


    - Integrate Google Gemini API
    - Create prompt for HIPAA-compliant SOAP note generation from Hinglish transcript
    - Parse JSON response with subjective, objective, assessment, plan fields
    - Add error handling for invalid JSON responses
    - _Requirements: 6.2, 6.3, 6.4_
  - [x] 9.3 Implement Compassion Reflex de-stigmatization (Step 2)


    - Extract assessment and plan sections from SOAP note
    - Create prompt for identifying stigmatizing language based on person-first principles
    - Parse JSON response with suggestions array
    - Return both raw_soap_note and de_stigma_suggestions
    - _Requirements: 7.1, 7.2, 7.3, 7.4_

- [x] 10. Create FastAPI endpoints







  - [x] 10.1 Implement WebSocket endpoint for audio streaming



    - Create /ws/{consultation_id}/{user_type} WebSocket endpoint
    - Accept binary audio chunks from client
    - Pass chunks to stt_pipeline.process_audio_stream
    - Broadcast translated captions to other participant via ConnectionManager
    - Append transcripts to consultations table in real-time

    - _Requirements: 3.1, 3.2, 3.5, 4.3, 4.6, 4.7_

  - [x] 10.2 Implement SOAP note generation endpoint
    - Create POST /consultation/{consultation_id}/generate_soap endpoint
    - Fetch full_transcript from database
    - Call summarizer.generate_notes_with_empathy
    - Save raw_soap_note and de_stigma_suggestions to consultations table
    - Return SoapGenerationResponse
    - _Requirements: 6.1, 6.5, 7.5_


  - [x] 10.3 Implement Community Lexicon endpoint

    - Create POST /community_lexicon/add endpoint
    - Accept LexiconTerm with term_english, term_regional, language
    - Generate 384-dimension embedding using sentence-transformers (gte-small)
    - Insert term and embedding into medical_lexicon table
    - _Requirements: 5.1, 5.2, 5.3_

  - [x] 10.4 Add health check endpoint

    - Create GET /health endpoint for monitoring
    - Return service status and dependencies health

- [x] 11. Build VideoCallRoom component






  - [x] 11.1 Implement WebRTC video/audio connection

    - Set up WebRTC peer connection using native APIs or simple-peer library
    - Request user media (video and audio)
    - Display local and remote video feeds
    - Handle peer connection state changes
    - _Requirements: 2.1, 2.2_

  - [x] 11.2 Implement audio capture and streaming

    - Use MediaRecorder API to capture local audio
    - Establish WebSocket connection to backend /ws/{consultation_id}/{user_type}
    - Stream audio chunks to backend at 1-second intervals
    - _Requirements: 3.1, 3.2_

  - [x] 11.3 Implement live caption display


    - Listen for incoming WebSocket messages with translated captions
    - Display captions in dedicated UI component with speaker identification
    - Show translated_text based on user_type (doctor sees patient translations, vice versa)
    - Auto-scroll caption display as new captions arrive
    - _Requirements: 4.6, 4.7_

  - [x] 11.4 Add call controls

    - Implement "End Call & Review Notes" button
    - Close WebSocket and WebRTC connections on end call
    - Navigate to SOAP note review page with consultation_id
    - _Requirements: 2.4, 2.5_

- [x] 12. Build SoapNoteReview component



  - [x] 12.1 Fetch and display SOAP note

    - Fetch raw_soap_note and de_stigma_suggestions from Supabase on component mount
    - Display S, O, A, P sections in editable Textarea components
    - _Requirements: 8.1, 8.2_

  - [x] 12.2 Implement Compassion Reflex UI

    - Loop through de_stigma_suggestions array
    - Render Alert component below relevant textarea for each suggestion
    - Display original phrase and suggested alternative with rationale
    - Implement "Accept" button that replaces text in textarea

    - _Requirements: 8.3, 8.4_

  - [x] 12.3 Implement Community Lexicon contribution UI
    - Add "Suggest Better Term" button
    - Create Modal component with fields for English Term and Regional Term
    - Implement form submission to POST /community_lexicon/add endpoint
    - Show success/error feedback


    - _Requirements: 5.1_
  - [x] 12.4 Implement note approval and save

    - Add "Approve and Save Record" button
    - Update consultations table with edited SOAP note
    - Set approved flag to true
    - Navigate back to dashboard or patient records
    - _Requirements: 8.5_

- [x] 13. Add error handling and loading states





  - Implement error boundaries in React components
  - Add loading spinners for async operations
  - Display user-friendly error messages for WebSocket failures
  - Implement retry logic for WebSocket connections with exponential backoff
  - Add toast notifications for success/error feedback
  - _Requirements: 2.3_

- [ ] 14. Configure environment variables and deployment
  - Create .env.local for frontend with Supabase URL and keys
  - Create .env for backend with API keys (Google Cloud, Gemini, NVIDIA)
  - Document environment variable setup in README
  - Create Dockerfile for FastAPI backend
  - Configure CORS for production domain
  - _Requirements: 1.1_

- [ ]* 15. Write integration tests
  - [ ]* 15.1 Test authentication flow
    - Test sign-in with valid credentials
    - Test sign-up with new user
    - Test protected route access without authentication
  - [ ]* 15.2 Test WebSocket audio streaming
    - Test WebSocket connection establishment
    - Test audio chunk transmission
    - Test caption broadcast between participants
  - [ ]* 15.3 Test SOAP note generation
    - Test with sample multilingual transcript
    - Verify SOAP note structure
    - Verify de-stigmatization suggestions
  - [ ]* 15.4 Test Community Lexicon
    - Test term submission
    - Test vector similarity search
    - Test term replacement in translation pipeline
