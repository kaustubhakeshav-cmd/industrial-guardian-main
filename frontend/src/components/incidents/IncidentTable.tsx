import { useEffect, useState } from 'react';
import axios from 'axios';
import { CheckCircle, AlertTriangle, AlertCircle, Clock, Download } from 'lucide-react';

interface Incident {
  id: number;
  sensor_id: string;
  timestamp: string;
  severity: 'low' | 'medium' | 'critical';
  status: 'open' | 'investigating' | 'resolved';
  description: string | null;
  resolved_at: string | null;
  resolved_by: string | null;
}

const severityConfig = {
  critical: { color: 'text-status-critical', bg: 'bg-status-critical/10', border: 'border-status-critical/20', icon: AlertCircle },
  medium: { color: 'text-status-warning', bg: 'bg-status-warning/10', border: 'border-status-warning/20', icon: AlertTriangle },
  low: { color: 'text-status-good', bg: 'bg-status-good/10', border: 'border-status-good/20', icon: Clock },
};

const statusConfig = {
  open: { color: 'text-status-critical', bg: 'bg-status-critical/10', border: 'border-status-critical/20', label: 'Open' },
  investigating: { color: 'text-status-warning', bg: 'bg-status-warning/10', border: 'border-status-warning/20', label: 'Investigating' },
  resolved: { color: 'text-status-good', bg: 'bg-status-good/10', border: 'border-status-good/20', label: 'Resolved' },
};

export default function IncidentTable() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [resolvingId, setResolvingId] = useState<number | null>(null);

  // Fetch incidents from the backend
  const fetchIncidents = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/api/incidents');
      setIncidents(response.data);
    } catch (error) {
      console.error("Failed to fetch incidents:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidents();
  }, []);

  // Handle the Resolve action
  const handleResolve = async (incidentId: number) => {
    setResolvingId(incidentId); // Show loading state on the button
    try {
      await axios.put(`http://127.0.0.1:8000/api/incidents/${incidentId}/resolve`);
      // Refetch to get the updated status from the database
      await fetchIncidents();
    } catch (error) {
      console.error("Failed to resolve incident:", error);
      alert("Failed to resolve incident. Please try again.");
    } finally {
      setResolvingId(null);
    }
  };

  // Handle CSV Export
  const handleExportCSV = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/api/incidents/export', {
        responseType: 'blob', // Important: tells axios to handle binary data
      });
      
      // Create a download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `incidents_export_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to export CSV:", error);
      alert("Failed to export CSV. Please try again.");
    }
  };

  return (
    <div className="bg-bg-panel border border-border-panel rounded-xl p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-text-primary">Active Incidents</h2>
        <div className="flex gap-2">
          <button 
            onClick={handleExportCSV}
            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-accent-primary/10 text-accent-primary border border-accent-primary/20 hover:bg-accent-primary/20 transition-colors flex items-center gap-2"
          >
            <Download className="w-3 h-3" />
            Export CSV
          </button>
          <button 
            onClick={fetchIncidents}
            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-bg-page text-text-muted border border-border-panel hover:text-text-primary transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-x-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-40 text-text-muted animate-pulse">
            Loading incidents...
          </div>
        ) : incidents.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-text-muted">
            <CheckCircle className="w-10 h-10 text-status-good mb-2" />
            <p>All systems normal. No active incidents.</p>
          </div>
        ) : (
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
            <tbody className="text-sm">
              {incidents.map((incident) => {
                const sev = severityConfig[incident.severity];
                const stat = statusConfig[incident.status];
                const SevIcon = sev.icon;
                const isResolved = incident.status === 'resolved';

                return (
                  <tr key={incident.id} className="border-b border-border-panel/50 hover:bg-bg-page/50 transition-colors">
                    <td className="py-3 px-4">
                      <div className={`flex items-center gap-2 font-medium ${sev.color}`}>
                        <SevIcon className="w-4 h-4" />
                        <span className="capitalize">{incident.severity}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-text-primary">{incident.sensor_id}</td>
                    <td className="py-3 px-4 text-text-muted max-w-xs truncate" title={incident.description || ''}>
                      {incident.description || 'No description provided'}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${stat.bg} ${stat.color} ${stat.border}`}>
                        {stat.label}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-text-muted text-xs">
                      {new Date(incident.timestamp).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {!isResolved ? (
                        <button
                          onClick={() => handleResolve(incident.id)}
                          disabled={resolvingId === incident.id}
                          className="px-3 py-1.5 text-xs font-medium rounded-lg bg-status-good/10 text-status-good border border-status-good/20 hover:bg-status-good/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1 ml-auto"
                        >
                          {resolvingId === incident.id ? (
                            <>Processing...</>
                          ) : (
                            <><CheckCircle className="w-3 h-3" /> Resolve</>
                          )}
                        </button>
                      ) : (
                        <span className="text-xs text-text-muted flex items-center justify-end gap-1">
                          <CheckCircle className="w-3 h-3 text-status-good" /> 
                          Resolved by {incident.resolved_by}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}