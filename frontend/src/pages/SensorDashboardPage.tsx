import React, { useState, useMemo } from 'react';
import GlobalShell from '../components/shell/GlobalShell';
import CorrelationMatrix from '../components/sensors/CorrelationMatrix'; // Keep your existing component!
import { useAppContext, Sensor } from '../context/AppContext';
import { Plus, Activity, Thermometer, Gauge, Wind, Waves, Box, Search } from 'lucide-react';

export default function SensorDashboardPage() {
  // 1. Connect to Global State
  const { sensors, addSensor } = useAppContext();
  
  // 2. State for Tabs and Filtering
  const [activeTab, setActiveTab] = useState<'readings' | 'correlation'>('readings');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState('');

  // 3. Dynamic Category Counts
  const categories = useMemo(() => {
    const counts: Record<string, number> = { All: sensors.length };
    sensors.forEach(s => {
      counts[s.category] = (counts[s.category] || 0) + 1;
    });
    return counts;
  }, [sensors]);

  // 4. Filtered Sensors List
  const filteredSensors = useMemo(() => {
    let result = sensors;
    if (selectedCategory !== 'All') {
      result = result.filter(s => s.category === selectedCategory);
    }
    if (searchTerm) {
      const lowerTerm = searchTerm.toLowerCase();
      result = result.filter(s => 
        s.id.toLowerCase().includes(lowerTerm) || 
        s.name.toLowerCase().includes(lowerTerm)
      );
    }
    return result;
  }, [sensors, selectedCategory, searchTerm]);

  // 5. Handle Add Sensor (Using prompts for demo, replace with your AddSensorModal later)
    // In SensorDashboardPage.tsx
  
  const handleAddSensor = async () => {
    const id = prompt("Enter Sensor ID (e.g., P-103):");
    if (!id) return;
    
    const name = prompt("Enter Sensor Name:") || "New Sensor";
    const categoryInput = prompt("Category (Pressure/Temperature/Flow/Vibration/Level/Others):") || "Others";
    const areaInput = prompt("Area/Location (e.g., Reactor, Turbine):") || "General"; // Added for API compatibility
    
    let category: any = "Others";
    if (["Pressure", "Temperature", "Flow", "Vibration", "Level"].includes(categoryInput)) {
      category = categoryInput;
    }

    // Determine unit based on category
    const unit = category === 'Temperature' ? '°C' : 
                 category === 'Pressure' ? 'bar' : 
                 category === 'Flow' ? 'm³/h' : 'units';

    const newSensor: Sensor = {
      id: id.toUpperCase(),
      name: name,
      category: category,
      value: 0,
      unit: unit,
      status: 'Normal',
      rul: 1000
    };
    
    try {
      // 1. Send to Backend (Matching your Swagger Schema)
      const response = await fetch('http://localhost:8000/api/sensors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sensor_id: newSensor.id,
          name: newSensor.name,
          unit: newSensor.unit,
          area: areaInput // Mapping 'area' from prompt to API
        })
      });
      
      if (response.ok) {
        // 2. Only update UI if backend succeeds
        addSensor(newSensor); 
        alert(`✅ Sensor ${newSensor.id} added successfully!`);
      } else {
        const errorData = await response.json();
        alert(`❌ Failed to add sensor: ${errorData.detail || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Network error:', error);
      alert('⚠️ Could not connect to backend. Sensor added locally only.');
      // Fallback: Add locally anyway so demo isn't blocked
      addSensor(newSensor);
    }
  };
      

  return (
    <GlobalShell>
      <div className="p-6 space-y-6 min-h-screen">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-text-primary">Sensor Dashboard</h1>
            <p className="text-text-muted text-sm mt-1">Real-time telemetry with AI-driven categorization.</p>
          </div>
          <button 
            onClick={handleAddSensor}
            className="flex items-center gap-2 px-4 py-2 bg-accent-primary text-white rounded-lg hover:bg-accent-primary/90 transition-colors text-sm font-medium"
          >
            <Plus size={18} /> Add Sensor
          </button>
        </div>

        {/* TABS NAVIGATION (Fixes the Overlap Issue) */}
        <div className="flex border-b border-gray-700 mb-6">
          <button
            onClick={() => setActiveTab('readings')}
            className={`px-6 py-3 font-medium text-sm transition-colors relative flex items-center gap-2 ${
              activeTab === 'readings' ? 'text-accent-primary' : 'text-text-muted hover:text-text-primary'
            }`}
          >
            📊 Sensor Readings
            {activeTab === 'readings' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-accent-primary"></span>}
          </button>
          <button
            onClick={() => setActiveTab('correlation')}
            className={`px-6 py-3 font-medium text-sm transition-colors relative flex items-center gap-2 ${
              activeTab === 'correlation' ? 'text-accent-primary' : 'text-text-muted hover:text-text-primary'
            }`}
          >
            🔗 AI Correlation Matrix
            {activeTab === 'correlation' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-accent-primary"></span>}
          </button>
        </div>

        {/* CONTENT AREA */}
        {activeTab === 'readings' ? (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            
            {/* LEFT SIDEBAR: Categories */}
            <div className="lg:col-span-1 space-y-4">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-2.5 text-text-muted" size={16} />
                <input 
                  type="text" 
                  placeholder="Search sensors..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-sm text-text-primary focus:border-accent-primary outline-none"
                />
              </div>

              {/* Category List */}
              <div className="space-y-2">
                <h3 className="text-text-muted text-xs uppercase font-bold tracking-wider mb-2">Categories</h3>
                {[
                  { name: 'All', icon: Box },
                  { name: 'Pressure', icon: Gauge },
                  { name: 'Temperature', icon: Thermometer },
                  { name: 'Flow', icon: Wind },
                  { name: 'Vibration', icon: Activity },
                  { name: 'Level', icon: Waves },
                  { name: 'Others', icon: Box },
                ].map((cat) => (
                  <button
                    key={cat.name}
                    onClick={() => setSelectedCategory(cat.name)}
                    className={`w-full flex items-center justify-between p-3 rounded-lg transition group ${
                      selectedCategory === cat.name 
                        ? 'bg-accent-primary/10 text-accent-primary border border-accent-primary/50' 
                        : 'bg-gray-800/50 text-text-muted hover:bg-gray-700 hover:text-text-primary border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <cat.icon size={16} className={selectedCategory === cat.name ? 'text-accent-primary' : 'text-text-muted'} />
                      <span className="font-medium">{cat.name}</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-xs font-mono ${
                      selectedCategory === cat.name ? 'bg-accent-primary/20 text-accent-primary' : 'bg-gray-900 text-text-muted'
                    }`}>
                      {categories[cat.name] || 0}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* RIGHT SIDE: Sensor Table */}
            <div className="lg:col-span-3 bg-gray-800/30 rounded-xl border border-gray-700 overflow-hidden backdrop-blur-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-text-muted">
                  <thead className="bg-gray-900/80 text-text-muted uppercase text-xs border-b border-gray-700">
                    <tr>
                      <th className="px-6 py-4 font-semibold">ID</th>
                      <th className="px-6 py-4 font-semibold">Name</th>
                      <th className="px-6 py-4 font-semibold">Current Value</th>
                      <th className="px-6 py-4 font-semibold">Status</th>
                      <th className="px-6 py-4 font-semibold">RUL Prediction</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700/50">
                    {filteredSensors.length > 0 ? (
                      filteredSensors.map((sensor) => (
                        <tr key={sensor.id} className="hover:bg-gray-700/20 transition group">
                          <td className="px-6 py-4 font-mono text-accent-primary font-medium">{sensor.id}</td>
                          <td className="px-6 py-4 text-text-primary">{sensor.name}</td>
                          <td className="px-6 py-4 font-mono">
                            <span className="text-text-primary">{sensor.value.toFixed(2)}</span> 
                            <span className="text-text-muted text-xs ml-1">{sensor.unit}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                              sensor.status === 'Anomaly' 
                                ? 'bg-red-500/10 text-red-400 border-red-500/20' 
                                : 'bg-green-500/10 text-green-400 border-green-500/20'
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                                sensor.status === 'Anomaly' ? 'bg-red-400' : 'bg-green-400'
                              }`}></span>
                              {sensor.status}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex-1 h-1.5 bg-gray-700 rounded-full overflow-hidden max-w-[100px]">
                                <div 
                                  className="h-full bg-accent-primary rounded-full transition-all duration-500" 
                                  style={{ width: `${Math.min(100, (sensor.rul / 1000) * 100)}%` }}
                                ></div>
                              </div>
                              <span className="text-xs text-text-muted font-mono">{sensor.rul}h</span>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="px-6 py-8 text-center text-text-muted">
                          No sensors found matching your criteria.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          /* CORRELATION MATRIX TAB - Using YOUR EXISTING COMPONENT */
          <div className="bg-gray-800/30 rounded-xl border border-gray-700 p-6 backdrop-blur-sm">
            <CorrelationMatrix />
          </div>
        )}
      </div>
    </GlobalShell>
  );
}