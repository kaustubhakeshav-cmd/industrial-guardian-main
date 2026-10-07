import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, AlertTriangle, CheckCircle, ArrowRight } from 'lucide-react';

interface Incident {
  id: number;
  sensor_id: string;
  timestamp: string;
  severity: 'low' | 'medium' | 'critical';
  status: 'open' | 'investigating' | 'resolved';
  description: string | null;
}

export default function RecentAlerts() {
  const [alerts, setAlerts] = useState<Incident[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
           const res = await axios.get('http://127.0.0.1:8000/api/dashboard-alerts');
        setAlerts(res.data);
      } catch (error) {
        console.error("Failed to fetch alerts:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAlerts();
    const interval = setInterval(fetchAlerts, 10000); // Refresh every 10s
    return () => clearInterval(interval);
  }, []);

  const getSeverityIcon = (severity: string) => {
    if (severity === 'critical') return <AlertCircle className="w-5 h-5 text-status-critical" />;
    if (severity === 'medium') return <AlertTriangle className="w-5 h-5 text-status-warning" />;
    return <CheckCircle className="w-5 h-5 text-status-good" />;
  };

  return (
    <div className="bg-bg-panel border border-border-panel rounded-xl p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-text-primary">Recent Alerts</h3>
        <button onClick={() => navigate('/anomalies')} className="text-xs text-accent-primary hover:underline font-medium flex items-center gap-1">
          View All <ArrowRight className="w-3 h-3" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 pr-2">
        {isLoading ? (
          <div className="text-center text-text-muted animate-pulse pt-10">Loading alerts...</div>
        ) : alerts.length === 0 ? (
          <div className="text-center text-text-muted pt-10">No recent alerts.</div>
        ) : (
          alerts.slice(0, 5).map((alert) => (
            <div 
              key={alert.id} 
              onClick={() => navigate('/incidents')}
              className="p-4 rounded-lg border border-border-panel bg-bg-page hover:border-accent-primary/30 transition-colors cursor-pointer group"
            >
              <div className="flex items-start gap-3">
                <div className="mt-1">{getSeverityIcon(alert.severity)}</div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-text-primary">{alert.sensor_id} Alert</p>
                    <span className="text-[10px] text-text-muted">{new Date(alert.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <p className="text-xs text-text-muted mt-1 line-clamp-1">
                    {alert.description || `${alert.severity} severity incident detected.`}
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border capitalize ${
                      alert.status === 'resolved' ? 'bg-status-good/10 text-status-good border-status-good/20' :
                      alert.severity === 'critical' ? 'bg-status-critical/10 text-status-critical border-status-critical/20' :
                      'bg-status-warning/10 text-status-warning border-status-warning/20'
                    }`}>
                      {alert.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}