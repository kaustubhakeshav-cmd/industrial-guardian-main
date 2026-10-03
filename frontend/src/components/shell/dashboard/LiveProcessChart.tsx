import { useEffect, useState } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function LiveProcessChart() {
  const [chartData, setChartData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch real chart data from the backend
  useEffect(() => {
    const fetchChartData = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:8000/api/chart-data');
        setChartData(response.data);
      } catch (error) {
        console.error("Failed to fetch chart data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    // Initial fetch
    fetchChartData();
    
    // Poll for new data every 10 seconds to simulate a "live" feel
    const interval = setInterval(fetchChartData, 10000);
    
    // Cleanup interval on component unmount
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-bg-panel border border-border-panel rounded-xl p-6 h-[400px]">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-lg font-semibold text-text-primary">Live Process Overview</h2>
          <p className="text-xs text-text-muted mt-1">Real-time monitoring · AI-powered anomaly detection</p>
        </div>
        <div className="flex gap-2">
          <button className="px-3 py-1 text-xs font-medium rounded bg-status-good/10 text-status-good border border-status-good/20 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-status-good animate-pulse"></span> Live
          </button>
          <button className="px-3 py-1 text-xs font-medium rounded bg-bg-page text-text-muted border border-border-panel hover:text-text-primary transition-colors">1H</button>
          <button className="px-3 py-1 text-xs font-medium rounded bg-bg-page text-text-muted border border-border-panel hover:text-text-primary transition-colors">6H</button>
          <button className="px-3 py-1 text-xs font-medium rounded bg-bg-page text-text-muted border border-border-panel hover:text-text-primary transition-colors">24H</button>
          <button className="px-3 py-1 text-xs font-medium rounded bg-accent-primary/20 text-accent-primary border border-accent-primary/20">7D</button>
        </div>
      </div>

      {isLoading ? (
        <div className="h-[300px] flex items-center justify-center text-text-muted animate-pulse">
          Loading live telemetry data...
        </div>
      ) : (
        <ResponsiveContainer width="100%" height="85%">
          <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1C2C45" vertical={false} />
            <XAxis 
              dataKey="time" 
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
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#0A1626', 
                border: '1px solid #1C2C45', 
                borderRadius: '8px', 
                color: '#E8EDF5' 
              }}
              itemStyle={{ color: '#E8EDF5' }}
            />
            <Legend wrapperStyle={{ color: '#7C8AA5', fontSize: '12px' }} />
            
            {/* Exact colors from the Master UI/UX Build Spec */}
            <Line type="monotone" dataKey="pressure" stroke="#3B82F6" strokeWidth={2} dot={false} name="Pressure" />
            <Line type="monotone" dataKey="temperature" stroke="#F59E0B" strokeWidth={2} dot={false} name="Temperature" />
            <Line type="monotone" dataKey="flow" stroke="#22C55E" strokeWidth={2} dot={false} name="Flow Rate" />
            <Line type="monotone" dataKey="vibration" stroke="#A259DA" strokeWidth={2} dot={false} name="Vibration" />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}