# Scenario Engine Flow

**Last Updated**: 2025-11-22

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
