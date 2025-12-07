
import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    PROJECT_NAME: str = "Autonoma"
    PROJECT_VERSION: str = "1.0.0"
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql+asyncpg://user:password@localhost/autonoma")
    
    # Security
    JWT_SECRET_KEY: str = os.getenv("JWT_SECRET_KEY", "super-secret-key-change-this")
    JWT_ALGORITHM: str = os.getenv("JWT_ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    
    # Data
    DATASET_PATH: str = os.getenv("DATASET_PATH", "../dataset/EV_Predictive_Maintenance_Dataset_15min.csv")

settings = Settings()
