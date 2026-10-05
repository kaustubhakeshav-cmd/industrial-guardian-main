from sqlalchemy import create_engine
from app.database import Base
from app.models import Scenario  # This imports the Scenario model we added

# Sync database URL
SYNC_DATABASE_URL = "postgresql+psycopg2://guardian_user:secure_password_123@localhost:5434/industrial_guardian_db"
engine = create_engine(SYNC_DATABASE_URL)

def create_table():
    print("🚀 Creating scenarios table...")
    # This creates ONLY the scenarios table (and any other missing tables)
    Base.metadata.create_all(bind=engine)
    print("✅ Scenarios table created successfully!")

if __name__ == "__main__":
    create_table()