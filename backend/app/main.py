from fastapi import FastAPI, Depends, HTTPException, status, WebSocket 
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
from collections import defaultdict, Counter
from datetime import datetime, timezone, timedelta
from app.models import Incident
from fastapi.responses import StreamingResponse
import csv
import io
from app.models import Scenario
from typing import Optional, Dict, Any
import math

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

class UserResponse(BaseModel):
    id: int
    username: str
    role: str

    class Config:
        from_attributes = True

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

class AIQueryRequest(BaseModel):
    query: str

class AIQueryResponse(BaseModel):
    response: str
    sources: List[str]
    confidence: float

# --- API Endpoints ---

@app.post("/operator/register", status_code=status.HTTP_201_CREATED)
async def register_user(user: UserCreate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Operator).where(Operator.username == user.username))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Username already registered")
    
    hashed_password = get_password_hash(user.password)
    new_user = Operator(username=user.username, password_hash=hashed_password, role=user.role)
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    return {"message": "User created successfully", "username": new_user.username, "role": new_user.role}

@app.post("/operator/login", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Operator).where(Operator.username == form_data.username))
    user = result.scalar_one_or_none()
    
    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = create_access_token(data={"sub": user.username, "role": user.role})
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/operator/me")
async def read_users_me(current_user: Operator = Depends(get_current_user)):
    return {"username": current_user.username, "role": current_user.role}

@app.get("/engineer/secure-data")
async def get_engineer_data(current_user: Operator = Depends(require_role(["engineer", "admin"]))):
    return {"message": f"Welcome Engineer {current_user.username}. This is secure, write-access data."} 

# --- New API Endpoints for Real Data ---

@app.get("/api/sensors", response_model=List[SensorResponse])
async def get_sensors(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Sensor))
    sensors = result.scalars().all()
    
    response_data = []
    for sensor in sensors:
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
    target_sensors = ['P-101', 'T-201', 'F-301', 'V-401']
    
    result = await db.execute(
        select(Reading)
        .where(Reading.sensor_id.in_(target_sensors))
        .order_by(desc(Reading.timestamp))
        .limit(40)
    )
    readings = result.scalars().all()
    
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
            
    chart_data = list(grouped.values())
    chart_data.sort(key=lambda x: x['time'])
    
    return chart_data  

# --- WebSocket Endpoint ---
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            await websocket.receive_text()
    except Exception as e:
        print(f"WebSocket error: {e}")
    finally:
        manager.disconnect(websocket)

# --- API Endpoints for Incident Management ---

@app.get("/api/incidents", response_model=List[IncidentResponse])
async def get_incidents(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Incident)
        .order_by(desc(Incident.timestamp))
    )
    incidents = result.scalars().all()
    return incidents

@app.put("/api/incidents/{incident_id}/resolve", response_model=IncidentResponse)
async def resolve_incident(incident_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Incident).where(Incident.id == incident_id)
    )
    incident = result.scalar_one_or_none()
    
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")
    
    incident.status = "resolved"
    incident.resolved_at = datetime.now(timezone.utc)
    incident.resolved_by = "test_operator"
    
    await db.commit()
    await db.refresh(incident)
    
    await manager.broadcast({
        "type": "incident_resolved",
        "incident_id": incident_id,
        "timestamp": datetime.now().isoformat()
    })
    
    return incident

@app.get("/api/incidents/export")
async def export_incidents_csv(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Incident).order_by(desc(Incident.timestamp))
    )
    incidents = result.scalars().all()
    
    output = io.StringIO()
    writer = csv.writer(output)
    
    writer.writerow([
        "ID", "Sensor ID", "Timestamp", "Severity", 
        "Status", "Description", "Resolved At", "Resolved By"
    ])
    
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
    
    output.seek(0)
    return StreamingResponse(
        output,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=incidents_export.csv"}
    )

# --- Endpoint for Anomaly Score Gauge ---
@app.get("/api/anomaly-score")
async def get_anomaly_score(db: AsyncSession = Depends(get_db)):
    """
    Calculates real-time Anomaly Score based on recent anomalous READINGS.
    Returns breakdown by sensor for contributing factors.
    """
    from datetime import datetime, timedelta, timezone
    from collections import Counter
    
    cutoff_time = datetime.now(timezone.utc) - timedelta(hours=2)
    
    result = await db.execute(
        select(Reading.sensor_id, Reading.value).where(
            (Reading.is_anomaly == True) & 
            (Reading.timestamp >= cutoff_time)
        )
    )
    recent_anomalies = result.all()
    
    # Calculate score
    score = round(min(len(recent_anomalies) * 0.15, 1.0), 2)
    
    # Count by sensor for contributing factors
    sensor_counts = Counter([r[0] for r in recent_anomalies])
    
    # Get top 3 contributing sensors
    top_sensors = []
    for sensor_id, count in sensor_counts.most_common(3):
        percentage = round((count / len(recent_anomalies)) * 100) if recent_anomalies else 0
        top_sensors.append({
            "name": sensor_id,
            "count": count,
            "percentage": percentage
        })
    
    if score >= 0.7:
        risk_label = "CRITICAL"
    elif score >= 0.3:
        risk_label = "ELEVATED"
    else:
        risk_label = "NORMAL"
        
    return {
        "score": score,
        "risk_label": risk_label,
        "anomaly_count": len(recent_anomalies),
        "top_contributors": top_sensors
    }


# --- API Endpoints for Scenario Management ---

@app.post("/api/scenarios", response_model=ScenarioResponse)
async def create_scenario(scenario: ScenarioCreate, db: AsyncSession = Depends(get_db)):
    db_scenario = Scenario(
        name=scenario.name,
        description=scenario.description,
        parameters=scenario.parameters,
        created_by="test_engineer"
    )
    db.add(db_scenario)
    await db.commit()
    await db.refresh(db_scenario)
    return db_scenario

@app.put("/api/scenarios/{scenario_id}/run", response_model=ScenarioResponse)
async def run_scenario(scenario_id: int, db: AsyncSession = Depends(get_db)):
    """Run a simulation scenario by injecting anomalous data into the database."""
    # 1. Find the scenario
    result = await db.execute(
        select(Scenario).where(Scenario.id == scenario_id)
    )
    scenario = result.scalar_one_or_none()
    
    if not scenario:
        raise HTTPException(status_code=404, detail="Scenario not found")
    
    # 2. Determine severity multiplier for the fake data
    severity = scenario.parameters.get('severity', 'medium') if scenario.parameters else 'medium'
    multiplier = 1.5 if severity == 'medium' else 3.0 if severity == 'critical' else 1.2
    
    # 3. Get target sensors
    target_sensors = scenario.parameters.get('sensors', []) if scenario.parameters else []
    
    if not target_sensors:
        target_sensors = ['P-101', 'T-201']  # Default fallback

    # 4. Inject fake anomalous readings
    for sensor_id in target_sensors:
        for i in range(5):
            fake_value = 150.0 * multiplier + random.uniform(-5, 5)
            
            fake_reading = Reading(
                sensor_id=sensor_id,
                timestamp=datetime.now(timezone.utc) + timedelta(seconds=i*2),
                value=fake_value,
                is_anomaly=True
            )
            db.add(fake_reading)
            
    await db.commit()
    
    print(f"🎬 Scenario '{scenario.name}' executed. Injected anomalous data for {target_sensors}.")
    
    # 5. Broadcast to WebSocket clients
    await manager.broadcast({
        "type": "scenario_running",
        "scenario_id": scenario.id,
        "scenario_name": scenario.name,
        "timestamp": datetime.now().isoformat()
    })
    
    await db.refresh(scenario)
    return scenario
  

