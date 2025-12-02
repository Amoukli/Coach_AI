# Coach AI - Development Progress Documentation

**Project:** Coach AI - Clinical Training Platform
**Developer:** Claude (Anthropic AI Assistant)
**Date:** January 2025
**Last Updated:** November 23, 2025
**Status:** ✅ Phase 2 - Admin UI & External Integrations Complete

---

## 📋 Executive Summary

Coach AI is a full-stack web application designed to help undergraduate medical students and newly qualified physicians train on clinical scenarios through interactive patient simulations. The application integrates with the existing Clare (clinical guidelines) and Clark (consultation transcription) ecosystem.

**Current Status:** Phase 1 and Phase 2 features complete. Admin UI for scenario management, Clare guidelines integration, Clark consultation import, and Past Cases browser are all implemented and functional.

---

## 🏗️ Architecture Overview

### Technology Stack

**Backend:**
- **Framework:** FastAPI (Python 3.11)
- **Database:** PostgreSQL 15
- **ORM:** SQLAlchemy 2.0 with async support
- **AI Services:** Azure OpenAI (GPT-4) for dialogue generation
- **Voice:** Azure Speech Services with neural voices
- **Authentication:** JWT tokens (Azure AD B2C ready)
- **WebSockets:** Real-time communication for scenarios

