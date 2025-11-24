# Scenario Engine Flow

**Last Updated**: 2025-11-24

## Overview

The Scenario Engine manages interactive clinical consultations between students and AI-simulated patients. It features a dynamic AI Prompt & Emotion Engine that generates contextually-aware patient responses with real-time emotional expression.

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
        SE->>AI: generate_patient_response(context, history)
        Note over AI: Build system prompt with<br/>patient persona + clinical facts
        AI-->>SE: JSON {text, emotion}
        SE->>SE: Extract text + emotion from response
        SE-->>WS: Response + Metadata (includes emotion)
        WS->>Voice: POST SSML with mstts:express-as style
        Note over Voice: Emotion maps to voice style<br/>(e.g., fearful -> worried)
        Voice-->>WS: WAV Audio Bytes
        WS->>WS: Base64 Encode Audio
        WS-->>FE: JSON {message, audio_base64, metadata, emotion}
        FE-->>S: Show Response + Play Audio with emotion
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

    Generate --> Context[Build Context with Clinical Facts]
    Context --> AI[Azure OpenAI\nJSON response_format]
    AI --> JSON[JSON Response\n{text, emotion}]

    JSON --> Text[Extract Text]
    JSON --> Emotion[Extract Emotion]

    Emotion -->|neutral| NeutralVoice[style: general]
    Emotion -->|cheerful| CheerfulVoice[style: cheerful]
    Emotion -->|sad| SadVoice[style: sad]
    Emotion -->|angry| AngryVoice[style: angry]
    Emotion -->|fearful| FearfulVoice[style: worried]
    Emotion -->|terrified| TerrifiedVoice[style: worried]
    Emotion -->|hopeful| HopefulVoice[style: hopeful]

    NeutralVoice --> SSML[Build SSML with mstts:express-as]
    CheerfulVoice --> SSML
    SadVoice --> SSML
    AngryVoice --> SSML
    FearfulVoice --> SSML
    TerrifiedVoice --> SSML
    HopefulVoice --> SSML

    SSML --> Speech[Azure Speech REST API\nPOST via httpx]
    Speech --> Audio[WAV Audio Bytes]
    Audio --> Base64[Base64 Encode]

    Text --> Output
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

## AI Prompt & Emotion Engine

The AI Prompt Engine builds comprehensive system prompts that enable realistic patient simulation with dynamic emotional responses.

### Clinical Knowledge Base Extraction

```mermaid
flowchart TD
    subgraph Input["Scenario Data"]
        DialogueTree[dialogue_tree JSON]
        PatientProfile[patient_profile]
    end

    subgraph Extraction["_extract_all_clinical_facts()"]
        Traverse[Recursive Tree Traversal]
        FindNodes[Find nodes with patient_says]
        ExtractFacts[Extract response text]
        BuildList[Build fact bullet points]
    end

    subgraph Output["Clinical Facts"]
        FactList["- **Topic**: Response text<br/>- **Topic**: Response text<br/>..."]
    end

    DialogueTree --> Traverse
    Traverse --> FindNodes
    FindNodes --> ExtractFacts
    ExtractFacts --> BuildList
    BuildList --> FactList
    PatientProfile --> SystemPrompt
    FactList --> SystemPrompt[System Prompt]
```

### System Prompt Structure

```mermaid
flowchart LR
    subgraph Persona["Patient Persona"]
        Name[Name]
        Age[Age]
        Gender[Gender]
        Occupation[Occupation]
        Complaint[Presenting Complaint]
        BaseEmotion[Base Emotional State]
    end

    subgraph Knowledge["Clinical Knowledge Base"]
        Facts[Extracted Clinical Facts]
        Symptoms[Symptoms & History]
        Responses[Predefined Responses]
    end

    subgraph Guidelines["Interaction Guidelines"]
        InCharacter[Stay in character]
        Layperson[Use layperson language]
        NoVolunteer[Do not volunteer history]
        DenyUnknown[Deny unknown symptoms]
    end

    subgraph Format["Output Format"]
        JSON[JSON Response Required]
        TextField[text: spoken response]
        EmotionField[emotion: emotional tone]
    end

    Persona --> Prompt[System Prompt]
    Knowledge --> Prompt
    Guidelines --> Prompt
    Format --> Prompt
```

### Emotion System

The AI dynamically selects an emotion for each response based on the conversation context.

| Emotion | Description | Azure Voice Style |
|---------|-------------|-------------------|
| `neutral` | Normal, calm state | `general` |
| `cheerful` | Happy, positive | `cheerful` |
| `sad` | Unhappy, down | `sad` |
| `angry` | Frustrated, upset | `angry` |
| `fearful` | Worried, anxious | `worried` |
| `terrified` | Extreme fear | `worried` |
| `hopeful` | Optimistic | `hopeful` |
| `shouting` | Loud, urgent | `shouting` |
| `whispering` | Quiet, secretive | `whispering` |
| `unfriendly` | Cold, distant | `unfriendly` |

### JSON Response Format

The AI is configured to output JSON using `response_format={"type": "json_object"}`:

```json
{
  "text": "It hurts so much when I breathe!",
  "emotion": "terrified"
}
```

The `emotion` field is:
1. Extracted by `ScenarioEngine.process_student_input()`
2. Stored in conversation history
3. Passed to Azure Speech Services for voice styling
4. Returned to frontend in response metadata

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
