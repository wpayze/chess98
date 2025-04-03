from datetime import timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.models.user import User
from app.models.profile import Profile
from app.schemas.user import UserCreate, UserOut
from app.utils.security import get_password_hash, verify_password
from app.utils.jwt import create_access_token

async def register_user(user_data: UserCreate, db: AsyncSession) -> User:
    result = await db.execute(select(User).filter(User.email == user_data.email))
    if result.scalars().first():
        raise Exception("Email already registered")
    
    result = await db.execute(select(User).filter(User.username == user_data.username))
    if result.scalars().first():
        raise Exception("Username already taken")
    
    hashed_password = get_password_hash(user_data.password)
    new_user = User(
        email=user_data.email,
        username=user_data.username,
        password_hash=hashed_password
    )
    new_profile = Profile(
        user=new_user,
        display_name=user_data.display_name
    )
    
    db.add(new_user)
    db.add(new_profile)
    await db.commit()
    await db.refresh(new_user)
    return new_user

async def login_user(email: str, password: str, db: AsyncSession) -> dict:
    result = await db.execute(select(User).filter(User.email == email))
    user = result.scalars().first()
    if not user or not verify_password(password, user.password_hash):
        raise Exception("Invalid credentials")
    
    token_data = {"sub": user.email, "user_id": str(user.id)}
    access_token = create_access_token(data=token_data, expires_delta=timedelta(minutes=30))
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": UserOut.model_validate(user)
    }