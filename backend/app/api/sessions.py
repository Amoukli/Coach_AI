"""Session management API endpoints"""

import uuid
from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.assessment import Assessment
from app.models.scenario import Scenario
from app.models.session import Session as SessionModel
from app.models.session import SessionStatus
from app.services.assessment_engine import AssessmentEngine

router = APIRouter()


# Pydantic schemas
class SessionCreate(BaseModel):
    scenario_id: str
    student_id: int


class MessageAdd(BaseModel):
    role: str  # "patient" or "student"
    message: str
    audio_url: Optional[str] = None


class SessionResponse(BaseModel):
    id: int
    session_id: str
    scenario_id: int
    student_id: int
    status: SessionStatus
    started_at: datetime
    completed_at: Optional[datetime]
    duration: Optional[int]
    current_node_id: Optional[str]
    transcript: List[dict]

    class Config:
        from_attributes = True


class SessionListItem(BaseModel):
    """Simplified session info for list view"""

    id: int
    session_id: str
    scenario_id: int
    status: SessionStatus
    started_at: datetime
    duration: Optional[int]

    class Config:
        from_attributes = True


class SessionWithDetails(BaseModel):
    """Session with scenario and assessment details for past cases view"""

    id: int
    session_id: str
    scenario_id: int
    scenario_title: str
    scenario_specialty: str
    status: SessionStatus
    started_at: datetime
    completed_at: Optional[datetime]
    duration: Optional[int]
    overall_score: Optional[int]
    diagnosis_submitted: Optional[str]
    diagnosis_correct: Optional[bool]

    class Config:
        from_attributes = True


@router.post("/", response_model=SessionResponse, status_code=status.HTTP_201_CREATED)
async def create_session(
    session_data: SessionCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """
    Start a new consultation session

    Args:
        session_data: Session creation data
    """
    # Verify scenario exists
    scenario = db.query(Scenario).filter(Scenario.scenario_id == session_data.scenario_id).first()

    if not scenario:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Scenario {session_data.scenario_id} not found",
        )

    # Create session
    session_id = f"session_{uuid.uuid4().hex[:12]}"
    session = SessionModel(
        session_id=session_id,
        student_id=session_data.student_id,
        scenario_id=scenario.id,
        status=SessionStatus.IN_PROGRESS,
        started_at=datetime.utcnow(),
        transcript=[],
        nodes_visited=[],
        topics_covered=[],
        red_flags_identified=[],
    )

    db.add(session)

    # Update scenario play count
    scenario.times_played += 1

    db.commit()
    db.refresh(session)

    return session


@router.get("/{session_id}", response_model=SessionResponse)
async def get_session(
    session_id: str, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)
):
    """Get session details"""
    session = db.query(SessionModel).filter(SessionModel.session_id == session_id).first()

    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail=f"Session {session_id} not found"
        )

    return session


