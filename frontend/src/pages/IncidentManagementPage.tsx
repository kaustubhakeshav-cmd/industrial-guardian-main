import { useState, useEffect } from 'react';
import axios from 'axios';
import GlobalShell from '../components/shell/GlobalShell';
import { AlertCircle, AlertTriangle, CheckCircle, Clock, Wrench, User, Bot, Download, RefreshCw, Check } from 'lucide-react';

export default function IncidentManagementPage() {
  const [incidents, setIncidents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedRows, setExpandedRows] = useState<Record<number, any>>({});

  // 1. Fetch Real Incidents
  const fetchIncidents = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get('http://127.0.0.1:8000/api/incidents');
      setIncidents(res.data);
    } catch (error) {
      console.error("Failed to fetch incidents:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidents();
  }, []);

  // 2. Resolve Incident
  const handleResolve = async (id: number) => {
    try {
      await axios.put(`http://127.0.0.1:8000/api/incidents/${id}/resolve`);
      fetchIncidents(); // Refresh list
    } catch (error) {
      console.error("Failed to resolve:", error);
    }
  };

  // 3. Get AI Recommendation (Inline)
  const handleAiRecommend = async (id: number) => {
    if (expandedRows[id]) return; // Already loaded
    try {
      const res = await axios.get(`http://127.0.0.1:8000/api/incidents/${id}/recommend-assignee`);
      setExpandedRows(prev => ({ ...prev, [id]: res.data }));
    } catch (error) {
      console.error("AI Recommend failed:", error);
    }
  };

  // 4. Export CSV
  const handleExportCSV = async () => {
    try {
      const res = await axios.get('http://127.0.0.1:8000/api/incidents/export', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `incidents_export_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Export failed:", error);
    }
  };

  // Calculate Summary Counts
  const openCount = incidents.filter(i => i.status === 'open').length;
  const progressCount = incidents.filter(i => i.status === 'investigating').length;
  const resolvedCount = incidents.filter(i => i.status === 'resolved').length;

  const getSeverityIcon = (sev: string) => {
    if (sev === 'critical') return <AlertCircle className="w-4 h-4 text-status-critical" />;
    if (sev === 'medium') return <AlertTriangle className="w-4 h-4 text-status-warning" />;
    return <Clock className="w-4 h-4 text-status-good" />;
  };

  const getStatusColor = (status: string) => {
    if (status === 'resolved') return 'bg-status-good/10 text-status-good border-status-good/20';
    if (status === 'investigating') return 'bg-status-warning/10 text-status-warning border-status-warning/20';
    return 'bg-status-critical/10 text-status-critical border-status-critical/20';
  };

  return (
    <GlobalShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold text-text-primary">Incident Management</h1>
            <p className="text-text-muted text-sm mt-1">Track, investigate, and resolve system anomalies.</p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-bg-panel border border-border-panel rounded-xl p-6 flex flex-col items-center justify-center">
            <AlertCircle className="w-8 h-8 text-status-critical mb-2" />
            <span className="text-sm text-text-muted">Detected (Open)</span>
            <span className="text-2xl font-bold text-status-critical mt-1">{openCount}</span>
          </div>
          <div className="bg-bg-panel border border-border-panel rounded-xl p-6 flex flex-col items-center justify-center">
            <Wrench className="w-8 h-8 text-status-warning mb-2" />
            <span className="text-sm text-text-muted">In Progress</span>
            <span className="text-2xl font-bold text-status-warning mt-1">{progressCount}</span>
          </div>
          <div className="bg-bg-panel border border-border-panel rounded-xl p-6 flex flex-col items-center justify-center">
            <CheckCircle className="w-8 h-8 text-status-good mb-2" />
            <span className="text-sm text-text-muted">Resolved</span>
            <span className="text-2xl font-bold text-status-good mt-1">{resolvedCount}</span>
          </div>
        </div>

        {/* Active Incidents Table */}
        <div className="bg-bg-panel border border-border-panel rounded-xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-text-primary">Active Incidents</h2>
            <div className="flex gap-2">
              <button onClick={handleExportCSV} className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg bg-accent-primary/10 text-accent-primary border border-accent-primary/20 hover:bg-accent-primary/20">
                <Download className="w-3 h-3" /> Export CSV
              </button>
              <button onClick={fetchIncidents} className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg bg-bg-page text-text-muted border border-border-panel hover:bg-bg-page/80">
                <RefreshCw className="w-3 h-3" /> Refresh
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border-panel text-text-muted text-xs uppercase tracking-wider">
                  <th className="py-3 px-4 font-medium">Severity</th>
                  <th className="py-3 px-4 font-medium">Sensor</th>
                  <th className="py-3 px-4 font-medium">Description</th>
                  <th className="py-3 px-4 font-medium">Status</th>
                  <th className="py-3 px-4 font-medium">Time</th>
                  <th className="py-3 px-4 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-border-panel/50">
                {isLoading ? (
                  <tr><td colSpan={6} className="py-8 text-center text-text-muted animate-pulse">Loading incidents...</td></tr>
                ) : incidents.length === 0 ? (
                  <tr><td colSpan={6} className="py-8 text-center text-text-muted">No incidents found.</td></tr>
                ) : (
                  incidents.map((inc) => (
                    <>
                      <tr key={inc.id} className="hover:bg-bg-page/30 transition-colors">
                        <td className={`py-4 px-4 font-medium capitalize flex items-center gap-2 ${
                          inc.severity === 'critical' ? 'text-status-critical' : inc.severity === 'medium' ? 'text-status-warning' : 'text-status-good'
                        }`}>
                          {getSeverityIcon(inc.severity)} {inc.severity}
                        </td>
                        <td className="py-4 px-4 font-mono text-text-primary">{inc.sensor_id}</td>
                        <td className="py-4 px-4 text-text-muted text-xs max-w-xs truncate">{inc.description || 'No description'}</td>
                        <td className="py-4 px-4">
                          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border capitalize ${getStatusColor(inc.status)}`}>
                            {inc.status}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-text-muted text-xs">{new Date(inc.timestamp).toLocaleString()}</td>
                        <td className="py-4 px-4 text-right">
                          {inc.status === 'resolved' ? (
                            <span className="text-xs text-status-good flex items-center justify-end gap-1">
                              <Check className="w-3 h-3" /> Resolved by {inc.resolved_by || 'system'}
                            </span>
                          ) : (
                            <div className="flex justify-end gap-2">
                              <button onClick={() => handleAiRecommend(inc.id)} className="text-xs px-3 py-1.5 bg-accent-primary/10 text-accent-primary border border-accent-primary/20 rounded hover:bg-accent-primary/20 flex items-center gap-1">
                                <Bot className="w-3 h-3" /> AI Assign
                              </button>
                              <button onClick={() => handleResolve(inc.id)} className="text-xs px-3 py-1.5 bg-status-good/10 text-status-good border border-status-good/20 rounded hover:bg-status-good/20 flex items-center gap-1">
                                <Check className="w-3 h-3" /> Resolve
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                      
                      {/* Inline AI Recommendation Card */}
                      {expandedRows[inc.id] && (
                        <tr key={`ai-${inc.id}`}>
                          <td colSpan={6} className="py-4 px-4 bg-bg-page/30">
                            <div className="bg-bg-panel border border-border-panel rounded-lg p-4 max-w-md ml-auto">
                              <div className="flex items-center gap-2 mb-3">
                                <Bot className="w-4 h-4 text-accent-primary" />
                                <span className="text-xs font-bold text-accent-primary uppercase tracking-wider">AI Recommended Assignee</span>
                              </div>
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <User className="w-4 h-4 text-text-muted" />
                                  <span className="font-semibold text-text-primary capitalize">{expandedRows[inc.id].recommended_user}</span>
                                </div>
                                <span className="text-xs font-bold text-status-warning bg-status-warning/10 px-2 py-0.5 rounded">
                                  {expandedRows[inc.id].confidence_score}% Match
                                </span>
                              </div>
                              <p className="text-xs text-text-muted italic">"{expandedRows[inc.id].reason}"</p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </GlobalShell>
  );
}