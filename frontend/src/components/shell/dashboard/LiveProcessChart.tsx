import { useEffect, useState } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine } from 'recharts';
import { AlertTriangle } from 'lucide-react';

interface ChartDataPoint {
  time: string;
  pressure: number | null;
  temperature: number | null;
  flow: number | null;
  vibration: number | null;
}

export default function LiveProcessChart() {
  const [liveData, setLiveData] = useState<ChartDataPoint[]>([]);
  const [predictions, setPredictions] = useState<ChartDataPoint[]>([]);
  const [anomalyWarning, setAnomalyWarning] = useState<string | null>(null);

  // 1. Manage WebSocket directly to guarantee correct local time formatting
  useEffect(() => {
    const ws = new WebSocket('ws://127.0.0.1:8000/ws');

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        // FORCE local browser time to perfectly match the TopBar clock!
        // This bypasses any server/UTC timezone mismatches.
        const localTime = new Date().toLocaleTimeString('en-US', { 
          hour12: false, 
          hour: '2-digit', 
          minute: '2-digit', 
          second: '2-digit' 
        });

        setLiveData((prev) => {
          const updated = [...prev, { ...data, time: localTime }];
          return updated.slice(-20); // Keep a rolling window of the last 20 points
        });
      } catch (error) {
        console.error("WebSocket parse error:", error);
      }
    };

    ws.onerror = (error) => console.error("WebSocket error:", error);

    return () => ws.close();
  }, []);

  // 2. Fetch AI Predictions every 10 seconds
  useEffect(() => {
    const fetchPredictions = async () => {
      try {
        const res = await axios.get('http://127.0.0.1:8000/api/predict');
        setAnomalyWarning(res.data.anomaly_warning || null);
        
        // Format prediction data to seamlessly continue the local time axis
        const formatted = res.data.times.map((_: string, index: number) => {
          // Generate future local times based on current time + (index+1)*2 seconds
          const futureDate = new Date();
          futureDate.setSeconds(futureDate.getSeconds() + (index + 1) * 2);
          const futureTimeStr = futureDate.toLocaleTimeString('en-US', { 
            hour12: false, 
            hour: '2-digit', 
            minute: '2-digit', 
            second: '2-digit' 
          });

          return {
            time: futureTimeStr,
            pressure: res.data.pressure[index],
            temperature: res.data.temperature[index],
            flow: null,
            vibration: null
          };
        });
        setPredictions(formatted);
      } catch (error) {
        console.error("Failed to fetch AI predictions:", error);
      }
    };

    fetchPredictions();
    const interval = setInterval(fetchPredictions, 10000);
    return () => clearInterval(interval);
  }, []);

  // Combine live data and predictions for Recharts
  const chartData = [...liveData, ...predictions];

  return (
    <div className="bg-bg-panel border border-border-panel rounded-xl p-6 h-[450px] flex flex-col">
      {/* AI Anomaly Warning Banner */}
      {anomalyWarning && (
        <div className="mb-4 p-3 bg-status-critical/10 border border-status-critical/30 rounded-lg flex items-center gap-3 animate-pulse">
          <AlertTriangle className="w-5 h-5 text-status-critical flex-shrink-0" />
          <span className="text-sm font-semibold text-status-critical">{anomalyWarning}</span>
        </div>
      )}

      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-lg font-semibold text-text-primary">Live Process Overview + AI Forecast</h2>
          <p className="text-xs text-text-muted mt-1">Real-time monitoring · ML Time-Series Prediction (Next 10s)</p>
        </div>
        <div className="flex gap-2">
          <span className="px-3 py-1 text-xs font-medium rounded bg-status-good/10 text-status-good border border-status-good/20 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-status-good animate-pulse"></span> Live
          </span>
        </div>
      </div>

      <div className="flex-1 w-full">
        {liveData.length === 0 ? (
          <div className="h-full flex items-center justify-center text-text-muted animate-pulse">
            Establishing Live Connection...
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1C2C45" vertical={false} />
              
              {/* X-Axis now shows perfect local time matching the TopBar */}
              <XAxis 
                dataKey="time" 
                stroke="#7C8AA5" 
                fontSize={11} 
                tickLine={false} 
                axisLine={false} 
              />
              <YAxis stroke="#7C8AA5" fontSize={11} tickLine={false} axisLine={false} />
              
              <Tooltip 
                contentStyle={{ backgroundColor: '#0A1626', border: '1px solid #1C2C45', borderRadius: '8px', color: '#E8EDF5' }}
                itemStyle={{ color: '#E8EDF5' }}
                labelStyle={{ color: '#94a3b8', marginBottom: '4px', fontWeight: 'bold' }}
              />
              <Legend wrapperStyle={{ color: '#7C8AA5', fontSize: '12px' }} />
              
              {/* Safety Threshold Line */}
              <ReferenceLine 
                y={140} 
                stroke="#EF4444" 
                strokeDasharray="3 3" 
                label={{ value: 'Critical Limit', position: 'right', fill: '#EF4444', fontSize: 10, fontWeight: 'bold' }} 
              />

              {/* Real Historical Data (Solid Lines) */}
              <Line type="monotone" dataKey="pressure" stroke="#3B82F6" strokeWidth={2} dot={false} name="Pressure (Real)" connectNulls={false} />
              <Line type="monotone" dataKey="temperature" stroke="#F59E0B" strokeWidth={2} dot={false} name="Temp (Real)" connectNulls={false} />
              
              {/* AI Predicted Data (Dashed Lines) */}
              <Line type="monotone" dataKey="pressure" stroke="#3B82F6" strokeWidth={2} strokeDasharray="5 5" dot={{ r: 3, fill: '#3B82F6' }} name="Pressure (AI Predicted)" connectNulls={false} />
              <Line type="monotone" dataKey="temperature" stroke="#F59E0B" strokeWidth={2} strokeDasharray="5 5" dot={{ r: 3, fill: '#F59E0B' }} name="Temp (AI Predicted)" connectNulls={false} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}