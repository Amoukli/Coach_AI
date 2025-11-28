"""User model for authentication and profile management"""

from datetime import datetime
from enum import Enum as PyEnum

from sqlalchemy import JSON, Boolean, Column, DateTime, Enum, Integer, String
from sqlalchemy.orm import relationship

from app.core.database import Base


class ExperienceLevel(str, PyEnum):
    """User experience level enum"""

    MEDICAL_STUDENT = "medical_student"
    PHYSICIAN_UNDER_5_YEARS = "physician_under_5_years"
    PHYSICIAN_OVER_5_YEARS = "physician_over_5_years"


class UserRole(str, PyEnum):
    """User role enum for access control"""

    USER = "user"
    ADMIN = "admin"


class User(Base):
    """User model - replaces Student model"""

    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)

    # Identity fields
    email = Column(String(255), unique=True, index=True, nullable=False)
    username = Column(String(100), unique=True, index=True, nullable=False)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)

    # Profile fields
    institution = Column(String(255), nullable=True)
    year_of_study = Column(Integer, nullable=True)
    specialty_interest = Column(String(100), nullable=True)
    experience_level = Column(
        Enum(
            ExperienceLevel, values_callable=lambda obj: [e.value for e in obj], create_type=False
        ),
        nullable=False,
        default=ExperienceLevel.MEDICAL_STUDENT,
    )

    # Access control
    role = Column(
        Enum(UserRole, values_callable=lambda obj: [e.value for e in obj], create_type=False),
        nullable=False,
        default=UserRole.USER,
    )

    # Authentication
    hashed_password = Column(String(255), nullable=True)
    azure_ad_oid = Column(String(255), unique=True, nullable=True)
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    last_login = Column(DateTime, nullable=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Progress tracking
    total_scenarios_completed = Column(Integer, default=0)
    total_time_spent = Column(Integer, default=0)
    skill_levels = Column(JSON, default=dict)

    # Relationships
    sessions = relationship("Session", back_populates="user", cascade="all, delete-orphan")
    assessments = relationship("Assessment", back_populates="user", cascade="all, delete-orphan")

    @property
    def full_name(self) -> str:
        """Computed property for backwards compatibility"""
        return f"{self.first_name} {self.last_name}".strip()

    def __repr__(self):
        return f"<User {self.username} ({self.email})>"


# Backwards compatibility alias
Student = User
