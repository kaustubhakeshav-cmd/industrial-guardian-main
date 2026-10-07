import { useEffect, useState } from 'react';
import axios from 'axios';
import { AlertTriangle, CheckCircle, AlertCircle, Cpu } from 'lucide-react';

export default function AIHealthCard() {
  const [healthData, setHealthData] = useState({
    health_score: 100,
    status: "Initializing",
    color: "good",
    details: "Connecting to AI engine...",
    metrics: { pressure_z: 0, temperature_z: 0, flow_z: 0, vibration_z: 0 }
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHealthScore = async () => {
      try {
        const res = await axios.get('http://127.0.0.1:8000/api/health-score');
        setHealthData(res.data);
      } catch (error) {
        console.error("Failed to fetch AI health score:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHealthScore();
    // Poll every 5 seconds for real-time ML updates
    const interval = setInterval(fetchHealthScore, 5000);
    return () => clearInterval(interval);
  }, []);

  const statusColors = {
    good: 'bg-status-good',
    warning: 'bg-status-warning',
    critical: 'bg-status-critical',
  };

  const statusTextColors = {
    good: 'text-status-good',
    warning: 'text-status-warning',
    critical: 'text-status-critical',
  };

  const getIcon = () => {
    const color = healthData.color as keyof typeof statusTextColors;
    if (color === 'good') return <CheckCircle className={`w-5 h-5 ${statusTextColors[color]}`} />;
    if (color === 'warning') return <AlertTriangle className={`w-5 h-5 ${statusTextColors[color]}`} />;
    return <AlertCircle className={`w-5 h-5 ${statusTextColors[color]}`} />;
  };

  const color = healthData.color as keyof typeof statusTextColors;

  return (
    <div className={`bg-bg-panel border border-border-panel rounded-xl p-5 flex flex-col justify-between h-36 transition-all duration-500 ${color === 'critical' ? 'border-status-critical/50 shadow-lg shadow-status-critical/10' : ''}`}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-text-muted text-[10px] font-medium uppercase tracking-wider flex items-center gap-1">
            <Cpu className="w-3 h-3" /> AI System Health
          </p>
          <h3 className={`text-2xl font-semibold mt-1 ${statusTextColors[color]}`}>
            {isLoading ? '--' : `${healthData.health_score}%`}
          </h3>
        </div>
        <div className={`p-2 rounded-lg ${statusColors[color]} bg-opacity-10`}>
          {getIcon()}
        </div>
      </div>
      
      <div className="mt-1">
        <div className="w-full bg-bg-page rounded-full h-1.5 mb-1.5">
          <div 
            className={`h-1.5 rounded-full ${statusColors[color]} transition-all duration-1000 ease-out`} 
            style={{ width: `${isLoading ? 0 : healthData.health_score}%` }}
          ></div>
        </div>
        <p className="text-[10px] text-text-muted leading-tight truncate">
          {isLoading ? 'Gathering baseline data...' : healthData.details}
        </p>
        
        {/* Mini Z-Score Metrics (Research-grade detail) */}
        {!isLoading && healthData.metrics && (
          <div className="mt-2 pt-1.5 border-t border-border-panel grid grid-cols-4 gap-1 text-center">
            <div>
              <p className="text-[8px] text-text-muted uppercase">Pres</p>
              <p className={`text-[10px] font-mono font-bold ${healthData.metrics.pressure_z > 2 ? 'text-status-critical' : 'text-text-primary'}`}>
                {healthData.metrics.pressure_z}
              </p>
            </div>
            <div>
              <p className="text-[8px] text-text-muted uppercase">Temp</p>
              <p className={`text-[10px] font-mono font-bold ${healthData.metrics.temperature_z > 2 ? 'text-status-critical' : 'text-text-primary'}`}>
                {healthData.metrics.temperature_z}
              </p>
            </div>
            <div>
              <p className="text-[8px] text-text-muted uppercase">Flow</p>
              <p className={`text-[10px] font-mono font-bold ${healthData.metrics.flow_z > 2 ? 'text-status-critical' : 'text-text-primary'}`}>
                {healthData.metrics.flow_z}
              </p>
            </div>
            <div>
              <p className="text-[8px] text-text-muted uppercase">Vib</p>
              <p className={`text-[10px] font-mono font-bold ${healthData.metrics.vibration_z > 2 ? 'text-status-critical' : 'text-text-primary'}`}>
                {healthData.metrics.vibration_z}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}