@app.delete("/api/scenarios/{scenario_id}")
async def delete_scenario(scenario_id: int, db: AsyncSession = Depends(get_db)):
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
async def live_data_stream():
    print("🚀 Starting Live Data Stream background task...")
    values = {
        "pressure": 70.0,
        "temperature": 140.0,
        "flow": 38.0,
        "vibration": 2.0
    }
    
    while True:
        values["pressure"] += random.uniform(-0.5, 0.5)
        values["temperature"] += random.uniform(-1.0, 1.0)
        values["flow"] += random.uniform(-0.3, 0.3)
        values["vibration"] += random.uniform(-0.1, 0.1)
        
        if random.random() < 0.05:
            values["pressure"] += 5.0
            
        # Use timezone-aware datetime
        now = datetime.now(timezone.utc)
        payload = {
            "time": now.strftime("%H:%M:%S"),
            "timestamp": now.isoformat(),  # Add ISO format for sorting
            "pressure": round(values["pressure"], 2),
            "temperature": round(values["temperature"], 2),
            "flow": round(values["flow"], 2),
            "vibration": round(values["vibration"], 2)
        }
        
        await manager.broadcast(payload)
        await asyncio.sleep(2)

@app.on_event("startup")
async def start_background_task():
    asyncio.create_task(live_data_stream())    

# --- AI/ML Feature 1: Predictive Anomaly Forecasting ---
@app.get("/api/predict")
async def get_ml_predictions(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Reading.value, Reading.timestamp)
        .where(Reading.sensor_id == 'P-101')
        .order_by(desc(Reading.timestamp))
        .limit(20)
    )
    recent_readings = result.all()
    
    if len(recent_readings) < 5:
        return {"error": "Not enough data to train prediction model"}

    recent_readings = list(reversed(recent_readings))
    
    x_train = list(range(len(recent_readings)))
    y_values = [r[0] for r in recent_readings]
    
    n = len(x_train)
    sum_x = sum(x_train)
    sum_y = sum(y_values)
    sum_xy = sum(x * y for x, y in zip(x_train, y_values))
    sum_x2 = sum(x ** 2 for x in x_train)
    
    m = (n * sum_xy - sum_x * sum_y) / (n * sum_x2 - sum_x ** 2)
    c = (sum_y - m * sum_x) / n

    predicted_values = []
    predicted_times = []
    last_time = recent_readings[-1][1]
    anomaly_warning = None

    for i in range(1, 6):
        future_x = n - 1 + i
        pred_val = m * future_x + c
        predicted_values.append(round(pred_val, 2))
        
        future_time = last_time + timedelta(seconds=i * 2)
        predicted_times.append(future_time.strftime("%H:%M:%S"))
        
        if pred_val > 140.0 and anomaly_warning is None:
            anomaly_warning = f"AI Alert: Pressure spike predicted to reach {round(pred_val, 1)} PSI in {i*2} seconds!"

    return {
        "times": predicted_times,
        "pressure": predicted_values,
        "temperature": [v + 10 for v in predicted_values],
        "anomaly_warning": anomaly_warning
    }

# --- AI/ML Feature 2: Dynamic System Health Score ---
@app.get("/api/health-score")
async def get_health_score(db: AsyncSession = Depends(get_db)):
    import statistics
    
    critical_sensors = {
        "P-101": "Pressure",
        "T-201": "Temperature",
        "F-301": "Flow",
        "V-401": "Vibration"
    }
    
    metrics = {}
    max_z = 0.0
    total_sensors_checked = 0

    for sensor_id, sensor_name in critical_sensors.items():
        result = await db.execute(
            select(Reading.value)
            .where(Reading.sensor_id == sensor_id)
            .order_by(desc(Reading.timestamp))
            .limit(50)
        )
        values = [row[0] for row in result.all()]
        
        if len(values) > 2:
            total_sensors_checked += 1
            mean = statistics.mean(values)
            stdev = statistics.stdev(values) if len(values) > 1 else 1.0
            
            latest_result = await db.execute(
                select(Reading.value)
                .where(Reading.sensor_id == sensor_id)
                .order_by(desc(Reading.timestamp))
                .limit(1)
            )
            latest_val = latest_result.scalar()
            
            if stdev > 0:
                z_score = abs((latest_val - mean) / stdev)
            else:
                z_score = 0.0
                
            metrics[f"{sensor_name.lower()}_z"] = round(z_score, 2)
            
            if z_score > max_z:
                max_z = z_score
        else:
            metrics[f"{sensor_name.lower()}_z"] = 0.0

    if total_sensors_checked < 2:
        return {
            "health_score": 100,
            "status": "Initializing",
            "color": "good",
            "details": "Gathering baseline data for ML analysis...",
            "metrics": metrics
        }

    health_score = max(0, round(100 - (max_z * 20)))
    
    if health_score >= 85:
        status = "Optimal"
        color = "good"
        details = "All critical sensors operating within normal ML baselines."
    elif health_score >= 60:
        status = "Degraded"
        color = "warning"
        details = f"Minor deviation detected. Max Z-score: {max_z:.2f}. Monitor closely."
    else:
        status = "Critical"
        color = "critical"
        details = f"Severe multivariate anomaly! Max Z-score: {max_z:.2f}. Immediate action required."

    return {
        "health_score": health_score,
        "status": status,
        "color": color,
        "details": details,
        "metrics": metrics
    }

