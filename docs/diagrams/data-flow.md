# Data Flow Diagrams

**Last Updated**: 2025-11-22

## Overview

This document illustrates how data flows through the Coach AI platform.

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

    subgraph Backend["Backend Processing"]
        Auth[Authentication]
        ScenarioAPI[Scenario API]
        SessionAPI[Session API]
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
```

## Real-Time Consultation Data Flow

```mermaid
sequenceDiagram
    participant Client as Browser
    participant WS as WebSocket
    participant Redis as Message Queue
    participant Engine as ScenarioEngine
    participant AI as Azure OpenAI
    participant DB as PostgreSQL

    Client->>WS: Connect (session_id)
    WS->>DB: Load Session State
    DB-->>WS: Session + Transcript

    loop Each Message
        Client->>WS: Student Message
        WS->>Engine: Process Message
        Engine->>DB: Save to Transcript
        Engine->>AI: Generate Response
        AI-->>Engine: Patient Response
        Engine->>DB: Update Metrics
        Engine-->>WS: Response Data
        WS-->>Client: Patient Response
    end

    Client->>WS: Complete Session
    WS->>Engine: Finalize
    Engine->>DB: Mark Completed
    WS-->>Client: Redirect to Results
```

## Voice Data Flow

```mermaid
flowchart LR
    subgraph Input["Text Input"]
        Response[Patient Response]
        Profile[Voice Profile]
        Emotion[Emotional State]
    end

    subgraph Processing["Azure Speech"]
        SSML[Build SSML]
        Synth[Speech Synthesis]
        Neural[Neural Voice]
    end

    subgraph Output["Audio Output"]
        Audio[Audio Buffer]
        Stream[Stream to Client]
    end

    Response --> SSML
    Profile --> SSML
    Emotion --> SSML
    SSML --> Synth
    Synth --> Neural
    Neural --> Audio
    Audio --> Stream
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
    ClarkConsult -.->|Import| Import
    ClarkTranscript -.->|Convert| Import
    Import --> ScenarioEngine

    style Clare stroke-dasharray: 5 5
    style Clark stroke-dasharray: 5 5
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
