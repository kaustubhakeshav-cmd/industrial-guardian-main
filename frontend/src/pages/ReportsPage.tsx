import { useState, useEffect } from 'react';
import axios from 'axios';
import GlobalShell from '../components/shell/GlobalShell';
import { 
  FileText, TrendingUp, AlertTriangle, Settings, Download, 
  Filter, Calendar, Loader, X, CheckCircle 
} from 'lucide-react';

const TABS = ['Operational', 'Anomaly', 'Performance', 'Custom'];

const REPORT_CARDS = [
  { id: 'weekly', title: 'Weekly Summary', desc: 'Automated overview of plant health and anomaly counts.', icon: FileText, tab: 'Operational' },
  { id: 'monthly', title: 'Monthly Performance', desc: 'Deep dive into sensor reliability and system uptime.', icon: TrendingUp, tab: 'Performance' },
  { id: 'incident', title: 'Incident Report', desc: 'Detailed timeline and root-cause analysis for all incidents.', icon: AlertTriangle, tab: 'Anomaly' },
  { id: 'custom', title: 'Custom Report', desc: 'Select specific sensors, timeframes, and metrics.', icon: Settings, tab: 'Custom' },
];

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState('Operational');
  const [generating, setGenerating] = useState<string | null>(null);
  const [reportModal, setReportModal] = useState<{ open: boolean; content: string; type: string }>({ open: false, content: '', type: '' });
  
  // Data Explorer State
  const [area, setArea] = useState('all');
  const [sensor, setSensor] = useState('all');
  const [startDate, setStartDate] = useState(() => {
    const d = new Date(); d.setDate(d.getDate() - 7);
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [data, setData] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(false);

  // Fetch historical data
  const fetchData = async () => {
    setLoadingData(true);
    try {
      const res = await axios.get('http://127.0.0.1:8000/api/reports/historical', {
        params: { area, sensor, start_date: startDate, end_date: endDate }
      });
      setData(res.data);
    } catch (err) {
      console.error("Failed to fetch data:", err);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // Generate Report
  const handleGenerate = async (reportId: string) => {
    setGenerating(reportId);
    try {
      const res = await axios.post('http://127.0.0.1:8000/api/reports/generate', { type: reportId });
      setReportModal({ open: true, content: res.data.report, type: reportId });
    } catch (err) {
      console.error("Failed to generate report:", err);
    } finally {
      setGenerating(null);
    }
  };

  // Export CSV
  const handleExportCSV = async () => {
    try {
      const res = await axios.get('http://127.0.0.1:8000/api/reports/export', {
        params: { area, sensor, start_date: startDate, end_date: endDate },
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `report_export_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("Export failed:", err);
    }
  };

  const getStatusBadge = (status: string) => {
    if (status === 'Anomaly') return 'bg-status-critical/10 text-status-critical border-status-critical/30';
    return 'bg-status-good/10 text-status-good border-status-good/30';
  };

  return (
    <GlobalShell>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold text-text-primary">Reports & Analytics</h1>
          <p className="text-text-muted text-sm mt-1">Generate compliance reports and explore historical telemetry data.</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-border-panel">
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
                activeTab === tab 
                  ? 'border-accent-primary text-accent-primary' 
                  : 'border-transparent text-text-muted hover:text-text-primary'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Report Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {REPORT_CARDS.map(card => {
            const Icon = card.icon;
            const isActive = activeTab === card.tab;
            return (
              <div 
                key={card.id}
                className={`bg-bg-panel border rounded-xl p-5 transition-all ${
                  isActive 
                    ? 'border-accent-primary ring-2 ring-accent-primary/20 shadow-lg shadow-accent-primary/10' 
                    : 'border-border-panel'
                }`}
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${
                  isActive ? 'bg-accent-primary/20 text-accent-primary' : 'bg-bg-page text-text-muted'
                }`}>
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-text-primary mb-1">{card.title}</h3>
                <p className="text-xs text-text-muted mb-4 leading-relaxed">{card.desc}</p>
                <button 
                  onClick={() => handleGenerate(card.id)}
                  disabled={generating === card.id}
                  className="w-full py-2 bg-bg-page border border-border-panel rounded-lg text-sm font-medium text-text-primary hover:bg-bg-page/80 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {generating === card.id ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" /> Generating...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" /> Generate
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>

        {/* Data Explorer */}
        <div className="bg-bg-panel border border-border-panel rounded-xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-text-primary">Data Explorer & Historical Analysis</h2>
            <button 
              onClick={handleExportCSV}
              className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg bg-accent-primary/10 text-accent-primary border border-accent-primary/20 hover:bg-accent-primary/20"
            >
              <Download className="w-3 h-3" /> Export CSV
            </button>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-6">
            <div>
              <label className="text-[10px] text-text-muted uppercase font-semibold mb-1 block">Plant Area</label>
              <select value={area} onChange={e => setArea(e.target.value)} className="w-full bg-bg-page border border-border-panel rounded-lg px-3 py-2 text-sm text-text-primary">
                <option value="all">All Areas</option>
                <option value="Reactor">Reactor</option>
                <option value="Heat Exchanger">Heat Exchanger</option>
                <option value="Compressor">Compressor</option>
                <option value="Turbine">Turbine</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] text-text-muted uppercase font-semibold mb-1 block">Equipment</label>
              <select value={sensor} onChange={e => setSensor(e.target.value)} className="w-full bg-bg-page border border-border-panel rounded-lg px-3 py-2 text-sm text-text-primary">
                <option value="all">All Equipment</option>
                <option value="P-101">P-101</option>
                <option value="P-102">P-102</option>
                <option value="T-201">T-201</option>
                <option value="T-202">T-202</option>
                <option value="F-301">F-301</option>
                <option value="V-401">V-401</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] text-text-muted uppercase font-semibold mb-1 block">Start Date</label>
              <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full bg-bg-page border border-border-panel rounded-lg px-3 py-2 text-sm text-text-primary" />
            </div>
            <div>
              <label className="text-[10px] text-text-muted uppercase font-semibold mb-1 block">End Date</label>
              <div className="flex gap-2">
                <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="flex-1 bg-bg-page border border-border-panel rounded-lg px-3 py-2 text-sm text-text-primary" />
                <button onClick={fetchData} className="px-4 py-2 bg-accent-primary text-white rounded-lg text-sm font-medium flex items-center gap-1.5 hover:bg-accent-primary/90">
                  <Filter className="w-3 h-3" /> Apply
                </button>
              </div>
            </div>
          </div>

          {/* Data Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border-panel text-text-muted text-xs uppercase tracking-wider">
                  <th className="py-3 px-4 font-medium">Timestamp</th>
                  <th className="py-3 px-4 font-medium">Sensor ID</th>
                  <th className="py-3 px-4 font-medium">Value</th>
                  <th className="py-3 px-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-border-panel/50">
                {loadingData ? (
                  <tr><td colSpan={4} className="py-8 text-center text-text-muted animate-pulse">Loading data...</td></tr>
                ) : data.length === 0 ? (
                  <tr><td colSpan={4} className="py-8 text-center text-text-muted">No data found for selected filters.</td></tr>
                ) : (
                  data.map((row) => (
                    <tr key={row.id} className="hover:bg-bg-page/30 transition-colors">
                      <td className="py-3 px-4 font-mono text-xs text-text-muted">{new Date(row.timestamp).toLocaleString()}</td>
                      <td className="py-3 px-4 font-mono text-text-primary">{row.sensor_id}</td>
                      <td className="py-3 px-4 text-text-primary">{row.value} <span className="text-xs text-text-muted">units</span></td>
                      <td className="py-3 px-4">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${getStatusBadge(row.status)}`}>
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Report Modal */}
      {reportModal.open && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-bg-panel border border-border-panel rounded-xl w-full max-w-3xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
            <div className="sticky top-0 bg-bg-panel border-b border-border-panel p-4 flex justify-between items-center">
              <h3 className="text-lg font-bold text-text-primary flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-status-good" /> 
                {REPORT_CARDS.find(c => c.id === reportModal.type)?.title || 'Report'} Generated
              </h3>
              <button onClick={() => setReportModal({ open: false, content: '', type: '' })}>
                <X className="w-5 h-5 text-text-muted hover:text-white" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              <pre className="whitespace-pre-wrap font-mono text-xs text-text-primary leading-relaxed bg-black/30 p-4 rounded-lg border border-border-panel">
                {reportModal.content}
              </pre>
            </div>
            <div className="border-t border-border-panel p-4 flex justify-end gap-2">
              <button 
                onClick={() => {
                  const blob = new Blob([reportModal.content], { type: 'text/plain' });
                  const url = window.URL.createObjectURL(blob);
                  const link = document.createElement('a');
                  link.href = url;
                  link.download = `${reportModal.type}_report.txt`;
                  link.click();
                }}
                className="px-4 py-2 bg-accent-primary text-white rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-accent-primary/90"
              >
                <Download className="w-4 h-4" /> Download Report
              </button>
            </div>
          </div>
        </div>
      )}
    </GlobalShell>
  );
}