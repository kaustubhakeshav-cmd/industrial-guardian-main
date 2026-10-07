import { useEffect, useState } from 'react';
import axios from 'axios';
import { AlertCircle, CheckCircle } from 'lucide-react';

// 1. UPDATED INTERFACE to match the new backend response
interface ScoreData {
  score: number;
  risk_label: string;
  anomaly_count: number;
  top_contributors: Array<{
    name: string;
    count: number;
    percentage: number;
  }>;
}

export default function AnomalyScoreGauge() {
  const [data, setData] = useState<ScoreData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchScore = async () => {
      try {
        const res = await axios.get('http://127.0.0.1:8000/api/anomaly-score');
        setData(res.data);
      } catch (error) {
        console.error("Failed to fetch anomaly score:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchScore();
    // Refresh every 5 seconds to catch new incidents instantly
    const interval = setInterval(fetchScore, 5000);
    return () => clearInterval(interval);
  }, []);

  if (isLoading || !data) {
    return (
      <div className="bg-bg-panel border border-border-panel rounded-xl p-6 h-full flex items-center justify-center">
        <span className="text-text-muted animate-pulse">Calculating Risk Score...</span>
      </div>
    );
  }

  // Determine color based on score
  const isCritical = data.score >= 0.7;
  const isWarning = data.score >= 0.3 && !isCritical;
  const textColor = isCritical ? 'text-status-critical' : isWarning ? 'text-status-warning' : 'text-status-good';
  const strokeColor = isCritical ? '#f43f5e' : isWarning ? '#f59e0b' : '#22c55e';

  return (
    <div className="bg-bg-panel border border-border-panel rounded-xl p-6 h-full flex flex-col">
      <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
        <AlertCircle className={`w-5 h-5 ${textColor}`} /> Anomaly Score
      </h3>

      {/* Circular Gauge */}
      <div className="flex-1 flex flex-col items-center justify-center relative">
        <div className="relative w-32 h-32">
          {/* Background Circle */}
          <svg className="w-full h-full transform -rotate-90">
            <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-bg-page" />
            <circle 
              cx="64" cy="64" r="56" 
              stroke={strokeColor} 
              strokeWidth="12" 
              fill="transparent" 
              strokeDasharray={352}
              strokeDashoffset={352 - (352 * data.score)}
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          {/* Center Text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-3xl font-bold ${textColor}`}>{data.score.toFixed(2)}</span>
            <span className="text-xs text-text-muted font-medium uppercase">{data.risk_label}</span>
          </div>
        </div>
      </div>

      {/* 2. UPDATED: Contributing Factors Section with Progress Bars */}
      <div className="mt-6 space-y-3">
        <p className="text-xs font-semibold text-text-muted uppercase tracking-wider">Top Contributing Factors</p>
        
        {data.top_contributors && data.top_contributors.length > 0 ? (
          data.top_contributors.map((contributor, idx) => (
            <div key={idx} className="flex items-center justify-between text-sm">
              <span className="text-text-primary font-mono font-medium">{contributor.name}</span>
              <div className="flex items-center gap-2">
                <div className="w-20 h-1.5 bg-bg-page rounded-full overflow-hidden border border-border-panel/50">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${isCritical ? 'bg-status-critical' : isWarning ? 'bg-status-warning' : 'bg-status-good'}`}
                    style={{ width: `${contributor.percentage}%` }}
                  />
                </div>
                <span className="text-xs font-mono text-text-muted w-6 text-right">
                  {contributor.count}
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="flex items-center gap-2 text-sm text-status-good pt-1">
            <CheckCircle className="w-4 h-4" /> All systems nominal
          </div>
        )}
      </div>
    </div>
  );
}