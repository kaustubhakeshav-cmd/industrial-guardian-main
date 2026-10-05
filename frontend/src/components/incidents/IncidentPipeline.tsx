import { useEffect, useState } from 'react';
import axios from 'axios';
import { AlertTriangle, Wrench, CheckCircle2 } from 'lucide-react';

interface Incident {
  id: number;
  status: 'open' | 'investigating' | 'resolved';
}

export default function IncidentPipeline() {
  const [counts, setCounts] = useState({ open: 0, investigating: 0, resolved: 0 });
  const [isLoading, setIsLoading] = useState(true);

  // Fetch real counts from the database
  const fetchCounts = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/api/incidents');
      const incidents = response.data;
      
      // Calculate real counts based on database status
      const openCount = incidents.filter((i: Incident) => i.status === 'open').length;
      const investigatingCount = incidents.filter((i: Incident) => i.status === 'investigating').length;
      const resolvedCount = incidents.filter((i: Incident) => i.status === 'resolved').length;

      setCounts({
        open: openCount,
        investigating: investigatingCount,
        resolved: resolvedCount,
      });
    } catch (error) {
      console.error("Failed to fetch incident counts:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCounts();
    
    // Poll every 5 seconds so the pipeline updates automatically 
    // when you resolve an incident in the table!
    const interval = setInterval(fetchCounts, 5000);
    return () => clearInterval(interval);
  }, []);

  // Match stages to our actual database statuses
  const stages = [
    { id: 'open', label: 'Detected (Open)', icon: AlertTriangle, count: counts.open, color: 'bg-status-critical', textColor: 'text-status-critical' },
    { id: 'investigating', label: 'In Progress', icon: Wrench, count: counts.investigating, color: 'bg-status-warning', textColor: 'text-status-warning' },
    { id: 'resolved', label: 'Resolved', icon: CheckCircle2, count: counts.resolved, color: 'bg-status-good', textColor: 'text-status-good' },
  ];

  if (isLoading) {
    return (
      <div className="bg-bg-panel border border-border-panel rounded-xl p-6 flex items-center justify-center h-32">
        <p className="text-text-muted animate-pulse">Loading pipeline...</p>
      </div>
    );
  }

  return (
    <div className="bg-bg-panel border border-border-panel rounded-xl p-6">
      <h2 className="text-lg font-semibold text-text-primary mb-6">Incident Workflow Pipeline</h2>
      
      <div className="flex items-center justify-between relative">
        {/* Connecting Line */}
        <div className="absolute top-5 left-0 right-0 h-0.5 bg-border-panel -z-10"></div>

        {stages.map((stage) => {
          const Icon = stage.icon;
          return (
            <div key={stage.id} className="flex flex-col items-center relative bg-bg-panel px-4 z-10">
              <div className={`w-10 h-10 rounded-full ${stage.color} bg-opacity-10 border-2 border-bg-panel flex items-center justify-center mb-2 shadow-lg`}>
                <Icon className={`w-5 h-5 ${stage.textColor}`} />
              </div>
              <p className="text-sm font-medium text-text-primary text-center">{stage.label}</p>
              <p className={`text-xl font-bold ${stage.textColor} mt-1`}>{stage.count}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}