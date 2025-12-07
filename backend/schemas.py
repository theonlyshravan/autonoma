from pydantic import BaseModel, EmailStr
from typing import Optional, List
from uuid import UUID
from enum import Enum

class UserRole(str, Enum):
    customer = "customer"
    service = "service"
    manufacturer = "manufacturer"

class Token(BaseModel):
    access_token: str
    token_type: str
    role: str

class TokenData(BaseModel):
    id: Optional[UUID] = None
    role: Optional[str] = None

class UserBase(BaseModel):
    email: EmailStr
    role: UserRole

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class User(UserBase):
    id: UUID
    is_active: bool = True

    class Config:
        from_attributes = True
