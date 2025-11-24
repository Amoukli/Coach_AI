# Coach AI Architecture Diagrams

This directory contains Mermaid diagrams documenting the Coach AI Clinical Training Platform architecture.

## Diagram Index

| Diagram | Description |
|---------|-------------|
| [architecture.md](architecture.md) | High-level system architecture, UI design system, component architecture, database schema, scenario status workflow, admin workflow, and AI Prompt & Emotion Engine |
| [data-flow.md](data-flow.md) | Data flow through the application including student journey, admin actions, Clark import flow, scenario lifecycle, and AI prompt/emotion data flows |
| [scenario-engine.md](scenario-engine.md) | Scenario and dialogue tree processing, AI Prompt & Emotion Engine, clinical knowledge extraction, emotion system, session state management, and API endpoints |
| [assessment-flow.md](assessment-flow.md) | Assessment scoring and feedback flow with notes on emotion data availability |

## Recent Updates (2025-11-24)

- **AI Prompt & Emotion Engine**: Major new documentation for the dynamic patient simulation system
  - Clinical Knowledge Base extraction from dialogue trees (`_extract_all_clinical_facts()`)
  - Persona-based system prompts with patient profile details
  - Dynamic emotion tagging in AI responses (JSON format: `{text, emotion}`)
  - Emotion-to-voice-style mapping for Azure Speech Services
  - Supported emotions: neutral, cheerful, sad, angry, fearful, terrified, hopeful, shouting, whispering, unfriendly
- **Updated Diagrams**:
  - `scenario-engine.md`: New AI Prompt & Emotion Engine section with clinical facts extraction flow
  - `architecture.md`: Added Prompt Engine component and emotion flow diagram
  - `data-flow.md`: New AI Prompt & Emotion Data Flow section with emotion storage diagrams
  - `assessment-flow.md`: Added note about emotion data availability for future assessment enhancements

### Previous Updates (2025-11-23)

- **UI Design System**: Added Clark-style design documentation
  - CoachLogo.svg branding in Header and Landing page
  - Olive green (#669900) color theme (replaces NHS blue)
  - Schibsted Grotesk typography (matching Clark)
  - Clark-style footer layout (text left, links right)
- **Frontend Component Architecture**: New diagram showing layout components and design system
- **Admin UI Components**: Added diagrams for Scenario Manager, Scenario Editor, and Clark Import components
- **Scenario Status Workflow**: New state diagram showing Draft -> Published -> Archived lifecycle
- **Clark Integration**: Added data flow diagrams for importing consultations from Clark API
- **API Endpoints**: Updated Component Architecture to include `/api/v1/clark` endpoint

## Standards

All diagrams in this directory must:

1. **Use Mermaid syntax** - GitHub renders Mermaid natively
2. **Include metadata** - Last Updated date at the top
3. **Be validated** - Run `python scripts/validate_diagrams.py` before committing
4. **Stay current** - Update when architecture changes

## Validation

Diagrams are automatically validated on commit via pre-commit hooks. To manually validate:

```bash
python scripts/validate_diagrams.py
```

## Contributing

When adding or updating diagrams:

1. Follow existing naming conventions
2. Include clear labels and descriptions
3. Update the Last Updated date
4. Run validation before committing
5. Reference actual file paths where relevant
