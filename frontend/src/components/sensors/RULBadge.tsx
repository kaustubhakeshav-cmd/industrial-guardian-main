import { useEffect, useState } from 'react';
import axios from 'axios';
import { Battery, BatteryWarning, BatteryCharging, Loader, AlertTriangle } from 'lucide-react';

interface RULData {
  sensor_id: string;
  rul_hours: number;
  status: 'healthy' | 'degraded' | 'critical';
  anomaly_count: number;
  avg_z_deviation: number;
}

interface RULBadgeProps {
  sensorId: string;
}

export default function RULBadge({ sensorId }: RULBadgeProps) {
  const [data, setData] = useState<RULData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRUL = async () => {
      setIsLoading(true);
      try {
        const res = await axios.get(`http://127.0.0.1:8000/api/sensors/${sensorId}/rul`);
        setData(res.data);
      } catch (error) {
        console.error(`Failed to fetch RUL for ${sensorId}:`, error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRUL();
  }, [sensorId]);

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-xs text-text-muted animate-pulse">
        <Loader className="w-3.5 h-3.5 animate-spin" /> Calculating RUL...
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center gap-2 text-xs text-text-muted">
        <AlertTriangle className="w-3.5 h-3.5" /> RUL unavailable
      </div>
    );
  }

  const statusConfig = {
    healthy: { 
      color: 'text-status-good', 
      bg: 'bg-status-good/10', 
      border: 'border-status-good/20',
      icon: <Battery className="w-4 h-4" />
    },
    degraded: { 
      color: 'text-status-warning', 
      bg: 'bg-status-warning/10', 
      border: 'border-status-warning/20',
      icon: <BatteryWarning className="w-4 h-4" />
    },
    critical: { 
      color: 'text-status-critical', 
      bg: 'bg-status-critical/10', 
      border: 'border-status-critical/20',
      icon: <BatteryCharging className="w-4 h-4" />
    }
  };

  const config = statusConfig[data.status];
  const daysLeft = (data.rul_hours / 24).toFixed(1);

  return (
    <div className={`flex items-center gap-3 px-3 py-2 rounded-lg border ${config.bg} ${config.border} transition-all`}>
      <div className={config.color}>{config.icon}</div>
      <div className="flex flex-col">
        <span className={`text-sm font-bold ${config.color}`}>
          {data.rul_hours.toFixed(0)}h RUL
        </span>
        <span className="text-[10px] text-text-muted">
          ~{daysLeft} days remaining • {data.anomaly_count} anomalies logged
        </span>
      </div>
    </div>
  );
}