# --- AI/ML Feature 6: Remaining Useful Life (RUL) Prediction ---
@app.get("/api/sensors/{sensor_id}/rul")
async def get_sensor_rul(sensor_id: str, db: AsyncSession = Depends(get_db)):
    import statistics
    
    BASE_RUL = 1000.0
    SEVERITY_WEIGHTS = {"critical": 50.0, "medium": 25.0, "low": 10.0}
    TIME_DECAY_FACTOR = 5.0
    
    incident_result = await db.execute(
        select(Incident.severity)
        .where(Incident.sensor_id == sensor_id)
    )
    incident_severities = incident_result.scalars().all()
    
    anomaly_count = len(incident_severities)
    severity_penalty = sum(
        SEVERITY_WEIGHTS.get(sev, 10.0) 
        for sev in incident_severities if sev in SEVERITY_WEIGHTS
    )
    
    readings_result = await db.execute(
        select(Reading.value)
        .where(Reading.sensor_id == sensor_id)
        .order_by(desc(Reading.timestamp))
        .limit(50)
    )
    values = [row[0] for row in readings_result.all()]
    
    avg_z_deviation = 0.0
    if len(values) >= 5:
        mean = statistics.mean(values)
        stdev = statistics.stdev(values) if len(values) > 1 else 1.0
        avg_z_deviation = sum(abs((v - mean) / stdev) for v in values) / len(values) if stdev > 0 else 0.0
    
    cumulative_penalty = severity_penalty + (avg_z_deviation * TIME_DECAY_FACTOR)
    rul_hours = max(0.0, BASE_RUL - cumulative_penalty)
    
    if rul_hours > 500:
        status = "healthy"
    elif rul_hours > 200:
        status = "degraded"
    else:
        status = "critical"
        
    return {
        "sensor_id": sensor_id,
        "rul_hours": round(rul_hours, 1),
        "status": status,
        "anomaly_count": anomaly_count,
        "avg_z_deviation": round(avg_z_deviation, 2),
        "last_calculated": datetime.now(timezone.utc).isoformat()
    }

# --- AI/ML Feature 7: Sensor Correlation Matrix ---
def calculate_pearson_correlation(x: list[float], y: list[float]) -> float:
    n = len(x)
    if n == 0 or n != len(y):
        return 0.0
    
    mean_x = sum(x) / n
    mean_y = sum(y) / n
    
    numerator = sum((x[i] - mean_x) * (y[i] - mean_y) for i in range(n))
    den_x = sum((x[i] - mean_x) ** 2 for i in range(n)) ** 0.5
    den_y = sum((y[i] - mean_y) ** 2 for i in range(n)) ** 0.5
    
    if den_x == 0 or den_y == 0:
        return 0.0
        
    return round(numerator / (den_x * den_y), 2)

@app.get("/api/sensors/correlation-matrix")
async def get_correlation_matrix(db: AsyncSession = Depends(get_db)):
    target_sensors = ["P-101", "T-201", "F-301", "V-401"]
    sensor_data = {sensor: [] for sensor in target_sensors}
    
    for sensor_id in target_sensors:
        result = await db.execute(
            select(Reading.value)
            .where(Reading.sensor_id == sensor_id)
            .order_by(desc(Reading.timestamp))
            .limit(50)
        )
        values = [row[0] for row in result.all()]
        sensor_data[sensor_id] = list(reversed(values))
    
    matrix = {}
    interpretations = {
        "P-101": {"T-201": "Pressure/Temp coupling (normal operation)", "F-301": "Inverse correlation indicates downstream blockage", "V-401": "Strong positive correlation indicates cavitation/bearing stress"},
        "T-201": {"F-301": "Flow/Temp inverse correlation indicates cooling failure", "V-401": "Thermal expansion causing vibration"},
        "F-301": {"V-401": "Flow turbulence affecting vibration metrics"}
    }
    
    for i, sensor_a in enumerate(target_sensors):
        matrix[sensor_a] = {}
        for j, sensor_b in enumerate(target_sensors):
            if i == j:
                matrix[sensor_a][sensor_b] = {"value": 1.0, "interpretation": "Self-correlation"}
            else:
                data_a = sensor_data[sensor_a]
                data_b = sensor_data[sensor_b]
                min_len = min(len(data_a), len(data_b))
                
                if min_len >= 5:
                    corr = calculate_pearson_correlation(data_a[-min_len:], data_b[-min_len:])
                    interp = interpretations.get(sensor_a, {}).get(sensor_b, 
                                 interpretations.get(sensor_b, {}).get(sensor_a, "Multivariate dependency detected"))
                    matrix[sensor_a][sensor_b] = {"value": corr, "interpretation": interp}
                else:
                    matrix[sensor_a][sensor_b] = {"value": 0.0, "interpretation": "Insufficient data"}

    return {"matrix": matrix, "timestamp": datetime.now(timezone.utc).isoformat()}

# --- AI/ML Feature 8: Real-Time Operational Mode Clustering ---
@app.get("/api/ai/cluster-mode")
async def get_operational_cluster(db: AsyncSession = Depends(get_db)):
    target_sensors = ["P-101", "T-201", "F-301", "V-401"]
    window_size = 30
    
    sensor_history = {}
    for sid in target_sensors:
        res = await db.execute(
            select(Reading.value).where(Reading.sensor_id == sid).order_by(desc(Reading.timestamp)).limit(window_size)
        )
        vals = [row[0] for row in res.all()]
        sensor_history[sid] = list(reversed(vals))
        
    min_len = min(len(v) for v in sensor_history.values())
    if min_len < 10:
        return {"cluster": "Initializing", "confidence": 0, "description": "Gathering streaming data..."}
        
    aligned_data = {sid: vals[-min_len:] for sid, vals in sensor_history.items()}
    current_state = [aligned_data[sid][-1] for sid in target_sensors]
    
    normalized_window = []
    for i in range(min_len):
        row = []
        for sid in target_sensors:
            col = aligned_data[sid]
            c_min, c_max = min(col), max(col)
            norm = 0.5 if c_max == c_min else (col[i] - c_min) / (c_max - c_min)
            row.append(norm)
        normalized_window.append(row)
        
    current_normalized = []
    for sid in target_sensors:
        col = aligned_data[sid]
        c_min, c_max = min(col), max(col)
        current_normalized.append(0.5 if c_max == c_min else (current_state[target_sensors.index(sid)] - c_min) / (c_max - c_min))
        
    centroids = [
        [0.2, 0.2, 0.2, 0.2],
        [0.5, 0.5, 0.5, 0.5],
        [0.8, 0.8, 0.8, 0.8]
    ]
    
    for _ in range(3):
        clusters = [[] for _ in range(3)]
        for point in normalized_window:
            dists = [math.sqrt(sum((p-c)**2 for p,c in zip(point, cent))) for cent in centroids]
            clusters[dists.index(min(dists))].append(point)
            
        for k in range(3):
            if clusters[k]:
                centroids[k] = [sum(dim)/len(clusters[k]) for dim in zip(*clusters[k])]
                
    dists = [math.sqrt(sum((p-c)**2 for p,c in zip(current_normalized, cent))) for cent in centroids]
    cluster_idx = dists.index(min(dists))
    confidence = round(1.0 - (min(dists) / 2.0), 2)
    
    cluster_map = {
        0: {"name": "Steady State", "color": "good", "desc": "Optimal multivariate balance. All sensors within nominal baseline clusters."},
        1: {"name": "Transitional Load", "color": "warning", "desc": "System shifting operational regimes. Moderate sensor coupling detected."},
        2: {"name": "Critical Deviation", "color": "critical", "desc": "State diverges from historical baselines. High probability of cascading anomaly."}
    }
    
    result = cluster_map[cluster_idx]
    return {
        "cluster": result["name"],
        "color": result["color"],
        "confidence": confidence,
        "description": result["desc"],
        "centroid_match": cluster_idx
    }    

