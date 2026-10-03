import { FileText, TrendingUp, AlertTriangle, Settings, Download } from 'lucide-react';

const reportTypes = [
  { id: 'weekly', title: 'Weekly Summary', desc: 'Automated overview of plant health and anomaly counts.', icon: FileText, color: 'text-accent-primary', bg: 'bg-accent-primary/10' },
  { id: 'monthly', title: 'Monthly Performance', desc: 'Deep dive into sensor reliability and system uptime.', icon: TrendingUp, color: 'text-status-good', bg: 'bg-status-good/10' },
  { id: 'incident', title: 'Incident Report', desc: 'Detailed timeline and root-cause analysis for all incidents.', icon: AlertTriangle, color: 'text-status-critical', bg: 'bg-status-critical/10' },
  { id: 'custom', title: 'Custom Report', desc: 'Select specific sensors, timeframes, and metrics.', icon: Settings, color: 'text-status-warning', bg: 'bg-status-warning/10' },
];

export default function ReportCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {reportTypes.map((report) => {
        const Icon = report.icon;
        return (
          <div key={report.id} className="bg-bg-panel border border-border-panel rounded-xl p-5 flex flex-col justify-between hover:border-accent-primary/30 transition-colors">
            <div>
              <div className={`w-10 h-10 rounded-lg ${report.bg} flex items-center justify-center mb-4`}>
                <Icon className={`w-5 h-5 ${report.color}`} />
              </div>
              <h3 className="text-base font-semibold text-text-primary mb-1">{report.title}</h3>
              <p className="text-xs text-text-muted leading-relaxed">{report.desc}</p>
            </div>
            <button className="mt-4 w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-bg-page border border-border-panel text-sm font-medium text-text-primary hover:bg-accent-primary/10 hover:text-accent-primary hover:border-accent-primary/30 transition-all">
              <Download className="w-4 h-4" /> Generate
            </button>
          </div>
        );
      })}
    </div>
  );
}