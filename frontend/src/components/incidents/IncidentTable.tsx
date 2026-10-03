import { Download, Filter } from 'lucide-react';

// Mock data - we will connect this to the real backend later
const mockIncidents = [
  { id: 'INC-1042', severity: 'critical', equipment: 'Pump P-103', area: 'Reactor Area', assignee: 'Rahul (Engineer)', status: 'Open', time: '2h ago' },
  { id: 'INC-1041', severity: 'warning', equipment: 'Heat Exchanger', area: 'Turbine Area', assignee: 'Aisha (Operator)', status: 'Investigating', time: '4h ago' },
  { id: 'INC-1040', severity: 'critical', equipment: 'Turbine T-201', area: 'Turbine Area', assignee: 'Rahul (Engineer)', status: 'In Progress', time: '6h ago' },
  { id: 'INC-1039', severity: 'good', equipment: 'Compressor C-201', area: 'Compressor Area', assignee: 'Priya (Operator)', status: 'Resolved', time: '8h ago' },
  { id: 'INC-1038', severity: 'warning', equipment: 'Reactor R-101', area: 'Reactor Area', assignee: 'Unassigned', status: 'Assigned', time: '12h ago' },
];

const severityConfig = {
  critical: { bg: 'bg-status-critical/10', text: 'text-status-critical', border: 'border-status-critical/20', label: 'High' },
  warning: { bg: 'bg-status-warning/10', text: 'text-status-warning', border: 'border-status-warning/20', label: 'Medium' },
  good: { bg: 'bg-status-good/10', text: 'text-status-good', border: 'border-status-good/20', label: 'Low' },
};

const statusConfig = {
  'Open': 'bg-status-critical/10 text-status-critical border-status-critical/20',
  'Investigating': 'bg-status-warning/10 text-status-warning border-status-warning/20',
  'In Progress': 'bg-accent-primary/10 text-accent-primary border-accent-primary/20',
  'Assigned': 'bg-text-muted/10 text-text-muted border-text-muted/20',
  'Resolved': 'bg-status-good/10 text-status-good border-status-good/20',
};

export default function IncidentTable() {
  return (
    <div className="bg-bg-panel border border-border-panel rounded-xl p-6 flex flex-col h-full">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-text-primary">Active Incidents</h2>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg bg-bg-page text-text-muted border border-border-panel hover:text-text-primary transition-colors">
            <Filter className="w-3 h-3" /> Filter
          </button>
          <button className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg bg-accent-primary/10 text-accent-primary border border-accent-primary/20 hover:bg-accent-primary/20 transition-colors">
            <Download className="w-3 h-3" /> Export CSV
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border-panel text-text-muted text-xs uppercase tracking-wider">
              <th className="py-3 px-4 font-medium">ID</th>
              <th className="py-3 px-4 font-medium">Severity</th>
              <th className="py-3 px-4 font-medium">Equipment</th>
              <th className="py-3 px-4 font-medium">Area</th>
              <th className="py-3 px-4 font-medium">Assignee</th>
              <th className="py-3 px-4 font-medium">Status</th>
              <th className="py-3 px-4 font-medium">Time</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {mockIncidents.map((incident) => {
              const sev = severityConfig[incident.severity as keyof typeof severityConfig];
              const statClass = statusConfig[incident.status as keyof typeof statusConfig] || statusConfig['Assigned'];
              return (
                <tr key={incident.id} className="border-b border-border-panel/50 hover:bg-bg-page/50 transition-colors cursor-pointer">
                  <td className="py-3 px-4 font-mono text-accent-primary font-medium">{incident.id}</td>
                  <td className="py-3 px-4">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded border ${sev.bg} ${sev.text} ${sev.border}`}>
                      {sev.label}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-text-primary">{incident.equipment}</td>
                  <td className="py-3 px-4 text-text-muted">{incident.area}</td>
                  <td className="py-3 px-4 text-text-primary">{incident.assignee}</td>
                  <td className="py-3 px-4">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${statClass}`}>
                      {incident.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-text-muted text-xs">{incident.time}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}