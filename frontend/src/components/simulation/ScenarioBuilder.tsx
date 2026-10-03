import { FlaskConical, AlertTriangle, Cpu, Zap } from 'lucide-react';

export default function ScenarioBuilder() {
  return (
    <div className="bg-bg-panel border border-border-panel rounded-xl p-6 h-full flex flex-col">
      <div className="flex items-center gap-2 mb-6">
        <FlaskConical className="w-5 h-5 text-accent-secondary" />
        <h2 className="text-lg font-semibold text-text-primary">Scenario Builder & What-If Analysis</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1">
        {/* Left: Form Inputs */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs text-text-muted uppercase tracking-wider font-semibold mb-2">Scenario Name</label>
            <input 
              type="text" 
              defaultValue="High Load Test - Reactor Area"
              className="w-full bg-bg-page border border-border-panel rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/50" 
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-text-muted uppercase tracking-wider font-semibold mb-2">Plant Area</label>
              <select className="w-full bg-bg-page border border-border-panel rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/50">
                <option>Reactor Area</option>
                <option>Turbine Area</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-text-muted uppercase tracking-wider font-semibold mb-2">Equipment</label>
              <select className="w-full bg-bg-page border border-border-panel rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/50">
                <option>Reactor R-101</option>
                <option>Pump P-103</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs text-text-muted uppercase tracking-wider font-semibold mb-2">Load Variation (+40%)</label>
            <input type="range" min="0" max="100" defaultValue="40" className="w-full accent-accent-primary" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-text-muted uppercase tracking-wider font-semibold mb-2">Duration</label>
              <input 
                type="text" 
                defaultValue="12 hours"
                className="w-full bg-bg-page border border-border-panel rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/50" 
              />
            </div>
            <div>
              <label className="block text-xs text-text-muted uppercase tracking-wider font-semibold mb-2">Start Time</label>
              <input 
                type="text" 
                defaultValue="Apr 26, 2025 10:00"
                className="w-full bg-bg-page border border-border-panel rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/50" 
              />
            </div>
          </div>

          <button className="w-full py-2.5 rounded-lg bg-accent-primary text-white font-medium hover:bg-accent-primary/90 transition-colors mt-4">
            Run Simulation
          </button>
        </div>

        {/* Right: AI Predicted Outcome */}
        <div className="bg-bg-page border border-border-panel rounded-lg p-5 flex flex-col">
          <p className="text-xs text-text-muted uppercase tracking-wider font-semibold mb-4">Expected Outcome (AI Prediction)</p>
          
          <div className="space-y-4 flex-1">
            <div className="flex items-center justify-between p-3 bg-bg-panel rounded-lg border border-border-panel">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-status-warning" />
                <span className="text-sm text-text-primary">Anomaly Probability</span>
              </div>
              <span className="text-sm font-bold text-status-warning">32%</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-bg-panel rounded-lg border border-border-panel">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-accent-primary" />
                <span className="text-sm text-text-primary">Affected Sensors</span>
              </div>
              <span className="text-sm font-bold text-text-primary">5</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-bg-panel rounded-lg border border-border-panel">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-status-critical" />
                <span className="text-sm text-text-primary">Estimated Impact</span>
              </div>
              <span className="text-sm font-bold text-status-critical">Medium</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}