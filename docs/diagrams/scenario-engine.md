# Scenario Engine Flow

**Last Updated**: 2025-11-23

## Overview

The Scenario Engine manages interactive clinical consultations between students and AI-simulated patients.

## Consultation Flow

```mermaid
sequenceDiagram
    participant S as Student
    participant FE as Frontend
    participant WS as WebSocket
    participant DB as PostgreSQL
    participant SE as ScenarioEngine
    participant AI as Azure OpenAI
    participant Voice as Azure Speech REST API

    S->>FE: Start Scenario
    FE->>WS: Connect WebSocket (session_id)
    WS->>DB: Load Session + Scenario
    DB-->>WS: Scenario Data (patient_profile, dialogue_tree)
    WS->>SE: Create ScenarioEngine(scenario_data)

    loop Consultation
        S->>FE: Ask Question (text or voice)
        FE->>WS: Send {type: student_message, message: ...}
        WS->>SE: process_student_input(message)
        SE->>SE: Analyze Question + Track Topics
        SE->>AI: generate_patient_response()
        AI-->>SE: Patient Response Text
        SE-->>WS: Response + Metadata
        WS->>Voice: POST SSML to TTS endpoint
        Voice-->>WS: WAV Audio Bytes
        WS->>WS: Base64 Encode Audio
        WS-->>FE: JSON {message, audio_base64, metadata}
        FE-->>S: Show Response + Play Audio
    end

    S->>FE: Complete Scenario
    FE->>WS: Disconnect
    WS->>WS: Cleanup ScenarioEngine
```

## Dialogue Tree Processing

```mermaid
flowchart TD
    Start([Student Question]) --> Analyze[Analyze Question]
    Analyze --> Relevance{Check Relevance}

    Relevance -->|High| Track[Track Topic Coverage]
    Relevance -->|Medium| Track
    Relevance -->|Low| Redirect[Redirect Response]

    Track --> RedFlag{Red Flag\nDetected?}
    RedFlag -->|Yes| MarkFlag[Mark Red Flag Found]
    RedFlag -->|No| Generate
    MarkFlag --> Generate

    Generate[Generate Patient Response]
    Redirect --> Generate

    Generate --> Context[Build Context]
    Context --> AI[Azure OpenAI]
    AI --> Response[Patient Response]
    Response --> Emotion{Emotional State}

    Emotion -->|Anxious| AnxiousVoice[style: worried]
    Emotion -->|Calm| CalmVoice[style: calm]
    Emotion -->|Distressed| DistressedVoice[style: sad]

    AnxiousVoice --> SSML[Build SSML with mstts:express-as]
    CalmVoice --> SSML
    DistressedVoice --> SSML

    SSML --> Speech[Azure Speech REST API\nPOST via httpx]
    Speech --> Audio[WAV Audio Bytes]
    Audio --> Base64[Base64 Encode]
    Base64 --> Output([Response + Audio via WebSocket])
```

## Question Analysis

```mermaid
flowchart LR
    subgraph Input
        Question[Student Question]
    end

    subgraph Analysis["Question Analysis"]
        Topic[Identify Topic]
        Intent[Detect Intent]
        Quality[Assess Quality]
    end

    subgraph Scoring
        Relevance[Relevance Score\n0-100]
        Coverage[Topic Coverage\nUpdate]
        Metrics[Performance\nMetrics]
    end

    Question --> Topic
    Question --> Intent
    Question --> Quality

    Topic --> Coverage
    Intent --> Relevance
    Quality --> Metrics
```

## Topic Categories

| Category | Examples | Weight |
|----------|----------|--------|
| History of Presenting Complaint | Pain location, duration, severity | High |
| Past Medical History | Previous conditions, surgeries | Medium |
| Medications | Current medications, allergies | High |
| Social History | Smoking, alcohol, occupation | Medium |
| Family History | Hereditary conditions | Low |
| Systems Review | Other symptoms | Medium |
| Red Flags | Concerning symptoms | Critical |

## Session State Management

```mermaid
stateDiagram-v2
    [*] --> Created: Create Session
    Created --> InProgress: Start Consultation
    InProgress --> InProgress: Exchange Messages
    InProgress --> Completed: Submit Diagnosis
    InProgress --> Abandoned: Timeout/Exit
    Completed --> [*]
    Abandoned --> [*]
```

## Scenario Status Management

Scenarios follow a lifecycle that determines their visibility and availability to students.

```mermaid
stateDiagram-v2
    [*] --> Draft: Create/Import
    Draft --> Draft: Edit
    Draft --> Published: POST /scenarios/{id}/publish
    Published --> Archived: POST /scenarios/{id}/archive
    Archived --> [*]

    note right of Draft: Admin-only visibility
    note right of Published: Available to students
    note right of Archived: Preserved but hidden
```

## Scenario Creation Sources

```mermaid
flowchart TD
    subgraph Sources["Scenario Sources"]
        Manual[Manual Creation\nScenario Editor]
        Clark[Clark Import\nConsultation Conversion]
    end

    subgraph Validation["Validation"]
        Check[Validate Structure]
        Review[Admin Review]
    end

    subgraph Database["Storage"]
        Draft[(Draft Scenarios)]
        Published[(Published Scenarios)]
    end

    subgraph Access["Access Control"]
        AdminUI[Admin UI]
        StudentUI[Student Library]
    end

    Manual --> Check
    Clark --> Check
    Check --> Draft
    Draft --> Review
    Review --> Published

    Draft --> AdminUI
    Published --> AdminUI
    Published --> StudentUI
```

## API Endpoints for Scenario Management

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/scenarios` | GET | List scenarios (filter by status) |
| `/api/v1/scenarios` | POST | Create new scenario (Draft status) |
| `/api/v1/scenarios/{id}` | GET | Get scenario details |
| `/api/v1/scenarios/{id}` | PUT | Update scenario |
| `/api/v1/scenarios/{id}` | DELETE | Delete scenario |
| `/api/v1/scenarios/{id}/publish` | POST | Publish scenario to students |
| `/api/v1/scenarios/{id}/archive` | POST | Archive scenario |
| `/api/v1/clark/consultations` | GET | List available Clark consultations |
| `/api/v1/clark/consultations/{id}/preview` | GET | Preview scenario conversion |
| `/api/v1/clark/consultations/{id}/import` | POST | Import as Draft scenario |
