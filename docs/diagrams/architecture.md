# Coach AI System Architecture

**Last Updated**: 2025-11-23

## Overview

Coach AI is a clinical training platform for medical students, integrating with the Clare (guidelines) and Clark (transcription) ecosystem.

## High-Level Architecture

```mermaid
flowchart TB
    subgraph Frontend["Frontend (React + TypeScript)"]
        Dashboard[Dashboard]
        ScenarioLib[Scenario Library]
        Player[Scenario Player]
        Results[Assessment Results]
        subgraph Admin["Admin UI"]
            ScenarioManager[Scenario Manager]
            ScenarioEditor[Scenario Editor]
            ClarkImport[Clark Import]
        end
    end

    subgraph Backend["Backend (FastAPI)"]
        API[REST API]
        WS[WebSocket Server]
        ScenarioEngine[Scenario Engine]
        AssessmentEngine[Assessment Engine]
        ClarkAPI[Clark Integration API]
    end

    subgraph Services["Azure Services (REST API)"]
        AzureOpenAI[Azure OpenAI\ngpt-4o]
        AzureSpeech[Azure Speech REST API\nTTS + STT via httpx]
    end

    subgraph Database["Database"]
        PostgreSQL[(PostgreSQL)]
    end

    subgraph Ecosystem["Clare/Clark Ecosystem"]
        Clare[Clare\nClinical Guidelines]
        Clark[Clark\nConsultation Export]
    end

    Frontend --> API
    Player <--> WS
    WS --> ScenarioEngine
    WS --> AzureSpeech
    API --> ScenarioEngine
    API --> AssessmentEngine
    ScenarioEngine --> AzureOpenAI
    AssessmentEngine --> AzureOpenAI
    API --> AzureSpeech
    Backend --> PostgreSQL
    Backend -.-> Clare
    ClarkAPI --> Clark
    ClarkImport --> ClarkAPI
```

## Component Architecture

```mermaid
flowchart LR
    subgraph API["API Layer"]
        Scenarios["/api/v1/scenarios"]
        Sessions["/api/v1/sessions"]
        Assessments["/api/v1/assessments"]
        Voice["/api/v1/voice"]
        Analytics["/api/v1/analytics"]
        Clark["/api/v1/clark"]
    end

    subgraph Services["Service Layer"]
        SE[ScenarioEngine]
        AE[AssessmentEngine]
        FS[FoundryService]
        AS[AzureServices]
        CS[ClarkIntegration]
    end

    subgraph Models["Data Models"]
        Student[Student]
        Scenario[Scenario]
        Session[Session]
        Assessment[Assessment]
        SkillProgress[SkillProgress]
    end

    Scenarios --> SE
    Sessions --> SE
    Assessments --> AE
    Voice --> FS
    Voice --> AS
    Analytics --> Models
    Clark --> CS
    CS --> Scenario

    SE --> FS
    AE --> FS
```

## Database Schema

```mermaid
erDiagram
    STUDENTS ||--o{ SESSIONS : creates
    STUDENTS ||--o{ SKILL_PROGRESS : tracks
    SCENARIOS ||--o{ SESSIONS : has
    SESSIONS ||--|| ASSESSMENTS : generates

    STUDENTS {
        uuid id PK
        string email
        string name
        json skill_levels
        int scenarios_completed
    }

    SCENARIOS {
        uuid id PK
        string title
        string specialty
        string difficulty
        string status
        json dialogue_tree
        json assessment_rubric
    }

    SESSIONS {
        uuid id PK
        uuid student_id FK
        uuid scenario_id FK
        string status
        json transcript
        json performance_metrics
    }

    ASSESSMENTS {
        uuid id PK
        uuid session_id FK
        int history_taking_score
        int clinical_reasoning_score
        int management_score
        int communication_score
        int efficiency_score
        int overall_score
    }

    SKILL_PROGRESS {
        uuid id PK
        uuid student_id FK
        string skill_name
        float current_level
        string trend
    }
```

## Deployment Architecture

```mermaid
flowchart TB
    subgraph Azure["Azure Cloud"]
        subgraph AppService["Azure App Service"]
            Backend[FastAPI Backend]
        end

        subgraph StaticWeb["Azure Static Web Apps"]
            Frontend[React Frontend]
        end

        subgraph Data["Data Services"]
            DB[(Azure PostgreSQL)]
        end

        subgraph AI["AI Services"]
            OpenAI[Azure OpenAI]
            Speech[Azure Speech]
        end
    end

    subgraph CICD["CI/CD"]
        GitHub[GitHub Actions]
    end

    Users((Users)) --> Frontend
    Frontend --> Backend
    Backend --> DB
    Backend --> OpenAI
    Backend --> Speech
    GitHub --> AppService
    GitHub --> StaticWeb
```

## Technology Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS |
| Backend | FastAPI, Python 3.11, SQLAlchemy 2.0 |
| Database | PostgreSQL 15 |
| AI | Azure OpenAI (gpt-4o), Azure Speech REST API (TTS/STT via httpx) |
| Infrastructure | Docker (ARM64/AMD64), Azure App Service, GitHub Actions |

## Scenario Status Workflow

```mermaid
stateDiagram-v2
    [*] --> Draft: Create Scenario
    [*] --> Draft: Import from Clark
    Draft --> Draft: Edit
    Draft --> Published: Publish
    Published --> Archived: Archive
    Archived --> [*]

    note right of Draft: Scenarios in Draft are\nnot visible to students
    note right of Published: Only Published scenarios\nappear in Scenario Library
    note right of Archived: Archived scenarios are\npreserved but hidden
```

## Admin Workflow

```mermaid
flowchart TD
    subgraph AdminUI["Admin UI"]
        Manager[Scenario Manager]
        Editor[Scenario Editor]
        Import[Clark Import]
    end

    subgraph Actions["Admin Actions"]
        Create[Create New Scenario]
        Edit[Edit Scenario]
        Publish[Publish to Students]
        Archive[Archive Scenario]
        Delete[Delete Scenario]
        ImportClark[Import from Clark]
    end

    subgraph ClarkFlow["Clark Import Flow"]
        List[List Consultations]
        Preview[Preview Conversion]
        Convert[Convert to Draft]
    end

    Manager --> Create
    Manager --> Edit
    Manager --> Publish
    Manager --> Archive
    Manager --> Delete
    Manager --> Import

    Import --> List
    List --> Preview
    Preview --> Convert
    Convert --> Manager

    Create --> Editor
    Edit --> Editor
```

## Key Architecture Notes

- **Azure Speech Services**: Uses REST API directly via httpx instead of the azure-cognitiveservices-speech SDK. This provides cross-platform compatibility (ARM64/AMD64) and works reliably in Docker containers.
- **WebSocket Integration**: The WebSocket endpoint loads scenarios from the database, creates a ScenarioEngine instance, and generates patient responses via Azure OpenAI. TTS audio is sent as base64-encoded data over the WebSocket connection.
- **Scenario Status Workflow**: Scenarios follow a Draft -> Published -> Archived lifecycle. Only Published scenarios are visible to students in the Scenario Library.
- **Clark Integration**: The Clark API (`/api/v1/clark`) enables importing anonymized consultations as Draft scenarios for review before publishing.
