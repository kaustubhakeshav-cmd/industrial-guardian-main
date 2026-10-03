import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp, TrendingDown } from 'lucide-react';

// Mock data for the weekly trend
const weeklyData = [
  { day: 'Mon', increase: 4, decrease: 2 },
  { day: 'Tue', increase: 6, decrease: 1 },
  { day: 'Wed', increase: 3, decrease: 4 },
  { day: 'Thu', increase: 8, decrease: 2 },
  { day: 'Fri', increase: 5, decrease: 3 },
  { day: 'Sat', increase: 2, decrease: 5 },
  { day: 'Sun', increase: 1, decrease: 2 },
];

// Mock data for equipment breakdown
const equipmentData = [
  { name: 'Heat Exchanger', count: 12, trend: '+40%' },
  { name: 'Compressor', count: 9, trend: '+25%' },
  { name: 'Reactor', count: 7, trend: '-17%' },
  { name: 'Turbine', count: 5, trend: '-33%' },
  { name: 'Pump', count: 3, trend: '-50%' },
];

export default function WeeklyAnomalyTrend() {
  return (
    <div className="bg-bg-panel border border-border-panel rounded-xl p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-text-primary">Weekly Anomaly Trend</h2>
          <p className="text-xs text-text-muted mt-1">All Appliances · Week of Oct 26</p>
        </div>
        <button className="px-3 py-1 text-xs font-medium rounded bg-bg-page text-text-muted border border-border-panel hover:text-text-primary transition-colors">
          This Week
        </button>
      </div>

      {/* Bar Chart */}
      <div className="h-48 mb-6">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={weeklyData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1C2C45" vertical={false} />
            <XAxis dataKey="day" stroke="#7C8AA5" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="#7C8AA5" fontSize={12} tickLine={false} axisLine={false} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#0A1626', border: '1px solid #1C2C45', borderRadius: '8px', color: '#E8EDF5' }}
              cursor={{ fill: 'rgba(255,255,255,0.05)' }}
            />
            <Legend wrapperStyle={{ color: '#7C8AA5', fontSize: '12px' }} />
            <Bar dataKey="increase" name="Increase" stackId="a" fill="#F53F55" radius={[0, 0, 0, 0]} />
            <Bar dataKey="decrease" name="Decrease" stackId="a" fill="#1DB87C" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Equipment Breakdown */}
      <div>
        <h3 className="text-sm font-semibold text-text-primary mb-3">Top 5 Appliances by Anomaly Count</h3>
        <div className="space-y-3">
          {equipmentData.map((item, index) => (
            <div key={index} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-3 w-1/3">
                <span className="text-text-muted w-4">{index + 1}</span>
                <span className="text-text-primary truncate">{item.name}</span>
              </div>
              <div className="flex-1 mx-4">
                <div className="w-full bg-bg-page rounded-full h-1.5">
                  <div 
                    className="h-1.5 rounded-full bg-accent-primary" 
                    style={{ width: `${(item.count / 12) * 100}%` }}
                  ></div>
                </div>
              </div>
              <div className="w-16 text-right flex items-center justify-end gap-1">
                <span className="text-text-muted">{item.count}</span>
                <span className={`text-xs font-medium ${item.trend.startsWith('+') ? 'text-status-critical' : 'text-status-good'}`}>
                  {item.trend.startsWith('+') ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {item.trend}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}