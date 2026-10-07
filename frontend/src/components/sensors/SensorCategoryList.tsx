import { useEffect, useState } from 'react';
import axios from 'axios';
import { Gauge, Thermometer, Waves, Activity, Waves as Level, Cpu } from 'lucide-react';

interface Category {
  name: string;
  count: number;
  icon: any;
}

interface SensorCategoryListProps {
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}

export default function SensorCategoryList({ activeCategory, onCategoryChange }: SensorCategoryListProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("🔄 Fetching sensor categories...");
    
    const fetchCounts = async () => {
      try {
        const res = await axios.get('http://127.0.0.1:8000/api/sensors');
        const sensors = res.data;
        
        console.log("✅ Received sensors:", sensors.length);
        
        const counts: Record<string, number> = {
          'Pressure': 0,
          'Temperature': 0,
          'Flow Rate': 0,
          'Vibration': 0,
          'Level': 0,
          'Others': 0,
        };

        sensors.forEach((sensor: any) => {
          const sensorId = sensor.sensor_id || '';
          console.log(`Sensor: ${sensorId}`);
          
          if (sensorId.startsWith('P')) counts['Pressure']++;
          else if (sensorId.startsWith('T')) counts['Temperature']++;
          else if (sensorId.startsWith('F')) counts['Flow Rate']++;
          else if (sensorId.startsWith('V')) counts['Vibration']++;
          else if (sensorId.startsWith('L')) counts['Level']++;
          else counts['Others']++;
        });

        console.log("📊 Counts:", counts);

        setCategories([
          { name: 'Pressure', count: counts['Pressure'], icon: Gauge },
          { name: 'Temperature', count: counts['Temperature'], icon: Thermometer },
          { name: 'Flow Rate', count: counts['Flow Rate'], icon: Waves },
          { name: 'Vibration', count: counts['Vibration'], icon: Activity },
          { name: 'Level', count: counts['Level'], icon: Level },
          { name: 'Others', count: counts['Others'], icon: Cpu },
        ]);
        setLoading(false);
      } catch (error) {
        console.error("❌ Failed to fetch category counts:", error);
        setLoading(false);
      }
    };

    fetchCounts();
  }, []);

  if (loading) {
    return (
      <div className="bg-bg-panel border border-border-panel rounded-xl p-6 h-full flex items-center justify-center">
        <span className="text-text-muted animate-pulse">Loading categories...</span>
      </div>
    );
  }

  return (
    <div className="bg-bg-panel border border-border-panel rounded-xl p-6 h-full">
      <h3 className="text-lg font-semibold text-text-primary mb-4">Sensor Categories</h3>
      <div className="space-y-2">
        {categories.map((category) => {
          const Icon = category.icon;
          const isActive = activeCategory === category.name;
          
          return (
            <button
              key={category.name}
              onClick={() => onCategoryChange(category.name)}
              className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all ${
                isActive 
                  ? 'bg-accent-primary/10 border-accent-primary text-accent-primary' 
                  : 'bg-bg-page/50 border-border-panel text-text-muted hover:bg-bg-page hover:border-border-panel/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className="w-4 h-4" />
                <span className="text-sm font-medium">{category.name}</span>
              </div>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                isActive ? 'bg-accent-primary/20' : 'bg-bg-panel'
              }`}>
                {category.count}
              </span>
            </button>
          );
        })}ss
      </div>
    </div>
  );
}