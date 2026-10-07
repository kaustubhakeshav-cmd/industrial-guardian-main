import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, AlertTriangle, AlertCircle, ArrowRight, RefreshCw } from 'lucide-react';

interface AreaStatus {
  name: string;
  value: number;
  unit: string;
  status: 'Normal' | 'Warning' | 'Anomaly';
  color: 'good' | 'warning' | 'critical';
  change: string;
}

export default function AreaStatusList() {
  const navigate = useNavigate();
  const [areas, setAreas] = useState<AreaStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStatus = async () => {
    try {
      console.log("🔄 FETCHING AREA STATUS FROM BACKEND...");
      const res = await axios.get('http://127.0.0.1:8000/api/layout/area-status');
      console.log("✅ BACKEND RESPONSE:", res.data);
      setAreas(res.data);
    } catch (error) {
      console.error("❌ Failed to fetch area status:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 3000);
    return () => clearInterval(interval);
  }, []);

  const getIcon = (status: string) => {
    switch(status) {
      case 'Anomaly': return <AlertCircle className="w-5 h-5 text-status-critical" />;
      case 'Warning': return <AlertTriangle className="w-5 h-5 text-status-warning" />;
      default: return <CheckCircle className="w-5 h-5 text-status-good" />;
    }
  };

  const getCardStyle = (color: string) => {
    switch(color) {
      case 'critical': return 'bg-status-critical/10 border-status-critical/30';
      case 'warning': return 'bg-status-warning/10 border-status-warning/30';
      default: return 'bg-status-good/10 border-status-good/30';
    }
  };

  const getStatusColor = (color: string) => {
     switch(color) {
      case 'critical': return 'text-status-critical bg-status-critical/20';
      case 'warning': return 'text-status-warning bg-status-warning/20';
      default: return 'text-status-good bg-status-good/20';
    }
  }

  return (
    <div className="bg-bg-panel border border-border-panel rounded-xl p-6 h-full flex flex-col">
      
      {/* UNDENIABLE PROOF THAT THIS IS THE NEW FILE */}
      <div className="mb-4 p-2 bg-status-good/20 border border-status-good rounded text-center text-xs font-bold text-status-good">
        ✅ DYNAMIC COMPONENT ACTIVE
      </div>

      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-text-primary">Area Status</h3>
        <div className="text-[10px] text-text-muted flex items-center gap-1">
          <RefreshCw className="w-3 h-3" /> Live
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto space-y-3 pr-2">
        {isLoading ? (
          <div className="text-center text-text-muted animate-pulse pt-10">Loading plant areas...</div>
        ) : areas.length === 0 ? (
           <div className="text-center text-text-muted pt-10">No area data.</div>
        ) : (
          areas.map((area, idx) => (
            <div 
              key={idx} 
              className={`p-4 rounded-lg border transition-all ${getCardStyle(area.color)}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {getIcon(area.status)}
                  <div>
                    <p className="text-sm font-medium text-text-primary">{area.name}</p>
                    <p className="text-xs opacity-80 mt-0.5">Pressure: {area.value} {area.unit}</p>
                  </div>
                </div>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${getStatusColor(area.color)}`}>
                  {area.status}
                </span>
              </div>
              <div className="mt-2 text-[10px] opacity-70 flex justify-between">
                <span>Deviation</span>
                <span className={`font-medium ${area.color === 'critical' ? 'text-status-critical' : 'text-text-muted'}`}>
                  {area.change}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* THIS BUTTON NOW NAVIGATES TO /SENSORS */}
      <button 
        onClick={() => {
          console.log("Navigating to /sensors");
          navigate('/sensors');
        }} 
        className="mt-4 w-full py-2.5 rounded-lg bg-accent-primary/10 text-accent-primary border border-accent-primary/20 hover:bg-accent-primary/20 transition-colors flex items-center justify-center gap-2 font-medium text-sm cursor-pointer"
      >
        View Full Sensor Dashboard
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}