@router.get("/student/{student_id}", response_model=List[SessionListItem])
async def list_student_sessions(
    student_id: int,
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """List all sessions for a student"""
    sessions = (
        db.query(SessionModel)
        .filter(SessionModel.student_id == student_id)
        .order_by(SessionModel.started_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )

    return sessions


@router.get("/student/{student_id}/history", response_model=List[SessionWithDetails])
async def list_student_session_history(
    student_id: int,
    status: Optional[SessionStatus] = None,
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """
    List all sessions for a student with scenario and assessment details.
    This is the main endpoint for the "Past Cases" view in the dashboard.
    """
    # Build query joining sessions with scenarios and assessments
    query = (
        db.query(
            SessionModel.id,
            SessionModel.session_id,
            SessionModel.scenario_id,
            Scenario.title.label("scenario_title"),
            Scenario.specialty.label("scenario_specialty"),
            SessionModel.status,
            SessionModel.started_at,
            SessionModel.completed_at,
            SessionModel.duration,
            Assessment.overall_score,
            SessionModel.diagnosis_submitted,
            SessionModel.diagnosis_correct,
        )
        .join(Scenario, SessionModel.scenario_id == Scenario.id)
        .outerjoin(Assessment, SessionModel.session_id == Assessment.session_id)
        .filter(SessionModel.student_id == student_id)
    )

    # Filter by status if provided
    if status:
        query = query.filter(SessionModel.status == status)

    # Order by most recent first
    query = query.order_by(SessionModel.started_at.desc())

    # Apply pagination
    results = query.offset(skip).limit(limit).all()

    # Convert to response model
    sessions = []
    for row in results:
        sessions.append(
            SessionWithDetails(
                id=row.id,
                session_id=row.session_id,
                scenario_id=row.scenario_id,
                scenario_title=row.scenario_title,
                scenario_specialty=row.scenario_specialty,
                status=row.status,
                started_at=row.started_at,
                completed_at=row.completed_at,
                duration=row.duration,
                overall_score=row.overall_score,
                diagnosis_submitted=row.diagnosis_submitted,
                diagnosis_correct=row.diagnosis_correct,
            )
        )

    return sessions


@router.post("/{session_id}/message")
async def add_message(
    session_id: str,
    message_data: MessageAdd,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """Add a message to the session transcript"""
    session = db.query(SessionModel).filter(SessionModel.session_id == session_id).first()

    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail=f"Session {session_id} not found"
        )

    # Add message to transcript
    message = {
        "role": message_data.role,
        "message": message_data.message,
        "timestamp": datetime.utcnow().isoformat(),
        "audio_url": message_data.audio_url,
    }

    transcript = session.transcript or []
    transcript.append(message)
    session.transcript = transcript

    # Update question count if student message
    if message_data.role == "student":
        session.questions_asked += 1

    db.commit()

    return {"status": "success", "message": "Message added"}


@router.post("/{session_id}/complete")
async def complete_session(
    session_id: str,
    diagnosis: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """
    Mark session as completed and create assessment

    Args:
        session_id: Session ID
        diagnosis: Student's final diagnosis
    """
    session = db.query(SessionModel).filter(SessionModel.session_id == session_id).first()

    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail=f"Session {session_id} not found"
        )

    # Calculate duration
    duration = int((datetime.utcnow() - session.started_at).total_seconds())

    # Update session
    session.status = SessionStatus.COMPLETED
    session.completed_at = datetime.utcnow()
    session.duration = duration
    session.diagnosis_submitted = diagnosis

    # Get scenario for assessment
    scenario = db.query(Scenario).filter(Scenario.id == session.scenario_id).first()

    # Check if diagnosis is correct
    diagnosis_correct = False
    if scenario and diagnosis:
        diagnosis_correct = diagnosis.lower().strip() == scenario.correct_diagnosis.lower().strip()
        session.diagnosis_correct = diagnosis_correct

    db.commit()

    # Create assessment
    assessment = None
    if scenario:
        # Build scenario data for assessment engine
        scenario_data = {
            "id": scenario.id,
            "scenario_id": scenario.scenario_id,
            "title": scenario.title,
            "assessment_rubric": scenario.assessment_rubric or {},
        }

        # Build session data for assessment engine
        session_data = {
            "questions_asked": session.questions_asked or 0,
            "relevant_questions": session.questions_asked
            or 0,  # Simplified: assume all questions are relevant
            "topics_covered": session.topics_covered or [],
            "red_flags_caught": session.red_flags_identified or [],
            "duration": duration,
            "diagnosis_correct": diagnosis_correct,
            "relevance_percentage": 70,  # Default relevance
        }

        # Calculate assessment using engine
        engine = AssessmentEngine(scenario_data, session_data)
        assessment_result = engine.calculate_assessment()

        # Create assessment record
        assessment_id = f"assessment_{uuid.uuid4().hex[:12]}"
        assessment = Assessment(
            assessment_id=assessment_id,
            student_id=session.student_id,
            session_id=session.session_id,
            overall_score=assessment_result["overall_score"],
            history_taking_score=assessment_result["history_taking_score"],
            clinical_reasoning_score=assessment_result["clinical_reasoning_score"],
            management_score=assessment_result["management_score"],
            communication_score=assessment_result["communication_score"],
            efficiency_score=assessment_result["efficiency_score"],
            metrics=assessment_result["metrics"],
            skills_breakdown=assessment_result["skills_breakdown"],
            feedback_summary=assessment_result["feedback_summary"],
            strengths=assessment_result["strengths"],
            areas_for_improvement=assessment_result["areas_for_improvement"],
        )

        db.add(assessment)
        db.commit()
        db.refresh(assessment)

    return {
        "status": "success",
        "message": "Session completed",
        "duration": duration,
        "assessment_id": assessment.assessment_id if assessment else None,
    }


@router.delete("/{session_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_session(
    session_id: str, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)
):
    """Delete a session"""
    session = db.query(SessionModel).filter(SessionModel.session_id == session_id).first()

    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail=f"Session {session_id} not found"
        )

    db.delete(session)
    db.commit()

    return None
