import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react';

// Mock 24h trend data
const trendData = Array.from({ length: 24 }, (_, i) => ({
  time: `${i}:00`,
  score: Math.random() * 0.5 + (i > 14 && i < 18 ? 0.4 : 0.1), // Simulate a spike in the afternoon
}));

// Mock contributing sensors
const contributingSensors = [
  { id: 1, name: 'Pump Pressure (P-103)', contribution: 42, trend: '+12%' },
  { id: 2, name: 'Flow Rate (F-201)', contribution: 28, trend: '-8%' },
  { id: 3, name: 'Temperature (T-305)', contribution: 18, trend: '+5%' },
  { id: 4, name: 'Vibration (V-402)', contribution: 7, trend: '+2%' },
  { id: 5, name: 'Level (L-210)', contribution: 5, trend: '0%' },
];

export default function AnomalyScoreDetail() {
  return (
    <div className="bg-bg-panel border border-border-panel rounded-xl p-6 h-full flex flex-col">
      <div className="flex items-center gap-2 mb-6">
        <AlertTriangle className="w-5 h-5 text-status-critical" />
        <h2 className="text-lg font-semibold text-text-primary">Anomaly Score & Evidence</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1">
        {/* Left: Gauge and Trend */}
        <div className="flex flex-col">
          <div className="flex items-center justify-center mb-6">
            <div className="relative w-40 h-40 flex items-center justify-center rounded-full border-8 border-status-critical/20">
              <div className="absolute inset-0 rounded-full border-8 border-status-critical border-t-transparent border-l-transparent rotate-45"></div>
              <div className="text-center">
                <span className="text-4xl font-bold text-text-primary">0.92</span>
                <p className="text-xs font-medium text-status-critical mt-1">HIGH RISK</p>
              </div>
            </div>
          </div>
          
          <div className="flex-1 min-h-[150px]">
            <p className="text-xs text-text-muted uppercase tracking-wider font-semibold mb-2">Score Trend (Last 24h)</p>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1C2C45" vertical={false} />
                <XAxis dataKey="time" stroke="#7C8AA5" fontSize={10} tickLine={false} axisLine={false} interval={5} />
                <YAxis stroke="#7C8AA5" fontSize={10} tickLine={false} axisLine={false} domain={[0, 1]} />
                <Tooltip contentStyle={{ backgroundColor: '#0A1626', border: '1px solid #1C2C45', borderRadius: '8px', color: '#E8EDF5' }} />
                <Line type="monotone" dataKey="score" stroke="#F53F55" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Ranked Sensor Table */}
        <div className="flex flex-col">
          <p className="text-xs text-text-muted uppercase tracking-wider font-semibold mb-3">Top Contributing Sensors</p>
          <div className="flex-1 overflow-y-auto space-y-3 pr-2">
            {contributingSensors.map((sensor) => (
              <div key={sensor.id} className="p-3 bg-bg-page rounded-lg border border-border-panel">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-text-primary">{sensor.name}</span>
                  <div className={`flex items-center gap-1 text-xs font-semibold ${
                    sensor.trend.startsWith('+') ? 'text-status-critical' : sensor.trend.startsWith('-') ? 'text-status-good' : 'text-text-muted'
                  }`}>
                    {sensor.trend.startsWith('+') ? <TrendingUp className="w-3 h-3" /> : sensor.trend.startsWith('-') ? <TrendingDown className="w-3 h-3" /> : null}
                    {sensor.trend}
                  </div>
                </div>
                <div className="w-full bg-bg-panel rounded-full h-1.5">
                  <div 
                    className="h-1.5 rounded-full bg-status-critical" 
                    style={{ width: `${sensor.contribution}%` }}
                  ></div>
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-[10px] text-text-muted">Contribution</span>
                  <span className="text-[10px] text-text-muted font-medium">{sensor.contribution}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}