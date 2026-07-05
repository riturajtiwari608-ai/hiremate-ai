from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import CompanySetting, User
from app.schemas import CompanySettingResponse, CompanySettingUpdate
from app.dependencies import get_current_user, require_admin


router = APIRouter(
    prefix="/branding",
    tags=["Branding"]
)


def get_or_create_company_setting(db: Session):
    setting = db.query(CompanySetting).first()

    if not setting:
        setting = CompanySetting()
        db.add(setting)
        db.commit()
        db.refresh(setting)

    return setting


@router.get("/", response_model=CompanySettingResponse)
def get_branding(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    setting = get_or_create_company_setting(db)
    return setting


@router.put("/", response_model=CompanySettingResponse)
def update_branding(
    branding_data: CompanySettingUpdate,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_admin)
):
    setting = get_or_create_company_setting(db)

    update_data = branding_data.model_dump(exclude_unset=True)

    for field, value in update_data.items():
        setattr(setting, field, value)

    db.commit()
    db.refresh(setting)

    return setting