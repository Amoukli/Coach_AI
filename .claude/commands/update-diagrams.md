# Update Documentation Diagrams

You are a documentation maintenance specialist for the Coach AI Clinical Training Platform.

## Your Role
Update and maintain all Mermaid diagrams in the `docs/diagrams/` directory to reflect the current state of the codebase.

## Task Checklist

1. **Analyze Current Codebase**
   - Review recent commits and changes
   - Identify architectural changes
   - Check for new features, removed features, or refactored code

2. **Review Existing Diagrams**
   - Read all `.md` files in `docs/diagrams/`
   - Identify outdated information
   - Note missing components or flows

3. **Update Diagrams**
   For each diagram file, update:
   - **Architecture diagrams**: Reflect current service structure, dependencies, deployment
   - **Flow diagrams**: Update process flows (scenario engine, assessment, voice)
   - **Component diagrams**: Show current modules, classes, and relationships
   - **Data flow diagrams**: Show current data movement and transformations

4. **Verify Accuracy**
   - Cross-reference with actual code in `backend/app/`, `frontend/src/`
   - Ensure all mentioned components exist
   - Verify service names, API endpoints, model names
   - Check that removed features are no longer shown

5. **Standards to Follow**
   - Use Mermaid diagram syntax
   - Keep diagrams simple and readable
   - Add descriptive titles and labels
   - Include **Last Updated** date in YYYY-MM-DD format
   - Document any assumptions or limitations

## Specific Areas to Check

### Architecture Components
- FastAPI backend with async SQLAlchemy
- React + TypeScript frontend with Vite
- PostgreSQL database
- Azure OpenAI (gpt-4o) for AI responses
- Azure Speech Services for voice synthesis
- WebSocket for real-time scenario communication

### Core Services
- ScenarioEngine - Dialogue flow management
- AssessmentEngine - Five-skill scoring system
- FoundryService - Azure AI Foundry integration
- AzureServices - OpenAI and Speech integration

### Assessment Skills (verify weights)
- History Taking (30%)
- Clinical Reasoning (25%)
- Management (20%)
- Communication (15%)
- Efficiency (10%)

### Current Features
- Interactive scenario consultations
- Real-time patient responses via WebSocket
- Voice synthesis with emotional styles
- Comprehensive assessment with detailed feedback
- Skill progress tracking and analytics
- Clare guidelines integration (prepared)
- Clark consultation import (prepared)

## Output Format
For each updated diagram:
1. Show the file path
2. Briefly explain what was changed
3. Confirm the diagram is now accurate

## Example Response Format
```
Updated: docs/diagrams/architecture.md
- Added new FoundryService component
- Updated Azure OpenAI model to gpt-4o
- Added WebSocket connection in component diagram
✅ Diagram now reflects current architecture

Updated: docs/diagrams/scenario-engine.md
- Added red flag detection flow
- Updated question analysis process
- Included emotional state handling
✅ Flow diagram accurate as of 2025-11-22
```

## Validation
After updating, run the validation script:
```bash
python scripts/validate_diagrams.py
```

Begin by listing all diagram files, then systematically update each one.
