import { useState, useEffect } from 'react';
import axios from 'axios';
import GlobalShell from '../components/shell/GlobalShell';
import { AlertTriangle, FileText, X, Loader, TrendingUp } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';

export default function AnomalyIntelligencePage() {
  const [anomalies, setAnomalies] = useState<any[]>([]);
  const [selectedAnomaly, setSelectedAnomaly] = useState<any>(null);
  const [report, setReport] = useState<string>('');
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // New State for Real-time Data
  const [topContributors, setTopContributors] = useState<any[]>([]);
  const [trendData, setTrendData] = useState<any[]>([]);

  useEffect(() => {
    // 1. Fetch Anomalies for Dropdown
    const fetchAnomalies = async () => {
      try {
        const res = await axios.get('http://127.0.0.1:8000/api/anomalies');
        setAnomalies(res.data);
        if (res.data.length > 0) setSelectedAnomaly(res.data[0]);
      } catch (error) { console.error("Failed to fetch anomalies:", error); }
    };

    // 2. Fetch Top Contributors (Real-time)
    const fetchContributors = async () => {
      try {
        const res = await axios.get('http://127.0.0.1:8000/api/anomaly-score');
        if (res.data.top_contributors) {
          setTopContributors(res.data.top_contributors);
        }
      } catch (error) { console.error("Failed to fetch contributors:", error); }
    };

    // 3. Fetch 24h Trend (Real-time)
    const fetchTrend = async () => {
      try {
        const res = await axios.get('http://127.0.0.1:8000/api/anomaly-score/trend');
        setTrendData(res.data.trend);
      } catch (error) { console.error("Failed to fetch trend:", error); }
    };

    fetchAnomalies();
    fetchContributors();
    fetchTrend();
  }, []);

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    setIsReportOpen(true);
    try {
      const res = await axios.post('http://127.0.0.1:8000/api/anomalies/generate-report');
      setReport(res.data.report);
    } catch (error) {
      setReport("Error generating report. Please check backend connection.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <GlobalShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold text-text-primary">Anomaly Intelligence</h1>
            <p className="text-text-muted text-sm mt-1">AI-driven insights into the cause and impact of anomalies.</p>
          </div>
          <button 
            onClick={handleGenerateReport}
            className="flex items-center gap-2 px-4 py-2 bg-accent-primary text-white rounded-lg hover:bg-accent-primary/90 transition-colors"
          >
            <FileText className="w-4 h-4" /> View Detailed Report
          </button>
        </div>

        {/* Top Section: Score & Investigation */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Left Panel: Score & Real-time Contributors */}
          <div className="bg-bg-panel border border-border-panel rounded-xl p-6">
            <h2 className="text-lg font-semibold text-text-primary mb-6 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-status-warning" /> Anomaly Score & Evidence
            </h2>
            
            <div className="flex items-center gap-8 mb-8">
              {/* Gauge */}
              <div className="relative w-32 h-32 flex items-center justify-center flex-shrink-0">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="64" cy="64" r="56" stroke="#1e293b" strokeWidth="12" fill="transparent" />
                  <circle cx="64" cy="64" r="56" stroke="#ef4444" strokeWidth="12" fill="transparent" strokeDasharray="352" strokeDashoffset="35" />
                </svg>
                <div className="absolute text-center">
                  <span className="text-3xl font-bold text-white">0.92</span>
                  <p className="text-xs text-status-critical font-bold">HIGH RISK</p>
                </div>
              </div>
              
              {/* Real-time Top Contributors List */}
              <div className="flex-1 space-y-3">
                <p className="text-xs font-semibold text-text-muted uppercase">Top Contributing Sensors</p>
                <div className="space-y-2">
                  {topContributors.length > 0 ? (
                    topContributors.map((c, i) => (
                      <div key={i} className="space-y-1">
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-text-primary font-mono">{c.name}</span>
                          <span className="text-status-critical font-bold">{c.percentage}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-bg-page rounded-full overflow-hidden">
                          <div className="h-full bg-status-critical rounded-full" style={{ width: `${c.percentage}%` }}></div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-text-muted">No active anomalies detected.</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel: AI Investigation */}
          <div className="bg-bg-panel border border-border-panel rounded-xl p-6">
            <h2 className="text-lg font-semibold text-text-primary mb-6">AI Investigation & Root Cause</h2>
            
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-text-muted uppercase mb-2 block">Select Anomaly Event</label>
                <select 
                  className="w-full bg-bg-page border border-border-panel rounded p-2 text-sm text-text-primary"
                  onChange={(e) => {
                    const selected = anomalies.find(a => a.id === parseInt(e.target.value));
                    setSelectedAnomaly(selected);
                  }}
                >
                  {anomalies.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.sensor_id} - {new Date(a.timestamp).toLocaleTimeString()} (Val: {a.value})
                    </option>
                  ))}
                </select>
              </div>

              <div className="bg-bg-page/50 border border-border-panel rounded p-4">
                <p className="text-xs font-semibold text-text-muted uppercase mb-2">AI Findings</p>
                <p className="text-sm text-text-primary">
                  {selectedAnomaly 
                    ? `Anomaly detected on ${selectedAnomaly.sensor_id} with value ${selectedAnomaly.value}. This exceeds the safety threshold by a significant margin.` 
                    : "Select an anomaly to view AI findings."}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section: Real-time 24h Trend Chart */}
        <div className="bg-bg-panel border border-border-panel rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-text-primary flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-accent-primary" /> Score Trend (Last 24 Hours)
            </h2>
            <span className="text-xs text-text-muted font-mono">Live Data · Hourly Aggregation</span>
          </div>
          
          <div className="h-[300px] w-full">
            {trendData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-text-muted">Loading trend data...</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis 
                    dataKey="time" 
                    stroke="#64748b" 
                    fontSize={12} 
                    tickLine={false}
                    interval={2} // Show every 2nd hour to avoid clutter
                  />
                  <YAxis 
                    stroke="#64748b" 
                    fontSize={12} 
                    tickLine={false}
                    domain={[0, 1]}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                    itemStyle={{ color: '#ef4444' }}
                    formatter={(value: any) => [`Score: ${value}`, 'Risk Level']}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="score" 
                    stroke="#ef4444" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorScore)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* REPORT MODAL */}
      {isReportOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-bg-panel border border-border-panel rounded-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-bg-panel border-b border-border-panel p-4 flex justify-between items-center">
              <h3 className="text-lg font-bold text-text-primary flex items-center gap-2">
                <FileText className="w-5 h-5 text-accent-primary" /> AI Generated Detailed Report
              </h3>
              <button onClick={() => setIsReportOpen(false)} className="text-text-muted hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6">
              {isGenerating ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <Loader className="w-8 h-8 text-accent-primary animate-spin mb-4" />
                  <p className="text-text-muted">AI Agent is analyzing database & generating report...</p>
                </div>
              ) : (
                <div className="prose prose-invert max-w-none">
                  <pre className="whitespace-pre-wrap font-sans text-sm text-text-primary leading-relaxed">
                    {report}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </GlobalShell>
  );
}