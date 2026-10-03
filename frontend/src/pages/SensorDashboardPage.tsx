import { useState } from 'react';
import GlobalShell from '../components/shell/GlobalShell';
import SensorCategoryList from '../components/sensors/SensorCategoryList';
import SensorTable from '../components/sensors/SensorTable';

export default function SensorDashboardPage() {
  const [activeCategory, setActiveCategory] = useState('all');

  return (
    <GlobalShell>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-semibold text-text-primary">Sensor Dashboard</h1>
          <p className="text-text-muted text-sm mt-1">Real-time sensor data with 72h historical trend and status indicators.</p>
        </div>

        {/* Main Grid: Category List (Left) and Table (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[600px]">
          {/* Category List takes 1 column */}
          <div className="lg:col-span-1">
            <SensorCategoryList activeCategory={activeCategory} onCategoryChange={setActiveCategory} />
          </div>
          
          {/* Sensor Table takes 3 columns */}
          <div className="lg:col-span-3">
            <SensorTable activeCategory={activeCategory} />
          </div>
        </div>
      </div>
    </GlobalShell>
  );
}