from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID
from app.services.settings import patch_user_settings
from app.services.user import get_user_by_id
from app.schemas.settings import SettingsPatch
from app.models.settings import Settings
from app.services.settings import get_or_create_settings_by_user_id

class SettingsController:
    @staticmethod
    async def patch(user_id: UUID, settings_data: SettingsPatch, db: AsyncSession) -> Settings:
        user = await get_user_by_id(user_id, db)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        try:
            return await patch_user_settings(user_id, settings_data, db)
        except Exception as e:
            raise HTTPException(status_code=400, detail=str(e))

    @staticmethod
    async def get_by_user_id(user_id: UUID, db: AsyncSession) -> Settings:
        settings = await get_or_create_settings_by_user_id(user_id, db)
        if not settings:
            raise HTTPException(status_code=404, detail="Settings not found for this user")
        return settings