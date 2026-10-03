import GlobalShell from '../components/shell/GlobalShell';
import KpiCard from '../components/shell/dashboard/KpiCard';
import LiveProcessChart from '../components/shell/dashboard/LiveProcessChart';
import AnomalyScoreGauge from '../components/shell/dashboard/AnomalyScoreGauge';
import RecentAlerts from '../components/shell/dashboard/RecentAlerts';
import WeeklyAnomalyTrend from '../components/shell/dashboard/WeeklyAnomalyTrend';
import AIAssistantPanel from '../components/shell/dashboard/AIAssistantPanel';
import { Activity, AlertTriangle, FileWarning, ShieldCheck } from 'lucide-react';

export default function OperatorDashboard() {
  return (
    <GlobalShell>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-semibold text-text-primary">Plant Overview</h1>
          <p className="text-text-muted text-sm mt-1">Real-time monitoring · AI-powered anomaly detection</p>
        </div>

        {/* KPI Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard title="Total Sensors" value={48} subtext="Online" status="good" icon={Activity} progress={100} />
          <KpiCard title="Active Anomalies" value={3} subtext="Requires attention" status="critical" icon={AlertTriangle} progress={6} />
          <KpiCard title="Incidents (24h)" value={2} subtext="Investigating" status="warning" icon={FileWarning} progress={4} />
          <KpiCard title="System Health" value="98.7%" subtext="Good" status="good" icon={ShieldCheck} progress={98} />
        </div>

        {/* Main Chart Area */}
        <LiveProcessChart />

        {/* Middle Section: Gauge and Alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <AnomalyScoreGauge />
          </div>
          <div className="lg:col-span-2">
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