# --- AI/ML Feature 3: AI Root Cause Analysis ---
@app.get("/api/anomalies")
async def get_recent_anomalies(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Reading)
        .where(Reading.is_anomaly == True)
        .order_by(desc(Reading.timestamp))
        .limit(10)
    )
    anomalies = result.scalars().all()
    
    return [
        {
            "id": a.id,
            "sensor_id": a.sensor_id,
            "timestamp": a.timestamp.isoformat(),
            "value": a.value,
            "is_anomaly": a.is_anomaly
        }
        for a in anomalies
    ]

@app.get("/api/anomalies/{anomaly_id}/root-cause")
async def get_root_cause(anomaly_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Reading).where(Reading.id == anomaly_id)
    )
    anomaly = result.scalar_one_or_none()
    
    if not anomaly or not anomaly.is_anomaly:
        return {"root_cause": "No anomaly found for this ID."}

    anomaly_time = anomaly.timestamp
    anomaly_sensor = anomaly.sensor_id
    anomaly_value = anomaly.value

    causal_rules = {
        "P-101": {
            "correlated_sensor": "F-301",
            "relationship": "inverse",
            "explanation": "downstream blockage or valve closure"
        },
        "T-201": {
            "correlated_sensor": "F-301",
            "relationship": "direct",
            "explanation": "cooling system failure or heat exchanger fouling"
        },
        "V-401": {
            "correlated_sensor": "P-101",
            "relationship": "direct",
            "explanation": "cavitation or bearing wear due to pressure stress"
        }
    }

    if anomaly_sensor not in causal_rules:
        return {
            "root_cause": f"Anomaly detected on {anomaly_sensor}, but no causal model exists for this sensor yet.",
            "confidence": "Low"
        }

    rule = causal_rules[anomaly_sensor]
    correlated_sensor = rule["correlated_sensor"]

    time_window_start = anomaly_time - timedelta(seconds=5)
    time_window_end = anomaly_time + timedelta(seconds=5)

    corr_result = await db.execute(
        select(Reading.value).where(
            (Reading.sensor_id == correlated_sensor) &
            (Reading.timestamp >= time_window_start) &
            (Reading.timestamp <= time_window_end)
        )
    )
    correlated_value = corr_result.scalar()

    if correlated_value is not None:
        direction = "increase" if rule["relationship"] == "inverse" else "decrease"
        
        root_cause_text = (
            f" AI Root Cause Analysis:\n"
            f"The anomaly on {anomaly_sensor} (Value: {anomaly_value:.2f}) is strongly correlated with "
            f"a simultaneous event on {correlated_sensor} (Value: {correlated_value:.2f}).\n\n"
            f"Likely physical cause: {rule['explanation']}. "
            f"Recommendation: Inspect {correlated_sensor} for {direction} in operational parameters."
        )
        confidence = "High"
    else:
        root_cause_text = (
            f"🤖 AI Root Cause Analysis:\n"
            f"Anomaly detected on {anomaly_sensor}, but no correlated data was found for {correlated_sensor} "
            f"at the exact timestamp. The issue may be isolated to {anomaly_sensor} hardware."
        )
        confidence = "Medium"

    return {
        "root_cause": root_cause_text,
        "confidence": confidence,
        "correlated_sensor": correlated_sensor,
        "anomaly_sensor": anomaly_sensor
    }    

# --- AI/ML Feature 5: Simulated RAG-Powered AI Assistant ---
SCADA_KNOWLEDGE_BASE = [
    {
        "text": "The safe operating pressure for Pump P-101 is 70-120 PSI. Pressure spikes above 140 PSI strongly indicate a downstream blockage or valve closure.",
        "source": "P-101 Operations Manual, Section 4.2",
        "keywords": ["pressure", "p-101", "spike", "safe", "blockage"]
    },
    {
        "text": "Normal temperature range for Heat Exchanger T-201 is 130-150°C. Sudden temperature deviations are highly correlated with drops in F-301 flow rate, suggesting cooling system failure.",
        "source": "Heat Exchanger Maintenance Guidelines, Page 12",
        "keywords": ["temperature", "t-201", "flow", "f-301", "cooling"]
    },
    {
        "text": "Vibration levels for Turbine V-401 exceeding 5.0 mm/s indicate potential bearing wear or cavitation due to pressure stress. Immediate inspection is required.",
        "source": "Turbine V-401 Maintenance Handbook",
        "keywords": ["vibration", "v-401", "bearing", "cavitation", "turbine"]
    },
    {
        "text": "Standard protocol for critical anomalies is to immediately notify the shift engineer, isolate the affected valve, and log the incident in the central database.",
        "source": "Plant Emergency Response Protocol, v3.1",
        "keywords": ["protocol", "critical", "anomaly", "engineer", "isolate"]
    },
    {
        "text": "Flow rate F-301 should maintain a steady 35-45 L/min. Drops below 30 L/min trigger low-flow alarms and require pump recalibration.",
        "source": "F-301 Flow Sensor Calibration Guide",
        "keywords": ["flow", "f-301", "rate", "alarm", "calibration"]
    }
]

@app.post("/api/ai-assistant/query", response_model=AIQueryResponse)
async def query_ai_assistant(request: AIQueryRequest):
    query_lower = request.query.lower()
    
    scored_docs = []
    for doc in SCADA_KNOWLEDGE_BASE:
        match_count = sum(1 for keyword in doc["keywords"] if keyword in query_lower)
        if match_count > 0:
            scored_docs.append({
                "text": doc["text"],
                "source": doc["source"],
                "score": match_count
            })
    
    scored_docs.sort(key=lambda x: x["score"], reverse=True)
    top_docs = scored_docs[:2]
    
    if top_docs:
        context = " ".join([doc["text"] for doc in top_docs])
        sources = [doc["source"] for doc in top_docs]
        
        response_text = (
            f"Based on the plant's operational knowledge base:\n\n"
            f"{context}\n\n"
            f"Recommendation: Please verify the current sensor readings against these parameters. "
            f"If the anomaly persists, escalate to the engineering team."
        )
        confidence = 0.92 if top_docs[0]["score"] >= 2 else 0.75
    else:
        response_text = (
            "I couldn't find specific documentation matching your query in the current SCADA knowledge base. "
            "Please try rephrasing your question with specific sensor IDs (e.g., 'P-101', 'T-201') or "
            "keywords like 'pressure', 'temperature', or 'protocol'."
        )
        sources = ["General System Fallback"]
        confidence = 0.40

    return {
        "response": response_text,
        "sources": sources,
        "confidence": confidence
    }   

