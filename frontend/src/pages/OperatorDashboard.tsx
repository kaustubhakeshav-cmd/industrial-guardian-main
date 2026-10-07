import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import GlobalShell from '../components/shell/GlobalShell';
import KpiCard from '../components/shell/dashboard/KpiCard';
import LiveProcessChart from '../components/shell/dashboard/LiveProcessChart';
import AnomalyScoreGauge from '../components/shell/dashboard/AnomalyScoreGauge';
import RecentAlerts from '../components/shell/dashboard/RecentAlerts';
import WeeklyAnomalyTrend from '../components/shell/dashboard/WeeklyAnomalyTrend';
import AIAssistantPanel from '../components/shell/dashboard/AIAssistantPanel';
import { Activity, AlertTriangle, FileWarning } from 'lucide-react';
import AIHealthCard from '../components/shell/dashboard/AIHealthCard';
import ClusterModeBadge from '../components/shell/dashboard/ClusterModeBadge';

export default function OperatorDashboard() {
  const navigate = useNavigate();
  
  // 1. Dynamic state for total sensors
  const [totalSensors, setTotalSensors] = useState(0);

  // 2. Fetch real sensor count on component mount
  useEffect(() => {
    axios.get('http://127.0.0.1:8000/api/sensors')
      .then(res => setTotalSensors(res.data.length))
      .catch(err => console.error("Failed to fetch total sensors:", err));
  }, []);

  return (
    <GlobalShell>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-semibold text-text-primary">Plant Overview</h1>
          <p className="text-text-muted text-sm mt-1">Real-time monitoring · AI-powered anomaly detection</p>
        </div>

        {/* KPI Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          
          {/* Total Sensors -> NOW DYNAMIC & Routes to /sensors */}
          <div 
            onClick={() => navigate('/sensors')} 
            className="cursor-pointer hover:scale-[1.02] transition-transform duration-200"
          >
            <KpiCard 
              title="Total Sensors" 
              value={totalSensors} 
              subtext="Online" 
              status="good" 
              icon={Activity} 
              progress={100} 
            />
          </div>

          {/* Active Anomalies -> Routes to /anomalies */}
          <div 
            onClick={() => navigate('/anomalies')} 
            className="cursor-pointer hover:scale-[1.02] transition-transform duration-200"
          >
            <KpiCard title="Active Anomalies" value={3} subtext="Requires attention" status="critical" icon={AlertTriangle} progress={6} />
          </div>

          {/* Incidents (24h) -> Routes to /incidents */}
          <div 
            onClick={() => navigate('/incidents')} 
            className="cursor-pointer hover:scale-[1.02] transition-transform duration-200"
          >
            <KpiCard title="Incidents (24h)" value={2} subtext="Investigating" status="warning" icon={FileWarning} progress={4} />
          </div>
          
          {/* AI Health Card & Cluster Badge */}
          <AIHealthCard />
          <ClusterModeBadge /> 
        </div>

        {/* Main Chart Area */}
        <LiveProcessChart />

        {/* Middle Section: Gauge and Alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <AnomalyScoreGauge />
          </div>
          <div className="lg:col-span-2">
            <div className="flex justify-between items-center mb-2">
               <h2 className="text-lg font-semibold text-text-primary">Recent Alerts</h2>
               <button onClick={() => navigate('/anomalies')} className="text-xs text-accent-primary hover:underline font-medium">View All →</button>
            </div>
            <RecentAlerts />
          </div>
        </div>

        {/* Bottom Section: Trend and AI Assistant */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <WeeklyAnomalyTrend />
          </div>
          <div className="lg:col-span-1">
            <AIAssistantPanel />
          </div>
        </div>
      </div>
    </GlobalShell>
  );
}