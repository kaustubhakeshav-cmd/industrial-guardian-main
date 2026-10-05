import GlobalShell from '../components/shell/GlobalShell';
import ScenarioBuilder from '../components/simulation/ScenarioBuilder';

export default function SimulationPage() {
  return (
    <GlobalShell>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-text-primary">Simulation & Testing</h1>
          <p className="text-text-muted mt-1">Create and run simulation scenarios for testing and training.</p>
        </div>
        
        <ScenarioBuilder />
      </div>
    </GlobalShell>
  );
}