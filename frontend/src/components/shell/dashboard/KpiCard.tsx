import type { LucideIcon } from 'lucide-react';

interface KpiCardProps {
  title: string;
  value: string | number;
  subtext: string;
  status: 'good' | 'warning' | 'critical';
  icon: LucideIcon;
  progress: number; // 0 to 100
}

export default function KpiCard({ title, value, subtext, status, icon: Icon, progress }: KpiCardProps) {
  const statusColors = {
    good: 'bg-status-good',
    warning: 'bg-status-warning',
    critical: 'bg-status-critical',
  };

  const statusTextColors = {
    good: 'text-status-good',
    warning: 'text-status-warning',
    critical: 'text-status-critical',
  };

  return (
    <div className="bg-bg-panel border border-border-panel rounded-xl p-5 flex flex-col justify-between h-32">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-text-muted text-xs font-medium uppercase tracking-wider">{title}</p>
          <h3 className="text-3xl font-semibold text-text-primary mt-1">{value}</h3>
        </div>
        <div className={`p-2 rounded-lg ${statusColors[status]} bg-opacity-10`}>
          <Icon className={`w-5 h-5 ${statusTextColors[status]}`} />
        </div>
      </div>
      
      <div className="mt-2">
        <div className="flex justify-between items-center mb-1">
          <span className={`text-xs font-medium ${statusTextColors[status]}`}>{subtext}</span>
          <span className="text-xs text-text-muted">{progress}%</span>
        </div>
        <div className="w-full bg-bg-page rounded-full h-1.5">
          <div 
            className={`h-1.5 rounded-full ${statusColors[status]}`} 
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
}