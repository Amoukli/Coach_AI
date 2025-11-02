"""Assessment and feedback models"""

from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, JSON, ForeignKey, Text
from sqlalchemy.orm import relationship

from app.core.database import Base


class Assessment(Base):
    """Student performance assessment"""

    __tablename__ = "assessments"

    id = Column(Integer, primary_key=True, index=True)
    assessment_id = Column(String, unique=True, index=True, nullable=False)

    # Foreign keys
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    session_id = Column(String, ForeignKey("sessions.session_id"), nullable=False)

    # Overall score (0-100)
    overall_score = Column(Integer, nullable=False)

    # Skill scores (0-100 each)
    history_taking_score = Column(Integer, nullable=True)
    clinical_reasoning_score = Column(Integer, nullable=True)
    management_score = Column(Integer, nullable=True)
    communication_score = Column(Integer, nullable=True)
    efficiency_score = Column(Integer, nullable=True)

    # Detailed metrics
    metrics = Column(JSON, default=dict)
    # {
    #   "questions_asked": 15,
    #   "relevant_questions": 12,
    #   "red_flags_caught": ["chest_pain", "radiation"],
    #   "red_flags_missed": ["sweating"],
    #   "time_taken": 12.5,  # minutes
    #   "diagnosis_correct": true,
    #   "management_appropriate": true
    # }

    # Skills breakdown
    skills_breakdown = Column(JSON, default=dict)
    # {
    #   "history_taking": {
    #     "score": 85,
    #     "strengths": [...],
    #     "areas_for_improvement": [...]
    #   },
    #   ...
    # }

    # Feedback
    feedback_summary = Column(Text, nullable=True)
    strengths = Column(JSON, default=list)
    areas_for_improvement = Column(JSON, default=list)
    recommendations = Column(JSON, default=list)  # Recommended scenarios

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    student = relationship("Student", back_populates="assessments")
    session = relationship("Session", back_populates="assessment")

    def __repr__(self):
        return f"<Assessment {self.assessment_id}: {self.overall_score}/100>"


class SkillProgress(Base):
    """Student skill progress over time"""

    __tablename__ = "skill_progress"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)

    skill_name = Column(String, nullable=False)  # e.g., "history_taking", "communication"
    current_level = Column(Integer, default=0)  # 0-100
    previous_level = Column(Integer, nullable=True)

    # Trend data
    trend = Column(String, nullable=True)  # "improving", "stable", "declining"
    sessions_count = Column(Integer, default=0)
    last_score = Column(Integer, nullable=True)
    average_score = Column(Integer, nullable=True)

    # Timestamps
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f"<SkillProgress {self.skill_name}: {self.current_level}>"
