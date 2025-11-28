"""Backwards compatibility - Student model redirects to User model"""

# All imports from user module for backwards compatibility
from app.models.user import ExperienceLevel, Student, User, UserRole

__all__ = ["User", "Student", "ExperienceLevel", "UserRole"]
