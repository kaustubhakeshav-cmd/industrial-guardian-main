import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { AlertTriangle } from 'lucide-react';

const data = [{ name: 'Score', value: 84 }];
// Exact colors from Master UI/UX Build Spec
const COLORS = ['#F53F55', '#1C2C45']; // Critical red, track color

export default function AnomalyScoreGauge() {
  return (
    <div className="bg-bg-panel border border-border-panel rounded-xl p-6 h-full flex flex-col">
      <div className="flex items-center gap-2 mb-4">
        <AlertTriangle className="w-5 h-5 text-status-critical" />
        <h2 className="text-lg font-semibold text-text-primary">Anomaly Score</h2>
      </div>
      
      <div className="flex-1 flex flex-col items-center justify-center relative">
        {/* Circular Gauge */}
        <div className="w-48 h-48 relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                startAngle={90}
                endAngle={-270}
                dataKey="value"
                stroke="none"
              >
                <Cell key="cell-0" fill={COLORS[0]} />
                <Cell key="cell-1" fill={COLORS[1]} />
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl font-bold text-text-primary">0.84</span>
            <span className="text-sm font-medium text-status-critical mt-1">HIGH</span>
          </div>
        </div>
        
        {/* Top Contributing Sensors */}
        <div className="w-full mt-6 space-y-3">
          <p className="text-xs text-text-muted uppercase tracking-wider font-semibold">Top Contributing Sensors</p>
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-text-primary">Pump Pressure (P-103)</span>
                <span className="text-status-critical font-medium">42%</span>
              </div>
              <div className="w-full bg-bg-page rounded-full h-1.5">
                <div className="h-1.5 rounded-full bg-status-critical" style={{ width: '42%' }}></div>
              </div>
            </div>
            
            <div>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-text-primary">Flow Rate (F-201)</span>
                <span className="text-status-warning font-medium">28%</span>
              </div>
              <div className="w-full bg-bg-page rounded-full h-1.5">
                <div className="h-1.5 rounded-full bg-status-warning" style={{ width: '28%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}