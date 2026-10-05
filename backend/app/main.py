from fastapi import FastAPI, Depends, HTTPException, status,WebSocket 
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from fastapi.middleware.cors import CORSMiddleware
from app.websocket_manager import manager
import asyncio
import random
from app.database import get_db
from app.models import Operator, Sensor, Reading
from app.auth import get_password_hash, verify_password, create_access_token, get_current_user, require_role
from collections import defaultdict
from datetime import datetime, timezone
from app.models import Incident
from fastapi.responses import StreamingResponse
import csv
import io
from app.models import Scenario
from pydantic import BaseModel
from typing import Optional, Dict, Any
app = FastAPI(title="Industrial Guardian API")

# Allow the React frontend (running on port 5173) to talk to this backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost", "http://127.0.0.1"], 
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
# --- WebSocket Endpoint ---
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            # Keep connection alive. We push data FROM server, so we just wait here.
            await websocket.receive_text()
    except Exception as e:
        print(f"WebSocket error: {e}")
    finally:
        manager.disconnect(websocket)
# --- Pydantic Schema for Incidents ---
class IncidentResponse(BaseModel):
    id: int
    sensor_id: str
    timestamp: datetime
    severity: str
    status: str
    description: Optional[str] = None
    resolved_at: Optional[datetime] = None
    resolved_by: Optional[str] = None

    class Config:
        from_attributes = True

# --- API Endpoints for Incident Management ---

@app.get("/api/incidents", response_model=List[IncidentResponse])
async def get_incidents(db: AsyncSession = Depends(get_db)):
    # Get all incidents, ordered by newest first
    result = await db.execute(
        select(Incident)
        .order_by(desc(Incident.timestamp))
    )
    incidents = result.scalars().all()
    return incidents

@app.put("/api/incidents/{incident_id}/resolve", response_model=IncidentResponse)
async def resolve_incident(incident_id: int, db: AsyncSession = Depends(get_db)):
    # Find the incident
    result = await db.execute(
        select(Incident).where(Incident.id == incident_id)
    )
    incident = result.scalar_one_or_none()
    
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")
    
    # Update the status
    incident.status = "resolved"
    incident.resolved_at = datetime.now(timezone.utc)
    incident.resolved_by = "test_operator" # In real app, get from current user
    
    await db.commit()
    await db.refresh(incident)
    
    # Broadcast update to all WebSocket clients (optional, for real-time dashboard updates)
    await manager.broadcast({
        "type": "incident_resolved",
        "incident_id": incident_id,
        "timestamp": datetime.now().isoformat()
    })
    
    return incident
# --- Export Incidents as CSV ---
@app.get("/api/incidents/export")
async def export_incidents_csv(db: AsyncSession = Depends(get_db)):
    # Fetch all incidents from database
    result = await db.execute(
        select(Incident).order_by(desc(Incident.timestamp))
    )
    incidents = result.scalars().all()
    
    # Create CSV in memory
    output = io.StringIO()
    writer = csv.writer(output)
    
    # Write header
    writer.writerow([
        "ID", "Sensor ID", "Timestamp", "Severity", 
        "Status", "Description", "Resolved At", "Resolved By"
    ])
    
    # Write data rows
    for incident in incidents:
        writer.writerow([
            incident.id,
            incident.sensor_id,
            incident.timestamp.isoformat() if incident.timestamp else "",
            incident.severity,
            incident.status,
            incident.description or "",
            incident.resolved_at.isoformat() if incident.resolved_at else "",
            incident.resolved_by or ""
        ])
    
    # Create the response
    output.seek(0)
    return StreamingResponse(
        output,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=incidents_export.csv"}
    )
# --- Get All Users (for Settings/Admin page) ---
class UserResponse(BaseModel):
    id: int
    username: str
    role: str

    class Config:
        from_attributes = True

@app.get("/api/operators", response_model=List[UserResponse])
async def get_operators(db: AsyncSession = Depends(get_db)):
    # Fetch all users from the database
    result = await db.execute(
        select(Operator).order_by(Operator.id)
    )
    operators = result.scalars().all()
    return operators   
# --- Pydantic Schemas for Scenarios ---
class ScenarioCreate(BaseModel):
    name: str
    description: Optional[str] = None
    parameters: Optional[Dict[str, Any]] = None

