"""Session models for consultation tracking"""

from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, Boolean, JSON, ForeignKey, Text, Enum
from sqlalchemy.orm import relationship
import enum

from app.core.database import Base


class SessionStatus(str, enum.Enum):
    """Session status"""
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    ABANDONED = "abandoned"


class Session(Base):
    """Student consultation session"""

    __tablename__ = "sessions"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String, unique=True, index=True, nullable=False)

    # Foreign keys
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    scenario_id = Column(Integer, ForeignKey("scenarios.id"), nullable=False)

    # Session data
    status = Column(Enum(SessionStatus), default=SessionStatus.IN_PROGRESS)
    started_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
    duration = Column(Integer, nullable=True)  # In seconds

    # Consultation transcript
    transcript = Column(JSON, default=list)
    # [
    #   {"role": "patient", "message": "...", "timestamp": "...", "audio_url": "..."},
    #   {"role": "student", "message": "...", "timestamp": "..."}
    # ]

    # Interaction tracking
    current_node_id = Column(String, nullable=True)  # Current position in dialogue tree
    nodes_visited = Column(JSON, default=list)  # Track path through scenario
    topics_covered = Column(JSON, default=list)  # Topics student has asked about
    red_flags_identified = Column(JSON, default=list)  # Red flags caught by student

    # Performance metrics (calculated during session)
    questions_asked = Column(Integer, default=0)
    relevant_questions = Column(Integer, default=0)
    time_to_diagnosis = Column(Integer, nullable=True)  # Seconds
    diagnosis_submitted = Column(String, nullable=True)
    diagnosis_correct = Column(Boolean, nullable=True)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    student = relationship("Student", back_populates="sessions")
    scenario = relationship("Scenario", back_populates="sessions")
    assessment = relationship("Assessment", back_populates="session", uselist=False, cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Session {self.session_id}>"


class ConversationMessage(Base):
    """Individual conversation messages (alternative to JSON storage)"""

    __tablename__ = "conversation_messages"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String, ForeignKey("sessions.session_id"), nullable=False)

    role = Column(String, nullable=False)  # "patient" or "student"
    message = Column(Text, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)

    # Audio data
    audio_url = Column(String, nullable=True)  # URL to audio file if available
    audio_duration = Column(Integer, nullable=True)  # Duration in seconds

    # Metadata
    node_id = Column(String, nullable=True)  # Dialogue node this relates to
    message_metadata = Column(JSON, default=dict)  # Additional metadata

    def __repr__(self):
        return f"<Message {self.role}: {self.message[:50]}>"
