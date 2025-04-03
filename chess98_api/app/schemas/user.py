from datetime import datetime
from enum import Enum
from pydantic import BaseModel, EmailStr, constr
from typing import Optional, Annotated
from uuid import UUID

UsernameStr = Annotated[str, constr(min_length=3, max_length=50)]
PasswordStr = Annotated[str, constr(min_length=8)]

class UserStatus(str, Enum):
    active = "active"
    suspended = "suspended"
    banned = "banned"

class UserRole(str, Enum):
    user = "user"
    moderator = "moderator"
    admin = "admin"

class UserBase(BaseModel):
    email: EmailStr
    username: UsernameStr

class UserCreate(UserBase):
    password: PasswordStr
    display_name: str

class UserOut(BaseModel):
    id: UUID
    email: EmailStr
    username: str
    is_email_verified: bool
    status: UserStatus
    role: UserRole
    created_at: datetime
    last_login_at: Optional[datetime]

    model_config = {
        "from_attributes": True
    }