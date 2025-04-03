from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel
from app.database.connection import get_db
from app.controllers.auth import AuthController
from app.schemas.user import UserCreate, UserOut

class LoginRequest(BaseModel):
    email: str
    password: str

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/register", response_model=UserOut)
async def register(user: UserCreate, db: AsyncSession = Depends(get_db)):
    """
    Endpoint para registrar un nuevo usuario.
    """
    return await AuthController.register(user, db)

@router.post("/login")
async def login(login_data: LoginRequest, db: AsyncSession = Depends(get_db)):
    """
    Endpoint para iniciar sesión y obtener un JWT.
    """
    return await AuthController.login(login_data.email, login_data.password, db)
