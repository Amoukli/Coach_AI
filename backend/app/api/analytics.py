"""Analytics and progress tracking API endpoints"""

from datetime import datetime, timedelta
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy import desc, func
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.assessment import Assessment, SkillProgress
from app.models.scenario import Scenario
from app.models.session import Session as SessionModel
from app.models.session import SessionStatus
from app.models.user import User

router = APIRouter()


# Pydantic schemas
class StudentStats(BaseModel):
    total_scenarios_completed: int
    total_time_spent: int  # minutes
    average_score: float
    scenarios_by_specialty: dict
    recent_activity: List[dict]


class SkillRadarData(BaseModel):
    history_taking: int
    clinical_reasoning: int
    management: int
    communication: int
    efficiency: int


class ProgressTrend(BaseModel):
    dates: List[str]
    scores: List[int]
    skill: str


@router.get("/user/{user_id}/dashboard")
async def get_user_dashboard(
    user_id: int, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)
):
    """
    Get comprehensive dashboard data for a user

    Args:
        user_id: User ID
    """
    # Get user
    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Get completed sessions
    completed_sessions = (
        db.query(SessionModel)
        .filter(SessionModel.user_id == user_id, SessionModel.status == SessionStatus.COMPLETED)
        .all()
    )

    # Get assessments
    assessments = db.query(Assessment).filter(Assessment.user_id == user_id).all()

    # Calculate statistics
    total_scenarios = len(completed_sessions)
    total_time_spent = (
        sum((s.duration or 0) for s in completed_sessions) // 60
    )  # Convert to minutes

    average_score = 0
    if assessments:
        average_score = sum(a.overall_score for a in assessments) / len(assessments)

    # Scenarios by specialty
    scenarios_by_specialty = {}
    for session in completed_sessions:
        scenario = db.query(Scenario).filter(Scenario.id == session.scenario_id).first()
        if scenario:
            specialty = scenario.specialty
            scenarios_by_specialty[specialty] = scenarios_by_specialty.get(specialty, 0) + 1

    # Recent activity (last 5 sessions)
    recent_sessions = (
        db.query(SessionModel)
        .filter(SessionModel.user_id == user_id)
        .order_by(desc(SessionModel.started_at))
        .limit(5)
        .all()
    )

    recent_activity = []
    for session in recent_sessions:
        scenario = db.query(Scenario).filter(Scenario.id == session.scenario_id).first()

        assessment = (
            db.query(Assessment).filter(Assessment.session_id == session.session_id).first()
        )

        recent_activity.append(
            {
                "session_id": session.session_id,
                "scenario_title": scenario.title if scenario else "Unknown",
                "date": session.started_at.isoformat(),
                "duration": session.duration,
                "score": assessment.overall_score if assessment else None,
                "status": session.status,
            }
        )

    return {
        "total_scenarios_completed": total_scenarios,
        "total_time_spent": total_time_spent,
        "average_score": round(average_score, 1),
        "scenarios_by_specialty": scenarios_by_specialty,
        "recent_activity": recent_activity,
    }


@router.get("/user/{user_id}/skills-radar")
async def get_skills_radar(
    user_id: int, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)
):
    """
    Get skill radar chart data for a user

    Args:
        user_id: User ID
    """
    # Get latest skill levels
    skills = {
        "history_taking": 0,
        "clinical_reasoning": 0,
        "management": 0,
        "communication": 0,
        "efficiency": 0,
    }

    skill_progress = db.query(SkillProgress).filter(SkillProgress.user_id == user_id).all()

    for progress in skill_progress:
        if progress.skill_name in skills:
            skills[progress.skill_name] = progress.current_level

    return skills


@router.get("/user/{user_id}/progress-trend")
async def get_progress_trend(
    user_id: int,
    skill: Optional[str] = Query(None, description="Specific skill to track"),
    days: int = Query(30, description="Number of days to look back"),
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """
    Get progress trend over time

    Args:
        user_id: User ID
        skill: Specific skill to track (optional, defaults to overall score)
        days: Number of days to look back
    """
    # Calculate date range
    end_date = datetime.utcnow()
    start_date = end_date - timedelta(days=days)

    # Get assessments in date range
    assessments = (
        db.query(Assessment)
        .filter(Assessment.user_id == user_id, Assessment.created_at >= start_date)
        .order_by(Assessment.created_at)
        .all()
    )

    dates = []
    scores = []

    for assessment in assessments:
        dates.append(assessment.created_at.strftime("%Y-%m-%d"))

        if skill and skill in assessment.skills_breakdown:
            scores.append(assessment.skills_breakdown[skill].get("score", 0))
        else:
            scores.append(assessment.overall_score)

    return {"dates": dates, "scores": scores, "skill": skill or "overall"}


@router.get("/user/{user_id}/recommendations")
async def get_scenario_recommendations(
    user_id: int,
    limit: int = Query(5, description="Number of recommendations"),
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """
    Get personalized scenario recommendations based on weak areas

    Args:
        user_id: User ID
        limit: Number of scenarios to recommend
    """
    # Get skill progress to identify weak areas
    skill_progress = (
        db.query(SkillProgress)
        .filter(SkillProgress.user_id == user_id)
        .order_by(SkillProgress.current_level)
        .all()
    )

    # Identify weakest skills
    weak_skills = [s.skill_name for s in skill_progress[:2]] if skill_progress else []

    # Get scenarios user has completed
    completed_sessions = (
        db.query(SessionModel.scenario_id)
        .filter(SessionModel.user_id == user_id, SessionModel.status == SessionStatus.COMPLETED)
        .all()
    )
    completed_scenario_ids = [s.scenario_id for s in completed_sessions]

    # Find scenarios targeting weak areas that haven't been completed
    # This is a simplified recommendation - could be enhanced with ML
    recommendations = (
        db.query(Scenario)
        .filter(Scenario.id.notin_(completed_scenario_ids), Scenario.status == "published")
        .order_by(Scenario.average_score.desc())
        .limit(limit)
        .all()
    )

    return [
        {
            "scenario_id": s.scenario_id,
            "title": s.title,
            "specialty": s.specialty,
            "difficulty": s.difficulty,
            "average_score": s.average_score,
            "reason": (
                f"Recommended to improve {', '.join(weak_skills)}"
                if weak_skills
                else "Popular scenario"
            ),
        }
        for s in recommendations
    ]


@router.get("/leaderboard")
async def get_leaderboard(
    specialty: Optional[str] = Query(None), limit: int = Query(10), db: Session = Depends(get_db)
):
    """
    Get leaderboard of top performing users

    Args:
        specialty: Filter by specialty (optional)
        limit: Number of users to return
    """
    # Get average scores per user
    query = db.query(
        User.id,
        User.first_name,
        User.last_name,
        User.institution,
        func.avg(Assessment.overall_score).label("avg_score"),
        func.count(Assessment.id).label("scenarios_completed"),
    ).join(Assessment, User.id == Assessment.user_id)

    if specialty:
        # Filter by specialty through sessions and scenarios
        query = (
            query.join(SessionModel, Assessment.session_id == SessionModel.session_id)
            .join(Scenario, SessionModel.scenario_id == Scenario.id)
            .filter(Scenario.specialty == specialty)
        )

    query = query.group_by(User.id).order_by(desc("avg_score")).limit(limit)

    results = query.all()

    return [
        {
            "rank": idx + 1,
            "user_name": f"{r.first_name} {r.last_name}",
            "institution": r.institution,
            "average_score": round(r.avg_score, 1),
            "scenarios_completed": r.scenarios_completed,
        }
        for idx, r in enumerate(results)
    ]
