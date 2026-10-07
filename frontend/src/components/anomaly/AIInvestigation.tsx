import { useEffect, useState } from 'react';
import axios from 'axios';
import { Bot, AlertCircle, FileText, Loader } from 'lucide-react';

interface Anomaly {
  id: number;
  sensor_id: string;
  timestamp: string;
  value: number;
}

interface RootCauseResponse {
  root_cause: string;
  confidence: string;
  correlated_sensor: string;
  anomaly_sensor: string;
}

export default function AIInvestigation() {
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [analysis, setAnalysis] = useState<RootCauseResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // 1. Fetch the list of anomalies from the database
  useEffect(() => {
    const fetchAnomalies = async () => {
      try {
        const res = await axios.get('http://127.0.0.1:8000/api/anomalies');
        setAnomalies(res.data);
        // Auto-select the first one so the UI isn't empty
        if (res.data.length > 0) setSelectedId(res.data[0].id);
      } catch (error) {
        console.error("Failed to fetch anomalies:", error);
      }
    };
    fetchAnomalies();
  }, []);

  // 2. Whenever the user selects a new anomaly, ask the AI for the Root Cause
  useEffect(() => {
    if (!selectedId) return;
    
    setIsLoading(true);
    setAnalysis(null);
    
    axios.get(`http://127.0.0.1:8000/api/anomalies/${selectedId}/root-cause`)
      .then(res => setAnalysis(res.data))
      .catch(err => console.error(err))
      .finally(() => setIsLoading(false));
  }, [selectedId]);

  // Helper to convert text confidence to a number for the progress bar
  const getConfidenceScore = (conf: string) => {
    if (conf === 'High') return 92;
    if (conf === 'Medium') return 75;
    return 45;
  };

  return (
    <div className="bg-bg-panel border border-border-panel rounded-xl p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Bot className="w-5 h-5 text-accent-primary" />
          <h2 className="text-lg font-semibold text-text-primary">AI Investigation & Root Cause</h2>
        </div>
        <button className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg bg-accent-primary/10 text-accent-primary border border-accent-primary/20 hover:bg-accent-primary/20 transition-colors">
          <FileText className="w-3 h-3" /> View Detailed Report
        </button>
      </div>

      {/* Incident Picker (Now Dynamic) */}
      <div className="mb-6">
        <label className="block text-xs text-text-muted uppercase tracking-wider font-semibold mb-2">Select Anomaly Event</label>
        <select 
          value={selectedId || ""}
          onChange={(e) => setSelectedId(Number(e.target.value))}
          className="w-full bg-bg-page border border-border-panel rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/50"
        >
          {anomalies.length === 0 && <option>No anomalies detected. Run a scenario first.</option>}
          {anomalies.map(a => (
            <option key={a.id} value={a.id}>
              {a.sensor_id} - {new Date(a.timestamp).toLocaleTimeString()} (Val: {a.value.toFixed(1)})
            </option>
          ))}
        </select>
      </div>

      {/* AI Findings */}
      <div className="flex-1 space-y-4 overflow-y-auto pr-2">
        <div>
          <p className="text-xs text-text-muted uppercase tracking-wider font-semibold mb-2">AI Findings</p>
          <div className="bg-bg-page border border-border-panel rounded-lg p-4 text-sm text-text-primary leading-relaxed min-h-[100px]">
            {isLoading ? (
              <div className="flex items-center gap-2 text-text-muted animate-pulse">
                <Loader className="w-4 h-4 animate-spin" /> Analyzing correlations...
              </div>
            ) : analysis ? (
              analysis.root_cause
            ) : (
              "Select an anomaly to begin analysis."
            )}
          </div>
        </div>

        {/* Key Evidence */}
        <div>
          <p className="text-xs text-text-muted uppercase tracking-wider font-semibold mb-2">Key Evidence</p>
          <div className="space-y-2">
            {isLoading ? (
               <div className="h-12 bg-bg-page rounded animate-pulse"></div>
            ) : analysis ? (
              <div className="flex items-center justify-between p-3 bg-bg-page rounded border border-border-panel">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-status-critical" />
                  <span className="text-sm text-text-primary">Correlated Sensor: <span className="font-mono font-bold">{analysis.correlated_sensor}</span></span>
                </div>
                <span className="text-xs font-semibold text-accent-primary bg-accent-primary/10 px-2 py-1 rounded">
                  Linked Event
                </span>
              </div>
            ) : null}
          </div>
        </div>

        {/* Confidence Bar */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs text-text-muted uppercase tracking-wider font-semibold">Confidence</p>
            <span className="text-sm font-semibold text-status-good">
              {analysis ? `${getConfidenceScore(analysis.confidence)}%` : '--'}
            </span>
          </div>
          <div className="w-full bg-bg-page rounded-full h-2">
            <div 
              className="h-2 rounded-full bg-gradient-to-r from-status-good to-accent-primary transition-all duration-500" 
              style={{ width: analysis ? `${getConfidenceScore(analysis.confidence)}%` : '0%' }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
}