"""Scenario management API endpoints"""

from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel, field_serializer

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.scenario import Scenario, DifficultyLevel, ScenarioStatus

router = APIRouter()


# Pydantic schemas
class ScenarioBase(BaseModel):
    scenario_id: str
    title: str
    description: Optional[str] = None
    specialty: str
    difficulty: DifficultyLevel
    patient_profile: dict
    dialogue_tree: dict
    assessment_rubric: dict
    learning_objectives: List[str] = []
    correct_diagnosis: Optional[str] = None
    clare_guidelines: List[str] = []


class ScenarioCreate(ScenarioBase):
    pass


class ScenarioResponse(ScenarioBase):
    id: int
    status: ScenarioStatus
    times_played: int
    average_score: Optional[int]
    created_at: datetime
    published_at: Optional[datetime]

    @field_serializer('created_at', 'published_at')
    def serialize_dt(self, dt: Optional[datetime], _info):
        return dt.isoformat() if dt else None

    class Config:
        from_attributes = True


class ScenarioListItem(BaseModel):
    """Simplified scenario info for list view"""
    id: int
    scenario_id: str
    title: str
    specialty: str
    difficulty: DifficultyLevel
    status: ScenarioStatus
    times_played: int
    average_score: Optional[int]

    class Config:
        from_attributes = True


@router.get("/", response_model=List[ScenarioListItem])
async def list_scenarios(
    specialty: Optional[str] = Query(None),
    difficulty: Optional[DifficultyLevel] = Query(None),
    status: Optional[ScenarioStatus] = Query(None, description="Filter by status"),
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    """
    List all scenarios with optional filters

    Args:
        specialty: Filter by medical specialty
        difficulty: Filter by difficulty level
        status: Filter by publication status
        skip: Number of records to skip
        limit: Maximum number of records to return
    """
    query = db.query(Scenario)

    if specialty:
        query = query.filter(Scenario.specialty == specialty)
    if difficulty:
        query = query.filter(Scenario.difficulty == difficulty)
    if status:
        query = query.filter(Scenario.status == status)
    else:
        # By default, only show published scenarios
        query = query.filter(Scenario.status == ScenarioStatus.PUBLISHED)

    scenarios = query.offset(skip).limit(limit).all()
    return scenarios


@router.get("/{scenario_id}", response_model=ScenarioResponse)
async def get_scenario(
    scenario_id: str,
    db: Session = Depends(get_db)
):
    """Get scenario by ID"""
    scenario = db.query(Scenario).filter(
        Scenario.scenario_id == scenario_id
    ).first()

    if not scenario:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Scenario {scenario_id} not found"
        )

    return scenario


@router.post("/", response_model=ScenarioResponse, status_code=status.HTTP_201_CREATED)
async def create_scenario(
    scenario_data: ScenarioCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Create a new scenario"""
    # Check if scenario_id already exists
    existing = db.query(Scenario).filter(
        Scenario.scenario_id == scenario_data.scenario_id
    ).first()

    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Scenario with ID {scenario_data.scenario_id} already exists"
        )

    scenario = Scenario(
        **scenario_data.model_dump(),
        created_by=current_user.get("sub"),
        status=ScenarioStatus.DRAFT
    )

    db.add(scenario)
    db.commit()
    db.refresh(scenario)

    return scenario


@router.put("/{scenario_id}", response_model=ScenarioResponse)
async def update_scenario(
    scenario_id: str,
    scenario_data: ScenarioCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Update an existing scenario"""
    scenario = db.query(Scenario).filter(
        Scenario.scenario_id == scenario_id
    ).first()

    if not scenario:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Scenario {scenario_id} not found"
        )

    # Update fields
    for key, value in scenario_data.model_dump().items():
        setattr(scenario, key, value)

    db.commit()
    db.refresh(scenario)

    return scenario


@router.delete("/{scenario_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_scenario(
    scenario_id: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Delete a scenario"""
    scenario = db.query(Scenario).filter(
        Scenario.scenario_id == scenario_id
    ).first()

    if not scenario:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Scenario {scenario_id} not found"
        )

    db.delete(scenario)
    db.commit()

    return None


@router.post("/{scenario_id}/publish", response_model=ScenarioResponse)
async def publish_scenario(
    scenario_id: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Publish a scenario (make it available to students)"""
    from datetime import datetime

    scenario = db.query(Scenario).filter(
        Scenario.scenario_id == scenario_id
    ).first()

    if not scenario:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Scenario {scenario_id} not found"
        )

    scenario.status = ScenarioStatus.PUBLISHED
    scenario.published_at = datetime.utcnow()

    db.commit()
    db.refresh(scenario)

    return scenario


@router.get("/specialties/list")
async def list_specialties(db: Session = Depends(get_db)):
    """Get list of all available specialties"""
    specialties = db.query(Scenario.specialty).distinct().all()
    return [s[0] for s in specialties]