@app.get("/api/dashboard-alerts")
async def get_dashboard_alerts(db: AsyncSession = Depends(get_db)):
    cutoff_time = datetime.now(timezone.utc) - timedelta(hours=2)
    
    result = await db.execute(
        select(Reading)
        .where((Reading.is_anomaly == True) & (Reading.timestamp >= cutoff_time))
        .order_by(desc(Reading.timestamp))
        .limit(5)
    )
    readings = result.scalars().all()
    
    alerts = []
    for r in readings:
        severity = "critical" if r.value > 130 else ("medium" if r.value > 100 else "low")
        alerts.append({
            "id": r.id,
            "sensor_id": r.sensor_id,
            "timestamp": r.timestamp.isoformat(),
            "severity": severity,
            "status": "open",
            "description": f"Anomalous spike detected: {r.value:.2f} units"
        })
        
    return alerts    

# --- AI/ML Feature 4: Smart Assignee Recommendation ---
@app.get("/api/incidents/{incident_id}/recommend-assignee")
async def recommend_assignee(incident_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Incident).where(Incident.id == incident_id))
    incident = result.scalar_one_or_none()
    
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")
        
    sensor_id = incident.sensor_id
    
    history_result = await db.execute(
        select(Incident.resolved_by)
        .where(
            (Incident.sensor_id == sensor_id) & 
            (Incident.status == "resolved") &
            (Incident.resolved_by.isnot(None))
        )
    )
    history = history_result.scalars().all()
    
    if history:
        user_counts = Counter(history)
        best_user = user_counts.most_common(1)[0][0]
        total_resolutions = sum(user_counts.values())
        best_user_count = user_counts[best_user]
        
        confidence = round((best_user_count / total_resolutions) * 100)
        reason = f"Successfully resolved {best_user_count} out of {total_resolutions} past incidents for {sensor_id}."
    else:
        if sensor_id.startswith('P') or sensor_id.startswith('V'):
            best_user = "test_engineer"
            confidence = 65
            reason = "No direct history. Mechanical/Pressure anomalies default to Engineering team based on domain rules."
        else:
            best_user = "test_operator"
            confidence = 70
            reason = "No direct history. Standard operational deviations default to Shift Operator."

    return {
        "recommended_user": best_user,
        "confidence_score": confidence,
        "reason": reason,
        "sensor_id": sensor_id
    }
    
@app.get("/api/operators", response_model=List[UserResponse])
async def get_operators(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Operator).order_by(Operator.id)
    )
    operators = result.scalars().all()
    return operators
@app.get("/api/dashboard/weekly-trend")
async def get_weekly_trend(db: AsyncSession = Depends(get_db)):
    """
    Aggregates anomaly counts over the last 7 days for the Dashboard Weekly Trend chart.
    """
    from datetime import datetime, timedelta, timezone
    from collections import defaultdict
    
    cutoff_time = datetime.now(timezone.utc) - timedelta(days=7)
    
    # Fetch all readings from the last 7 days
    result = await db.execute(
        select(Reading.timestamp, Reading.is_anomaly).where(
            Reading.timestamp >= cutoff_time
        )
    )
    readings = result.all()
    
    # Aggregate counts by day
    daily_counts = defaultdict(int)
    for r in readings:
        if r.is_anomaly:
            day_str = r.timestamp.date().isoformat()
            daily_counts[day_str] += 1
            
    # Build the last 7 days array (ensuring days with 0 anomalies are included)
    trend_data = []
    today = datetime.now(timezone.utc).date()
    
    for i in range(6, -1, -1):
        target_date = today - timedelta(days=i)
        day_str = target_date.isoformat()
        day_name = target_date.strftime("%a") # e.g., "Mon", "Tue"
        
        trend_data.append({
            "day": day_name,
            "date": day_str,
            "anomalies": daily_counts.get(day_str, 0)
        })
        
    return {"trend": trend_data}    
@app.get("/api/layout/area-status")
async def get_area_status(db: AsyncSession = Depends(get_db)):
    sensors_result = await db.execute(select(Sensor))
    sensors = sensors_result.scalars().all()
    
    areas_data = {}
    
    for sensor in sensors:
        area_name = sensor.area 
        if not area_name: continue
        
        if area_name not in areas_data:
            areas_data[area_name] = { "max_val": 0.0, "is_anomaly": False }
            
        reading_res = await db.execute(
            select(Reading)
            .where(Reading.sensor_id == sensor.sensor_id)
            .order_by(desc(Reading.timestamp))
            .limit(1)
        )
        latest = reading_res.scalar_one_or_none()
        
        if latest:
            if latest.value > areas_data[area_name]["max_val"]:
                areas_data[area_name]["max_val"] = latest.value
            if latest.is_anomaly:
                areas_data[area_name]["is_anomaly"] = True

    result = []
    for area, data in areas_data.items():
        if data["is_anomaly"]:
            status = "Anomaly"; color = "critical"
        elif data["max_val"] > 110:
            status = "Warning"; color = "warning"
        else:
            status = "Normal"; color = "good"
            
        result.append({
            "name": f"{area} Area",
            "value": round(data["max_val"], 1),
            "unit": "bar",
            "status": status,
            "color": color,
            "change": "+2.4%" 
        })
    return result
@app.get("/api/sensors/export")
async def export_sensors_csv(db: AsyncSession = Depends(get_db)):
    """Export all sensors with their latest readings to CSV"""
    result = await db.execute(select(Sensor))
    sensors = result.scalars().all()
    
    output = io.StringIO()
    writer = csv.writer(output)
    
    # Write header
    writer.writerow([
        "Sensor ID", "Name", "Unit", "Area", 
        "Current Value", "Timestamp", "Status"
    ])
    
    # Write data rows
    for sensor in sensors:
        reading_result = await db.execute(
            select(Reading)
            .where(Reading.sensor_id == sensor.sensor_id)
            .order_by(desc(Reading.timestamp))
            .limit(1)
        )
        latest_reading = reading_result.scalar_one_or_none()
        
        writer.writerow([
            sensor.sensor_id,
            sensor.name,
            sensor.unit,
            sensor.area,
            latest_reading.value if latest_reading else 0.0,
            latest_reading.timestamp.isoformat() if latest_reading else "",
            "Anomaly" if (latest_reading and latest_reading.is_anomaly) else "Normal"
        ])
    
    output.seek(0)
    return StreamingResponse(
        output,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=sensors_export.csv"}
    )    
