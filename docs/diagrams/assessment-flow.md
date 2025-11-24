# Assessment Engine Flow

**Last Updated**: 2025-11-24

## Overview

The Assessment Engine evaluates student performance across five clinical competencies and generates detailed feedback.

## Assessment Generation Flow

```mermaid
sequenceDiagram
    participant SE as Session
    participant AE as AssessmentEngine
    participant AI as Azure OpenAI
    participant DB as Database

    SE->>AE: Session Completed
    AE->>AE: Extract Performance Data
    AE->>AE: Calculate Base Scores

    par AI Enhancement
        AE->>AI: Analyze History Taking
        AE->>AI: Analyze Clinical Reasoning
        AE->>AI: Analyze Communication
    end

    AI-->>AE: AI Feedback

    AE->>AE: Calculate Final Scores
    AE->>AE: Generate Recommendations
    AE->>DB: Store Assessment
    AE->>DB: Update Skill Progress
    AE-->>SE: Assessment Results
```

## Scoring Algorithm

```mermaid
flowchart TD
    subgraph Input["Session Data"]
        Transcript[Conversation Transcript]
        Metrics[Performance Metrics]
        Diagnosis[Submitted Diagnosis]
    end

    subgraph Calculation["Score Calculation"]
        HT[History Taking\n30% weight]
        CR[Clinical Reasoning\n25% weight]
        MG[Management\n20% weight]
        CM[Communication\n15% weight]
        EF[Efficiency\n10% weight]
    end

    subgraph Output["Final Assessment"]
        Overall[Overall Score]
        Feedback[Detailed Feedback]
        Strengths[Strengths]
        Improvements[Areas to Improve]
    end

    Transcript --> HT
    Transcript --> CM
    Metrics --> HT
    Metrics --> EF
    Diagnosis --> CR
    Diagnosis --> MG

    HT --> Overall
    CR --> Overall
    MG --> Overall
    CM --> Overall
    EF --> Overall

    Overall --> Feedback
    Feedback --> Strengths
    Feedback --> Improvements
```

## Skill Scoring Criteria

### History Taking (30%)

```mermaid
flowchart LR
    subgraph Metrics
        Topics[Topics Covered]
        RedFlags[Red Flags Found]
        Questions[Question Quality]
    end

    subgraph Scoring
        Coverage[Coverage %]
        Flags[Flag Detection %]
        Quality[Quality Score]
    end

    subgraph Weight
        W1[40%]
        W2[35%]
        W3[25%]
    end

    Topics --> Coverage --> W1
    RedFlags --> Flags --> W2
    Questions --> Quality --> W3

    W1 --> Final[History Taking Score]
    W2 --> Final
    W3 --> Final
```

### Clinical Reasoning (25%)

| Factor | Weight | Measurement |
|--------|--------|-------------|
| Diagnosis Accuracy | 50% | Correct vs. incorrect |
| Differential Thinking | 30% | Questions suggesting alternatives |
| Pattern Recognition | 20% | Identifying key symptoms |

### Management (20%)

| Factor | Weight | Measurement |
|--------|--------|-------------|
| Treatment Plan | 40% | Appropriate interventions |
| Referral Decision | 30% | Correct escalation |
| Safety Netting | 30% | Red flag awareness |

### Communication (15%)

| Factor | Weight | Measurement |
|--------|--------|-------------|
| Empathy | 40% | Patient-centered language |
| Clarity | 35% | Clear questions |
| Professional Tone | 25% | Appropriate language |

**Note**: The conversation history now includes emotion data from patient responses (e.g., `fearful`, `terrified`, `sad`). This emotion data can be used for future enhancements to assess how students respond to emotionally distressed patients.

### Efficiency (10%)

| Factor | Weight | Measurement |
|--------|--------|-------------|
| Time Management | 50% | Session duration |
| Question Efficiency | 50% | Relevant questions ratio |

## Skill Progress Tracking

```mermaid
flowchart TD
    Assessment[New Assessment] --> Extract[Extract Skill Scores]
    Extract --> Check{Existing\nProgress?}

    Check -->|Yes| Update[Update Progress]
    Check -->|No| Create[Create Progress Record]

    Update --> Trend[Calculate Trend]
    Create --> Trend

    Trend --> Improving{Score\nIncreased?}
    Improving -->|Yes| MarkUp[Trend: Improving]
    Improving -->|No| Declined{Score\nDecreased?}
    Declined -->|Yes| MarkDown[Trend: Declining]
    Declined -->|No| MarkStable[Trend: Stable]

    MarkUp --> Save[Save Progress]
    MarkDown --> Save
    MarkStable --> Save
```

## Feedback Generation

```mermaid
flowchart LR
    subgraph Scores
        S1[History: 85]
        S2[Reasoning: 70]
        S3[Management: 75]
        S4[Communication: 90]
        S5[Efficiency: 65]
    end

    subgraph Analysis
        High[High Scores\n≥80]
        Medium[Medium Scores\n60-79]
        Low[Low Scores\n<60]
    end

    subgraph Feedback
        Strengths[Strengths List]
        Improve[Improvements List]
        Recommend[Recommendations]
    end

    S1 --> High
    S4 --> High
    S2 --> Medium
    S3 --> Medium
    S5 --> Medium

    High --> Strengths
    Medium --> Improve
    Low --> Improve

    Strengths --> Recommend
    Improve --> Recommend
```
