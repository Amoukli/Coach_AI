"""Clark integration API endpoints for importing consultations"""

import uuid
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.scenario import DifficultyLevel, Scenario, ScenarioStatus
from app.services.clark_integration import clark_service

router = APIRouter()


class ConsultationListItem(BaseModel):
    """Summary of a Clark consultation"""

    id: str
    specialty: str
    diagnosis: str
    patient_age: int
    patient_gender: str
    created_at: str


class ConsultationPreview(BaseModel):
    """Preview of scenario to be created from consultation"""

    consultation_id: str
    title: str
    specialty: str
    difficulty: str
    patient_profile: dict
    correct_diagnosis: str
    learning_objectives: list


class ImportResult(BaseModel):
    """Result of importing a consultation"""

    success: bool
    scenario_id: Optional[str] = None
    message: str


@router.get("/consultations")
async def list_consultations(
    specialty: Optional[str] = Query(None),
    limit: int = Query(20, le=50),
    current_user: dict = Depends(get_current_user),
):
    """
    List available consultations from Clark that can be imported.
    Returns mock data if Clark API is unavailable.
    """
    try:
        consultations = await clark_service.fetch_consultations(specialty=specialty, limit=limit)

        if consultations:
            return consultations
    except Exception:
        pass

    # Return mock data when Clark API is unavailable
    mock_consultations = [
        {
            "id": "clark_consult_001",
            "specialty": "General Practice",
            "diagnosis": "Type 2 Diabetes Mellitus",
            "patient_age": 52,
            "patient_gender": "male",
            "created_at": "2025-01-15T10:30:00Z",
            "summary": "Middle-aged male presenting with increased thirst and frequent urination",
        },
        {
            "id": "clark_consult_002",
            "specialty": "Respiratory",
            "diagnosis": "Community Acquired Pneumonia",
            "patient_age": 68,
            "patient_gender": "female",
            "created_at": "2025-01-14T14:20:00Z",
            "summary": "Elderly female with productive cough, fever, and shortness of breath",
        },
        {
            "id": "clark_consult_003",
            "specialty": "Cardiology",
            "diagnosis": "Atrial Fibrillation",
            "patient_age": 71,
            "patient_gender": "male",
            "created_at": "2025-01-13T09:45:00Z",
            "summary": "Elderly male with palpitations and irregular pulse",
        },
        {
            "id": "clark_consult_004",
            "specialty": "Gastroenterology",
            "diagnosis": "Irritable Bowel Syndrome",
            "patient_age": 28,
            "patient_gender": "female",
            "created_at": "2025-01-12T16:10:00Z",
            "summary": "Young female with recurrent abdominal pain and altered bowel habit",
        },
        {
            "id": "clark_consult_005",
            "specialty": "Psychiatry",
            "diagnosis": "Generalized Anxiety Disorder",
            "patient_age": 34,
            "patient_gender": "female",
            "created_at": "2025-01-11T11:00:00Z",
            "summary": "Young female with persistent worry, sleep disturbance, and tension",
        },
    ]

    if specialty:
        mock_consultations = [
            c for c in mock_consultations if c["specialty"].lower() == specialty.lower()
        ]

    return mock_consultations[:limit]


