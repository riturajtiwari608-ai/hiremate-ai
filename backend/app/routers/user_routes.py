from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User
from app.schemas import UserResponse, UserStatusUpdate
from app.dependencies import get_current_user, require_admin


router = APIRouter(
    prefix="/users",
    tags=["Users"]
)


@router.get("/me", response_model=UserResponse)
def get_my_profile(current_user: User = Depends(get_current_user)):
    return current_user


@router.get("/all", response_model=list[UserResponse])
def get_all_users(
    role: str | None = None,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_admin)
):
    query = db.query(User)

    if role:
        if role not in ["candidate", "admin"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Role must be candidate or admin"
            )

        query = query.filter(User.role == role)

    users = query.order_by(User.created_at.desc()).all()
    return users


@router.patch("/{user_id}/status", response_model=UserResponse)
def update_user_status(
    user_id: int,
    status_data: UserStatusUpdate,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_admin)
):
    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    if user.id == admin_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You cannot deactivate your own account"
        )

    user.is_active = status_data.is_active

    db.commit()
    db.refresh(user)

    return user