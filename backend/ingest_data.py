import pandas as pd
from sqlalchemy import create_engine, text
from app.database import Base
from app.models import Sensor, Reading

# 1. Create a SYNCHRONOUS engine for this script (Explicitly using psycopg2)
SYNC_DATABASE_URL = "postgresql+psycopg2://guardian_user:secure_password_123@localhost:5434/industrial_guardian_db"
engine = create_engine(SYNC_DATABASE_URL)

def ingest_data():
    print("🚀 Starting data ingestion...")
    
    # 2. Create the new tables in the database (if they don't exist)
    print("Creating tables...")
    Base.metadata.create_all(bind=engine)
    
    # 3. Read the CSV file
    print("Reading hai_dataset.csv...")
    try:
        df = pd.read_csv('hai_dataset.csv')
    except FileNotFoundError:
        print("❌ Error: hai_dataset.csv not found in the backend folder!")
        return

    print(f"Found {len(df)} rows of data.")

    # 4. Process Sensors (Get unique sensors from the CSV to avoid duplicates)
    print("Processing unique sensors...")
    unique_sensors = df[['sensor_id', 'name', 'unit', 'area']].drop_duplicates()
    
    sensor_records = [
        {
            'sensor_id': row['sensor_id'], 
            'name': row['name'], 
            'unit': row['unit'], 
            'area': row['area']
        } for _, row in unique_sensors.iterrows()
    ]

    # 5. Process Readings (The actual time-series data)
    print("Processing telemetry readings...")
    df['timestamp'] = pd.to_datetime(df['timestamp'])
    readings_df = df[['sensor_id', 'timestamp', 'value', 'is_anomaly']].copy()

    # 6. Insert into Database (Using engine.begin() to keep everything in one transaction)
    print("Inserting into PostgreSQL...")
    try:
        with engine.begin() as conn:
            # Insert sensors using UPSERT (ignore if already exists)
            for sensor in sensor_records:
                conn.execute(
                    text("""
                        INSERT INTO sensors (sensor_id, name, unit, area) 
                        VALUES (:sensor_id, :name, :unit, :area)
                        ON CONFLICT (sensor_id) DO NOTHING
                    """),
                    sensor
                )
            print("✅ Sensors inserted successfully.")

            # Bulk insert readings using the SAME connection
            print(f"Inserting {len(readings_df)} readings (this might take a few seconds)...")
            readings_df.to_sql('readings', con=conn, if_exists='append', index=False)
            
        print("✅ Data ingestion complete! Your database is now filled with real telemetry.")
        
    except Exception as e:
        print(f"❌ Error during ingestion: {e}")

if __name__ == "__main__":
    ingest_data()