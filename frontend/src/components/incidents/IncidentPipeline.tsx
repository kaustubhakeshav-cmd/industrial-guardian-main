import { AlertTriangle, User, Wrench, CheckCircle2 } from 'lucide-react';

const stages = [
  { id: 'detected', label: 'Detected', icon: AlertTriangle, count: 12, color: 'bg-status-critical', textColor: 'text-status-critical' },
  { id: 'assigned', label: 'Assigned', icon: User, count: 5, color: 'bg-accent-primary', textColor: 'text-accent-primary' },
  { id: 'in-progress', label: 'In Progress', icon: Wrench, count: 3, color: 'bg-status-warning', textColor: 'text-status-warning' },
  { id: 'resolved', label: 'Resolved', icon: CheckCircle2, count: 28, color: 'bg-status-good', textColor: 'text-status-good' },
];

export default function IncidentPipeline() {
  return (
    <div className="bg-bg-panel border border-border-panel rounded-xl p-6">
      <h2 className="text-lg font-semibold text-text-primary mb-6">Incident Workflow Pipeline</h2>
      
      <div className="flex items-center justify-between relative">
        {/* Connecting Line */}
        <div className="absolute top-5 left-0 right-0 h-0.5 bg-border-panel -z-10"></div>

        {stages.map((stage, index) => {
          const Icon = stage.icon;
          return (
            <div key={stage.id} className="flex flex-col items-center relative bg-bg-panel px-2">
              <div className={`w-10 h-10 rounded-full ${stage.color} bg-opacity-10 border-2 border-bg-panel flex items-center justify-center mb-2`}>
                <Icon className={`w-5 h-5 ${stage.textColor}`} />
              </div>
              <p className="text-sm font-medium text-text-primary">{stage.label}</p>
              <p className={`text-xs font-bold ${stage.textColor} mt-1`}>{stage.count}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}