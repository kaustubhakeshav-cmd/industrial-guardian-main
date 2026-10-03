import { useState } from 'react';
import { AlertTriangle, CheckCircle2, AlertCircle } from 'lucide-react';

// IMPORT BOTH OF YOUR IMAGES HERE
import plantLayout from '../../assets/plant-layout.jpeg'; 
import pressureLayout from '../../assets/pressure-layout.jpeg'; 

const equipmentNodes = [
  // You can adjust these X/Y percentages for each layout later if needed!
  { id: 1, name: 'Reactor A', x: '20%', y: '30%', status: 'good', value: '72.4 bar' },
  { id: 2, name: 'Compressor', x: '50%', y: '20%', status: 'warning', value: '89.7 bar' },
  { id: 3, name: 'Heat Exchanger', x: '75%', y: '40%', status: 'critical', value: '112.3 bar' },
  { id: 4, name: 'Turbine', x: '80%', y: '70%', status: 'good', value: '48.6 bar' },
  { id: 5, name: 'Pump B', x: '30%', y: '75%', status: 'good', value: '45.2 bar' },
];

const statusConfig = {
  good: { color: 'text-status-good', bg: 'bg-status-good', border: 'border-status-good/30', icon: CheckCircle2, label: 'Normal' },
  warning: { color: 'text-status-warning', bg: 'bg-status-warning', border: 'border-status-warning/30', icon: AlertCircle, label: 'Warning' },
  critical: { color: 'text-status-critical', bg: 'bg-status-critical', border: 'border-status-critical/30', icon: AlertTriangle, label: 'Anomaly' },
};

export default function PlantMap() {
  // State to track which layout is currently selected
  const [activeLayout, setActiveLayout] = useState('plant');

  // Decide which image to show based on the state
  const currentImage = activeLayout === 'plant' ? plantLayout : pressureLayout;

  return (
    <div className="bg-bg-panel border border-border-panel rounded-xl p-6 h-[600px] relative overflow-hidden flex flex-col">
      {/* View Type Switcher */}
      <div className="flex items-center justify-between mb-6 z-10">
        <h2 className="text-lg font-semibold text-text-primary">Plant Layout & Live Status</h2>
        <div className="flex gap-2">
          <button 
            onClick={() => setActiveLayout('plant')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
              activeLayout === 'plant' 
                ? 'bg-accent-primary/10 text-accent-primary border-accent-primary/20' 
                : 'bg-bg-page text-text-muted border-border-panel hover:text-text-primary'
            }`}
          >
            Plant Layout
          </button>
          <button 
            onClick={() => setActiveLayout('pressure')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
              activeLayout === 'pressure' 
                ? 'bg-accent-primary/10 text-accent-primary border-accent-primary/20' 
                : 'bg-bg-page text-text-muted border-border-panel hover:text-text-primary'
            }`}
          >
            Pressure Layout
          </button>
        </div>
      </div>

      {/* Map Area with Dynamic Image Background */}
      <div className="flex-1 relative bg-bg-page rounded-lg border border-border-panel overflow-hidden flex items-center justify-center">
        
        {/* The 3D Image Background (Changes dynamically) */}
        <img 
          src={currentImage} 
          alt="3D Plant Layout" 
          className="w-full h-full object-contain select-none pointer-events-none transition-opacity duration-500"
        />

        {/* Interactive Equipment Nodes Overlay */}
        {equipmentNodes.map((node) => {
          const config = statusConfig[node.status as keyof typeof statusConfig];
          const Icon = config.icon;
          return (
            <div 
              key={node.id} 
              className="absolute transform -translate-x-1/2 -translate-y-1/2 group cursor-pointer z-20"
              style={{ left: node.x, top: node.y }}
            >
              {node.status !== 'good' && (
                <div className={`absolute inset-0 rounded-full ${config.bg} opacity-30 animate-ping`}></div>
              )}
              
              <div className={`relative w-10 h-10 rounded-full ${config.bg} border-2 border-bg-panel flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                <Icon className="w-5 h-5 text-white" />
              </div>

              <div className="absolute top-12 left-1/2 -translate-x-1/2 bg-bg-panel border border-border-panel rounded-lg p-3 min-w-[140px] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-xl z-30">
                <p className="text-sm font-semibold text-text-primary">{node.name}</p>
                <div className="flex items-center gap-2 mt-1">
                  <div className={`w-2 h-2 rounded-full ${config.bg}`}></div>
                  <p className={`text-xs font-medium ${config.color}`}>{config.label}</p>
                </div>
                <p className="text-xs text-text-muted mt-2">Pressure: {node.value}</p>
              </div>
            </div>
          );
        })}

        {/* Map Legend */}
        <div className="absolute bottom-4 right-4 bg-bg-panel/90 border border-border-panel rounded-lg p-3 flex gap-4 z-20 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-status-good"></div>
            <span className="text-xs text-text-muted">Normal</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-status-warning"></div>
            <span className="text-xs text-text-muted">Warning</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-status-critical"></div>
            <span className="text-xs text-text-muted">Anomaly</span>
          </div>
        </div>
      </div>
    </div>
  );
}