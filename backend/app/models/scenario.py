"""Scenario models"""

from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, JSON, Enum
from sqlalchemy.orm import relationship
import enum

from app.core.database import Base


class DifficultyLevel(str, enum.Enum):
    """Scenario difficulty levels"""
    BEGINNER = "beginner"
    INTERMEDIATE = "intermediate"
    ADVANCED = "advanced"


class ScenarioStatus(str, enum.Enum):
    """Scenario publication status"""
    DRAFT = "draft"
    PENDING_REVIEW = "pending_review"
    APPROVED = "approved"
    PUBLISHED = "published"
    ARCHIVED = "archived"


class Scenario(Base):
    """Clinical scenario model"""

    __tablename__ = "scenarios"

    id = Column(Integer, primary_key=True, index=True)
    scenario_id = Column(String, unique=True, index=True, nullable=False)  # e.g., "scenario_001"
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)

    # Classification
    specialty = Column(String, nullable=False)  # Cardiology, Respiratory, etc.
    difficulty = Column(Enum(DifficultyLevel), default=DifficultyLevel.BEGINNER)
    status = Column(Enum(ScenarioStatus), default=ScenarioStatus.DRAFT)

    # Patient profile
    patient_profile = Column(JSON, nullable=False)
    # {
    #   "name": "Anonymous Patient",
    #   "age": 58,
    #   "gender": "male",
    #   "presenting_complaint": "Chest pain",
    #   "voice_profile": {
    #     "accent": "British",
    #     "emotional_state": "anxious",
    #     "voice_id": "azure_voice_en_GB_male_01"
    #   }
    # }

    # Dialogue tree structure
    dialogue_tree = Column(JSON, nullable=False)
    # {
    #   "root": {
    #     "id": "node_001",
    #     "patient_says": "...",
    #     "expected_topics": [...],
    #     "branches": [...]
    #   }
    # }

    # Learning objectives
    learning_objectives = Column(JSON, default=list)
    correct_diagnosis = Column(String, nullable=True)
    differential_diagnoses = Column(JSON, default=list)

    # Guidelines integration
    clare_guidelines = Column(JSON, default=list)  # List of CKS/NICE guideline IDs
    clare_guideline_urls = Column(JSON, default=list)

    # Assessment rubric
    assessment_rubric = Column(JSON, nullable=False)
    # {
    #   "must_ask": [...],
    #   "red_flags": [...],
    #   "management_steps": [...],
    #   "time_limit": 15  # minutes
    # }

    # Source tracking
    source_clark_consultation_id = Column(String, nullable=True)  # If imported from Clark
    created_by = Column(String, nullable=True)  # Creator user ID
    reviewed_by = Column(String, nullable=True)  # Reviewer user ID

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    published_at = Column(DateTime, nullable=True)

    # Usage statistics
    times_played = Column(Integer, default=0)
    average_score = Column(Integer, nullable=True)  # 0-100
    average_completion_time = Column(Integer, nullable=True)  # In minutes

    # Relationships
    sessions = relationship("Session", back_populates="scenario", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Scenario {self.scenario_id}: {self.title}>"