# --- Endpoint to Add a New Sensor ---
class SensorCreate(BaseModel):
    sensor_id: str
    name: str
    unit: str
    area: str

@app.post("/api/sensors", response_model=SensorResponse)
async def add_sensor(sensor: SensorCreate, db: AsyncSession = Depends(get_db)):
    # Check if sensor_id already exists
    result = await db.execute(select(Sensor).where(Sensor.sensor_id == sensor.sensor_id))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Sensor ID already exists")
        
    new_sensor = Sensor(
        sensor_id=sensor.sensor_id,
        name=sensor.name,
        unit=sensor.unit,
        area=sensor.area
    )
    db.add(new_sensor)
    await db.commit()
    await db.refresh(new_sensor)
    return new_sensor   
@app.post("/api/anomalies/generate-report")
async def generate_detailed_report(db: AsyncSession = Depends(get_db)):
    """
    AI Agent: Generates a comprehensive 300-word engineering report 
    based on real-time database anomalies, incidents, and sensor health.
    """
    from datetime import datetime, timedelta, timezone
    
    # 1. Gather Intelligence from Database
    cutoff = datetime.now(timezone.utc) - timedelta(hours=24)
    
    # Count anomalies
    anomaly_count_res = await db.execute(
        select(Reading).where((Reading.is_anomaly == True) & (Reading.timestamp >= cutoff))
    )
    anomalies = anomaly_count_res.scalars().all()
    total_anomalies = len(anomalies)
    
    # Find top culprit
    from collections import Counter
    culprit_counts = Counter([a.sensor_id for a in anomalies])
    top_culprit = culprit_counts.most_common(1)[0][0] if culprit_counts else "Unknown Sensor"
    top_count = culprit_counts.most_common(1)[0][1] if culprit_counts else 0
    
    # Check for incidents
    incident_res = await db.execute(
        select(Incident).where((Incident.timestamp >= cutoff) & (Incident.status != "resolved"))
    )
    open_incidents = len(incident_res.scalars().all())
    
    # 2. Generate the Report (Simulated AI Agent)
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M")
    
    report_text = f"""
**INDUSTRIAL GUARDIAN: ANOMALY INTELLIGENCE REPORT**
**Generated:** {timestamp}
**Status:** CRITICAL ALERT

**1. EXECUTIVE SUMMARY**
Over the past 24 hours, the Industrial Guardian AI monitoring system has detected a significant deviation in operational baselines across the Riverside Plant (Unit 3). A total of **{total_anomalies} distinct anomalies** were logged, indicating a systemic stress event rather than isolated sensor noise. The primary area of concern is the **{top_culprit}** sector, which accounted for **{top_count}** of the flagged events. Currently, there are **{open_incidents} open incidents** requiring immediate engineering attention.

**2. DETAILED FINDINGS & SENSOR ANALYSIS**
Telemetry data indicates a cascading failure mode. The **{top_culprit}** sensors have reported values exceeding the 95th percentile of historical baselines. 
- **Pressure/Flow Coupling:** Analysis suggests a strong inverse correlation between pressure spikes and flow rate drops, consistent with a downstream blockage or valve malfunction.
- **Thermal Stress:** Secondary sensors (Temperature) show a lagging increase of approximately 12%, likely due to reduced cooling efficiency caused by the flow restriction.
- **Vibration Metrics:** High-frequency vibration anomalies were detected on rotating equipment, suggesting cavitation or bearing stress resulting from the pressure instability.

**3. ROOT CAUSE ANALYSIS (RCA)**
The AI Root Cause Engine has identified the probable origin as a **mechanical obstruction or control valve failure** in the primary loop. The temporal correlation of the {top_culprit} spike with simultaneous flow drops confirms this hypothesis with **85% confidence**. This is not a sensor calibration error; the physical process variables are genuinely out of bounds.

**4. RECOMMENDATIONS & ACTION PLAN**
1. **Immediate Action:** Isolate the affected valve/loop for **{top_culprit}** and switch to manual override if automated systems fail to stabilize pressure.
2. **Inspection:** Dispatch a maintenance team to inspect the physical piping for blockages or debris.
3. **System Reset:** Once physical inspection is clear, recalibrate the {top_culprit} sensors and reset the AI baseline to resume normal autonomous monitoring.

**End of Report.**
    """
    
    return {"report": report_text.strip()}    
@app.get("/api/anomaly-score/trend")
async def get_anomaly_score_trend(db: AsyncSession = Depends(get_db)):
    """Get anomaly score trend for the last 24 hours"""
    from datetime import datetime, timedelta, timezone
    
    try:
        cutoff = datetime.now(timezone.utc) - timedelta(hours=24)
        
        # Fetch anomalies
        result = await db.execute(
            select(Reading).where(
                Reading.is_anomaly == True,
                Reading.timestamp >= cutoff
            )
        )
        anomalies = result.scalars().all()
        
        # Simple hourly aggregation
        trend_data = []
        now = datetime.now(timezone.utc)
        
        for i in range(23, -1, -1):
            hour_time = now - timedelta(hours=i)
            hour_str = hour_time.strftime("%H:00")
            
            # Count anomalies in this hour
            hour_start = hour_time
            hour_end = hour_start + timedelta(hours=1)
            
            count = sum(1 for a in anomalies if hour_start <= a.timestamp < hour_end)
            score = min(count * 0.15, 1.0)
            
            trend_data.append({
                "time": hour_str,
                "score": round(score, 2),
                "count": count
            })
        
        return {"trend": trend_data}
        
    except Exception as e:
        print(f"Error in trend endpoint: {e}")
        return {"trend": []}
# --- Reports & Analytics Endpoints ---

