"""Assessment and feedback API endpoints"""

from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
import uuid

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.assessment import Assessment, SkillProgress
from app.models.session import Session as SessionModel

router = APIRouter()


# Pydantic schemas
class AssessmentCreate(BaseModel):
    session_id: str
    student_id: int
    overall_score: int
    history_taking_score: Optional[int] = None
    clinical_reasoning_score: Optional[int] = None
    management_score: Optional[int] = None
    communication_score: Optional[int] = None
    efficiency_score: Optional[int] = None
    metrics: dict = {}
    skills_breakdown: dict = {}
    feedback_summary: Optional[str] = None
    strengths: List[str] = []
    areas_for_improvement: List[str] = []


class AssessmentResponse(BaseModel):
    id: int
    assessment_id: str
    student_id: int
    session_id: str
    overall_score: int
    history_taking_score: Optional[int]
    clinical_reasoning_score: Optional[int]
    management_score: Optional[int]
    communication_score: Optional[int]
    efficiency_score: Optional[int]
    metrics: dict
    skills_breakdown: dict
    feedback_summary: Optional[str]
    strengths: List[str]
    areas_for_improvement: List[str]
    recommendations: List[str]
    created_at: datetime

    class Config:
        from_attributes = True


class SkillProgressResponse(BaseModel):
    skill_name: str
    current_level: int
    previous_level: Optional[int]
    trend: Optional[str]
    sessions_count: int
    average_score: Optional[int]

    class Config:
        from_attributes = True


@router.post("/", response_model=AssessmentResponse, status_code=status.HTTP_201_CREATED)
async def create_assessment(
    assessment_data: AssessmentCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Create assessment for a completed session

    Args:
        assessment_data: Assessment data
    """
    # Verify session exists and is completed
    session = db.query(SessionModel).filter(
        SessionModel.session_id == assessment_data.session_id
    ).first()

    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Session {assessment_data.session_id} not found"
        )

    # Check if assessment already exists
    existing = db.query(Assessment).filter(
        Assessment.session_id == assessment_data.session_id
    ).first()

    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Assessment already exists for this session"
        )

    # Create assessment
    assessment_id = f"assessment_{uuid.uuid4().hex[:12]}"
    assessment = Assessment(
        assessment_id=assessment_id,
        **assessment_data.model_dump()
    )

    db.add(assessment)
    db.commit()
    db.refresh(assessment)

    # Update skill progress
    await _update_skill_progress(
        db,
        assessment_data.student_id,
        assessment_data.skills_breakdown
    )

    return assessment


@router.get("/{assessment_id}", response_model=AssessmentResponse)
async def get_assessment(
    assessment_id: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Get assessment by ID"""
    assessment = db.query(Assessment).filter(
        Assessment.assessment_id == assessment_id
    ).first()

    if not assessment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Assessment {assessment_id} not found"
        )

    return assessment


@router.get("/session/{session_id}", response_model=AssessmentResponse)
async def get_assessment_by_session(
    session_id: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Get assessment for a specific session"""
    assessment = db.query(Assessment).filter(
        Assessment.session_id == session_id
    ).first()

    if not assessment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No assessment found for session {session_id}"
        )

    return assessment


@router.get("/student/{student_id}", response_model=List[AssessmentResponse])
async def list_student_assessments(
    student_id: int,
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """List all assessments for a student"""
    assessments = db.query(Assessment).filter(
        Assessment.student_id == student_id
    ).order_by(
        Assessment.created_at.desc()
    ).offset(skip).limit(limit).all()

    return assessments


@router.get("/student/{student_id}/skills", response_model=List[SkillProgressResponse])
async def get_student_skill_progress(
    student_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Get skill progress for a student"""
    skills = db.query(SkillProgress).filter(
        SkillProgress.student_id == student_id
    ).all()

    return skills


async def _update_skill_progress(
    db: Session,
    student_id: int,
    skills_breakdown: dict
):
    """Update student skill progress based on latest assessment"""
    for skill_name, skill_data in skills_breakdown.items():
        score = skill_data.get("score", 0)

        # Get or create skill progress
        progress = db.query(SkillProgress).filter(
            SkillProgress.student_id == student_id,
            SkillProgress.skill_name == skill_name
        ).first()

        if progress:
            # Update existing
            progress.previous_level = progress.current_level
            progress.current_level = score
            progress.sessions_count += 1
            progress.last_score = score

            # Calculate average
            if progress.average_score:
                progress.average_score = int(
                    (progress.average_score * (progress.sessions_count - 1) + score) /
                    progress.sessions_count
                )
            else:
                progress.average_score = score

            # Determine trend
            if progress.previous_level:
                if score > progress.previous_level + 5:
                    progress.trend = "improving"
                elif score < progress.previous_level - 5:
                    progress.trend = "declining"
                else:
                    progress.trend = "stable"

        else:
            # Create new
            progress = SkillProgress(
                student_id=student_id,
                skill_name=skill_name,
                current_level=score,
                last_score=score,
                average_score=score,
                sessions_count=1,
                trend="new"
            )
            db.add(progress)

    db.commit()