@router.get("/consultations/{consultation_id}/preview", response_model=ConsultationPreview)
async def preview_consultation(
    consultation_id: str,
    current_user: dict = Depends(get_current_user),
):
    """
    Preview how a consultation would be converted to a scenario.
    Returns mock data if Clark API is unavailable.
    """
    try:
        consultation = await clark_service.get_consultation(consultation_id)
        if consultation:
            scenario_data = clark_service.convert_to_scenario(consultation)
            return ConsultationPreview(
                consultation_id=consultation_id,
                title=scenario_data["title"],
                specialty=scenario_data["specialty"],
                difficulty=scenario_data["difficulty"],
                patient_profile=scenario_data["patient_profile"],
                correct_diagnosis=scenario_data["correct_diagnosis"],
                learning_objectives=scenario_data["learning_objectives"],
            )
    except Exception:
        pass

    # Return mock preview based on consultation_id
    mock_previews = {
        "clark_consult_001": {
            "title": "Type 2 Diabetes Mellitus Presentation",
            "specialty": "General Practice",
            "difficulty": "intermediate",
            "patient_profile": {
                "name": "Anonymous Patient",
                "age": 52,
                "gender": "male",
                "presenting_complaint": "I've been feeling really thirsty lately and going to the toilet all the time.",
                "occupation": "Office worker",
                "background": "No significant past medical history. Father had diabetes.",
            },
            "correct_diagnosis": "Type 2 Diabetes Mellitus",
            "learning_objectives": [
                "Elicit symptoms of diabetes",
                "Assess risk factors",
                "Consider differential diagnoses",
                "Plan appropriate investigations",
            ],
        },
        "clark_consult_002": {
            "title": "Community Acquired Pneumonia Case",
            "specialty": "Respiratory",
            "difficulty": "intermediate",
            "patient_profile": {
                "name": "Anonymous Patient",
                "age": 68,
                "gender": "female",
                "presenting_complaint": "I've had this terrible cough for a week now with green phlegm.",
                "occupation": "Retired",
                "background": "COPD on inhalers. Ex-smoker 30 pack years.",
            },
            "correct_diagnosis": "Community Acquired Pneumonia",
            "learning_objectives": [
                "Recognise signs of pneumonia",
                "Assess severity using CURB-65",
                "Consider co-morbidities",
                "Plan antibiotic therapy",
            ],
        },
    }

    preview = mock_previews.get(
        consultation_id,
        {
            "title": f"Clinical Scenario from Consultation {consultation_id}",
            "specialty": "General Practice",
            "difficulty": "intermediate",
            "patient_profile": {
                "name": "Anonymous Patient",
                "age": 45,
                "gender": "unknown",
                "presenting_complaint": "Patient presenting with symptoms",
                "occupation": "Unknown",
                "background": "No details available",
            },
            "correct_diagnosis": "Requires clinical assessment",
            "learning_objectives": [
                "Take comprehensive history",
                "Identify key clinical features",
                "Make appropriate diagnosis",
            ],
        },
    )

    return ConsultationPreview(consultation_id=consultation_id, **preview)


@router.post("/consultations/{consultation_id}/import", response_model=ImportResult)
async def import_consultation(
    consultation_id: str,
    difficulty: Optional[DifficultyLevel] = Query(None),
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """
    Import a Clark consultation as a new scenario (draft status).
    The scenario will need to be reviewed and published separately.
    """
    try:
        # Try to get consultation from Clark
        consultation = await clark_service.get_consultation(consultation_id)

        if consultation:
            scenario_data = clark_service.convert_to_scenario(consultation)
        else:
            # Use mock data for demo
            scenario_data = _get_mock_scenario_data(consultation_id)

        if not scenario_data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Consultation {consultation_id} not found",
            )

        # Generate unique scenario ID
        scenario_id = f"scenario_{uuid.uuid4().hex[:12]}"

        # Override difficulty if provided
        if difficulty:
            scenario_data["difficulty"] = difficulty

        # Create scenario in draft status
        scenario = Scenario(
            scenario_id=scenario_id,
            title=scenario_data.get("title", "Imported Scenario"),
            description=scenario_data.get(
                "description", "Scenario imported from Clark consultation"
            ),
            specialty=scenario_data.get("specialty", "General Practice"),
            difficulty=DifficultyLevel(scenario_data.get("difficulty", "intermediate")),
            status=ScenarioStatus.DRAFT,
            patient_profile=scenario_data.get("patient_profile", {}),
            dialogue_tree=scenario_data.get("dialogue_tree", {}),
            learning_objectives=scenario_data.get("learning_objectives", []),
            correct_diagnosis=scenario_data.get("correct_diagnosis", ""),
            assessment_rubric=scenario_data.get("assessment_rubric", {}),
            clare_guidelines=scenario_data.get("clare_guideline_ids", []),
            created_by=current_user.get("sub"),
        )

        db.add(scenario)
        db.commit()
        db.refresh(scenario)

        return ImportResult(
            success=True,
            scenario_id=scenario.scenario_id,
            message=f"Successfully imported consultation as scenario '{scenario.title}'. Status: Draft",
        )

    except HTTPException:
        raise
    except Exception as e:
        return ImportResult(success=False, message=f"Failed to import consultation: {str(e)}")


