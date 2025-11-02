"""Session management API endpoints"""

from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
import uuid

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.session import Session as SessionModel, SessionStatus
from app.models.scenario import Scenario
from app.models.student import Student

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
    started_at: str
    completed_at: Optional[str]
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
    started_at: str
    duration: Optional[int]

    class Config:
        from_attributes = True


@router.post("/", response_model=SessionResponse, status_code=status.HTTP_201_CREATED)
async def create_session(
    session_data: SessionCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Start a new consultation session

    Args:
        session_data: Session creation data
    """
    # Verify scenario exists
    scenario = db.query(Scenario).filter(
        Scenario.scenario_id == session_data.scenario_id
    ).first()

    if not scenario:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Scenario {session_data.scenario_id} not found"
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
        red_flags_identified=[]
    )

    db.add(session)

    # Update scenario play count
    scenario.times_played += 1

    db.commit()
    db.refresh(session)

    return session


@router.get("/{session_id}", response_model=SessionResponse)
async def get_session(
    session_id: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Get session details"""
    session = db.query(SessionModel).filter(
        SessionModel.session_id == session_id
    ).first()

    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Session {session_id} not found"
        )

    return session


@router.get("/student/{student_id}", response_model=List[SessionListItem])
async def list_student_sessions(
    student_id: int,
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """List all sessions for a student"""
    sessions = db.query(SessionModel).filter(
        SessionModel.student_id == student_id
    ).order_by(
        SessionModel.started_at.desc()
    ).offset(skip).limit(limit).all()

    return sessions


@router.post("/{session_id}/message")
async def add_message(
    session_id: str,
    message_data: MessageAdd,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Add a message to the session transcript"""
    session = db.query(SessionModel).filter(
        SessionModel.session_id == session_id
    ).first()

    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Session {session_id} not found"
        )

    # Add message to transcript
    message = {
        "role": message_data.role,
        "message": message_data.message,
        "timestamp": datetime.utcnow().isoformat(),
        "audio_url": message_data.audio_url
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
    current_user: dict = Depends(get_current_user)
):
    """
    Mark session as completed

    Args:
        session_id: Session ID
        diagnosis: Student's final diagnosis
    """
    session = db.query(SessionModel).filter(
        SessionModel.session_id == session_id
    ).first()

    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Session {session_id} not found"
        )

    # Calculate duration
    duration = int((datetime.utcnow() - session.started_at).total_seconds())

    # Update session
    session.status = SessionStatus.COMPLETED
    session.completed_at = datetime.utcnow()
    session.duration = duration
    session.diagnosis_submitted = diagnosis

    # Check if diagnosis is correct
    scenario = db.query(Scenario).filter(Scenario.id == session.scenario_id).first()
    if scenario and diagnosis:
        session.diagnosis_correct = (
            diagnosis.lower().strip() == scenario.correct_diagnosis.lower().strip()
        )

    db.commit()

    return {
        "status": "success",
        "message": "Session completed",
        "duration": duration
    }


@router.delete("/{session_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_session(
    session_id: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Delete a session"""
    session = db.query(SessionModel).filter(
        SessionModel.session_id == session_id
    ).first()

    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Session {session_id} not found"
        )

    db.delete(session)
    db.commit()

    return None
