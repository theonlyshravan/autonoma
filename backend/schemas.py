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
    full_name: Optional[str] = None
    phone_number: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserRegistration(BaseModel):
    # User Details
    email: EmailStr
    password: str
    full_name: str
    phone_number: str
    
    # Vehicle Details
    vin: str
    model: str
    year: int
    vehicle_type: str = "EV"

class User(UserBase):
    id: UUID
    is_active: bool = True
    full_name: Optional[str] = None
    phone_number: Optional[str] = None

    class Config:
        from_attributes = True
