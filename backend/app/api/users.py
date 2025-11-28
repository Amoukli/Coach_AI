"""User management API endpoints"""

from typing import Any, Dict, List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import (
    create_access_token,
    get_current_user,
    get_password_hash,
    require_admin,
)
from app.models.user import ExperienceLevel, User, UserRole
from app.schemas.user import TokenResponse, UserRegister, UserResponse, UserUpdate

router = APIRouter()


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register_user(
    user_data: UserRegister,
    db: Session = Depends(get_db),
):
    """
    Register a new user account

    Args:
        user_data: User registration data
    """
    # Check if email already exists
    if db.query(User).filter(User.email == user_data.email).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered"
        )

    # Check if username already exists
    if db.query(User).filter(User.username == user_data.username.lower()).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Username already taken"
        )

    # Create user
    user = User(
        email=user_data.email,
        username=user_data.username.lower(),
        first_name=user_data.first_name,
        last_name=user_data.last_name,
        hashed_password=get_password_hash(user_data.password),
        institution=user_data.institution,
        year_of_study=user_data.year_of_study,
        specialty_interest=user_data.specialty_interest,
        experience_level=ExperienceLevel(user_data.experience_level.value),
        role=UserRole.USER,
        is_active=True,
        is_verified=False,
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    # Create access token
    token_data = {
        "sub": str(user.id),
        "email": user.email,
        "username": user.username,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "role": user.role.value,
        "experience_level": user.experience_level.value,
    }
    access_token = create_access_token(token_data)

    return TokenResponse(
        access_token=access_token,
        token_type="bearer",  # nosec B106 - not a password, it's OAuth2 token type
        user=UserResponse(
            id=user.id,
            email=user.email,
            username=user.username,
            first_name=user.first_name,
            last_name=user.last_name,
            full_name=user.full_name,
            institution=user.institution,
            year_of_study=user.year_of_study,
            specialty_interest=user.specialty_interest,
            experience_level=user.experience_level,
            role=user.role,
            is_active=user.is_active,
            is_verified=user.is_verified,
            created_at=user.created_at,
            last_login=user.last_login,
            total_scenarios_completed=user.total_scenarios_completed,
            total_time_spent=user.total_time_spent,
            skill_levels=user.skill_levels or {},
        ),
    )


@router.get("/me", response_model=UserResponse)
async def get_current_user_profile(
    current_user: Dict[str, Any] = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get the current authenticated user's profile"""
    user_id = int(current_user.get("sub"))
    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    return UserResponse(
        id=user.id,
        email=user.email,
        username=user.username,
        first_name=user.first_name,
        last_name=user.last_name,
        full_name=user.full_name,
        institution=user.institution,
        year_of_study=user.year_of_study,
        specialty_interest=user.specialty_interest,
        experience_level=user.experience_level,
        role=user.role,
        is_active=user.is_active,
        is_verified=user.is_verified,
        created_at=user.created_at,
        last_login=user.last_login,
        total_scenarios_completed=user.total_scenarios_completed,
        total_time_spent=user.total_time_spent,
        skill_levels=user.skill_levels or {},
    )


@router.put("/me", response_model=UserResponse)
async def update_current_user_profile(
    update_data: UserUpdate,
    current_user: Dict[str, Any] = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Update the current authenticated user's profile"""
    user_id = int(current_user.get("sub"))
    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    # Update fields if provided
    if update_data.first_name is not None:
        user.first_name = update_data.first_name
    if update_data.last_name is not None:
        user.last_name = update_data.last_name
    if update_data.institution is not None:
        user.institution = update_data.institution
    if update_data.year_of_study is not None:
        user.year_of_study = update_data.year_of_study
    if update_data.specialty_interest is not None:
        user.specialty_interest = update_data.specialty_interest
    if update_data.experience_level is not None:
        user.experience_level = ExperienceLevel(update_data.experience_level.value)

    db.commit()
    db.refresh(user)

    return UserResponse(
        id=user.id,
        email=user.email,
        username=user.username,
        first_name=user.first_name,
        last_name=user.last_name,
        full_name=user.full_name,
        institution=user.institution,
        year_of_study=user.year_of_study,
        specialty_interest=user.specialty_interest,
        experience_level=user.experience_level,
        role=user.role,
        is_active=user.is_active,
        is_verified=user.is_verified,
        created_at=user.created_at,
        last_login=user.last_login,
        total_scenarios_completed=user.total_scenarios_completed,
        total_time_spent=user.total_time_spent,
        skill_levels=user.skill_levels or {},
    )


@router.get("/{user_id}", response_model=UserResponse)
async def get_user_by_id(
    user_id: int,
    current_user: Dict[str, Any] = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get a user by ID (admin or self only)"""
    # Check if requesting own profile or is admin
    requesting_user_id = int(current_user.get("sub"))
    is_admin = current_user.get("role") == "admin"

    if requesting_user_id != user_id and not is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to view this user"
        )

    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    return UserResponse(
        id=user.id,
        email=user.email,
        username=user.username,
        first_name=user.first_name,
        last_name=user.last_name,
        full_name=user.full_name,
        institution=user.institution,
        year_of_study=user.year_of_study,
        specialty_interest=user.specialty_interest,
        experience_level=user.experience_level,
        role=user.role,
        is_active=user.is_active,
        is_verified=user.is_verified,
        created_at=user.created_at,
        last_login=user.last_login,
        total_scenarios_completed=user.total_scenarios_completed,
        total_time_spent=user.total_time_spent,
        skill_levels=user.skill_levels or {},
    )


@router.get("/", response_model=List[UserResponse])
async def list_users(
    skip: int = 0,
    limit: int = 50,
    experience_level: Optional[str] = None,
    current_user: Dict[str, Any] = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """List all users (admin only)"""
    query = db.query(User)

    if experience_level:
        query = query.filter(User.experience_level == ExperienceLevel(experience_level))

    users = query.offset(skip).limit(limit).all()

    return [
        UserResponse(
            id=user.id,
            email=user.email,
            username=user.username,
            first_name=user.first_name,
            last_name=user.last_name,
            full_name=user.full_name,
            institution=user.institution,
            year_of_study=user.year_of_study,
            specialty_interest=user.specialty_interest,
            experience_level=user.experience_level,
            role=user.role,
            is_active=user.is_active,
            is_verified=user.is_verified,
            created_at=user.created_at,
            last_login=user.last_login,
            total_scenarios_completed=user.total_scenarios_completed,
            total_time_spent=user.total_time_spent,
            skill_levels=user.skill_levels or {},
        )
        for user in users
    ]
