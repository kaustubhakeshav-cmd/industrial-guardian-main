import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import random

def generate_hai_dataset():
    print(" Generating realistic HAI SCADA dataset...")
    
    # Define our sensors
    sensors = [
        {'id': 'P-101', 'name': 'Reactor Pressure', 'unit': 'bar', 'area': 'Reactor Area', 'base': 70, 'noise': 5},
        {'id': 'P-102', 'name': 'Compressor Output', 'unit': 'bar', 'area': 'Compressor Area', 'base': 65, 'noise': 4},
        {'id': 'T-201', 'name': 'Turbine Temp', 'unit': '°C', 'area': 'Turbine Area', 'base': 140, 'noise': 10},
        {'id': 'T-202', 'name': 'Cooling Water Temp', 'unit': '°C', 'area': 'Cooling Area', 'base': 40, 'noise': 2},
        {'id': 'F-301', 'name': 'Main Flow Rate', 'unit': 'm³/h', 'area': 'Flow Area', 'base': 38, 'noise': 3},
        {'id': 'V-401', 'name': 'Pump Vibration', 'unit': 'mm/s', 'area': 'Pump Area', 'base': 2.0, 'noise': 0.5},
    ]

    data = []
    start_time = datetime(2026, 10, 1, 0, 0, 0)
    
    # Generate 24 hours of data, every 5 minutes (288 readings per sensor)
    for sensor in sensors:
        for i in range(288):
            timestamp = start_time + timedelta(minutes=5 * i)
            
            # Normal operation with random noise
            value = sensor['base'] + random.gauss(0, sensor['noise'])
            is_anomaly = False
            
            # Inject anomalies (spikes) randomly (about 5% of the time)
            if random.random() < 0.05:
                # Spike the value by 30% to 50%
                spike = random.uniform(1.3, 1.5)
                value = value * spike
                is_anomaly = True
                
            data.append({
                'timestamp': timestamp.strftime('%Y-%m-%d %H:%M:%S'),
                'sensor_id': sensor['id'],
                'name': sensor['name'],
                'unit': sensor['unit'],
                'area': sensor['area'],
                'value': round(value, 2),
                'is_anomaly': is_anomaly
            })

    # Create DataFrame and save to CSV
    df = pd.DataFrame(data)
    df.to_csv('hai_dataset.csv', index=False)
    print(f"✅ Successfully generated hai_dataset.csv with {len(df)} rows!")
    print("📁 File saved in your backend folder.")

if __name__ == "__main__":
    generate_hai_dataset()