"""Pydantic schemas for User model"""

import re
from datetime import datetime
from enum import Enum
from typing import Any, Dict, Optional

from pydantic import BaseModel, EmailStr, Field, field_validator


class ExperienceLevel(str, Enum):
    """User experience level enum"""

    MEDICAL_STUDENT = "medical_student"
    PHYSICIAN_UNDER_5_YEARS = "physician_under_5_years"
    PHYSICIAN_OVER_5_YEARS = "physician_over_5_years"


class UserRole(str, Enum):
    """User role enum for access control"""

    USER = "user"
    ADMIN = "admin"


class UserBase(BaseModel):
    """Base user schema with common fields"""

    email: EmailStr
    username: str = Field(..., min_length=3, max_length=100)
    first_name: str = Field(..., min_length=1, max_length=100)
    last_name: str = Field(..., min_length=1, max_length=100)
    institution: Optional[str] = None
    year_of_study: Optional[int] = Field(None, ge=1, le=10)
    specialty_interest: Optional[str] = None
    experience_level: ExperienceLevel

    @field_validator("username")
    @classmethod
    def validate_username(cls, v: str) -> str:
        """Username can only contain letters, numbers, underscores, and hyphens"""
        if not re.match(r"^[a-zA-Z0-9_-]+$", v):
            raise ValueError("Username can only contain letters, numbers, underscores, and hyphens")
        return v.lower()


class UserCreate(UserBase):
    """Schema for creating a new user (admin use)"""

    password: str = Field(..., min_length=8)
    role: UserRole = UserRole.USER


class UserRegister(BaseModel):
    """Schema for user self-registration"""

    email: EmailStr
    username: str = Field(..., min_length=3, max_length=100)
    first_name: str = Field(..., min_length=1, max_length=100)
    last_name: str = Field(..., min_length=1, max_length=100)
    password: str = Field(..., min_length=8)
    institution: Optional[str] = None
    year_of_study: Optional[int] = Field(None, ge=1, le=10)
    specialty_interest: Optional[str] = None
    experience_level: ExperienceLevel

    @field_validator("username")
    @classmethod
    def validate_username(cls, v: str) -> str:
        """Username can only contain letters, numbers, underscores, and hyphens"""
        if not re.match(r"^[a-zA-Z0-9_-]+$", v):
            raise ValueError("Username can only contain letters, numbers, underscores, and hyphens")
        return v.lower()


class UserUpdate(BaseModel):
    """Schema for updating user profile"""

    first_name: Optional[str] = Field(None, min_length=1, max_length=100)
    last_name: Optional[str] = Field(None, min_length=1, max_length=100)
    institution: Optional[str] = None
    year_of_study: Optional[int] = Field(None, ge=1, le=10)
    specialty_interest: Optional[str] = None
    experience_level: Optional[ExperienceLevel] = None


class UserResponse(BaseModel):
    """Schema for user response (API output)"""

    id: int
    email: EmailStr
    username: str
    first_name: str
    last_name: str
    full_name: str
    institution: Optional[str] = None
    year_of_study: Optional[int] = None
    specialty_interest: Optional[str] = None
    experience_level: ExperienceLevel
    role: UserRole
    is_active: bool
    is_verified: bool
    created_at: datetime
    last_login: Optional[datetime] = None
    total_scenarios_completed: int
    total_time_spent: int
    skill_levels: Dict[str, Any]

    class Config:
        from_attributes = True


class UserLogin(BaseModel):
    """Schema for user login"""

    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    """Schema for authentication token response"""

    access_token: str
    token_type: str = "bearer"
    user: UserResponse
