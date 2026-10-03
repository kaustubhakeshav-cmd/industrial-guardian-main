from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from fastapi.middleware.cors import CORSMiddleware

from app.database import get_db
from app.models import Operator, Sensor, Reading
from app.auth import get_password_hash, verify_password, create_access_token, get_current_user, require_role
from collections import defaultdict
app = FastAPI(title="Industrial Guardian API")

# Allow the React frontend (running on port 5173) to talk to this backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# --- Pydantic Schemas for Request Validation ---
class UserCreate(BaseModel):
    username: str
    password: str
    role: str = "operator" # Defaults to operator if not specified

class Token(BaseModel):
    access_token: str
    token_type: str

# --- API Endpoints ---

@app.post("/operator/register", status_code=status.HTTP_201_CREATED)
async def register_user(user: UserCreate, db: AsyncSession = Depends(get_db)):
    # 1. Check if user already exists
    result = await db.execute(select(Operator).where(Operator.username == user.username))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Username already registered")
    
    # 2. Hash password and create user
    hashed_password = get_password_hash(user.password)
    new_user = Operator(username=user.username, password_hash=hashed_password, role=user.role)
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    return {"message": "User created successfully", "username": new_user.username, "role": new_user.role}

@app.post("/operator/login", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: AsyncSession = Depends(get_db)):
    # 1. Find user by username
    result = await db.execute(select(Operator).where(Operator.username == form_data.username))
    user = result.scalar_one_or_none()
    
    # 2. Verify password
    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # 3. Generate JWT token containing username and role
    access_token = create_access_token(data={"sub": user.username, "role": user.role})
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/operator/me")
async def read_users_me(current_user: Operator = Depends(get_current_user)):
    return {"username": current_user.username, "role": current_user.role}

# --- RBAC Test Endpoint (Engineers Only) ---
@app.get("/engineer/secure-data")
async def get_engineer_data(current_user: Operator = Depends(require_role(["engineer", "admin"]))):
    return {"message": f"Welcome Engineer {current_user.username}. This is secure, write-access data."} 
# --- Pydantic Schemas for Sensor Data ---
class SensorResponse(BaseModel):
    id: int
    sensor_id: str
    name: str
    unit: str
    area: str
    latest_value: Optional[float] = None
    latest_timestamp: Optional[datetime] = None
    is_anomaly: Optional[bool] = False

    class Config:
        from_attributes = True

# --- New API Endpoints for Real Data ---

@app.get("/api/sensors", response_model=List[SensorResponse])
async def get_sensors(db: AsyncSession = Depends(get_db)):
    # 1. Fetch all sensors from the database
    result = await db.execute(select(Sensor))
    sensors = result.scalars().all()
    
    response_data = []
    for sensor in sensors:
        # 2. For each sensor, fetch its single most recent reading
        reading_result = await db.execute(
            select(Reading)
            .where(Reading.sensor_id == sensor.sensor_id)
            .order_by(desc(Reading.timestamp))
            .limit(1)
        )
        latest_reading = reading_result.scalar_one_or_none()
        
        response_data.append({
            "id": sensor.id,
            "sensor_id": sensor.sensor_id,
            "name": sensor.name,
            "unit": sensor.unit,
            "area": sensor.area,
            "latest_value": latest_reading.value if latest_reading else 0.0,
            "latest_timestamp": latest_reading.timestamp if latest_reading else None,
            "is_anomaly": latest_reading.is_anomaly if latest_reading else False
        })
        
    return response_data  
@app.get("/api/chart-data")
async def get_chart_data(db: AsyncSession = Depends(get_db)):
    # We want data for our 4 main sensor types
    target_sensors = ['P-101', 'T-201', 'F-301', 'V-401']
    
    # Fetch the last 40 readings (approx. 10 per sensor) ordered by time
    result = await db.execute(
        select(Reading)
        .where(Reading.sensor_id.in_(target_sensors))
        .order_by(desc(Reading.timestamp))
        .limit(40)
    )
    readings = result.scalars().all()
    
    # Group the readings by timestamp so Recharts can plot them on the same X-axis
    grouped = defaultdict(lambda: {"time": "", "pressure": 0, "temperature": 0, "flow": 0, "vibration": 0})
    
    for r in readings:
        time_str = r.timestamp.strftime("%H:%M")
        grouped[time_str]["time"] = time_str
        
        if r.sensor_id == 'P-101':
            grouped[time_str]["pressure"] = r.value
        elif r.sensor_id == 'T-201':
            grouped[time_str]["temperature"] = r.value
        elif r.sensor_id == 'F-301':
            grouped[time_str]["flow"] = r.value
        elif r.sensor_id == 'V-401':
            grouped[time_str]["vibration"] = r.value
            
    # Convert to a list and sort chronologically for the chart
    chart_data = list(grouped.values())
    chart_data.sort(key=lambda x: x['time'])
    
    return chart_data  