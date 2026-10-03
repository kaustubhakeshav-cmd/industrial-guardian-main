import { Play, Pause, SkipBack, SkipForward, Database, Gauge } from 'lucide-react';
import { useState } from 'react';

export default function SimulationReplay() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState('1x');
  const [progress, setProgress] = useState(35); // Mock progress

  return (
    <div className="bg-bg-panel border border-border-panel rounded-xl p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Database className="w-5 h-5 text-accent-primary" />
          <h2 className="text-lg font-semibold text-text-primary">Live Replay & Simulation</h2>
        </div>
        <select className="bg-bg-page border border-border-panel rounded-lg px-3 py-1.5 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/50">
          <option>HAI 23.05 Dataset</option>
          <option>Synthetic Test Data</option>
          <option>Custom CSV Upload</option>
        </select>
      </div>

      {/* Replay Controls */}
      <div className="bg-bg-page border border-border-panel rounded-lg p-6 mb-6">
        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between text-xs text-text-muted mb-2">
            <span>Replay Progress</span>
            <span>{progress}% (14:32 / 40:00)</span>
          </div>
          <div className="w-full bg-bg-panel rounded-full h-2">
            <div className="h-2 rounded-full bg-accent-primary" style={{ width: `${progress}%` }}></div>
          </div>
        </div>

        {/* Transport Controls & Speed */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button className="p-2 rounded-lg bg-bg-panel border border-border-panel text-text-muted hover:text-text-primary transition-colors">
              <SkipBack className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-3 rounded-lg bg-accent-primary text-white hover:bg-accent-primary/90 transition-colors"
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            </button>
            <button className="p-2 rounded-lg bg-bg-panel border border-border-panel text-text-muted hover:text-text-primary transition-colors">
              <SkipForward className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <Gauge className="w-4 h-4 text-text-muted" />
            <span className="text-xs text-text-muted mr-1">Speed:</span>
            {['0.5x', '1x', '2x', '5x'].map((s) => (
              <button
                key={s}
                onClick={() => setSpeed(s)}
                className={`px-2.5 py-1 text-xs font-medium rounded border transition-colors ${
                  speed === s 
                    ? 'bg-accent-primary/10 text-accent-primary border-accent-primary/20' 
                    : 'bg-bg-panel text-text-muted border-border-panel hover:text-text-primary'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Live Simulated Data Mini-Panel */}
      <div className="flex-1 grid grid-cols-2 gap-4">
        <div className="bg-bg-page border border-border-panel rounded-lg p-4">
          <p className="text-xs text-text-muted uppercase tracking-wider font-semibold mb-2">Current Window Score</p>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold text-status-critical">0.84</span>
            <span className="text-xs text-status-critical font-medium mb-1">HIGH ANOMALY</span>
          </div>
        </div>
        <div className="bg-bg-page border border-border-panel rounded-lg p-4">
          <p className="text-xs text-text-muted uppercase tracking-wider font-semibold mb-2">Active Incidents</p>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold text-text-primary">2</span>
            <span className="text-xs text-text-muted mb-1">Triggered in last 5m</span>
          </div>
        </div>
      </div>
    </div>
  );
}