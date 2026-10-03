import { Activity, Thermometer, Wind, Waves, Gauge, Cpu } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  count: number;
  icon: LucideIcon;
}

const categories: Category[] = [
  { id: 'pressure', name: 'Pressure', count: 12, icon: Gauge },
  { id: 'temperature', name: 'Temperature', count: 10, icon: Thermometer },
  { id: 'flow', name: 'Flow Rate', count: 8, icon: Wind },
  { id: 'vibration', name: 'Vibration', count: 6, icon: Activity },
  { id: 'level', name: 'Level', count: 4, icon: Waves },
  { id: 'others', name: 'Others', count: 8, icon: Cpu },
];

interface SensorCategoryListProps {
  activeCategory: string;
  onCategoryChange: (id: string) => void;
}

export default function SensorCategoryList({ activeCategory, onCategoryChange }: SensorCategoryListProps) {
  return (
    <div className="bg-bg-panel border border-border-panel rounded-xl p-6 h-full flex flex-col">
      <h2 className="text-lg font-semibold text-text-primary mb-4">Sensor Categories</h2>
      
      <div className="flex-1 space-y-2 overflow-y-auto pr-2">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => onCategoryChange(cat.id)}
              className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all ${
                isActive 
                  ? 'bg-sidebar-active-bg border-accent-primary/30 text-accent-primary' 
                  : 'bg-bg-page border-border-panel text-text-muted hover:text-text-primary hover:border-text-muted/30'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className="w-5 h-5" />
                <span className="text-sm font-medium">{cat.name}</span>
              </div>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                isActive ? 'bg-accent-primary/20 text-accent-primary' : 'bg-bg-panel text-text-muted'
              }`}>
                {cat.count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}