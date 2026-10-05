import { useEffect, useState } from 'react';
import axios from 'axios';
import { Play, Plus, Trash2, Save, Cpu, AlertTriangle } from 'lucide-react';

interface Scenario {
  id: number;
  name: string;
  description: string | null;
  created_by: string | null;
  created_at: string;
  parameters: any;
  is_active: boolean;
}

export default function ScenarioBuilder() {
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [runningId, setRunningId] = useState<number | null>(null);
  
  // Form state
  const [scenarioName, setScenarioName] = useState('');
  const [scenarioDescription, setScenarioDescription] = useState('');
  const [selectedSensors, setSelectedSensors] = useState<string[]>([]);
  const [simulationType, setSimulationType] = useState('spike');
  const [severity, setSeverity] = useState('medium');

  // Fetch existing scenarios
  const fetchScenarios = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/api/scenarios');
      setScenarios(response.data);
    } catch (error) {
      console.error("Failed to fetch scenarios:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchScenarios();
  }, []);

  // Handle Create Scenario
  const handleCreateScenario = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);

    try {
      const parameters = {
        sensors: selectedSensors,
        type: simulationType,
        severity: severity,
        // Add more parameters as needed
      };

      await axios.post('http://127.0.0.1:8000/api/scenarios', {
        name: scenarioName,
        description: scenarioDescription,
        parameters: parameters
      });

      // Reset form
      setScenarioName('');
      setScenarioDescription('');
      setSelectedSensors([]);
      setSimulationType('spike');
      setSeverity('medium');
      
      // Refresh list
      await fetchScenarios();
    } catch (error) {
      console.error("Failed to create scenario:", error);
      alert("Failed to create scenario. Please try again.");
    } finally {
      setIsCreating(false);
    }
  };

  // Handle Run Scenario
  const handleRunScenario = async (scenarioId: number, scenarioName: string) => {
    if (!confirm(`Run scenario "${scenarioName}"? This will simulate the configured conditions.`)) {
      return;
    }

    setRunningId(scenarioId);
    try {
      await axios.put(`http://127.0.0.1:8000/api/scenarios/${scenarioId}/run`);
      alert(`✅ Scenario "${scenarioName}" executed successfully! Check the dashboard for simulated data.`);
    } catch (error) {
      console.error("Failed to run scenario:", error);
      alert("Failed to run scenario. Please try again.");
    } finally {
      setRunningId(null);
    }
  };

  // Handle Delete Scenario
  const handleDeleteScenario = async (scenarioId: number) => {
    if (!confirm('Delete this scenario? This action cannot be undone.')) {
      return;
    }

    try {
      await axios.delete(`http://127.0.0.1:8000/api/scenarios/${scenarioId}`);
      await fetchScenarios();
    } catch (error) {
      console.error("Failed to delete scenario:", error);
      alert("Failed to delete scenario. Please try again.");
    }
  };

  const toggleSensor = (sensorId: string) => {
    setSelectedSensors(prev =>
      prev.includes(sensorId)
        ? prev.filter(id => id !== sensorId)
        : [...prev, sensorId]
    );
  };

  // Common sensors for simulation
  const availableSensors = ['P-101', 'P-102', 'T-201', 'F-301', 'V-401'];

  return (
    <div className="space-y-6">
      {/* Create Scenario Form */}
      <div className="bg-bg-panel border border-border-panel rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Plus className="w-5 h-5 text-accent-primary" />
          <h2 className="text-lg font-semibold text-text-primary">Create New Scenario</h2>
        </div>

        <form onSubmit={handleCreateScenario} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-text-muted mb-1">Scenario Name</label>
              <input
                type="text"
                required
                value={scenarioName}
                onChange={(e) => setScenarioName(e.target.value)}
                className="w-full px-3 py-2 bg-bg-page border border-border-panel rounded-lg text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent-primary/50"
                placeholder="e.g., Pressure Spike Test"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-text-muted mb-1">Simulation Type</label>
              <select
                value={simulationType}
                onChange={(e) => setSimulationType(e.target.value)}
                className="w-full px-3 py-2 bg-bg-page border border-border-panel rounded-lg text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent-primary/50"
              >
                <option value="spike">Spike (Sudden Increase)</option>
                <option value="drop">Drop (Sudden Decrease)</option>
                <option value="drift">Drift (Gradual Change)</option>
                <option value="failure">Sensor Failure</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-text-muted mb-1">Description</label>
            <textarea
              value={scenarioDescription}
              onChange={(e) => setScenarioDescription(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 bg-bg-page border border-border-panel rounded-lg text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent-primary/50"
              placeholder="Describe what this scenario simulates..."
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-text-muted mb-2">Target Sensors</label>
            <div className="flex flex-wrap gap-2">
              {availableSensors.map(sensor => (
                <button
                  key={sensor}
                  type="button"
                  onClick={() => toggleSensor(sensor)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                    selectedSensors.includes(sensor)
                      ? 'bg-accent-primary/20 text-accent-primary border-accent-primary/30'
                      : 'bg-bg-page text-text-muted border-border-panel hover:text-text-primary'
                  }`}
                >
                  {sensor}
                </button>
              ))}
            </div>
            <p className="text-xs text-text-muted mt-1">Select sensors to affect in this simulation</p>
          </div>

          <div>
            <label className="block text-xs font-medium text-text-muted mb-1">Severity Level</label>
            <div className="flex gap-2">
              {['low', 'medium', 'critical'].map(level => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setSeverity(level)}
                  className={`flex-1 px-3 py-2 text-xs font-medium rounded-lg border capitalize transition-colors ${
                    severity === level
                      ? level === 'critical'
                        ? 'bg-status-critical/20 text-status-critical border-status-critical/30'
                        : level === 'medium'
                        ? 'bg-status-warning/20 text-status-warning border-status-warning/30'
                        : 'bg-status-good/20 text-status-good border-status-good/30'
                      : 'bg-bg-page text-text-muted border-border-panel hover:text-text-primary'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={isCreating || selectedSensors.length === 0}
            className="w-full px-4 py-2 bg-accent-primary text-white text-sm font-medium rounded-lg hover:bg-accent-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" />
            {isCreating ? 'Creating...' : 'Save Scenario'}
          </button>
        </form>
      </div>

      {/* Saved Scenarios List */}
      <div className="bg-bg-panel border border-border-panel rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-accent-primary" />
            <h2 className="text-lg font-semibold text-text-primary">Saved Scenarios</h2>
          </div>
          <span className="text-xs text-text-muted">{scenarios.length} scenarios</span>
        </div>

        {isLoading ? (
          <div className="text-text-muted animate-pulse">Loading scenarios...</div>
        ) : scenarios.length === 0 ? (
          <div className="text-center py-8 text-text-muted">
            <AlertTriangle className="w-10 h-10 mx-auto mb-2 opacity-50" />
            <p>No scenarios created yet.</p>
            <p className="text-xs mt-1">Create your first simulation scenario above.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {scenarios.map((scenario) => (
              <div
                key={scenario.id}
                className="p-4 border border-border-panel rounded-lg hover:bg-bg-page/50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium text-text-primary">{scenario.name}</h3>
                    {scenario.description && (
                      <p className="text-sm text-text-muted mt-1">{scenario.description}</p>
                    )}
                    <div className="flex items-center gap-3 mt-2 text-xs text-text-muted">
                      <span>Created: {new Date(scenario.created_at).toLocaleDateString()}</span>
                      {scenario.parameters?.sensors && (
                        <span>Sensors: {scenario.parameters.sensors.join(', ')}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleRunScenario(scenario.id, scenario.name)}
                      disabled={runningId === scenario.id}
                      className="px-3 py-1.5 text-xs font-medium rounded-lg bg-status-good/10 text-status-good border border-status-good/20 hover:bg-status-good/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
                    >
                      <Play className="w-3 h-3" />
                      {runningId === scenario.id ? 'Running...' : 'Run'}
                    </button>
                    <button
                      onClick={() => handleDeleteScenario(scenario.id)}
                      className="p-1.5 text-text-muted hover:text-status-critical hover:bg-status-critical/10 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}