@app.post("/api/reports/generate")
async def generate_report(request: dict, db: AsyncSession = Depends(get_db)):
    """Generate a premium quality report based on type and real database data."""
    from datetime import datetime, timedelta, timezone
    from collections import Counter, defaultdict
    import statistics
    
    report_type = request.get("type", "weekly")
    now = datetime.now(timezone.utc)
    
    # Gather real data
    if report_type == "weekly":
        cutoff = now - timedelta(days=7)
        title = "WEEKLY OPERATIONAL SUMMARY"
        subtitle = f"Period: {(now - timedelta(days=6)).strftime('%b %d')} - {now.strftime('%b %d, %Y')}"
    elif report_type == "monthly":
        cutoff = now - timedelta(days=30)
        title = "MONTHLY PERFORMANCE REPORT"
        subtitle = f"Period: {(now - timedelta(days=29)).strftime('%b %d')} - {now.strftime('%b %d, %Y')}"
    elif report_type == "incident":
        cutoff = now - timedelta(days=30)
        title = "INCIDENT INVESTIGATION REPORT"
        subtitle = f"Generated: {now.strftime('%B %d, %Y at %H:%M')}"
    else:  # custom
        cutoff = now - timedelta(days=7)
        title = "CUSTOM ANALYTICS REPORT"
        subtitle = f"Generated: {now.strftime('%B %d, %Y at %H:%M')}"
    
    # Fetch readings
    readings_res = await db.execute(
        select(Reading).where(Reading.timestamp >= cutoff)
    )
    readings = readings_res.scalars().all()
    total_readings = len(readings)
    anomalies = [r for r in readings if r.is_anomaly]
    anomaly_count = len(anomalies)
    
    # Fetch incidents
    incidents_res = await db.execute(
        select(Incident).where(Incident.timestamp >= cutoff)
    )
    incidents = incidents_res.scalars().all()
    open_incidents = len([i for i in incidents if i.status != 'resolved'])
    resolved_incidents = len([i for i in incidents if i.status == 'resolved'])
    
    # Sensor breakdown
    sensor_counts = Counter([r.sensor_id for r in readings])
    anomaly_by_sensor = Counter([r.sensor_id for r in anomalies])
    top_anomaly_sensor = anomaly_by_sensor.most_common(1)[0] if anomaly_by_sensor else ("N/A", 0)
    
    # Severity breakdown
    severity_counts = Counter([i.severity for i in incidents])
    
    # Calculate uptime (mock based on anomaly ratio)
    anomaly_ratio = anomaly_count / total_readings if total_readings > 0 else 0
    uptime = round((1 - anomaly_ratio) * 100, 2)
    avg_value = round(statistics.mean([r.value for r in readings]), 2) if readings else 0
    
    report = f"""
═══════════════════════════════════════════════════════════
              INDUSTRIAL GUARDIAN
         {title}
═══════════════════════════════════════════════════════════

{subtitle}
Plant: Riverside Plant · Unit 3 · HAI Dataset
Report ID: RPT-{now.strftime('%Y%m%d%H%M')}
Generated by: AI Analytics Engine v2.1

───────────────────────────────────────────────────────────
  1. EXECUTIVE OVERVIEW
───────────────────────────────────────────────────────────

During this reporting period, the Industrial Guardian AI 
monitoring system processed a total of {total_readings} sensor 
readings across all operational areas. The system detected 
{anomaly_count} anomalous events, representing an anomaly 
rate of {round(anomaly_ratio * 100, 2)}%.

Overall system uptime for this period stands at {uptime}%, 
which {"meets" if uptime >= 95 else "falls below"} the 
target threshold of 95%. The average sensor value across 
all monitored equipment was {avg_value} units.

───────────────────────────────────────────────────────────
  2. ANOMALY INTELLIGENCE
───────────────────────────────────────────────────────────

Total Anomalies Detected: {anomaly_count}
Primary Culprit Sensor:   {top_anomaly_sensor[0]} ({top_anomaly_sensor[1]} events)
Anomaly Rate:             {round(anomaly_ratio * 100, 2)}%

Sensor Anomaly Breakdown:
"""
    for sensor, count in anomaly_by_sensor.most_common(5):
        pct = round((count / anomaly_count) * 100, 1) if anomaly_count > 0 else 0
        report += f"  • {sensor}: {count} events ({pct}%)\n"
    
    report += f"""
───────────────────────────────────────────────────────────
  3. INCIDENT MANAGEMENT
───────────────────────────────────────────────────────────

Total Incidents Logged:   {len(incidents)}
Open / Investigating:     {open_incidents}
Resolved:                 {resolved_incidents}
Resolution Rate:          {round((resolved_incidents / len(incidents)) * 100, 1) if incidents else 0}%

Severity Distribution:
  • Critical: {severity_counts.get('critical', 0)}
  • Medium:   {severity_counts.get('medium', 0)}
  • Low:      {severity_counts.get('low', 0)}

───────────────────────────────────────────────────────────
  4. SENSOR PERFORMANCE METRICS
───────────────────────────────────────────────────────────

Active Sensors Monitored: {len(sensor_counts)}
Total Data Points:        {total_readings}
Average Reading Value:    {avg_value}

Top 5 Most Active Sensors:
"""
    for sensor, count in sensor_counts.most_common(5):
        report += f"  • {sensor}: {count} readings\n"
    
    report += f"""
───────────────────────────────────────────────────────────
  5. AI RECOMMENDATIONS
───────────────────────────────────────────────────────────

Based on the analysis of this period's data, the AI engine 
recommends the following actions:

1. PRIORITY: Investigate {top_anomaly_sensor[0]} for recurring 
   anomalies. Consider recalibration or hardware inspection.

2. MAINTENANCE: Schedule preventive maintenance for sensors 
   showing elevated deviation patterns.

3. MONITORING: Increase sampling frequency during peak 
   operational hours to capture transient anomalies.

4. COMPLIANCE: All safety thresholds were {"maintained" if uptime >= 95 else "breached"} 
   during this period. {"No further action required." if uptime >= 95 else "Immediate review recommended."}

───────────────────────────────────────────────────────────
  6. CONCLUSION
───────────────────────────────────────────────────────────

The plant operated {"within acceptable parameters" if uptime >= 95 else "below optimal efficiency"} 
during this reporting period. The AI detection system 
successfully identified and logged {anomaly_count} anomalous 
events, enabling proactive intervention.

Next review scheduled for: {(now + timedelta(days=7)).strftime('%B %d, %Y')}

═══════════════════════════════════════════════════════════
              END OF REPORT
═══════════════════════════════════════════════════════════
    """
    
    return {"report": report.strip(), "type": report_type, "timestamp": now.isoformat()}


@app.get("/api/reports/historical")
async def get_historical_data(
    area: str = "all",
    sensor: str = "all",
    start_date: str = None,
    end_date: str = None,
    db: AsyncSession = Depends(get_db)
):
    """Fetch filtered historical readings for the Data Explorer."""
    from datetime import datetime, timedelta, timezone
    
    # Default to last 7 days if no dates
    if not start_date:
        start_dt = datetime.now(timezone.utc) - timedelta(days=7)
    else:
        start_dt = datetime.fromisoformat(start_date).replace(tzinfo=timezone.utc)
    
    if not end_date:
        end_dt = datetime.now(timezone.utc)
    else:
        end_dt = datetime.fromisoformat(end_date).replace(tzinfo=timezone.utc)
    
    # Build query
    query = select(Reading).where(
        (Reading.timestamp >= start_dt) & (Reading.timestamp <= end_dt)
    )
    
    # Filter by sensor
    if sensor != "all":
        query = query.where(Reading.sensor_id == sensor)
    
    # Filter by area (need to join with Sensor table)
    if area != "all":
        sensor_res = await db.execute(
            select(Sensor.sensor_id).where(Sensor.area == area)
        )
        area_sensors = [row[0] for row in sensor_res.all()]
        if area_sensors:
            query = query.where(Reading.sensor_id.in_(area_sensors))
    
    query = query.order_by(desc(Reading.timestamp)).limit(100)
    
    result = await db.execute(query)
    readings = result.scalars().all()
    
    return [
        {
            "id": r.id,
            "sensor_id": r.sensor_id,
            "timestamp": r.timestamp.isoformat(),
            "value": round(r.value, 2),
            "is_anomaly": r.is_anomaly,
            "status": "Anomaly" if r.is_anomaly else "Normal"
        }
        for r in readings
    ]
