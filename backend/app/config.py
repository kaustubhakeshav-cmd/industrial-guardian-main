from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # Database credentials (must match your docker-compose.yml)
    DATABASE_URL: str = "postgresql+asyncpg://guardian_user:secure_password_123@localhost:5432/industrial_guardian_db"
    
    # Security settings for JWT tokens
    SECRET_KEY: str = "your_super_secret_key_change_this_in_production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    class Config:
        env_file = ".env"

settings = Settings()