def _get_mock_scenario_data(consultation_id: str) -> Optional[dict]:
    """Get mock scenario data for demo purposes"""
    mock_data = {
        "clark_consult_001": {
            "title": "Type 2 Diabetes Mellitus Presentation",
            "description": "A 52-year-old office worker presents with increased thirst and polyuria. "
            "This scenario tests the student's ability to recognise and assess diabetic symptoms.",
            "specialty": "General Practice",
            "difficulty": "intermediate",
            "patient_profile": {
                "name": "Anonymous Patient",
                "age": 52,
                "gender": "male",
                "occupation": "Office worker",
                "presenting_complaint": "I've been feeling really thirsty lately and I'm going to the toilet all the time, especially at night.",
                "background": "No significant past medical history. Father diagnosed with type 2 diabetes at age 60. "
                "BMI 31, sedentary lifestyle. Drinks 2-3 pints of beer at weekends.",
                "accent": "British",
                "emotional_state": "concerned",
            },
            "dialogue_tree": {
                "greeting": {
                    "id": "greeting",
                    "type": "greeting",
                    "content": "Hello doctor. I've booked this appointment because I've been really thirsty lately and going to the toilet all the time.",
                    "next_nodes": ["history"],
                },
            },
            "learning_objectives": [
                "Elicit classic symptoms of diabetes mellitus",
                "Assess cardiovascular risk factors",
                "Consider differential diagnoses including diabetes insipidus",
                "Plan appropriate diagnostic investigations (HbA1c, fasting glucose)",
            ],
            "correct_diagnosis": "Type 2 Diabetes Mellitus",
            "assessment_rubric": {
                "must_ask_questions": [
                    "Duration of symptoms",
                    "Weight changes",
                    "Visual changes",
                    "Family history of diabetes",
                    "Diet and exercise history",
                ],
                "red_flags": ["Weight loss", "DKA symptoms", "Visual disturbance"],
                "key_findings": ["Polyuria", "Polydipsia", "Family history", "Overweight"],
                "management_steps": [
                    "Blood tests (HbA1c, fasting glucose)",
                    "Lifestyle advice",
                    "Follow-up appointment",
                ],
            },
        },
        "clark_consult_002": {
            "title": "Community Acquired Pneumonia Case",
            "description": "A 68-year-old retired woman presents with productive cough and fever. "
            "This scenario tests respiratory assessment and severity scoring.",
            "specialty": "Respiratory",
            "difficulty": "intermediate",
            "patient_profile": {
                "name": "Anonymous Patient",
                "age": 68,
                "gender": "female",
                "occupation": "Retired teacher",
                "presenting_complaint": "I've had this terrible cough for about a week now, bringing up green phlegm, and I've been feeling feverish.",
                "background": "COPD diagnosed 5 years ago, uses Seretide and Ventolin. "
                "Ex-smoker, quit 10 years ago, 30 pack-year history. Lives alone.",
                "accent": "British",
                "emotional_state": "unwell",
            },
            "dialogue_tree": {
                "greeting": {
                    "id": "greeting",
                    "type": "greeting",
                    "content": "Hello doctor, I've been feeling really unwell for the past week. I've got this awful cough.",
                    "next_nodes": ["history"],
                },
            },
            "learning_objectives": [
                "Recognise clinical features of pneumonia",
                "Apply CURB-65 severity assessment",
                "Consider impact of co-morbidities",
                "Plan appropriate antibiotic therapy",
            ],
            "correct_diagnosis": "Community Acquired Pneumonia",
            "assessment_rubric": {
                "must_ask_questions": [
                    "Character and colour of sputum",
                    "Presence of fever/rigors",
                    "Shortness of breath",
                    "Chest pain",
                    "Confusion/orientation",
                ],
                "red_flags": ["Confusion", "Respiratory rate >30", "Hypotension", "SpO2 <92%"],
                "key_findings": ["Productive cough", "Fever", "COPD background"],
                "management_steps": [
                    "CURB-65 assessment",
                    "Chest X-ray",
                    "Appropriate antibiotics",
                    "Admission decision",
                ],
            },
        },
    }

    return mock_data.get(consultation_id)
