from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from uuid import UUID
from app.models.settings import Settings
from app.schemas.settings import SettingsPatch

async def patch_user_settings(user_id: UUID, settings_data: SettingsPatch, db: AsyncSession) -> Settings:
    result = await db.execute(select(Settings).filter(Settings.user_id == user_id))
    settings = result.scalars().first()

    if not settings:
        raise Exception("Settings not found for this user")

    data_dict = settings_data.model_dump(exclude_unset=True)

    for key, value in data_dict.items():
        setattr(settings, key, value)

    await db.commit()
    await db.refresh(settings)
    return settings

async def get_or_create_settings_by_user_id(user_id: UUID, db: AsyncSession) -> Settings:
    result = await db.execute(select(Settings).filter(Settings.user_id == user_id))
    settings = result.scalar_one_or_none()

    if settings:
        return settings

    new_settings = Settings(user_id=user_id)
    db.add(new_settings)
    await db.commit()
    await db.refresh(new_settings)
    return new_settings