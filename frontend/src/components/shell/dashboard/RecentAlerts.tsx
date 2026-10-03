import { AlertCircle, CheckCircle2, Clock } from 'lucide-react';

const alerts = [
  { id: 1, time: '14:32:18', equipment: 'Reactor A', metric: 'Temperature Deviation', status: 'critical', type: 'Anomaly' },
  { id: 2, time: '14:15:05', equipment: 'Pump P-103', metric: 'Vibration Increase', status: 'warning', type: 'Warning' },
  { id: 3, time: '13:48:22', equipment: 'Valve V-23', metric: 'Flow Rate Drop', status: 'critical', type: 'Anomaly' },
  { id: 4, time: '12:10:00', equipment: 'Cooling Tower', metric: 'System Recovered', status: 'good', type: 'Resolved' },
];

const statusConfig = {
  critical: { color: 'text-status-critical', bg: 'bg-status-critical/10', border: 'border-status-critical/20', icon: AlertCircle },
  warning: { color: 'text-status-warning', bg: 'bg-status-warning/10', border: 'border-status-warning/20', icon: AlertCircle },
  good: { color: 'text-status-good', bg: 'bg-status-good/10', border: 'border-status-good/20', icon: CheckCircle2 },
};

export default function RecentAlerts() {
  return (
    <div className="bg-bg-panel border border-border-panel rounded-xl p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-text-primary">Recent Alerts</h2>
        <button className="text-xs text-accent-primary hover:underline font-medium">View All</button>
      </div>
      
      <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
        {alerts.map((alert) => {
          const config = statusConfig[alert.status as keyof typeof statusConfig];
          const Icon = config.icon;
          return (
            <div key={alert.id} className={`p-3 rounded-lg border ${config.bg} ${config.border} flex items-start gap-3 transition-colors hover:bg-opacity-20`}>
              <Icon className={`w-5 h-5 ${config.color} mt-0.5 flex-shrink-0`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-text-primary truncate">{alert.metric}</p>
                  <span className="text-[10px] text-text-muted flex items-center gap-1 flex-shrink-0">
                    <Clock className="w-3 h-3" /> {alert.time}
                  </span>
                </div>
                <p className="text-xs text-text-muted mt-1">{alert.equipment} · {alert.type}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}