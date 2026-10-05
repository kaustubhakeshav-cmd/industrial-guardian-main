from sqlalchemy import create_engine
from sqlalchemy.orm import Session
from app.database import Base
from app.models import Incident
from datetime import datetime, timezone, timedelta

# Sync database URL for this script (using port 5434 as we set up earlier)
SYNC_DATABASE_URL = "postgresql+psycopg2://guardian_user:secure_password_123@localhost:5434/industrial_guardian_db"
engine = create_engine(SYNC_DATABASE_URL)

def seed_incidents():
    print("🚀 Creating tables (if they don't exist) and seeding test incidents...")
    
    # 1. THIS IS THE MAGIC LINE: It creates the 'incidents' table if it's missing!
    Base.metadata.create_all(bind=engine)
    
    with Session(engine) as session:
        # 2. Check if incidents already exist
        existing = session.query(Incident).count()
        if existing > 0:
            print(f"ℹ️  {existing} incidents already exist. Skipping seed.")
            return
        
        # 3. Create 5 test incidents
        incidents = [
            Incident(
                sensor_id="P-101",
                timestamp=datetime.now(timezone.utc) - timedelta(hours=2),
                severity="critical",
                status="open",
                description="Pressure spike detected - exceeding safe operating limits"
            ),
            Incident(
                sensor_id="T-201",
                timestamp=datetime.now(timezone.utc) - timedelta(hours=5),
                severity="medium",
                status="investigating",
                description="Temperature fluctuation - possible sensor drift"
            ),
            Incident(
                sensor_id="V-401",
                timestamp=datetime.now(timezone.utc) - timedelta(hours=8),
                severity="low",
                status="open",
                description="Vibration anomaly - minor deviation from baseline"
            ),
            Incident(
                sensor_id="F-301",
                timestamp=datetime.now(timezone.utc) - timedelta(hours=12),
                severity="critical",
                status="open",
                description="Flow rate dropped below minimum threshold"
            ),
            Incident(
                sensor_id="P-102",
                timestamp=datetime.now(timezone.utc) - timedelta(hours=24),
                severity="medium",
                status="open",
                description="Pressure instability - requires calibration check"
            ),
        ]
        
        session.add_all(incidents)
        session.commit()
        
        print(f"✅ Successfully seeded {len(incidents)} test incidents!")

if __name__ == "__main__":
    seed_incidents()