import { useState } from 'react';
import GlobalShell from '../components/shell/GlobalShell';
import SensorCategoryList from '../components/sensors/SensorCategoryList';
import SensorTable from '../components/sensors/SensorTable';
import CorrelationMatrix from '../components/sensors/CorrelationMatrix';
import AddSensorModal from '../components/sensors/AddSensorModal';
import { Plus } from 'lucide-react';

export default function SensorDashboardPage() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleRefresh = () => {
    // Simple reload to reflect the newly added sensor in the table and categories
    window.location.reload();
  };

  return (
    <GlobalShell>
      <div className="space-y-6">
        {/* Page Header with Add Button */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-semibold text-text-primary">Sensor Dashboard</h1>
            <p className="text-text-muted text-sm mt-1">Real-time sensor data with 72h historical trend and status indicators.</p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)} 
            className="flex items-center gap-2 px-4 py-2 bg-accent-primary text-white rounded-lg hover:bg-accent-primary/90 transition-colors text-sm font-medium"
          >
            <Plus className="w-4 h-4" /> Add Sensor
          </button>
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

        {/* AI Correlation Matrix */}
        <CorrelationMatrix />
      </div>
      
      {/* Add Sensor Modal */}
      <AddSensorModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSensorAdded={handleRefresh} 
      />
    </GlobalShell>
  );
}