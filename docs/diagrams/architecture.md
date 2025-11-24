# Coach AI System Architecture

**Last Updated**: 2025-11-24

## Overview

Coach AI is a clinical training platform for medical students, integrating with the Clare (guidelines) and Clark (transcription) ecosystem.

## UI Design System

Coach AI uses a Clark-inspired design system for visual consistency across the Clare/Clark/Coach ecosystem.

### Branding

- **Logo**: CoachLogo.svg (SVG vector logo used in Header and Landing page)
- **Color Theme**: Olive green (#669900) - replaces previous NHS blue palette
- **Typography**: Schibsted Grotesk (matching Clark design)

### Color Palette

| Token | Value | Usage |
|-------|-------|-------|
| `primary-500` | #669900 | Main olive green, buttons, active states |
| `primary-600` | #527a00 | Hover states, darker accents |
| `primary-50` | #f4f7e9 | Light backgrounds, active nav items |
| `coach-olive` | #669900 | Brand color alias |
| `coach-olive-light` | rgba(102,153,0,0.1) | Subtle backgrounds |

### Layout Components

| Component | Description |
|-----------|-------------|
| **Header** | Coach SVG logo (left), Navigation links (center), User menu (right) |
| **Footer** | Clark-style layout - copyright text (left), policy/terms links (right) |

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
        AS[AzureServices\nTTS + STT + OpenAI]
        CS[ClarkIntegration]
        PE[PromptEngine\nEmotion + Clinical Facts]
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
    SE --> PE
    AE --> FS
    PE --> AS
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
| UI Design | Clark-style CSS, Schibsted Grotesk font, Olive green (#669900) theme |
| Backend | FastAPI, Python 3.11, SQLAlchemy 2.0 |
| Database | PostgreSQL 15 |
| AI | Azure OpenAI (gpt-4o), Azure Speech REST API (TTS/STT via httpx) |
| Infrastructure | Docker (ARM64/AMD64), Azure App Service, GitHub Actions |

## Frontend Component Architecture

```mermaid
flowchart TD
    subgraph Layout["Layout Components"]
        Header["Header\n(CoachLogo.svg + Nav)"]
        Footer["Footer\n(Clark-style layout)"]
    end

    subgraph Pages["Page Components"]
        Landing["Landing Page\n(CoachLogo.svg hero)"]
        Dashboard[Dashboard]
        ScenarioLib[Scenario Library]
        Player[Scenario Player]
        Results[Assessment Results]
    end

    subgraph AdminPages["Admin Pages"]
        ScenarioManager[Scenario Manager]
        ScenarioEditor[Scenario Editor]
        ClarkImport[Clark Import]
    end

    subgraph Styling["Design System"]
        Colors["Olive Green Theme\n#669900"]
        Font["Schibsted Grotesk\nFont Family"]
        CSS["Clark-style CSS\nLayouts & Components"]
    end

    Header --> Pages
    Header --> AdminPages
    Footer --> Pages
    Footer --> AdminPages
    Styling --> Layout
    Styling --> Pages
    Styling --> AdminPages
```

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
- **AI Prompt & Emotion Engine**: The system builds comprehensive patient personas with clinical knowledge extracted from the entire dialogue tree. AI responses include dynamic emotion tags that map to Azure Speech voice styles.

## AI Prompt & Emotion Engine

The AI subsystem provides realistic patient simulation with dynamic emotional responses.

```mermaid
flowchart TD
    subgraph ScenarioData["Scenario Data"]
        PatientProfile[patient_profile]
        DialogueTree[dialogue_tree]
    end

    subgraph PromptEngine["Prompt Engine (azure_services.py)"]
        ExtractFacts["_extract_all_clinical_facts()\nRecursive tree traversal"]
        BuildPrompt["_build_system_prompt()\nPersona + Knowledge + Guidelines"]
    end

    subgraph AIGeneration["AI Response Generation"]
        OpenAI[Azure OpenAI\ngpt-4o]
        JSONFormat["response_format:\njson_object"]
    end

    subgraph Response["Response Processing"]
        ParseJSON[Parse JSON Response]
        ExtractText[Extract text field]
        ExtractEmotion[Extract emotion field]
    end

    subgraph VoiceSynthesis["Voice Synthesis"]
        MapEmotion[Map emotion to voice style]
        BuildSSML[Build SSML with mstts:express-as]
        SpeechAPI[Azure Speech REST API]
    end

    PatientProfile --> BuildPrompt
    DialogueTree --> ExtractFacts
    ExtractFacts --> BuildPrompt
    BuildPrompt --> OpenAI
    JSONFormat --> OpenAI
    OpenAI --> ParseJSON
    ParseJSON --> ExtractText
    ParseJSON --> ExtractEmotion
    ExtractEmotion --> MapEmotion
    ExtractText --> BuildSSML
    MapEmotion --> BuildSSML
    BuildSSML --> SpeechAPI
```

### Supported Emotions

| Emotion | Azure Voice Style | Use Case |
|---------|-------------------|----------|
| `neutral` | `general` | Normal conversation |
| `cheerful` | `cheerful` | Good news, positive updates |
| `sad` | `sad` | Disappointment, bad news |
| `angry` | `angry` | Frustration, upset |
| `fearful` | `worried` | Anxiety about symptoms |
| `terrified` | `worried` | Severe fear, panic |
| `hopeful` | `hopeful` | Optimism about treatment |
| `shouting` | `shouting` | Urgency, distress |
| `whispering` | `whispering` | Confidential information |
| `unfriendly` | `unfriendly` | Uncooperative patient |
