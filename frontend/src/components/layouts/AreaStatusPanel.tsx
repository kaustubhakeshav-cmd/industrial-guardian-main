import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, AlertTriangle, AlertCircle, ArrowRight } from 'lucide-react';

export default function AreaStatusPanel() {
  const navigate = useNavigate();
  const [areas, setAreas] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await axios.get('http://127.0.0.1:8000/api/layout/area-status');
        setAreas(res.data);
      } catch (error) {
        console.error("Failed to fetch area status:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStatus();
    // Refresh every 5 seconds to catch scenario spikes instantly
    const interval = setInterval(fetchStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  const getIcon = (status: string) => {
    if (status === 'Anomaly') return <AlertCircle className="w-5 h-5 text-status-critical" />;
    if (status === 'Warning') return <AlertTriangle className="w-5 h-5 text-status-warning" />;
    return <CheckCircle className="w-5 h-5 text-status-good" />;
  };

  const getColorClasses = (color: string) => {
    if (color === 'critical') return 'bg-status-critical/10 border-status-critical/30 text-status-critical';
    if (color === 'warning') return 'bg-status-warning/10 border-status-warning/30 text-status-warning';
    return 'bg-status-good/10 border-status-good/30 text-status-good';
  };

  return (
    <div className="bg-bg-panel border border-border-panel rounded-xl p-6 h-full flex flex-col">
      <h3 className="text-lg font-semibold text-text-primary mb-4">Area Status</h3>
      
      <div className="flex-1 overflow-y-auto space-y-3 pr-2">
        {isLoading ? (
          <div className="text-center text-text-muted animate-pulse pt-10">Loading plant areas...</div>
        ) : (
          areas.map((area, idx) => (
            <div key={idx} className={`p-4 rounded-lg border transition-all ${getColorClasses(area.color)}`}>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {getIcon(area.status)}
                  <div>
                    <p className="text-sm font-medium text-text-primary">{area.name}</p>
                    <p className="text-xs opacity-80 mt-0.5">Pressure: {area.value} {area.unit}</p>
                  </div>
                </div>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full bg-bg-panel/50 border border-current`}>
                  {area.status}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* FIXED: Clickable Button */}
      <button 
        onClick={() => navigate('/sensors')}
        className="mt-4 w-full py-2.5 rounded-lg bg-accent-primary/10 text-accent-primary border border-accent-primary/20 hover:bg-accent-primary/20 transition-colors flex items-center justify-center gap-2 font-medium text-sm"
      >
        View Full Sensor Dashboard
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}