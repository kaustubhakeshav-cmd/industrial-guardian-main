from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker, declarative_base
from app.config import settings

# Create the async database engine
engine = create_async_engine(settings.DATABASE_URL, echo=False)

# Create a session factory
AsyncSessionLocal = sessionmaker(
    engine, class_=AsyncSession, expire_on_commit=False
)

# Base class for all our database models
Base = declarative_base()

# Dependency to get a database session
async def get_db():
    async with AsyncSessionLocal() as session:
        yield session