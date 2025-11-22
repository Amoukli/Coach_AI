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
    participant SE as ScenarioEngine
    participant AI as Azure OpenAI
    participant Voice as Speech Service

    S->>FE: Start Scenario
    FE->>WS: Connect WebSocket
    WS->>SE: Initialize Session
    SE->>SE: Load Dialogue Tree

    loop Consultation
        S->>FE: Ask Question
        FE->>WS: Send Message
        WS->>SE: Process Question
        SE->>SE: Analyze Question
        SE->>AI: Generate Response
        AI-->>SE: Patient Response
        SE->>Voice: Synthesize Speech
        Voice-->>SE: Audio Data
        SE-->>WS: Response + Audio
        WS-->>FE: Display Response
        FE-->>S: Show Response + Play Audio
    end

    S->>FE: Complete Scenario
    FE->>SE: End Session
    SE->>SE: Calculate Metrics
    SE-->>FE: Session Summary
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

    Emotion -->|Anxious| AnxiousVoice[Anxious Voice Style]
    Emotion -->|Calm| CalmVoice[Calm Voice Style]
    Emotion -->|Distressed| DistressedVoice[Distressed Voice Style]

    AnxiousVoice --> Speech[Azure Speech Synthesis]
    CalmVoice --> Speech
    DistressedVoice --> Speech

    Speech --> Output([Response + Audio])
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
