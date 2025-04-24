from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID
from app.database.connection import get_db
from app.controllers.settings import SettingsController
from app.schemas.settings import SettingsPatch, SettingsOut

router = APIRouter(prefix="/settings", tags=["settings"])

@router.patch("/{user_id}", response_model=SettingsOut)
async def update_settings(user_id: UUID, settings_data: SettingsPatch, db: AsyncSession = Depends(get_db)):
    """
    Actualiza parcialmente las configuraciones de un usuario.
    """
    return await SettingsController.patch(user_id, settings_data, db)

@router.get("/{user_id}", response_model=SettingsOut)
async def get_user_settings(user_id: UUID, db: AsyncSession = Depends(get_db)):
    """
    Obtiene las configuraciones actuales de un usuario por su ID.
    """
    return await SettingsController.get_by_user_id(user_id, db)