**Frontend:**
- **Framework:** React 18 with TypeScript
- **Build Tool:** Vite 5.0
- **Styling:** Tailwind CSS 3.3 with Clark-style design system
- **Design System:** Olive green theme (#669900), Schibsted Grotesk font
- **Charts:** Recharts for data visualization
- **State Management:** React hooks + Zustand (prepared)
- **Routing:** React Router v6

**Infrastructure:**
- **Containerization:** Docker with multi-stage builds
- **Orchestration:** Docker Compose
- **CI/CD:** GitHub Actions for Azure deployment
- **Hosting:** Azure App Service + Azure Static Web Apps

---

## 📦 Implemented Features

### ✅ Phase 1 - Core Features (COMPLETED)

#### Backend API

1. **Scenario Management** (`/api/v1/scenarios`)
   - ✅ List scenarios with filters (specialty, difficulty, status)
   - ✅ Get scenario by ID with full dialogue tree
   - ✅ Create new scenarios
   - ✅ Update existing scenarios
   - ✅ Delete scenarios
   - ✅ Publish scenarios (status management)
   - ✅ Archive scenarios (remove from student view)
   - ✅ List available specialties

2. **Session Management** (`/api/v1/sessions`)
   - ✅ Create new consultation session
   - ✅ Get session details with transcript
   - ✅ List student sessions
   - ✅ Get student session history with scenario/assessment details
   - ✅ Add messages to session transcript
   - ✅ Complete session with diagnosis
   - ✅ Delete session

3. **Assessment System** (`/api/v1/assessments`)
   - ✅ Create comprehensive assessment
   - ✅ Get assessment by ID
   - ✅ Get assessment by session
   - ✅ List student assessments
   - ✅ Get student skill progress
   - ✅ Automatic skill progress tracking

4. **Voice Generation** (`/api/v1/voice`)
   - ⚠️ Text-to-speech synthesis with Azure (Docker incompatibility issue)
   - ✅ Voice profile matching (accent, gender, emotion)
   - ✅ List available voices
   - ✅ Emotional style support (anxious, calm, distressed)
   - ✅ Speech-to-text transcription endpoint
   - ✅ Audio format conversion (WebM to WAV with pydub/ffmpeg)
   - ⚠️ Azure Speech SDK incompatible with Docker (Error 2153)

5. **Analytics & Progress** (`/api/v1/analytics`)
   - ✅ Student dashboard data
   - ✅ Skills radar chart data
   - ✅ Progress trend over time
   - ✅ Personalized scenario recommendations
   - ✅ Leaderboard with filtering

6. **Real-time Communication**
   - ✅ WebSocket endpoint for scenarios
   - ✅ Connection manager
   - ✅ Message broadcasting
   - ✅ Automatic reconnection handling

#### Business Logic Services

1. **Scenario Engine** (`scenario_engine.py`)
   - ✅ Dialogue flow management
   - ✅ Branching logic based on student input
   - ✅ Topic tracking and coverage analysis
   - ✅ Red flag identification
   - ✅ Question relevance scoring
   - ✅ Assessment data preparation

2. **Assessment Engine** (`assessment_engine.py`)
   - ✅ Five-skill scoring system:
     - History Taking (30% weight)
     - Clinical Reasoning (25% weight)
     - Management (20% weight)
     - Communication (15% weight)
     - Efficiency (10% weight)
   - ✅ Overall score calculation
   - ✅ Detailed feedback generation
   - ✅ Strengths identification
   - ✅ Areas for improvement
   - ✅ Performance metrics tracking

3. **Azure Services Integration**
   - ✅ Speech synthesis with multiple voices
   - ✅ SSML generation for emotional styles
   - ✅ OpenAI chat completion for patient responses
   - ✅ Context-aware dialogue generation
   - ✅ Voice profile mapping

4. **External API Integration** (FULLY IMPLEMENTED)
   - ✅ Clark integration service (import consultations)
   - ✅ Clare integration service (fetch guidelines)
   - ✅ Scenario enrichment with guidelines
   - ✅ Consultation-to-scenario conversion

5. **Guidelines Integration** (`/api/v1/guidelines`)
   - ✅ Search clinical guidelines by condition/diagnosis
   - ✅ Filter by specialty
   - ✅ Mock data fallback when Clare API unavailable

6. **Clark Import** (`/api/v1/clark`)
   - ✅ List available consultations from Clark
   - ✅ Preview consultation-to-scenario conversion
   - ✅ Import consultation as draft scenario
   - ✅ Mock data fallback when Clark API unavailable

#### Database Models

1. **Student Model**
   - User profile (email, name, institution)
   - Authentication fields (password hash, Azure AD OID)
   - Progress tracking (scenarios completed, time spent)
   - Skill levels (JSON storage)

2. **Scenario Model**
   - Metadata (title, specialty, difficulty, status)
   - Patient profile (age, gender, presenting complaint, voice)
   - Dialogue tree (JSON structure with nodes and branches)
   - Assessment rubric (must-ask questions, red flags, management steps)
   - Learning objectives and correct diagnosis
   - Clare guideline references
   - Usage statistics (times played, average score)

3. **Session Model**
   - Student and scenario relationships
   - Status tracking (in_progress, completed, abandoned)
   - Complete transcript (JSON array)
   - Navigation tracking (current node, nodes visited)
   - Performance metrics (questions asked, topics covered, red flags)
   - Diagnosis submission and correctness

4. **Assessment Model**
   - Five skill scores (0-100 each)
   - Overall score calculation
   - Detailed metrics (JSON)
   - Skills breakdown with details
   - Feedback summary and recommendations

5. **Skill Progress Model**
   - Skill-specific tracking per student
   - Current and previous levels
   - Trend analysis (improving, stable, declining)
   - Session count and averages

#### Frontend Components

1. **Layout Components**
   - ✅ Header with navigation
   - ✅ Footer with ecosystem links
   - ✅ Responsive design

2. **Dashboard** (`/dashboard`)
   - ✅ Welcome banner with gradient
   - ✅ Stats overview cards (scenarios, score, time)
   - ✅ Skills radar chart
   - ✅ Progress line chart
   - ✅ Past Cases browser with filtering
   - ✅ Quick action cards

3. **Scenario Library** (`/scenarios`)
   - ✅ Scenario grid with cards
   - ✅ Filter by specialty
   - ✅ Filter by difficulty
   - ✅ Clear filters functionality
   - ✅ Scenario metadata display
   - ✅ Usage statistics (plays, average score)

4. **Scenario Player** (`/scenarios/:id/play`)
   - ✅ Patient information sidebar
   - ✅ Chat interface for consultation
   - ✅ Real-time message display
   - ✅ Student/patient message distinction
   - ✅ WebSocket integration
   - ✅ Audio playback (prepared)
   - ✅ Microphone button with recording UI
   - ✅ Recording timer and visual indicators
   - ✅ Speech-to-text integration
   - ✅ Complete scenario button
   - ✅ Guidelines lookup panel (Clare integration)

5. **Assessment Results** (`/sessions/:id/results`)
   - ✅ Overall score display
   - ✅ Skills breakdown with progress bars
   - ✅ Strengths and improvements sections
   - ✅ Detailed feedback
   - ✅ Navigation to next actions

6. **Admin Panel** (`/admin/*`)
   - ✅ Scenario Manager (`/admin/scenarios`)
     - List all scenarios with status filtering
     - Publish, archive, delete actions
     - Link to create/edit scenarios
   - ✅ Scenario Editor (`/admin/scenarios/new`, `/admin/scenarios/:id/edit`)
     - Multi-tab form (Basic Info, Patient Profile, Dialogue, Assessment)
     - Create new scenarios
     - Edit existing scenarios
   - ✅ Clark Import (`/admin/import`)
     - Browse available Clark consultations
     - Preview scenario conversion
     - Import as draft scenario

#### Frontend Services

1. **API Client** (`api.ts`)
   - ✅ Axios-based HTTP client
   - ✅ Request/response interceptors
   - ✅ Token management
   - ✅ Error handling (401 redirect)
   - ✅ Complete CRUD operations for all entities
   - ✅ Guidelines search API
   - ✅ Clark consultation import API
   - ✅ Session history API

2. **WebSocket Service** (`websocket.ts`)
   - ✅ Connection management
   - ✅ Message handlers
   - ✅ Automatic reconnection (5 attempts)
   - ✅ Event system (message, error, close)
   - ✅ Connection state tracking

3. **Audio Service** (`audio.ts`)
   - ✅ Audio playback from Blob/URL
   - ✅ Microphone recording
   - ✅ Audio state management
   - ✅ Base64 conversion
   - ✅ Resource cleanup

4. **Auth Service** (`auth.ts`)
   - ✅ Login/logout functionality
   - ✅ User session management
   - ✅ Token storage
   - ✅ Authentication state checking
   - ✅ Development auto-login

#### Styling & Design

1. **Tailwind Configuration**
   - ✅ Custom color palette (Coach olive green #669900)
   - ✅ Medical-themed colors (success, warning, error)
   - ✅ Schibsted Grotesk font family (matching Clark)
   - ✅ Custom box shadows
   - ✅ Responsive breakpoints

2. **Global Styles**
   - ✅ Clark-style design system throughout app
   - ✅ CoachLogo.svg in Header and Landing page
   - ✅ Clark-style footer (text left, links right)
   - ✅ Component classes (btn, card, input, badge)
   - ✅ Form styling
   - ✅ Transcript message styling
   - ✅ Progress bars
   - ✅ Custom scrollbars
   - ✅ Animations (fade-in, slide-in)
   - ✅ Accessibility features (focus states, sr-only)
   - ✅ Print styles for medical documentation

#### Infrastructure & DevOps

1. **Docker Configuration**
   - ✅ Backend Dockerfile (Python 3.11)
   - ✅ Frontend Dockerfile (multi-stage with Nginx)
   - ✅ Docker Compose with all services
   - ✅ PostgreSQL container with health checks
   - ✅ Volume management
   - ✅ Network configuration
   - ✅ Environment variable injection

2. **Database**
   - ✅ Complete schema migration (001_initial_schema.sql)
   - ✅ All tables with proper relationships
   - ✅ Indexes for performance
   - ✅ Triggers for auto-updating timestamps
   - ✅ Sample demo user
   - ✅ Foreign key constraints with CASCADE

3. **CI/CD Pipeline**
   - ✅ GitHub Actions workflow
   - ✅ Backend deployment to Azure App Service
   - ✅ Frontend deployment to Azure Static Web Apps
   - ✅ Database migration job
   - ✅ Environment variable management
   - ✅ Automated testing hooks

4. **Configuration**
   - ✅ Comprehensive .env.example
   - ✅ .gitignore for all environments
   - ✅ TypeScript configuration
   - ✅ Vite configuration with path aliases
   - ✅ Tailwind/PostCSS configuration
   - ✅ Nginx configuration for SPA

5. **Documentation**
   - ✅ README.md (comprehensive)
   - ✅ QUICKSTART.md (5-minute setup)
   - ✅ CLAUDE.md (this document)
   - ✅ Inline code documentation
   - ✅ API endpoint documentation (FastAPI auto-docs)

---

## 🎯 Design Decisions

### 1. Architecture Choices

**Why FastAPI?**
- Modern async/await support for WebSocket connections
- Automatic OpenAPI documentation
- Type hints with Pydantic for validation
- Excellent performance for real-time applications
- Easy Azure deployment

**Why React with TypeScript?**
- Strong typing prevents runtime errors in medical application
- Component reusability for scenario variations
- Large ecosystem for medical UI components
- Excellent Azure Static Web Apps support
- Type safety critical for medical data

**Why PostgreSQL?**
- JSONB support for flexible dialogue trees
- Strong consistency for assessment data
- Azure Database for PostgreSQL integration
- Advanced indexing for performance
- ACID compliance for medical records

### 2. Data Model Decisions

**Dialogue Tree Storage (JSON):**
- Flexible structure for different scenario types
- Easy to modify without schema changes
- Efficient storage and retrieval
- Supports complex branching logic

**Transcript Storage (JSON Array):**
- Maintains conversation order
- Easy to append new messages
- Supports rich metadata (audio URLs, timestamps)
- Simple to display in UI

**Skill Progress Tracking:**
- Separate table for efficient querying
- Historical data preserved
- Trend analysis enabled
- Per-skill granularity

### 3. API Design Decisions

**RESTful Endpoints:**
- Clear resource naming (/scenarios, /sessions, /assessments)
- Standard HTTP methods (GET, POST, PUT, DELETE)
- Consistent response formats
- Pagination support

**WebSocket for Real-time:**
- Immediate patient responses
- Better user experience
- Reduces server load vs polling
- Supports audio streaming (future)

**Separate Voice Endpoint:**
- Can use different voice providers
- Caching opportunities
- Fallback to ElevenLabs if needed
- Audio file management

### 4. Assessment Algorithm

**Weighted Scoring:**
- History Taking (30%): Most important for diagnosis
- Clinical Reasoning (25%): Critical thinking skills
- Management (20%): Treatment planning
- Communication (15%): Patient rapport
- Efficiency (10%): Time management

**Dynamic Rubric:**
- Scenario-specific must-ask questions
- Configurable red flags
- Adaptable to specialty requirements

### 5. Security Decisions

**JWT Tokens:**
- Stateless authentication
- Easy to scale horizontally
- Azure AD B2C compatible
- Short expiration for security

**Input Validation:**
- Pydantic models for all inputs
- SQL injection prevention (ORM)
- XSS prevention (React escaping)
- CORS properly configured

### 6. User Experience

**Auto-login in Development:**
- Faster development iteration
- Easy to disable for production
- Demo user for testing

**Real-time Feedback:**
- WebSocket for immediate responses
- Loading states for all async operations
- Error handling with user-friendly messages

**Progressive Disclosure:**
- Simple interface for students
- Advanced features for educators
- Dashboard shows relevant metrics only

---

## 📊 Database Schema

### Entity Relationships

```
students (1) ─┬─ (*) sessions (*) ── (1) scenarios
              └─ (*) assessments (1) ── (1) sessions
              └─ (*) skill_progress

sessions (1) ── (*) conversation_messages
```

### Key Tables

1. **students**: 14 columns, user profiles and progress
2. **scenarios**: 18 columns, clinical scenario data
3. **sessions**: 19 columns, consultation sessions
4. **assessments**: 14 columns, performance evaluations
5. **skill_progress**: 10 columns, skill tracking
6. **conversation_messages**: 8 columns, detailed transcript

---

## 🔧 Configuration Requirements

### Required Environment Variables

**Backend:**
```
DATABASE_URL                  # PostgreSQL connection
AZURE_SPEECH_KEY             # Required for voice
AZURE_SPEECH_REGION          # Required for voice
AZURE_OPENAI_KEY             # Required for AI responses
AZURE_OPENAI_ENDPOINT        # Required for AI responses
AZURE_OPENAI_DEPLOYMENT_NAME # GPT-4 deployment
JWT_SECRET_KEY               # Token signing
```

**Frontend:**
```
VITE_API_URL                 # Backend API URL
VITE_WS_URL                  # WebSocket URL
```

**Optional (for full features):**
```
CLARE_API_KEY                # Clinical guidelines
CLARK_API_KEY                # Consultation import
AZURE_AD_CLIENT_ID           # Azure AD B2C
ELEVENLABS_API_KEY           # Voice fallback
```

---

## 🚀 Deployment Architecture

### Development Environment
```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Frontend  │────▶│   Backend   │────▶│  PostgreSQL │
│   (Vite)    │     │  (FastAPI)  │     │             │
│  Port 3000  │     │  Port 8000  │     │  Port 5432  │
└─────────────┘     └─────────────┘     └─────────────┘
                           │
                           ▼
                    ┌─────────────┐
                    │   Azure AI  │
                    │  Services   │
                    └─────────────┘
```

### Production (Azure)
```
┌──────────────────┐     ┌──────────────────┐
│  Azure Static    │────▶│  Azure App       │
│  Web Apps        │     │  Service         │
│  (Frontend)      │     │  (Backend)       │
└──────────────────┘     └──────────────────┘
                                │
                                ▼
                         ┌──────────────────┐
                         │  Azure Database  │
                         │  for PostgreSQL  │
                         └──────────────────┘
                                │
                                ▼
                         ┌──────────────────┐
                         │  Azure OpenAI    │
                         │  Speech Services │
                         └──────────────────┘
```

---

## 🧪 Testing Strategy

### Backend Testing (Prepared)
- Unit tests for services (scenario_engine, assessment_engine)
- Integration tests for API endpoints
- Database migration tests
- Azure service mocking for CI/CD

### Frontend Testing (Prepared)
- Component tests with React Testing Library
- Service tests (API, WebSocket, Audio)
- E2E tests with Playwright (recommended)
- Accessibility testing

### Manual Testing Checklist
- [ ] Create and start a scenario
- [ ] Send messages and receive responses
- [ ] Complete scenario and view assessment
- [ ] View dashboard with charts
- [ ] Filter scenarios by specialty/difficulty
- [ ] Audio playback functionality
- [ ] WebSocket reconnection
- [ ] Mobile responsiveness

---

## 📈 Performance Considerations

### Database
- Indexes on frequently queried columns
- JSONB for flexible data with GIN indexes
- Connection pooling in SQLAlchemy
- Async operations for better concurrency

### Backend
- Async/await throughout for I/O operations
- WebSocket for real-time communication
- Caching opportunities for scenarios
- Background tasks for assessment calculation

### Frontend
- Code splitting with Vite
- Lazy loading for routes
- Optimized images and assets
- Service Worker ready for PWA

### Azure Services
- Azure OpenAI streaming (can be added)
- Speech synthesis caching
- CDN for static assets
- Application Insights for monitoring

---

## 🔜 Future Enhancements (Phase 3+)

### High Priority
1. **~~Audio Recording~~** ✅ **COMPLETED**: Microphone recording with visual indicators
2. **~~Speech-to-Text~~** ✅ **COMPLETED**: Azure Speech REST API integration
3. **~~Scenario Builder UI~~** ✅ **COMPLETED**: Full Admin UI with ScenarioEditor
4. **Mobile App**: React Native version
5. **Offline Mode**: PWA with service workers
6. **Advanced Analytics**: ML-based insights

### Medium Priority
1. **Video Integration**: Pre-recorded examination videos
2. **Multiplayer Scenarios**: Group consultations
3. **Peer Review**: Students review each other
4. **Certification System**: Official completion certificates
5. **Integration Tests**: Automated E2E testing

### Low Priority (Nice to Have)
1. **Gamification**: Badges, achievements, streaks
2. **Social Features**: Student forums, discussion
3. **Custom Themes**: Institution branding
4. **Export Reports**: PDF generation of assessments
5. **API for Third Parties**: Allow external integrations

---

## ⚠️ Known Limitations

1. **~~Azure Speech SDK Docker Incompatibility~~** ✅ **RESOLVED**: Switched from Azure Speech SDK to REST API. Both TTS and STT now work in Docker on any architecture (ARM64/AMD64).
2. **Authentication**: Currently uses simple JWT, Azure AD B2C integration needed for production
3. **~~Scenario Creation~~** ✅ **RESOLVED**: Full Admin UI implemented with ScenarioManager, ScenarioEditor, and ClarkImport
4. **~~Clare/Clark Integration~~** ✅ **RESOLVED**: Both integrations working with mock data fallback when APIs unavailable
5. **Testing**: Test suites prepared but not yet implemented
6. **Monitoring**: Application Insights configured but needs instrumentation
7. **Error Boundaries**: Frontend needs React error boundaries
8. **Rate Limiting**: API needs rate limiting for production
9. **Data Backup**: Automated backup strategy needed
10. **GDPR Compliance**: Need data export and deletion workflows

---

## 🔐 Security Considerations

### Implemented
- ✅ Password hashing (prepared in models)
- ✅ JWT token authentication
- ✅ CORS configuration
- ✅ SQL injection prevention (ORM)
- ✅ XSS prevention (React)
- ✅ HTTPS enforcement (Nginx config)
- ✅ Input validation (Pydantic)
- ✅ Secure headers (Nginx)

### Needed for Production
- [ ] Rate limiting on API endpoints
- [ ] Azure AD B2C implementation
- [ ] Secrets management (Azure Key Vault)
- [ ] Audit logging
- [ ] GDPR compliance workflows
- [ ] Penetration testing
- [ ] Security headers (CSP, HSTS)
- [ ] API key rotation strategy

---

## 💰 Cost Estimation (Azure)

### Monthly Estimates (Medium Usage - 1000 students, 10 scenarios/month each)

**Compute:**
- Azure App Service (Backend): ~$50-100/month (B2 tier)
- Azure Static Web Apps (Frontend): ~$0-10/month (Standard tier)

**Database:**
- Azure Database for PostgreSQL: ~$50-100/month (Basic tier)

**AI Services:**
- Azure OpenAI: ~$200-500/month (10k scenarios × 20 tokens avg)
- Azure Speech Services: ~$100-200/month (10k voice generations)

**Storage & Networking:**
- Azure Blob Storage (audio): ~$10-20/month
- Bandwidth: ~$10-20/month

**Total Estimated:** $420-950/month

**Scaling Considerations:**
- Can reduce costs with reserved instances
- Auto-scaling for peak usage
- Speech synthesis caching can reduce 50% of costs
- Free tier available for development/testing

---

## 📝 Git Repository Structure

```
Coach/
├── .github/
│   └── workflows/
│       └── azure-deploy.yml       # CI/CD pipeline
├── backend/
│   ├── app/
│   │   ├── api/                   # API endpoints
│   │   ├── core/                  # Configuration
│   │   ├── models/                # Database models
│   │   └── services/              # Business logic
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .env.example
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/            # React components
│   │   ├── services/              # API clients
│   │   ├── store/                 # State management
│   │   └── styles/                # CSS
│   ├── package.json
│   ├── Dockerfile
│   ├── nginx.conf
│   └── .env.example
├── database/
│   └── migrations/
│       └── 001_initial_schema.sql
├── docker-compose.yml
├── .env.example
├── .gitignore
├── README.md
├── QUICKSTART.md
└── CLAUDE.md                      # This file
```

---

## 🎓 Key Learnings & Best Practices

### What Went Well
1. **Modular Architecture**: Clean separation of concerns makes it easy to extend
2. **Type Safety**: TypeScript and Pydantic prevent many bugs early
3. **Docker First**: Consistent development and production environments
4. **Comprehensive Models**: Database schema supports all planned features
5. **Azure Integration**: Cloud-native design from the start
6. **Documentation**: Clear docs make onboarding easier

### Challenges Addressed
1. **Real-time Communication**: WebSocket integration required careful error handling
2. **Audio Handling**: Browser compatibility considerations for audio playback
3. **Complex Assessment**: Multi-factor scoring algorithm needed careful weighting
4. **Dialogue Trees**: JSON structure allows flexibility while maintaining structure
5. **Async Operations**: Proper async/await usage throughout for performance

### Recommendations for Future Development
1. **Add Tests First**: Implement test suites before adding new features
2. **Monitor Performance**: Use Application Insights from day one
3. **Cache Aggressively**: Scenarios and audio can be cached effectively
4. **Version API**: Plan for /api/v2 as features evolve
5. **User Feedback Loop**: Built-in feedback mechanism for improvements
6. **Incremental Rollout**: Use feature flags for gradual releases

---

## 📞 Support & Maintenance

### Development Setup Issues
- Check Docker is running: `docker ps`
- Verify .env file exists and has correct values
- Ensure ports 80, 8000, 5432 are available
- Check logs: `docker-compose logs -f`

### Common Errors
1. **Database connection failed**: Check DATABASE_URL format
2. **Azure Speech 401**: Verify AZURE_SPEECH_KEY
3. **OpenAI timeout**: Check AZURE_OPENAI_ENDPOINT
4. **WebSocket disconnect**: Normal, reconnection is automatic
5. **Audio not playing**: Check browser audio permissions

### Monitoring Checklist
- [ ] Health endpoint responding: `/health`
- [ ] Database connectivity
- [ ] Azure Speech quota remaining
- [ ] Azure OpenAI quota remaining
- [ ] WebSocket connections count
- [ ] Average response times
- [ ] Error rates by endpoint
- [ ] Active user sessions

---

## ✅ Project Completion Checklist

### Infrastructure
- [x] Backend FastAPI application
- [x] Frontend React application
- [x] PostgreSQL database
- [x] Docker configuration
- [x] Docker Compose orchestration
- [x] CI/CD pipeline
- [x] Environment configuration
- [x] Documentation

### Backend Features
- [x] Database models and relationships
- [x] API endpoints (scenarios, sessions, assessments, voice, analytics)
- [x] WebSocket real-time communication
- [x] Scenario engine with dialogue logic
- [x] Assessment engine with scoring
- [x] Azure Speech integration (REST API)
- [x] Azure OpenAI integration
- [x] Clark integration (fully implemented with mock fallback)
- [x] Clare integration (fully implemented with mock fallback)
- [x] Guidelines API endpoint
- [x] Session history with scenario/assessment details

### Frontend Features
- [x] Dashboard with charts and Past Cases browser
- [x] Scenario library with filtering
- [x] Scenario player with chat interface and guidelines lookup
- [x] Assessment results display
- [x] API client with authentication
- [x] WebSocket service
- [x] Audio service
- [x] Responsive design
- [x] Medical-themed styling
- [x] Admin Panel (ScenarioManager, ScenarioEditor, ClarkImport)

### Deployment
- [x] Backend Dockerfile
- [x] Frontend Dockerfile with Nginx
- [x] Database migrations
- [x] GitHub Actions workflow
- [x] Azure deployment configuration
- [x] Environment variable examples

### Documentation
- [x] README.md (comprehensive guide)
- [x] QUICKSTART.md (5-minute setup)
- [x] CLAUDE.md (this progress document)
- [x] Inline code comments
- [x] API documentation (FastAPI auto-docs)

---

## 🎙️ Speech-to-Text Feature Implementation (November 22, 2025)

### Overview
Added comprehensive Speech-to-Text functionality to allow students to speak their questions instead of typing.

### Implementation Details

#### Backend Changes

1. **STT Endpoint** (`/api/v1/voice/transcribe`)
   - POST endpoint accepting audio file upload (multipart/form-data)
   - Uses Azure Speech Recognition service
   - Returns transcribed text in JSON format

2. **Audio Format Conversion**
   - Added `pydub==0.25.1` to requirements.txt
   - Added `ffmpeg` to Dockerfile
   - Converts WebM/Opus (from browser MediaRecorder) to WAV (for Azure)
   - Specifications: 16kHz, 16-bit, mono
   - Uses temporary files for conversion
   - Automatic cleanup after processing

3. **Azure Speech Recognition Service**
   - Method: `recognize_speech_from_audio()` in `azure_services.py`
   - Language: en-GB
   - Async implementation for non-blocking operations
   - Comprehensive error handling

#### Frontend Changes

1. **Scenario Player UI Updates**
   - Microphone button next to send button
   - Recording visual indicators (pulsing red dot)
   - Timer display during recording
   - Button state management (mic icon ↔ stop icon)
   - Disabled states during recording

2. **Recording Functionality**
   - `startRecording()`: Initiates microphone capture
   - `stopRecording()`: Stops capture and triggers transcription
   - Recording timer with state management
   - Automatic cleanup on unmount

3. **API Integration**
   - `transcribeAudio()` method in API client
   - FormData construction for file upload
   - Error handling with user-friendly alerts
   - Transcribed text populates input field for review/editing

### Issue Resolved: Azure Speech SDK Docker Incompatibility

**Original Problem:**
Azure Speech SDK failed to initialize in Docker with Error 2153 on both ARM64 and AMD64 platforms.

**Solution Implemented (November 22, 2025):**
Switched from Azure Speech SDK to Azure Speech **REST API**. This approach:
- Works on any architecture (ARM64/AMD64)
- No platform-specific SDK dependencies
- Uses `httpx` for async HTTP calls
- Maintains same functionality (TTS and STT)

### Files Modified

**Backend:**
- `backend/requirements.txt` - Removed `azure-cognitiveservices-speech`, kept `httpx` and `pydub`
- `backend/Dockerfile` - Simplified (only needs `ffmpeg` for audio conversion)
- `backend/app/api/voice.py` - `/transcribe` endpoint (unchanged)
- `backend/app/core/azure_services.py` - Rewrote to use REST API instead of SDK
- `docker-compose.yml` - Removed `platform: linux/amd64` requirement

**Frontend:**
- `frontend/src/services/api.ts` - `transcribeAudio()` method
- `frontend/src/components/ScenarioPlayer/index.tsx` - Microphone UI and recording logic

### Testing Performed

**UI Testing:** ✅ Complete
- Microphone button renders correctly
- Recording indicator appears with timer
- Button state changes (mic → stop → mic)
- Disabled states work correctly
- Recording timer increments properly

**Backend Testing:** ✅ Complete
- TTS REST API: Working (returns audio bytes)
- STT REST API: Working (transcribes audio correctly)
- Audio format conversion: Working (WebM to WAV)
- Test: Generated audio via TTS, transcribed back via STT - exact match

---

## 🛠️ Phase 2 - Admin UI & External Integrations (November 23, 2025)

### Overview
Implemented comprehensive Admin UI for scenario management and integrated with Clare (guidelines) and Clark (consultations) external services.

### Features Implemented

#### 1. Clare Guidelines Integration
- **Backend endpoint**: `GET /api/v1/guidelines/search`
- **Frontend**: Guidelines lookup panel in ScenarioPlayer
- Students can search for clinical guidelines during diagnosis
- Clare API: `POST /search` with `X-API-Key` header
- Mock data fallback when Clare API is unavailable

#### 2. Past Cases Browser
- **Backend endpoint**: `GET /api/v1/sessions/student/{id}/history`
- **Frontend component**: `PastCases.tsx` in Dashboard
- Shows all previous sessions with scenario titles, scores, status
- Filter by status (all, completed, in_progress, abandoned)
- Links to view results or continue in-progress sessions

#### 3. Admin Scenario Manager
- **Route**: `/admin/scenarios`
- **Features**:
  - List all scenarios with status filtering (all/draft/published/archived)
  - Table view with title, specialty, difficulty, status, plays, average score
  - Actions: Edit, Publish (draft only), Archive (published only), Delete

#### 4. Scenario Editor
- **Routes**: `/admin/scenarios/new`, `/admin/scenarios/:id/edit`
- **Multi-tab form**:
  - **Basic Info**: Title, specialty, difficulty, diagnosis, learning objectives, differentials
  - **Patient Profile**: Age, gender, occupation, presenting complaint, background, voice settings
  - **Dialogue**: Initial greeting/opening statement
  - **Assessment**: Must-ask questions, red flags, key findings, management steps
- Auto-generates unique scenario_id for new scenarios

#### 5. Clark Import
- **Route**: `/admin/import`
- **Backend endpoints**:
  - `GET /api/v1/clark/consultations` - List available consultations
  - `GET /api/v1/clark/consultations/{id}/preview` - Preview conversion
  - `POST /api/v1/clark/consultations/{id}/import` - Import as draft
- **Features**:
  - Browse available Clark consultations with filtering
  - Preview how consultation converts to scenario
  - Import creates scenario in Draft status for review
  - Mock data fallback when Clark API is unavailable

#### 6. Scenario Status Workflow
- **Status states**: Draft → Published → Archived
- **Transitions**:
  - `POST /api/v1/scenarios/{id}/publish`: Draft → Published
  - `POST /api/v1/scenarios/{id}/archive`: Published → Archived
- **Visibility**: Only published scenarios appear in student Scenario Library

### Files Created/Modified

**New Backend Files:**
- `backend/app/api/clark.py` - Clark import endpoints
- `backend/app/api/guidelines.py` - Clare guidelines endpoint

**New Frontend Files:**
- `frontend/src/components/Admin/ScenarioManager.tsx`
- `frontend/src/components/Admin/ScenarioEditor.tsx`
- `frontend/src/components/Admin/ClarkImport.tsx`
- `frontend/src/components/Dashboard/PastCases.tsx`

**Modified Files:**
- `backend/app/api/scenarios.py` - Added archive endpoint
- `backend/app/api/sessions.py` - Added history endpoint
- `backend/app/main.py` - Added clark and guidelines routers
- `frontend/src/App.tsx` - Added admin routes
- `frontend/src/services/api.ts` - Added all new API methods
- `frontend/src/components/Layout/Header.tsx` - Added Admin nav link
- `frontend/src/components/ScenarioPlayer/index.tsx` - Added guidelines lookup
- `frontend/src/components/Dashboard/index.tsx` - Added PastCases component

### Documentation Updates
All architecture diagrams in `/docs/diagrams/` updated to reflect new features:
- architecture.md - Admin UI components, Clark API, status workflow
- data-flow.md - Admin actions, Clark import flow, scenario lifecycle
- scenario-engine.md - Status management, API endpoints reference
- README.md - Updated descriptions and recent changes section

---

## 🎭 AI Prompt & Emotion Engine (November 24, 2025)

### Overview
Significantly enhanced the AI patient's realism by implementing a dynamic prompt engine and real-time emotion tagging.

### Features Implemented

#### 1. Dynamic Emotion Tagging
- **Mechanism**: AI now outputs JSON responses containing both `text` and `emotion`.
- **Emotions Supported**: `neutral`, `cheerful`, `sad`, `angry`, `fearful`, `shouting`, `whispering`, `hopeful`, `terrified`, `unfriendly`.
- **Integration**: The `emotion` tag is passed to Azure Speech Services to dynamically adjust the voice style (e.g., using `mstts:express-as style="worried"`).

#### 2. Comprehensive Clinical Knowledge Base
- **Problem**: Previous prompt only knew about the "root" of the dialogue tree.
- **Solution**: Implemented recursive extraction (`_extract_all_clinical_facts`) that traverses the entire dialogue tree.
- **Result**: The AI now "knows" every symptom, history detail, and response defined in the scenario, regardless of depth.

#### 3. Improved System Prompt
- **Persona-based**: clearer instructions on role-playing (Name, Age, Occupation).
- **Improvisation**: Explicit permission to improvise non-clinical details (lifestyle, hobbies) while strictly adhering to clinical facts.
- **Safe Defaults**: Instructions to deny symptoms not in the Knowledge Base ("If asked about a symptom NOT in your Knowledge Base, assume you do not have it").

### Files Modified
- `backend/app/core/azure_services.py`: Refactored `_build_system_prompt` and `generate_patient_response`.
- `backend/app/services/scenario_engine.py`: Updated `process_student_input` to handle JSON responses.

---

## 🎉 Conclusion

Coach AI is a fully functional MVP ready for initial deployment and user testing. The application provides a solid foundation for clinical training with room for extensive future enhancements.

**Next Immediate Steps:**
1. Deploy to Azure using the provided CI/CD pipeline
2. Add Azure credentials to GitHub Secrets
3. Test with real medical students
4. Gather feedback and prioritize Phase 2 features
5. Implement comprehensive testing
6. Add Azure AD B2C authentication

**Success Metrics to Track:**
- Number of active students
- Scenarios completed per student
- Average assessment scores
- Time spent per scenario
- Student satisfaction (NPS score)
- Azure service costs
- System uptime and performance

---

**Documentation maintained by:** Claude (Anthropic)
**Last updated:** November 23, 2025
**Version:** 2.1.0 (UI Design System - Clark-style with Olive Green Theme)
- Docker is installed locally, always rebuild containers when adding new feature or making fixes