class ScenarioResponse(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    created_by: Optional[str] = None
    created_at: datetime
    parameters: Optional[Dict[str, Any]] = None
    is_active: bool

    class Config:
        from_attributes = True

# --- API Endpoints for Scenario Management ---

@app.post("/api/scenarios", response_model=ScenarioResponse)
async def create_scenario(scenario: ScenarioCreate, db: AsyncSession = Depends(get_db)):
    """Create a new simulation scenario"""
    db_scenario = Scenario(
        name=scenario.name,
        description=scenario.description,
        parameters=scenario.parameters,
        created_by="test_engineer"  # In real app, get from current user
    )
    db.add(db_scenario)
    await db.commit()
    await db.refresh(db_scenario)
    return db_scenario

@app.get("/api/scenarios", response_model=List[ScenarioResponse])
async def get_scenarios(db: AsyncSession = Depends(get_db)):
    """Get all simulation scenarios"""
    result = await db.execute(
        select(Scenario).order_by(desc(Scenario.created_at))
    )
    scenarios = result.scalars().all()
    return scenarios

@app.put("/api/scenarios/{scenario_id}/run", response_model=ScenarioResponse)
async def run_scenario(scenario_id: int, db: AsyncSession = Depends(get_db)):
    """Run/execute a simulation scenario"""
    # Find the scenario
    result = await db.execute(
        select(Scenario).where(Scenario.id == scenario_id)
    )
    scenario = result.scalar_one_or_none()
    
    if not scenario:
        raise HTTPException(status_code=404, detail="Scenario not found")
    
    # Here you would implement the actual simulation logic
    # For now, we'll just mark it as "executed" by updating a timestamp
    # In a real implementation, this would:
    # 1. Read the parameters (which sensors to affect)
    # 2. Inject simulated data into the readings table
    # 3. Trigger anomaly detection
    # 4. Create incidents if thresholds are exceeded
    
    print(f"🎬 Running scenario: {scenario.name}")
    print(f"   Parameters: {scenario.parameters}")
    
    # Broadcast to WebSocket clients that a scenario is running
    await manager.broadcast({
        "type": "scenario_running",
        "scenario_id": scenario.id,
        "scenario_name": scenario.name,
        "timestamp": datetime.now().isoformat()
    })
    
    return scenario

@app.delete("/api/scenarios/{scenario_id}")
async def delete_scenario(scenario_id: int, db: AsyncSession = Depends(get_db)):
    """Delete a simulation scenario"""
    result = await db.execute(
        select(Scenario).where(Scenario.id == scenario_id)
    )
    scenario = result.scalar_one_or_none()
    
    if not scenario:
        raise HTTPException(status_code=404, detail="Scenario not found")
    
    await db.delete(scenario)
    await db.commit()
    
    return {"message": "Scenario deleted successfully"}        
# --- Background Task: Simulate Live Data Stream ---
# This runs independently and pushes data to all connected clients every 2 seconds
async def live_data_stream():
    print("🚀 Starting Live Data Stream background task...")
    # Start with base values similar to our HAI dataset
    values = {
        "pressure": 70.0,
        "temperature": 140.0,
        "flow": 38.0,
        "vibration": 2.0
    }
    
    while True:
        # Simulate slight random fluctuations (random walk)
        values["pressure"] += random.uniform(-0.5, 0.5)
        values["temperature"] += random.uniform(-1.0, 1.0)
        values["flow"] += random.uniform(-0.3, 0.3)
        values["vibration"] += random.uniform(-0.1, 0.1)
        
        # Inject occasional anomaly spikes
        if random.random() < 0.05: # 5% chance
            values["pressure"] += 5.0 # Spike
            
        payload = {
    "time": datetime.now().strftime("%H:%M:%S"), # Real clock time
    "pressure": round(values["pressure"], 2),
    "temperature": round(values["temperature"], 2),
    "flow": round(values["flow"], 2),
    "vibration": round(values["vibration"], 2)
}
        
        await manager.broadcast(payload)
        await asyncio.sleep(2) # Push new data every 2 seconds

# --- Register the Background Task ---
@app.on_event("startup")
async def start_background_task():
    asyncio.create_task(live_data_stream())    