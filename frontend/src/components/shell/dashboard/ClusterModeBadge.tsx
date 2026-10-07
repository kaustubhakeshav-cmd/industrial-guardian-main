import { useEffect, useState } from 'react';
import axios from 'axios';
import { Brain, Loader, AlertCircle, CheckCircle, AlertTriangle } from 'lucide-react';

interface ClusterData {
  cluster: string;
  color: 'good' | 'warning' | 'critical';
  confidence: number;
  description: string;
}

export default function ClusterModeBadge() {
  const [data, setData] = useState<ClusterData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCluster = async () => {
      try {
        const res = await axios.get('http://127.0.0.1:8000/api/ai/cluster-mode');
        setData(res.data);
      } catch (error) {
        console.error("Failed to fetch cluster mode:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCluster();
    const interval = setInterval(fetchCluster, 8000); // Refresh every 8s
    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <div className="bg-bg-panel border border-border-panel rounded-xl p-4 flex items-center justify-center h-28">
        <div className="flex items-center gap-2 text-text-muted animate-pulse">
          <Loader className="w-4 h-4 animate-spin" /> Analyzing streaming clusters...
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-bg-panel border border-border-panel rounded-xl p-4 flex items-center justify-center h-28">
        <div className="flex items-center gap-2 text-text-muted">
          <AlertCircle className="w-4 h-4" /> Cluster data unavailable
        </div>
      </div>
    );
  }

  const colorMap = {
    good: { text: 'text-status-good', bg: 'bg-status-good/10', border: 'border-status-good/20', icon: CheckCircle },
    warning: { text: 'text-status-warning', bg: 'bg-status-warning/10', border: 'border-status-warning/20', icon: AlertTriangle },
    critical: { text: 'text-status-critical', bg: 'bg-status-critical/10', border: 'border-status-critical/20', icon: AlertCircle }
  };

  const style = colorMap[data.color];
  const Icon = style.icon;

  return (
    <div className={`bg-bg-panel border rounded-xl p-4 transition-all ${style.border} ${data.color === 'critical' ? 'shadow-lg shadow-status-critical/10' : ''}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Brain className={`w-4 h-4 ${style.text}`} />
          <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider">AI Operational Cluster</h3>
        </div>
        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${style.bg} ${style.text} border ${style.border}`}>
          {data.confidence * 100}% Conf.
        </span>
      </div>
      
      <div className="flex items-center gap-2 mb-1">
        <Icon className={`w-5 h-5 ${style.text}`} />
        <span className={`text-lg font-bold ${style.text}`}>{data.cluster}</span>
      </div>
      
      <p className="text-[10px] text-text-muted leading-tight">{data.description}</p>
    </div>
  );
}