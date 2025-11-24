# Data Flow Diagrams

**Last Updated**: 2025-11-24

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
        Note over AI: Build system prompt with<br/>persona + clinical facts
        AI-->>Engine: JSON {text, emotion}
        Engine->>Engine: Extract text + emotion
        Engine-->>WS: Response + Metadata + Emotion
        WS->>Speech: POST SSML with mstts:express-as style
        Note over Speech: Emotion mapped to voice style<br/>(e.g., fearful -> worried)
        Speech-->>WS: Audio WAV bytes
        WS->>WS: base64 encode audio
        WS-->>Client: JSON {message, audio_base64, metadata, emotion}
    end

    Client->>WS: Disconnect
    WS->>WS: Cleanup Engine
```

## Voice Data Flow

### Text-to-Speech (TTS)

```mermaid
flowchart LR
    subgraph Input["Input Data"]
        Response[Patient Response Text]
        Profile[Voice Profile\nAccent + Gender]
        Emotion[Dynamic Emotion\nfrom AI Response]
    end

    subgraph EmotionMapping["Emotion to Style Mapping"]
        Map{Map Emotion}
        Map -->|neutral| General[general]
        Map -->|cheerful| Cheerful[cheerful]
        Map -->|sad| Sad[sad]
        Map -->|angry| Angry[angry]
        Map -->|fearful| Worried[worried]
        Map -->|terrified| Worried2[worried]
        Map -->|hopeful| Hopeful[hopeful]
    end

    subgraph Processing["Azure Speech REST API"]
        SSML[Build SSML with\nmstts:express-as style]
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
    Emotion --> Map
    General --> SSML
    Cheerful --> SSML
    Sad --> SSML
    Angry --> SSML
    Worried --> SSML
    Worried2 --> SSML
    Hopeful --> SSML
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

## AI Prompt & Emotion Data Flow

This section details how clinical knowledge is extracted and how emotions flow through the system.

### Clinical Knowledge Extraction

```mermaid
flowchart TD
    subgraph Scenario["Scenario Data (PostgreSQL)"]
        DT[dialogue_tree JSON]
        PP[patient_profile]
    end

    subgraph Extraction["Clinical Facts Extraction"]
        Traverse["_extract_all_clinical_facts()"]
        Recursive[Recursive Tree Traversal]
        FindPatientSays[Find all patient_says nodes]
        BuildFacts[Build bullet point list]
    end

    subgraph PromptBuild["System Prompt Construction"]
        Persona[Patient Persona Section]
        Knowledge[Clinical Knowledge Base Section]
        Guidelines[Interaction Guidelines Section]
        OutputFormat[JSON Output Format Section]
    end

    subgraph FinalPrompt["Complete System Prompt"]
        SystemPrompt[System Prompt for Azure OpenAI]
    end

    DT --> Traverse
    Traverse --> Recursive
    Recursive --> FindPatientSays
    FindPatientSays --> BuildFacts
    BuildFacts --> Knowledge

    PP --> Persona
    Persona --> SystemPrompt
    Knowledge --> SystemPrompt
    Guidelines --> SystemPrompt
    OutputFormat --> SystemPrompt
```

### Emotion Flow Through System

```mermaid
sequenceDiagram
    participant AI as Azure OpenAI
    participant SE as ScenarioEngine
    participant WS as WebSocket
    participant AS as Azure Speech
    participant FE as Frontend

    AI->>SE: JSON {text: "...", emotion: "fearful"}
    SE->>SE: Parse JSON response
    SE->>SE: Store emotion in conversation_history
    SE->>WS: Return (text, metadata with emotion)
    WS->>AS: Build SSML with style="worried"
    Note over AS: emotion "fearful" maps to style "worried"
    AS-->>WS: Audio with emotional expression
    WS->>FE: {message, audio_base64, emotion: "fearful"}
    FE->>FE: Display response with emotion context
```

### Emotion Storage in Conversation History

```mermaid
flowchart LR
    subgraph ConversationHistory["conversation_history[]"]
        Msg1["{ role: 'student',<br/>content: 'Where is the pain?' }"]
        Msg2["{ role: 'patient',<br/>content: 'In my chest...',<br/>emotion: 'fearful' }"]
        Msg3["{ role: 'student',<br/>content: 'How severe?' }"]
        Msg4["{ role: 'patient',<br/>content: 'It hurts so much!',<br/>emotion: 'terrified' }"]
    end

    subgraph Usage["Emotion Usage"]
        VoiceStyle[Azure Speech voice styling]
        Metadata[Response metadata to frontend]
        Assessment[Available for assessment analysis]
    end

    ConversationHistory --> VoiceStyle
    ConversationHistory --> Metadata
    ConversationHistory --> Assessment
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
