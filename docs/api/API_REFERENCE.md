# Coach - API Reference

Complete API documentation for the Coach backend.

**Base URL:** `http://localhost:8000/api/v1` (development)

**Authentication:** Bearer token in `Authorization` header

---

## 📋 Table of Contents

- [Authentication](#authentication)
- [Scenarios](#scenarios)
- [Sessions](#sessions)
- [Assessments](#assessments)
- [Voice](#voice)
- [Analytics](#analytics)

---

## Authentication

### Get Token

Currently using JWT tokens. In production, will use Azure AD B2C.

**Development:** Token automatically created with demo user login.

```bash
# Store token
localStorage.setItem('auth_token', 'your_token_here')

# Use in requests
Authorization: Bearer your_token_here
```

---

## Scenarios

### List Scenarios

Get all published scenarios with optional filters.

**Endpoint:** `GET /scenarios`

**Query Parameters:**
- `specialty` (string, optional): Filter by specialty
- `difficulty` (string, optional): Filter by difficulty level
- `status` (string, optional): Filter by status
- `skip` (integer, optional): Number of records to skip (default: 0)
- `limit` (integer, optional): Max records to return (default: 50)

**Example Request:**
```bash
curl -X GET "http://localhost:8000/api/v1/scenarios?specialty=Cardiology&difficulty=intermediate" \
  -H "Authorization: Bearer your_token"
```

**Response:**
```json
[
  {
    "id": 1,
    "scenario_id": "scenario_001",
    "title": "Chest Pain in Primary Care",
    "specialty": "Cardiology",
    "difficulty": "intermediate",
    "status": "published",
    "times_played": 45,
    "average_score": 78
  }
]
```

---

### Get Scenario by ID

Get complete scenario details including dialogue tree.

**Endpoint:** `GET /scenarios/{scenario_id}`

**Path Parameters:**
- `scenario_id` (string): Unique scenario identifier

**Example Request:**
```bash
curl -X GET "http://localhost:8000/api/v1/scenarios/scenario_001" \
  -H "Authorization: Bearer your_token"
```

**Response:**
```json
{
  "id": 1,
  "scenario_id": "scenario_001",
  "title": "Chest Pain in Primary Care",
  "description": "58-year-old male presenting with chest pain",
  "specialty": "Cardiology",
  "difficulty": "intermediate",
  "status": "published",
  "patient_profile": {
    "name": "Anonymous Patient",
    "age": 58,
    "gender": "male",
    "presenting_complaint": "Chest pain for 2 hours",
    "voice_profile": {
      "accent": "British",
      "emotional_state": "anxious",
      "voice_id": "en-GB-RyanNeural"
    }
  },
  "dialogue_tree": {
    "root": {
      "id": "node_001",
      "patient_says": "Doctor, I've been having this pain in my chest...",
      "expected_topics": ["pain_quality", "pain_location", "duration"]
    }
  },
  "assessment_rubric": {
    "must_ask": ["pain_quality", "radiation", "associated_symptoms"],
    "red_flags": ["crushing_pain", "radiation_to_arm", "sweating"],
    "time_limit": 15
  },
  "correct_diagnosis": "Unstable Angina",
  "clare_guidelines": ["CG95", "NG185"],
  "times_played": 45,
  "average_score": 78,
  "created_at": "2025-01-15T10:30:00Z"
}
```

---

### Create Scenario

Create a new clinical scenario.

**Endpoint:** `POST /scenarios`

**Request Body:**
```json
{
  "scenario_id": "scenario_002",
  "title": "Acute Asthma Attack",
  "specialty": "Respiratory",
  "difficulty": "intermediate",
  "patient_profile": {
    "age": 25,
    "gender": "female",
    "presenting_complaint": "Difficulty breathing",
    "voice_profile": {
      "accent": "British",
      "emotional_state": "distressed"
    }
  },
  "dialogue_tree": {
    "root": {
      "id": "node_001",
      "patient_says": "I can't breathe properly...",
      "expected_topics": ["symptom_onset", "triggers", "previous_episodes"]
    }
  },
  "assessment_rubric": {
    "must_ask": ["duration", "triggers", "medications", "previous_attacks"],
    "red_flags": ["unable_to_speak", "silent_chest", "cyanosis"],
    "time_limit": 10
  },
  "correct_diagnosis": "Acute Asthma Exacerbation"
}
```

**Response:** `201 Created` with scenario object

---

### Update Scenario

Update an existing scenario.

**Endpoint:** `PUT /scenarios/{scenario_id}`

**Request Body:** Same as Create Scenario

**Response:** Updated scenario object

---

### Delete Scenario

Delete a scenario (admin only).

**Endpoint:** `DELETE /scenarios/{scenario_id}`

**Response:** `204 No Content`

---

### Publish Scenario

Change scenario status to published.

**Endpoint:** `POST /scenarios/{scenario_id}/publish`

**Response:** Updated scenario with status "published"

---

### List Specialties

Get all available medical specialties.

**Endpoint:** `GET /scenarios/specialties/list`

**Response:**
```json
["Cardiology", "Respiratory", "Gastroenterology", "Neurology", "General"]
```

---

## Sessions

### Create Session

Start a new consultation session.

**Endpoint:** `POST /sessions`

**Request Body:**
```json
{
  "scenario_id": "scenario_001",
  "student_id": 1
}
```

**Response:**
```json
{
  "id": 1,
  "session_id": "session_a1b2c3d4e5f6",
  "scenario_id": 1,
  "student_id": 1,
  "status": "in_progress",
  "started_at": "2025-01-15T14:30:00Z",
  "current_node_id": null,
  "transcript": []
}
```

---

### Get Session

Get session details with full transcript.

**Endpoint:** `GET /sessions/{session_id}`

**Response:**
```json
{
  "id": 1,
  "session_id": "session_a1b2c3d4e5f6",
  "status": "in_progress",
  "started_at": "2025-01-15T14:30:00Z",
  "transcript": [
    {
      "role": "patient",
      "message": "Doctor, I've been having chest pain...",
      "timestamp": "2025-01-15T14:30:05Z"
    },
    {
      "role": "student",
      "message": "Can you describe the pain?",
      "timestamp": "2025-01-15T14:30:30Z"
    }
  ]
}
```

---

### List Student Sessions

Get all sessions for a student.

**Endpoint:** `GET /sessions/student/{student_id}`

**Query Parameters:**
- `skip` (integer, optional): Records to skip
- `limit` (integer, optional): Max records

**Response:** Array of session objects

---

### Add Message to Session

Add a message to the session transcript.

**Endpoint:** `POST /sessions/{session_id}/message`

**Request Body:**
```json
{
  "role": "student",
  "message": "Can you describe the pain?",
  "audio_url": null
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Message added"
}
```

---

### Complete Session

Mark session as completed and submit diagnosis.

**Endpoint:** `POST /sessions/{session_id}/complete?diagnosis=Unstable%20Angina`

**Query Parameters:**
- `diagnosis` (string, optional): Student's final diagnosis

**Response:**
```json
{
  "status": "success",
  "message": "Session completed",
  "duration": 720
}
```

---

## Assessments

### Create Assessment

Generate assessment for a completed session.

**Endpoint:** `POST /assessments`

**Request Body:**
```json
{
  "session_id": "session_a1b2c3d4e5f6",
  "student_id": 1,
  "overall_score": 78,
  "history_taking_score": 85,
  "clinical_reasoning_score": 75,
  "management_score": 70,
  "communication_score": 80,
  "efficiency_score": 80,
  "metrics": {
    "questions_asked": 15,
    "relevant_questions": 12,
    "time_taken": 12
  },
  "skills_breakdown": {
    "history_taking": {
      "score": 85,
      "details": "Covered 9/10 essential topics"
    }
  },
  "feedback_summary": "Good performance overall",
  "strengths": ["Thorough history taking", "Good communication"],
  "areas_for_improvement": ["Consider red flags earlier"]
}
```

**Response:** `201 Created` with assessment object

---

### Get Assessment

Get assessment by ID.

**Endpoint:** `GET /assessments/{assessment_id}`

**Response:** Assessment object

---

### Get Assessment by Session

Get assessment for a specific session.

**Endpoint:** `GET /assessments/session/{session_id}`

**Response:** Assessment object

---

### List Student Assessments

Get all assessments for a student.

**Endpoint:** `GET /assessments/student/{student_id}`

**Response:** Array of assessment objects

---

### Get Student Skill Progress

Get skill progress tracking for a student.

**Endpoint:** `GET /assessments/student/{student_id}/skills`

**Response:**
```json
[
  {
    "skill_name": "history_taking",
    "current_level": 85,
    "previous_level": 78,
    "trend": "improving",
    "sessions_count": 10,
    "average_score": 82
  }
]
```

---

## Voice

### Synthesize Speech

Convert text to speech using Azure Speech Services.

**Endpoint:** `POST /voice/synthesize`

**Request Body:**
```json
{
  "text": "Doctor, I've been having this chest pain for 2 hours now.",
  "voice_name": "en-GB-RyanNeural",
  "emotional_style": "anxious"
}
```

**Response:** Audio file (WAV format)

**Content-Type:** `audio/wav`

---

### Get Voice for Profile

Get appropriate Azure voice based on patient profile.

**Endpoint:** `POST /voice/get-voice-for-profile`

**Request Body:**
```json
{
  "accent": "British",
  "gender": "male",
  "emotional_state": "anxious"
}
```

**Response:**
```json
{
  "voice_name": "en-GB-RyanNeural",
  "accent": "British",
  "gender": "male",
  "emotional_state": "anxious"
}
```

---

### List Available Voices

Get all available voice options.

**Endpoint:** `GET /voice/voices/list`

**Response:**
```json
{
  "british": {
    "male": ["en-GB-RyanNeural", "en-GB-ThomasNeural"],
    "female": ["en-GB-SoniaNeural", "en-GB-LibbyNeural"]
  },
  "scottish": {
    "male": ["en-GB-ThomasNeural"],
    "female": ["en-GB-SoniaNeural"]
  }
}
```

---

## Analytics

### Get Student Dashboard

Get comprehensive dashboard data for a student.

**Endpoint:** `GET /analytics/student/{student_id}/dashboard`

**Response:**
```json
{
  "total_scenarios_completed": 12,
  "total_time_spent": 180,
  "average_score": 78.5,
  "scenarios_by_specialty": {
    "Cardiology": 5,
    "Respiratory": 4,
    "General": 3
  },
  "recent_activity": [
    {
      "session_id": "session_abc123",
      "scenario_title": "Chest Pain in Primary Care",
      "date": "2025-01-15T14:30:00Z",
      "duration": 720,
      "score": 78,
      "status": "completed"
    }
  ]
}
```

---

### Get Skills Radar

Get skill levels for radar chart.

**Endpoint:** `GET /analytics/student/{student_id}/skills-radar`

**Response:**
```json
{
  "history_taking": 85,
  "clinical_reasoning": 75,
  "management": 70,
  "communication": 80,
  "efficiency": 78
}
```

---

### Get Progress Trend

Get progress over time for a specific skill.

**Endpoint:** `GET /analytics/student/{student_id}/progress-trend`

**Query Parameters:**
- `skill` (string, optional): Specific skill name
- `days` (integer, optional): Days to look back (default: 30)

**Response:**
```json
{
  "dates": ["2025-01-01", "2025-01-08", "2025-01-15"],
  "scores": [65, 72, 78],
  "skill": "overall"
}
```

---

### Get Scenario Recommendations

Get personalized scenario recommendations.

**Endpoint:** `GET /analytics/student/{student_id}/recommendations`

**Query Parameters:**
- `limit` (integer, optional): Number of recommendations (default: 5)

**Response:**
```json
[
  {
    "scenario_id": "scenario_003",
    "title": "Acute MI",
    "specialty": "Cardiology",
    "difficulty": "advanced",
    "average_score": 65,
    "reason": "Recommended to improve clinical reasoning"
  }
]
```

---

### Get Leaderboard

Get top performing students.

**Endpoint:** `GET /analytics/leaderboard`

**Query Parameters:**
- `specialty` (string, optional): Filter by specialty
- `limit` (integer, optional): Number of students (default: 10)

**Response:**
```json
[
  {
    "rank": 1,
    "student_name": "John Smith",
    "institution": "Medical School A",
    "average_score": 92.5,
    "scenarios_completed": 25
  }
]
```

---

## WebSocket

### Connect to Scenario Session

Real-time communication for scenario interactions.

**Endpoint:** `ws://localhost:8000/ws/{session_id}`

**Client Message:**
```json
{
  "type": "student_message",
  "message": "Can you describe the pain?"
}
```

**Server Response:**
```json
{
  "type": "patient_response",
  "message": "It's a crushing pain in the center of my chest...",
  "audio_url": "https://storage.blob.core.windows.net/audio/response_123.wav"
}
```

---

## Error Responses

All endpoints may return the following error codes:

### 400 Bad Request
```json
{
  "detail": "Invalid input data"
}
```

### 401 Unauthorized
```json
{
  "detail": "Could not validate credentials"
}
```

### 404 Not Found
```json
{
  "detail": "Scenario scenario_999 not found"
}
```

### 500 Internal Server Error
```json
{
  "detail": "Internal server error"
}
```

---

## Rate Limiting

**Development:** No rate limiting

**Production:**
- 100 requests per minute per user
- 1000 requests per hour per user
- WebSocket: 1 connection per session

---

## Interactive API Documentation

FastAPI provides interactive API documentation:

- **Swagger UI:** http://localhost:8000/api/v1/docs
- **ReDoc:** http://localhost:8000/api/v1/redoc

These interfaces allow you to:
- Browse all endpoints
- Test API calls directly
- View request/response schemas
- Download OpenAPI specification

---

## Example Workflows

### Complete Scenario Workflow

1. **List scenarios** → `GET /scenarios`
2. **Create session** → `POST /sessions`
3. **Connect WebSocket** → `ws://localhost:8000/ws/{session_id}`
4. **Send messages** via WebSocket
5. **Complete session** → `POST /sessions/{session_id}/complete`
6. **Create assessment** → `POST /assessments`
7. **View results** → `GET /assessments/session/{session_id}`

### Student Dashboard Workflow

1. **Get dashboard data** → `GET /analytics/student/{id}/dashboard`
2. **Get skills radar** → `GET /analytics/student/{id}/skills-radar`
3. **Get progress trend** → `GET /analytics/student/{id}/progress-trend`
4. **Get recommendations** → `GET /analytics/student/{id}/recommendations`

---

For more details, see the interactive documentation at `/api/v1/docs` when the server is running.
