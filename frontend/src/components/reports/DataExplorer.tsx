import { Filter, Download, Calendar } from 'lucide-react';

// Mock historical data
const historicalData = [
  { timestamp: '2026-10-02 14:32:18', sensor: 'P-103', value: 89.7, unit: 'bar', status: 'Warning' },
  { timestamp: '2026-10-02 14:30:00', sensor: 'P-103', value: 88.2, unit: 'bar', status: 'Normal' },
  { timestamp: '2026-10-02 14:28:15', sensor: 'T-201', value: 145.2, unit: '°C', status: 'Normal' },
  { timestamp: '2026-10-02 14:25:00', sensor: 'F-301', value: 38.7, unit: 'm³/h', status: 'Normal' },
  { timestamp: '2026-10-02 14:20:10', sensor: 'V-401', value: 4.5, unit: 'mm/s', status: 'Critical' },
];

export default function DataExplorer() {
  return (
    <div className="bg-bg-panel border border-border-panel rounded-xl p-6 flex flex-col h-full">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-text-primary">Data Explorer & Historical Analysis</h2>
        <button className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg bg-accent-primary/10 text-accent-primary border border-accent-primary/20 hover:bg-accent-primary/20 transition-colors">
          <Download className="w-3 h-3" /> Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div>
          <label className="block text-xs text-text-muted uppercase tracking-wider font-semibold mb-2">Plant Area</label>
          <select className="w-full bg-bg-page border border-border-panel rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/50">
            <option>All Areas</option>
            <option>Reactor Area</option>
            <option>Turbine Area</option>
          </select>
        </div>
        <div>
          <label className="block text-xs text-text-muted uppercase tracking-wider font-semibold mb-2">Equipment</label>
          <select className="w-full bg-bg-page border border-border-panel rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/50">
            <option>All Equipment</option>
            <option>Pump P-103</option>
            <option>Heat Exchanger</option>
          </select>
        </div>
        <div>
          <label className="block text-xs text-text-muted uppercase tracking-wider font-semibold mb-2">Start Date</label>
          <div className="relative">
            <input type="text" defaultValue="Oct 01, 2026" className="w-full bg-bg-page border border-border-panel rounded-lg pl-9 pr-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/50" />
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          </div>
        </div>
        <div className="flex items-end">
          <button className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-accent-primary text-white text-sm font-medium hover:bg-accent-primary/90 transition-colors">
            <Filter className="w-4 h-4" /> Apply Filters
          </button>
        </div>
      </div>

      {/* Data Table */}
      <div className="flex-1 overflow-x-auto border-t border-border-panel pt-4">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border-panel text-text-muted text-xs uppercase tracking-wider">
              <th className="py-3 px-4 font-medium">Timestamp</th>
              <th className="py-3 px-4 font-medium">Sensor ID</th>
              <th className="py-3 px-4 font-medium">Value</th>
              <th className="py-3 px-4 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {historicalData.map((row, idx) => (
              <tr key={idx} className="border-b border-border-panel/50 hover:bg-bg-page/50 transition-colors">
                <td className="py-3 px-4 font-mono text-text-muted text-xs">{row.timestamp}</td>
                <td className="py-3 px-4 text-text-primary font-medium">{row.sensor}</td>
                <td className="py-3 px-4 text-text-primary">{row.value} <span className="text-text-muted text-xs">{row.unit}</span></td>
                <td className="py-3 px-4">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
                    row.status === 'Critical' ? 'bg-status-critical/10 text-status-critical border-status-critical/20' :
                    row.status === 'Warning' ? 'bg-status-warning/10 text-status-warning border-status-warning/20' :
                    'bg-status-good/10 text-status-good border-status-good/20'
                  }`}>
                    {row.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}