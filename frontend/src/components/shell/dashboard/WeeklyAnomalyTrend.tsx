import { useEffect, useState } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { TrendingUp } from 'lucide-react';

export default function WeeklyAnomalyTrend() {
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTrend = async () => {
      try {
        const res = await axios.get('http://127.0.0.1:8000/api/dashboard/weekly-trend');
        setData(res.data.trend);
      } catch (error) {
        console.error("Failed to fetch weekly trend:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTrend();
  }, []);

  if (isLoading) {
    return (
      <div className="bg-bg-panel border border-border-panel rounded-xl p-6 h-[300px] flex items-center justify-center">
        <span className="text-text-muted animate-pulse">Loading weekly trends...</span>
      </div>
    );
  }

  return (
    <div className="bg-bg-panel border border-border-panel rounded-xl p-6 h-[300px] flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-text-primary">Weekly Anomaly Trend</h3>
          <p className="text-xs text-text-muted mt-1">Total anomalies detected over the last 7 days</p>
        </div>
        <div className="flex items-center gap-1 text-status-good text-xs font-medium bg-status-good/10 px-2 py-1 rounded border border-status-good/20">
          <TrendingUp className="w-3 h-3" /> Live Data
        </div>
      </div>

      <div className="flex-1 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1C2C45" vertical={false} />
            <XAxis 
              dataKey="day" 
              stroke="#7C8AA5" 
              fontSize={12} 
              tickLine={false} 
              axisLine={false} 
            />
            <YAxis 
              stroke="#7C8AA5" 
              fontSize={12} 
              tickLine={false} 
              axisLine={false} 
              allowDecimals={false}
            />
            <Tooltip 
              contentStyle={{ backgroundColor: '#0A1626', border: '1px solid #1C2C45', borderRadius: '8px', color: '#E8EDF5' }}
              cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
              formatter={(value: any) => [`${value} Anomalies`, 'Count']}
            />
            <Bar dataKey="anomalies" radius={[4, 4, 0, 0]} maxBarSize={40}>
              {data.map((entry, index) => {
                // Dynamic coloring: Red for high, Yellow for medium, Green for low
                const color = entry.anomalies > 5 ? '#EF4444' : entry.anomalies > 2 ? '#F59E0B' : '#22C55E';
                return <Cell key={`cell-${index}`} fill={color} />;
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}