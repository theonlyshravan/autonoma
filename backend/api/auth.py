from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from jose import JWTError, jwt
from passlib.context import CryptContext
from datetime import datetime, timedelta
from typing import Optional
import os
from pydantic import BaseModel

from database import get_db
from models import User, UserRole, Vehicle, VehicleType
from schemas import UserRegistration, Token

# Config
SECRET_KEY = os.getenv("JWT_SECRET_KEY", "supersecret")
ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 1440))

router = APIRouter(prefix="/api/auth", tags=["auth"])
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

# Schemas
class TokenData(BaseModel):
    username: Optional[str] = None
    role: Optional[str] = None

# Utils
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(token: str = Depends(oauth2_scheme), db: AsyncSession = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        role: str = payload.get("role")
        if username is None:
            raise credentials_exception
        token_data = TokenData(username=username, role=role)
    except JWTError:
        raise credentials_exception
    
    # Optional: Validate against DB for strictness
    result = await db.execute(select(User).where(User.email == token_data.username))
    user = result.scalars().first()
    if user is None:
        raise credentials_exception
    return user

def require_role(role: UserRole):
    def role_checker(user: User = Depends(get_current_user)):
        if user.role != role:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Operation not permitted for role {user.role}"
            )
        return user
    return role_checker

# Routes
@router.post("/register", response_model=Token)
async def register(reg_data: UserRegistration, db: AsyncSession = Depends(get_db)):
    # Check if user already exists
    existing_user_q = await db.execute(select(User).where(User.email == reg_data.email))
    if existing_user_q.scalars().first():
        raise HTTPException(status_code=400, detail="Email already registered")

    # Check if VIN already exists
    existing_vin_q = await db.execute(select(Vehicle).where(Vehicle.vin == reg_data.vin))
    if existing_vin_q.scalars().first():
        raise HTTPException(status_code=400, detail="Vehicle VIN already registered")

    # Create User
    new_user = User(
        email=reg_data.email,
        password_hash=get_password_hash(reg_data.password),
        role=UserRole.customer,
        full_name=reg_data.full_name,
        phone_number=reg_data.phone_number
    )
    db.add(new_user)
    await db.flush() # Get ID

    # Create Vehicle
    new_vehicle = Vehicle(
        owner_id=new_user.id,
        vin=reg_data.vin,
        model=reg_data.model,
        year=reg_data.year,
        vehicle_type=VehicleType.EV if reg_data.vehicle_type == "EV" else VehicleType.ICE
    )
    db.add(new_vehicle)
    await db.flush() # Ensure vehicle ID is ready

    # Create Initial Simulated Anomaly (For Demo Purposes)
    # This solves the user's "Why is no problem coming?" query.
    from models import AnomalyEvent, AnomalySeverity
    import uuid
    import random
    
    # Randomly assign a problem or keep healthy (for now, ALWAYS assign a problem as user requested "fix it")
    simulated_anomaly = AnomalyEvent(
        id=uuid.uuid4(),
        vehicle_id=new_vehicle.id,
        anomaly_type="Tire Pressure Low" if random.choice([True, False]) else "Brake Fluid Low",
        severity=AnomalySeverity.Medium,
        rul_prediction=200.0,
        sensor_snapshot={"pressure": 28, "fluid_level": 40}
    )
    db.add(simulated_anomaly)

    await db.commit()
    await db.refresh(new_user)

    # Generate Token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": new_user.email, "role": new_user.role.value, "user_id": str(new_user.id)},
        expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token, 
        "token_type": "bearer",
        "role": new_user.role.value,
        "user_id": str(new_user.id)
    }

@router.post("/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == form_data.username))
    user = result.scalars().first()
    
    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email, "role": user.role.value, "user_id": str(user.id)},
        expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token, 
        "token_type": "bearer",
        "role": user.role.value,
        "user_id": str(user.id)
    }
