# Data Flow Diagrams

**Last Updated**: 2025-11-23

## Overview

This document illustrates how data flows through the Coach AI platform.

## UI Design Context

The Coach AI frontend uses a Clark-inspired design system:
- **Branding**: CoachLogo.svg in Header and Landing page
- **Color Theme**: Olive green (#669900) primary color
- **Typography**: Schibsted Grotesk font family
- **Layout**: Clark-style footer (text left, links right)

## End-to-End User Journey

```mermaid
flowchart TD
    subgraph Student["Student Actions"]
        Login[Login/Register]
        Browse[Browse Scenarios]
        Start[Start Scenario]
        Consult[Consultation]
        Submit[Submit Diagnosis]
        Review[Review Results]
    end

    subgraph Admin["Admin Actions"]
        AdminLogin[Admin Login]
        Manage[Manage Scenarios]
        ImportClark[Import from Clark]
        EditScenario[Edit Scenario]
        PublishScenario[Publish Scenario]
        ArchiveScenario[Archive Scenario]
    end

    subgraph Backend["Backend Processing"]
        Auth[Authentication]
        ScenarioAPI[Scenario API]
        SessionAPI[Session API]
        ClarkAPI[Clark API]
        Engine[Scenario Engine]
        Assessment[Assessment Engine]
        Analytics[Analytics API]
    end

    subgraph Data["Data Storage"]
        Students[(Students)]
        Scenarios[(Scenarios)]
        Sessions[(Sessions)]
        Assessments[(Assessments)]
        Progress[(Skill Progress)]
    end

    Login --> Auth --> Students
    Browse --> ScenarioAPI --> Scenarios
    Start --> SessionAPI --> Sessions
    Consult --> Engine --> Sessions
    Submit --> Assessment --> Assessments
    Assessment --> Progress
    Review --> Analytics

    AdminLogin --> Auth
    Manage --> ScenarioAPI
    ImportClark --> ClarkAPI --> Scenarios
    EditScenario --> ScenarioAPI --> Scenarios
    PublishScenario --> ScenarioAPI
    ArchiveScenario --> ScenarioAPI
```

## Real-Time Consultation Data Flow

```mermaid
sequenceDiagram
    participant Client as Browser
    participant WS as WebSocket
    participant DB as PostgreSQL
    participant Engine as ScenarioEngine
    participant AI as Azure OpenAI
    participant Speech as Azure Speech REST API

    Client->>WS: Connect (session_id)
    WS->>DB: Load Session + Scenario
    DB-->>WS: Session + Scenario Data
    WS->>Engine: Create ScenarioEngine

    loop Each Message
        Client->>WS: Student Message (type: student_message)
        WS->>Engine: process_student_input()
        Engine->>AI: Generate Patient Response
        AI-->>Engine: Patient Response Text
        Engine-->>WS: Response + Metadata
        WS->>Speech: POST /cognitiveservices/v1 (SSML)
        Speech-->>WS: Audio WAV bytes
        WS->>WS: base64 encode audio
        WS-->>Client: JSON {message, audio_base64, metadata}
    end

    Client->>WS: Disconnect
    WS->>WS: Cleanup Engine
```

## Voice Data Flow

### Text-to-Speech (TTS)

```mermaid
flowchart LR
    subgraph Input["Text Input"]
        Response[Patient Response]
        Profile[Voice Profile]
        Emotion[Emotional State]
    end

    subgraph Processing["Azure Speech REST API"]
        SSML[Build SSML with mstts:express-as]
        HTTP[POST via httpx\nto tts.speech.microsoft.com]
        Neural[Neural Voice Processing]
    end

    subgraph Output["Audio Output"]
        Audio[WAV Audio Bytes\n16kHz 16-bit mono]
        Base64[Base64 Encode]
        WS[Send via WebSocket]
    end

    Response --> SSML
    Profile --> SSML
    Emotion --> SSML
    SSML --> HTTP
    HTTP --> Neural
    Neural --> Audio
    Audio --> Base64
    Base64 --> WS
```

### Speech-to-Text (STT)

```mermaid
flowchart LR
    subgraph Input["Audio Input"]
        Mic[Browser Microphone]
        WebM[WebM/Opus Audio]
    end

    subgraph Conversion["Audio Conversion"]
        Upload[Upload to API]
        FFmpeg[pydub + ffmpeg]
        WAV[WAV 16kHz 16-bit mono]
    end

    subgraph Processing["Azure Speech REST API"]
        HTTP[POST via httpx\nto stt.speech.microsoft.com]
        Recognition[Speech Recognition]
    end

    subgraph Output["Text Output"]
        Text[Transcribed Text]
        Input[Populate Input Field]
    end

    Mic --> WebM
    WebM --> Upload
    Upload --> FFmpeg
    FFmpeg --> WAV
    WAV --> HTTP
    HTTP --> Recognition
    Recognition --> Text
    Text --> Input
```

## Assessment Data Flow

```mermaid
flowchart TD
    subgraph SessionData["Session Completion"]
        Transcript[Full Transcript]
        Metrics[Performance Metrics]
        Diagnosis[Student Diagnosis]
        Rubric[Scenario Rubric]
    end

    subgraph Processing["Assessment Processing"]
        Extract[Extract Data]
        Calculate[Calculate Scores]
        AIAnalysis[AI Analysis]
        Generate[Generate Feedback]
    end

    subgraph Storage["Data Storage"]
        AssessmentDB[(Assessment)]
        ProgressDB[(Skill Progress)]
        AnalyticsDB[(Analytics Cache)]
    end

    Transcript --> Extract
    Metrics --> Extract
    Diagnosis --> Extract
    Rubric --> Extract

    Extract --> Calculate
    Extract --> AIAnalysis
    Calculate --> Generate
    AIAnalysis --> Generate

    Generate --> AssessmentDB
    Generate --> ProgressDB
    Generate --> AnalyticsDB
```

## Analytics Data Aggregation

```mermaid
flowchart LR
    subgraph Sources["Data Sources"]
        Sessions[(Sessions)]
        Assessments[(Assessments)]
        Progress[(Skill Progress)]
    end

    subgraph Aggregation["Aggregation"]
        StudentStats[Student Statistics]
        SkillTrends[Skill Trends]
        Recommendations[Recommendations]
        Leaderboard[Leaderboard]
    end

    subgraph Output["Dashboard Data"]
        Overview[Overview Cards]
        Charts[Progress Charts]
        Radar[Skills Radar]
        Feed[Activity Feed]
    end

    Sessions --> StudentStats
    Assessments --> StudentStats
    Assessments --> SkillTrends
    Progress --> SkillTrends
    SkillTrends --> Recommendations

    StudentStats --> Overview
    SkillTrends --> Charts
    SkillTrends --> Radar
    Sessions --> Feed
    StudentStats --> Leaderboard
```

## External Integration Data Flow

```mermaid
flowchart TD
    subgraph Coach["Coach AI"]
        ScenarioEngine[Scenario Engine]
        Guidelines[Guidelines Cache]
        Import[Consultation Import]
        ClarkAPI["/api/v1/clark"]
    end

    subgraph Clare["Clare API"]
        ClareGuidelines[Clinical Guidelines]
        ClareSearch[Guideline Search]
    end

    subgraph Clark["Clark API"]
        ClarkConsult[Consultation Export]
        ClarkTranscript[Transcript Data]
    end

    ClareGuidelines -.->|Fetch| Guidelines
    ClareSearch -.->|Query| ScenarioEngine
    ClarkAPI -->|List Consultations| ClarkConsult
    ClarkAPI -->|Get Transcript| ClarkTranscript
    ClarkConsult -->|Convert| Import
    ClarkTranscript -->|Convert| Import
    Import -->|Draft Scenario| ScenarioEngine

    style Clare stroke-dasharray: 5 5
    style Clark stroke-dasharray: 5 5
```

## Clark Import Data Flow

```mermaid
sequenceDiagram
    participant Admin as Admin UI
    participant API as Clark API
    participant Clark as Clark Service
    participant DB as PostgreSQL

    Admin->>API: GET /clark/consultations
    API->>Clark: Fetch available consultations
    Clark-->>API: Consultation list
    API-->>Admin: Display consultations

    Admin->>API: GET /clark/consultations/{id}/preview
    API->>Clark: Get consultation details
    Clark-->>API: Consultation data
    API->>API: Convert to scenario preview
    API-->>Admin: Preview scenario structure

    Admin->>API: POST /clark/consultations/{id}/import
    API->>Clark: Get full consultation
    Clark-->>API: Complete consultation data
    API->>API: Convert to scenario (Draft status)
    API->>DB: Create Scenario (status=draft)
    DB-->>API: Scenario created
    API-->>Admin: Import result with scenario_id
```

## Scenario Lifecycle Data Flow

```mermaid
flowchart TD
    subgraph Creation["Scenario Creation"]
        Manual[Manual Creation]
        ClarkImport[Clark Import]
    end

    subgraph Status["Status Management"]
        Draft[Draft Status]
        Published[Published Status]
        Archived[Archived Status]
    end

    subgraph Visibility["Visibility"]
        AdminOnly[Admin Only]
        Students[Student Access]
        Hidden[Hidden from All]
    end

    subgraph Data["Data Storage"]
        DB[(PostgreSQL)]
    end

    Manual --> Draft
    ClarkImport --> Draft
    Draft --> Published
    Published --> Archived

    Draft --> AdminOnly
    Published --> Students
    Archived --> Hidden

    Draft --> DB
    Published --> DB
    Archived --> DB
```

## Data Model Relationships

```mermaid
erDiagram
    STUDENT ||--o{ SESSION : creates
    STUDENT ||--o{ SKILL_PROGRESS : has
    SCENARIO ||--o{ SESSION : used_in
    SESSION ||--o| ASSESSMENT : generates
    SESSION ||--o{ MESSAGE : contains

    STUDENT {
        uuid id PK
        string email UK
        json skill_levels
    }

    SCENARIO {
        uuid id PK
        string status
        json dialogue_tree
        json rubric
    }

    SESSION {
        uuid id PK
        uuid student_id FK
        uuid scenario_id FK
        json transcript
    }

    ASSESSMENT {
        uuid id PK
        uuid session_id FK
        json scores
    }

    SKILL_PROGRESS {
        uuid id PK
        uuid student_id FK
        string skill
        float level
    }
```
