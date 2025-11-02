"""Student and user models"""

from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, Boolean, JSON
from sqlalchemy.orm import relationship

from app.core.database import Base


class Student(Base):
    """Student/user model"""

    __tablename__ = "students"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    full_name = Column(String, nullable=False)
    institution = Column(String, nullable=True)
    year_of_study = Column(Integer, nullable=True)  # Medical school year
    specialty_interest = Column(String, nullable=True)

    # Authentication
    hashed_password = Column(String, nullable=True)  # Optional if using Azure AD
    azure_ad_oid = Column(String, unique=True, nullable=True)  # Azure AD Object ID
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    last_login = Column(DateTime, nullable=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Progress tracking
    total_scenarios_completed = Column(Integer, default=0)
    total_time_spent = Column(Integer, default=0)  # In minutes
    skill_levels = Column(JSON, default=dict)  # {skill_name: level}

    # Relationships
    sessions = relationship("Session", back_populates="student", cascade="all, delete-orphan")
    assessments = relationship("Assessment", back_populates="student", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Student {self.email}>"