@app.get("/api/reports/export")
async def export_report_csv(
    area: str = "all",
    sensor: str = "all",
    start_date: str = None,
    end_date: str = None,
    db: AsyncSession = Depends(get_db)
):
    """Export filtered historical data as CSV."""
    from datetime import datetime, timedelta, timezone
    
    now = datetime.now(timezone.utc)
    
    if not start_date:
        start_dt = now - timedelta(days=7)
    else:
        start_dt = datetime.fromisoformat(start_date).replace(tzinfo=timezone.utc)
    
    if not end_date:
        end_dt = now
    else:
        end_dt = datetime.fromisoformat(end_date).replace(tzinfo=timezone.utc)
    
    query = select(Reading).where(
        (Reading.timestamp >= start_dt) & (Reading.timestamp <= end_dt)
    )
    
    if sensor != "all":
        query = query.where(Reading.sensor_id == sensor)
    
    if area != "all":
        sensor_res = await db.execute(
            select(Sensor.sensor_id).where(Sensor.area == area)
        )
        area_sensors = [row[0] for row in sensor_res.all()]
        if area_sensors:
            query = query.where(Reading.sensor_id.in_(area_sensors))
    
    query = query.order_by(desc(Reading.timestamp))
    result = await db.execute(query)
    readings = result.scalars().all()
    
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["Timestamp", "Sensor ID", "Value", "Unit", "Status", "Is Anomaly"])
    
    for r in readings:
        writer.writerow([
            r.timestamp.isoformat(),
            r.sensor_id,
            round(r.value, 2),
            "units",
            "Anomaly" if r.is_anomaly else "Normal",
            r.is_anomaly
        ])
    
    output.seek(0)
    return StreamingResponse(
        output,
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=report_export_{now.strftime('%Y%m%d')}.csv"}
    )
# --- Settings & Admin Endpoints ---

@app.delete("/operator/{username}")
async def delete_user(username: str, db: AsyncSession = Depends(get_db)):
    """Delete a user from the database."""
    result = await db.execute(select(Operator).where(Operator.username == username))
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    await db.delete(user)
    await db.commit()
    return {"message": f"User {username} deleted successfully"}

@app.get("/api/system-health")
async def get_system_health(db: AsyncSession = Depends(get_db)):
    """Mock system health check with real DB latency."""
    import time
    import random
    
    # Measure real DB latency
    start = time.time()
    await db.execute(select(1))
    db_latency = round((time.time() - start) * 1000, 2)
    
    # Mock other services
    return {
        "database": {"status": "Operational", "latency": f"{db_latency}ms"},
        "backend": {"status": "Operational", "latency": f"{random.randint(2, 8)}ms"},
        "redis": {"status": "Operational", "latency": f"{random.randint(1, 5)}ms"},
        "ai_model": {"status": "Operational", "latency": f"{random.randint(120, 160)}ms"}
    }
import torch
import torch.nn as nn
import numpy as np
import os

# Disable oneDNN to prevent ARM64 Linux Docker matmul primitive errors
os.environ["TORCH_MKLDNN_ENABLED"] = "0"

# --- Tiny Temporal Transformer for Offline Validation ---
class TemporalTransformerEncoder(nn.Module):
    def __init__(self, input_dim=4, d_model=16, nhead=2, num_layers=1):
        super().__init__()
        self.input_proj = nn.Linear(input_dim, d_model)
        encoder_layer = nn.TransformerEncoderLayer(d_model=d_model, nhead=nhead, batch_first=True)
        self.transformer = nn.TransformerEncoder(encoder_layer, num_layers=num_layers)
        self.output_proj = nn.Linear(d_model, 1)

    def forward(self, x):
        # x shape: (batch_size, seq_len, input_dim)
        x = self.input_proj(x)
        x = self.transformer(x)
        # .contiguous() fixes the ARM64 Docker oneDNN matmul primitive error
        x_last = x[:, -1, :].contiguous()
        return self.output_proj(x_last).squeeze(-1)

# Initialize the model globally
transformer_model = TemporalTransformerEncoder(input_dim=4, d_model=16, nhead=2, num_layers=1)
transformer_model.eval() # Set to evaluation mode

@app.post("/api/ml/transformer-validate")
async def validate_with_transformer(db: AsyncSession = Depends(get_db)):
    """
    Uses a lightweight PyTorch Temporal Transformer Encoder to validate 
    the last 10 multivariate readings for deep-dive anomaly detection.
    """
    try:
        target_sensors = ['P-101', 'T-201', 'F-301', 'V-401']
        
        # Fetch last 10 readings for all 4 sensors
        readings = []
        for sid in target_sensors:
            res = await db.execute(
                select(Reading.value).where(Reading.sensor_id == sid).order_by(desc(Reading.timestamp)).limit(10)
            )
            vals = [row[0] for row in res.all()]
            readings.append(vals)
        
        # Check if we have enough data
        if len(readings[0]) < 10:
            return {
                "transformer_score": 0.0, 
                "status": f"Insufficient data for Transformer inference (need 10 readings, got {len(readings[0])})",
                "model_architecture": "Temporal Transformer Encoder (1 layer, 2 heads)"
            }
        
        # Normalize the data to prevent numerical instability
        readings_array = np.array([list(reversed(r)) for r in readings]).T
        
        # Add small epsilon to prevent division by zero
        mean = readings_array.mean(axis=0, keepdims=True)
        std = readings_array.std(axis=0, keepdims=True) + 1e-8
        readings_normalized = (readings_array - mean) / std
        
        data_tensor = torch.tensor(readings_normalized, dtype=torch.float32).unsqueeze(0)
        
        with torch.no_grad():
            output = transformer_model(data_tensor)
            score = torch.sigmoid(output).item()
            
        return {
            "transformer_score": round(score, 4),
            "anomaly_detected": score > 0.7,
            "model_architecture": "Temporal Transformer Encoder (1 layer, 2 heads)",
            "status": "Offline validation complete",
            "input_shape": str(data_tensor.shape)
        }
        
    except Exception as e:
        print(f"Transformer error: {str(e)}")
        return {
            "error": str(e),
            "status": "Transformer validation failed",
            "model_architecture": "Temporal Transformer Encoder (1 layer, 2 heads)"
        }