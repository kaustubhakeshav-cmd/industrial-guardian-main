import { CheckCircle2, AlertCircle, AlertTriangle } from 'lucide-react';

const areas = [
  { id: 1, name: 'Reactor Area', status: 'good', pressure: '72.4 bar', trend: '+2.4%' },
  { id: 2, name: 'Heat Exchanger Area', status: 'warning', pressure: '89.7 bar', trend: '+1.2%' },
  { id: 3, name: 'Compressor Area', status: 'critical', pressure: '112.3 bar', trend: '+6.8%' },
  { id: 4, name: 'Turbine Area', status: 'good', pressure: '48.6 bar', trend: '+0.5%' },
];

const statusConfig = {
  good: { color: 'text-status-good', bg: 'bg-status-good/10', border: 'border-status-good/20', icon: CheckCircle2, label: 'Normal' },
  warning: { color: 'text-status-warning', bg: 'bg-status-warning/10', border: 'border-status-warning/20', icon: AlertCircle, label: 'Warning' },
  critical: { color: 'text-status-critical', bg: 'bg-status-critical/10', border: 'border-status-critical/20', icon: AlertTriangle, label: 'Anomaly' },
};

export default function AreaStatusList() {
  return (
    <div className="bg-bg-panel border border-border-panel rounded-xl p-6 h-[600px] flex flex-col">
      <h2 className="text-lg font-semibold text-text-primary mb-4">Area Status</h2>
      
      <div className="flex-1 overflow-y-auto space-y-3 pr-2">
        {areas.map((area) => {
          const config = statusConfig[area.status as keyof typeof statusConfig];
          const Icon = config.icon;
          return (
            <div key={area.id} className={`p-4 rounded-lg border ${config.bg} ${config.border} flex items-center justify-between transition-colors hover:bg-opacity-20 cursor-pointer`}>
              <div className="flex items-center gap-3">
                <Icon className={`w-5 h-5 ${config.color}`} />
                <div>
                  <p className="text-sm font-medium text-text-primary">{area.name}</p>
                  <p className="text-xs text-text-muted mt-0.5">Pressure: {area.pressure}</p>
                </div>
              </div>
              
              <div className="flex flex-col items-end gap-1">
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${config.bg} ${config.color} border ${config.border}`}>
                  {config.label}
                </span>
                <span className={`text-xs font-medium ${area.trend.startsWith('+') ? 'text-status-critical' : 'text-status-good'}`}>
                  {area.trend}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <button className="w-full mt-4 py-2.5 rounded-lg bg-accent-primary/10 text-accent-primary border border-accent-primary/20 text-sm font-medium hover:bg-accent-primary/20 transition-colors">
        View Full Sensor Dashboard
      </button>
    </div>
  );
}