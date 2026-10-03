import { useEffect, useState } from 'react';
import axios from 'axios';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

const statusConfig = {
  good: { color: 'text-status-good', bg: 'bg-status-good/10', border: 'border-status-good/20', label: 'Normal' },
  warning: { color: 'text-status-warning', bg: 'bg-status-warning/10', border: 'border-status-warning/20', label: 'Warning' },
  critical: { color: 'text-status-critical', bg: 'bg-status-critical/10', border: 'border-status-critical/20', label: 'Anomaly' },
};

interface SensorTableProps {
  activeCategory: string;
}

interface RealSensor {
  id: number;
  sensor_id: string;
  name: string;
  unit: string;
  area: string;
  latest_value: number;
  latest_timestamp: string | null;
  is_anomaly: boolean;
}

export default function SensorTable({ activeCategory }: SensorTableProps) {
  const [sensors, setSensors] = useState<RealSensor[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch real data from the backend when the component loads
  useEffect(() => {
    const fetchSensors = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:8000/api/sensors');
        setSensors(response.data);
      } catch (error) {
        console.error("Failed to fetch sensors:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSensors();
  }, []);

  // Filter sensors based on the selected category
  const filteredSensors = activeCategory === 'all' 
    ? sensors 
    : sensors.filter(s => s.area.toLowerCase().includes(activeCategory) || s.sensor_id.toLowerCase().includes(activeCategory));

  return (
    <div className="bg-bg-panel border border-border-panel rounded-xl p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-text-primary">Sensor Readings</h2>
        <div className="flex gap-2">
           <button className="px-3 py-1.5 text-xs font-medium rounded-lg bg-accent-primary/10 text-accent-primary border border-accent-primary/20">
             Export CSV
           </button>
        </div>
      </div>

      <div className="flex-1 overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border-panel text-text-muted text-xs uppercase tracking-wider">
              <th className="py-3 px-4 font-medium">Sensor ID</th>
              <th className="py-3 px-4 font-medium">Name</th>
              <th className="py-3 px-4 font-medium">Current Value</th>
              <th className="py-3 px-4 font-medium">24h Change</th>
              <th className="py-3 px-4 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {isLoading ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-text-muted">Loading real telemetry data...</td>
              </tr>
            ) : filteredSensors.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-text-muted">No sensors found in this category.</td>
              </tr>
            ) : (
              filteredSensors.map((sensor) => {
                // Determine status based on the real is_anomaly flag from the database
                const status = sensor.is_anomaly ? 'critical' : 'good';
                const config = statusConfig[status as keyof typeof statusConfig];
                
                // Mock a small 24h change for visual flair (we will make this real later)
                const mockChange = sensor.is_anomaly ? 15.4 : (Math.random() * 5 - 2.5).toFixed(1);

                return (
                  <tr key={sensor.id} className="border-b border-border-panel/50 hover:bg-bg-page/50 transition-colors">
                    <td className="py-3 px-4 font-mono text-text-muted">{sensor.sensor_id}</td>
                    <td className="py-3 px-4 text-text-primary font-medium">{sensor.name}</td>
                    <td className="py-3 px-4 text-text-primary">
                      {sensor.latest_value} <span className="text-text-muted text-xs">{sensor.unit}</span>
                    </td>
                    <td className="py-3 px-4">
                      <div className={`flex items-center gap-1 font-medium ${
                        Number(mockChange) > 0 ? 'text-status-critical' : Number(mockChange) < 0 ? 'text-status-good' : 'text-text-muted'
                      }`}>
                        {Number(mockChange) > 0 ? <TrendingUp className="w-3 h-3" /> : Number(mockChange) < 0 ? <TrendingDown className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
                        {Math.abs(Number(mockChange))}%
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${config.bg} ${config.color} ${config.border}`}>
                        {config.label}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}