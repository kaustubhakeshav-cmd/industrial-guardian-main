import React, { createContext, useContext, useState, useEffect } from 'react';

// Define Types
export interface Sensor {
  id: string;
  name: string;
  category: 'Pressure' | 'Temperature' | 'Flow' | 'Vibration' | 'Level' | 'Others';
  value: number;
  unit: string;
  status: 'Normal' | 'Anomaly';
  rul: number; // Remaining Useful Life in hours
}

export interface Scenario {
  id: string;
  name: string;
  targetSensorId: string;
  severity: 'Low' | 'Medium' | 'High';
  type: 'Spike' | 'Drop' | 'Noise';
  redirectToIncidents: boolean; // The new feature you requested
}

interface AppContextType {
  sensors: Sensor[];
  scenarios: Scenario[];
  addSensor: (sensor: Sensor) => void;
  addScenario: (scenario: Scenario) => void;
  updateSensorValue: (id: string, value: number) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within an AppProvider');
  return context;
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 1. Initial Mock Data (Fallback if backend is down)
  const [sensors, setSensors] = useState<Sensor[]>([
    { id: 'P-101', name: 'Reactor Pressure', category: 'Pressure', value: 452.7, unit: 'bar', status: 'Normal', rul: 945 },
    { id: 'P-102', name: 'Compressor Output', category: 'Pressure', value: 453.0, unit: 'bar', status: 'Anomaly', rul: 970 },
    { id: 'T-201', name: 'Turbine Temp', category: 'Temperature', value: 227.9, unit: '°C', status: 'Anomaly', rul: 970 },
    { id: 'T-202', name: 'Cooling Water Temp', category: 'Temperature', value: 38.7, unit: '°C', status: 'Normal', rul: 996 },
    { id: 'F-301', name: 'Main Flow Rate', category: 'Flow', value: 447.0, unit: 'm³/h', status: 'Anomaly', rul: 946 },
    { id: 'V-401', name: 'Pump Vibration', category: 'Vibration', value: 0.57, unit: 'mm/s', status: 'Anomaly', rul: 886 },
    { id: 'L-501', name: 'Tank Level A', category: 'Level', value: 75.0, unit: '%', status: 'Normal', rul: 1000 },
    { id: 'M-601', name: 'Motor RPM', category: 'Others', value: 1450, unit: 'rpm', status: 'Normal', rul: 1000 },
  ]);

  const [scenarios, setScenarios] = useState<Scenario[]>([]);

  // ✅ ADD THE USEEFFECT HERE (Between state and functions)
  useEffect(() => {
    const fetchSensors = async () => {
      try {
        const res = await fetch('http://localhost:8000/api/sensors');
        if (res.ok) {
          const data = await res.json();
          const mappedSensors: Sensor[] = data.map((s: any) => ({
            id: s.sensor_id,
            name: s.name,
            category: s.area || 'Others', 
            value: s.latest_value || 0,
            unit: s.unit,
            status: s.is_anomaly ? 'Anomaly' : 'Normal',
            rul: 1000 
          }));
          setSensors(mappedSensors);
        }
      } catch (err) {
        console.log("Using default mock sensors (Backend unreachable)");
      }
    };

    fetchSensors();
  }, []);

  // 2. Helper Functions
  const addSensor = (newSensor: Sensor) => {
    setSensors((prev) => [...prev, newSensor]);
  };

  const addScenario = (newScenario: Scenario) => {
    setScenarios((prev) => [...prev, newScenario]);
    if (newScenario.redirectToIncidents) {
      console.log("Scenario created. Will reflect in Active Incidents upon execution.");
    }
  };

  const updateSensorValue = (id: string, value: number) => {
    setSensors((prev) => prev.map(s => s.id === id ? { ...s, value } : s));
  };

  return (
    <AppContext.Provider value={{ sensors, scenarios, addSensor, addScenario, updateSensorValue }}>
      {children}
    </AppContext.Provider>
  );
};