import { useState } from 'react';
import GlobalShell from '../components/shell/GlobalShell';
import SimulationReplay from '../components/simulation/SimulationReplay';
import ScenarioBuilder from '../components/simulation/ScenarioBuilder';

export default function SimulationPage() {
  const [activeTab, setActiveTab] = useState('replay');

  return (
    <GlobalShell>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-semibold text-text-primary">Simulation & Scenario Builder</h1>
          <p className="text-text-muted text-sm mt-1">Test, validate and predict with custom scenarios and what-if analysis.</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-border-panel pb-2">
          <button 
            onClick={() => setActiveTab('replay')}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
              activeTab === 'replay' ? 'bg-bg-panel text-accent-primary border-b-2 border-accent-primary' : 'text-text-muted hover:text-text-primary'
            }`}
          >
            Live Replay
          </button>
          <button 
            onClick={() => setActiveTab('scenario')}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
              activeTab === 'scenario' ? 'bg-bg-panel text-accent-primary border-b-2 border-accent-primary' : 'text-text-muted hover:text-text-primary'
            }`}
          >
            Scenario Builder
          </button>
          <button 
            className="px-4 py-2 text-sm font-medium rounded-t-lg text-text-muted hover:text-text-primary transition-colors"
          >
            Saved Scenarios
          </button>
        </div>

        {/* Tab Content */}
        <div className="h-[600px]">
          {activeTab === 'replay' ? <SimulationReplay /> : <ScenarioBuilder />}
        </div>
      </div>
    </GlobalShell>
  );
}