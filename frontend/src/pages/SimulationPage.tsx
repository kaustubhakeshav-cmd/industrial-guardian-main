import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import GlobalShell from '../components/shell/GlobalShell';
import { Play, Trash2, Plus, Terminal, Activity, Loader, Save, Cpu, Gauge, Thermometer, Waves, Wind, Layers } from 'lucide-react';

interface Scenario {
  id: number;
  name: string;
  description: string;
  parameters: { severity: string; sensors: string[]; type?: string };
  created_at: string;
}

const AVAILABLE_SENSORS = [
  { id: 'P-101', name: 'Reactor Pressure', icon: Gauge },
  { id: 'P-102', name: 'Compressor Output', icon: Gauge },
  { id: 'T-201', name: 'Turbine Temp', icon: Thermometer },
  { id: 'F-301', name: 'Main Flow Rate', icon: Waves },
  { id: 'V-401', name: 'Pump Vibration', icon: Wind },
];

export default function SimulationPage() {
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  
  // Form State
  const [formName, setFormName] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formType, setFormType] = useState('Spike (Sudden Increase)');
  const [selectedSensors, setSelectedSensors] = useState<string[]>([]);
  const [severity, setSeverity] = useState('medium');
  
  // Terminal State
  const [logs, setLogs] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [runningName, setRunningName] = useState('');
  const terminalRef = useRef<HTMLDivElement>(null);

  // Fetch Scenarios on Load
  useEffect(() => {
    axios.get('http://127.0.0.1:8000/api/scenarios')
      .then(res => setScenarios(res.data))
      .catch(console.error);
  }, []);

  // Auto-scroll terminal
  useEffect(() => {
    if (terminalRef.current) terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
  }, [logs]);

  const toggleSensor = (id: string) => {
    setSelectedSensors(prev => 
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const handleSaveScenario = async () => {
    if (!formName || selectedSensors.length === 0) return;
    try {
      const res = await axios.post('http://127.0.0.1:8000/api/scenarios', {
        name: formName,
        description: formDesc,
        parameters: { severity, sensors: selectedSensors, type: formType }
      });
      setScenarios([res.data, ...scenarios]);
      setFormName(''); setFormDesc(''); setSelectedSensors([]);
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (id: number) => {
    await axios.delete(`http://127.0.0.1:8000/api/scenarios/${id}`);
    setScenarios(scenarios.filter(s => s.id !== id));
  };

  const runScenario = async (scenario: Scenario) => {
    setIsRunning(true);
    setRunningName(scenario.name);
    setLogs([`[SYSTEM] Initializing scenario: ${scenario.name}...`]);

    const targetSensors = scenario.parameters?.sensors?.join(', ') || 'P-101';
    const sev = scenario.parameters?.severity || 'medium';

    const steps = [
      `[AI] Connecting to WebSocket gateway...`,
      `[AI] Targeting sensors: ${targetSensors}`,
      `[INJECT] Generating anomalous data payload (Type: ${scenario.parameters?.type || 'Spike'}, Severity: ${sev})...`,
      `[DB] Writing synthetic readings to PostgreSQL...`,
      `[AI] Broadcasting anomaly event to all clients...`,
      `[SUCCESS] Scenario executed. Check Dashboard for live impact.`
    ];

    for (let i = 0; i < steps.length; i++) {
      await new Promise(r => setTimeout(r, 500));
      setLogs(prev => [...prev, steps[i]]);
    }

    try {
      await axios.put(`http://127.0.0.1:8000/api/scenarios/${scenario.id}/run`);
      setLogs(prev => [...prev, `[COMPLETE] Data injected successfully.`]);
    } catch (err) {
      setLogs(prev => [...prev, `[ERROR] Failed to execute scenario.`]);
    } finally {
      setIsRunning(false);
    }
  };

  const getSeverityColor = (sev: string) => {
    if (sev === 'critical') return 'bg-status-critical/20 text-status-critical border-status-critical/50';
    if (sev === 'medium') return 'bg-status-warning/20 text-status-warning border-status-warning/50';
    return 'bg-status-good/20 text-status-good border-status-good/50';
  };

  return (
    <GlobalShell>
      <div className="space-y-6 pb-10">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold text-text-primary">Simulation & Testing</h1>
          <p className="text-text-muted text-sm mt-1">Create and run simulation scenarios for testing and training.</p>
        </div>

        {/* 1. CREATE NEW SCENARIO FORM */}
        <div className="bg-bg-panel border border-border-panel rounded-xl p-6">
          <h2 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
            <Plus className="w-5 h-5 text-accent-primary" /> Create New Scenario
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-xs text-text-muted uppercase font-semibold mb-1 block">Scenario Name</label>
              <input 
                value={formName} onChange={e => setFormName(e.target.value)}
                placeholder="e.g., Pressure Spike Test" 
                className="w-full bg-bg-page border border-border-panel rounded-lg p-2.5 text-sm text-text-primary focus:ring-2 focus:ring-accent-primary outline-none"
              />
            </div>
            <div>
              <label className="text-xs text-text-muted uppercase font-semibold mb-1 block">Simulation Type</label>
              <select 
                value={formType} onChange={e => setFormType(e.target.value)}
                className="w-full bg-bg-page border border-border-panel rounded-lg p-2.5 text-sm text-text-primary focus:ring-2 focus:ring-accent-primary outline-none"
              >
                <option>Spike (Sudden Increase)</option>
                <option>Drift (Gradual Increase)</option>
                <option>Drop (Sudden Decrease)</option>
                <option>Noise (Random Fluctuation)</option>
              </select>
            </div>
          </div>

          <div className="mb-4">
            <label className="text-xs text-text-muted uppercase font-semibold mb-1 block">Description</label>
            <textarea 
              value={formDesc} onChange={e => setFormDesc(e.target.value)}
              placeholder="Describe what this scenario simulates..." 
              className="w-full bg-bg-page border border-border-panel rounded-lg p-2.5 text-sm text-text-primary focus:ring-2 focus:ring-accent-primary outline-none h-20 resize-none"
            />
          </div>

          <div className="mb-4">
            <label className="text-xs text-text-muted uppercase font-semibold mb-2 block">Target Sensors</label>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_SENSORS.map(s => {
                const Icon = s.icon;
                const isSelected = selectedSensors.includes(s.id);
                return (
                  <button 
                    key={s.id}
                    onClick={() => toggleSensor(s.id)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                      isSelected 
                        ? 'bg-accent-primary/20 border-accent-primary text-accent-primary' 
                        : 'bg-bg-page border-border-panel text-text-muted hover:border-text-muted'
                    }`}
                  >
                    <Icon className="w-3 h-3" /> {s.id}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mb-6">
            <label className="text-xs text-text-muted uppercase font-semibold mb-2 block">Severity Level</label>
            <div className="grid grid-cols-3 gap-2">
              {['low', 'medium', 'critical'].map(sev => (
                <button 
                  key={sev}
                  onClick={() => setSeverity(sev)}
                  className={`py-2 rounded-lg border text-sm font-medium capitalize transition-all ${
                    severity === sev ? getSeverityColor(sev) : 'bg-bg-page border-border-panel text-text-muted'
                  }`}
                >
                  {sev}
                </button>
              ))}
            </div>
          </div>

          <button 
            onClick={handleSaveScenario}
            disabled={!formName || selectedSensors.length === 0}
            className="w-full py-2.5 bg-accent-primary/20 text-accent-primary border border-accent-primary/50 rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-accent-primary/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4" /> Save Scenario
          </button>
        </div>

        {/* 2. MISSION CONTROL TERMINAL (The new cool part!) */}
        <div className="bg-black/40 border border-border-panel rounded-xl overflow-hidden flex flex-col h-[250px]">
          <div className="bg-bg-panel/50 border-b border-border-panel px-4 py-2 flex items-center justify-between">
            <div className="flex items-center gap-2 text-text-muted text-xs font-mono">
              <Terminal className="w-4 h-4" />
              <span>EXECUTION CONSOLE</span>
              {isRunning && <span className="text-accent-primary animate-pulse">● LIVE</span>}
            </div>
            <span className="text-[10px] text-text-muted font-mono">{runningName || 'IDLE'}</span>
          </div>
          
          <div ref={terminalRef} className="flex-1 p-4 font-mono text-xs overflow-y-auto space-y-1.5">
            {logs.length === 0 ? (
              <div className="h-full flex items-center justify-center text-text-muted/50">
                Waiting for scenario execution...
              </div>
            ) : (
              logs.map((log, i) => (
                <div key={i} className={`flex gap-2 ${log.includes('ERROR') ? 'text-status-critical' : log.includes('SUCCESS') || log.includes('COMPLETE') ? 'text-status-good' : 'text-green-400/90'}`}>
                  <span className="text-text-muted/50 select-none">{'>'}</span>
                  <span>{log}</span>
                </div>
              ))
            )}
            {isRunning && <span className="inline-block w-2 h-4 bg-green-400/90 animate-pulse ml-2"></span>}
          </div>
        </div>

        {/* 3. SAVED SCENARIOS LIST */}
        <div className="bg-bg-panel border border-border-panel rounded-xl p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-text-primary flex items-center gap-2">
              <Cpu className="w-5 h-5 text-accent-primary" /> Saved Scenarios
            </h2>
            <span className="text-xs text-text-muted">{scenarios.length} scenarios</span>
          </div>

          <div className="space-y-3">
            {scenarios.length === 0 ? (
              <p className="text-center text-text-muted py-8 text-sm">No saved scenarios yet.</p>
            ) : (
              scenarios.map(s => (
                <div key={s.id} className="flex items-center justify-between p-4 bg-bg-page/30 border border-border-panel rounded-lg hover:border-border-panel/80 transition-colors">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-medium text-text-primary">{s.name}</h3>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${getSeverityColor(s.parameters?.severity)}`}>
                        {s.parameters?.severity || 'medium'}
                      </span>
                    </div>
                    <p className="text-xs text-text-muted truncate max-w-md">{s.description || 'No description'}</p>
                    <p className="text-[10px] text-text-muted mt-1">
                      Created: {new Date(s.created_at).toLocaleDateString()} · Sensors: {s.parameters?.sensors?.join(', ') || 'None'}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2 ml-4">
                    <button 
                      onClick={() => runScenario(s)}
                      disabled={isRunning}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-status-good/10 text-status-good border border-status-good/20 rounded-lg text-xs font-medium hover:bg-status-good/20 transition-colors disabled:opacity-50"
                    >
                      {isRunning && runningName === s.name ? <Loader className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />}
                      Run
                    </button>
                    <button 
                      onClick={() => handleDelete(s.id)}
                      className="p-1.5 text-text-muted hover:text-status-critical transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </GlobalShell>
  );
}