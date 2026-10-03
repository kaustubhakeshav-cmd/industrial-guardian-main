import { Database, Server, Cpu, Activity, CheckCircle2, AlertCircle } from 'lucide-react';

const services = [
  { name: 'PostgreSQL Database', status: 'Operational', latency: '12ms', icon: Database, color: 'text-status-good', bg: 'bg-status-good/10' },
  { name: 'FastAPI Backend', status: 'Operational', latency: '4ms', icon: Server, color: 'text-status-good', bg: 'bg-status-good/10' },
  { name: 'Redis Cache', status: 'Operational', latency: '2ms', icon: Cpu, color: 'text-status-good', bg: 'bg-status-good/10' },
  { name: 'AI Anomaly Model', status: 'Degraded', latency: '145ms', icon: Activity, color: 'text-status-warning', bg: 'bg-status-warning/10' },
];

export default function SystemHealth() {
  return (
    <div className="bg-bg-panel border border-border-panel rounded-xl p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-accent-primary" />
          <h2 className="text-lg font-semibold text-text-primary">System Health & Infrastructure</h2>
        </div>
        <div className="flex items-center gap-2 text-xs text-status-good bg-status-good/10 px-3 py-1.5 rounded-full border border-status-good/20">
          <CheckCircle2 className="w-3 h-3" /> All Systems Operational
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
        {services.map((service) => {
          const Icon = service.icon;
          return (
            <div key={service.name} className="bg-bg-page border border-border-panel rounded-lg p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg ${service.bg} flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${service.color}`} />
                </div>
                <div>
                  <p className="text-sm font-medium text-text-primary">{service.name}</p>
                  <p className="text-xs text-text-muted mt-0.5">Latency: {service.latency}</p>
                </div>
              </div>
              <div className={`flex items-center gap-1.5 text-xs font-semibold ${service.color}`}>
                {service.status === 'Operational' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                {service.status}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}