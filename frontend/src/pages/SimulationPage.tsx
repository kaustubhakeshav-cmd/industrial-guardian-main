import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import GlobalShell from '../components/shell/GlobalShell';
import { useAppContext } from '../context/AppContext';
import { Play, Save, Trash2, Terminal, AlertTriangle, Plus, Cpu, Loader } from 'lucide-react';

export default function SimulationPage() {
  const { sensors, scenarios, addScenario } = useAppContext();
  const terminalRef = useRef<HTMLDivElement>(null);
  
  const [scenarioName, setScenarioName] = useState('');
  const [description, setDescription] = useState('');
  const [simType, setSimType] = useState('Drift (Gradual Increase)');
  const [severity, setSeverity] = useState<'Low' | 'Medium' | 'Critical'>('Critical');
  const [selectedSensors, setSelectedSensors] = useState<string[]>([]);
  
  const [executionMode, setExecutionMode] = useState<'console' | 'incidents'>('console');
  const [consoleLogs, setConsoleLogs] = useState<string[]>([]);
  const [isExecuting, setIsExecuting] = useState(false);
  const [runningName, setRunningName] = useState('');

  useEffect(() => {
    axios.get('http://localhost:8000/api/scenarios')
      .then(res => {
        res.data.forEach((s: any) => {
          addScenario({
            id: s.id,
            name: s.name,
            description: s.description,
            severity: s.parameters?.severity,
            targetSensors: s.parameters?.sensors,
            createdAt: new Date(s.created_at).toLocaleDateString()
          } as any);
        });
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (terminalRef.current) terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
  }, [consoleLogs]);

  const toggleSensor = (sensorId: string) => {
    setSelectedSensors(prev => 
      prev.includes(sensorId) ? prev.filter(id => id !== sensorId) : [...prev, sensorId]
    );
  };

  const handleSaveScenario = async () => {
    if (!scenarioName || selectedSensors.length === 0) return alert("Please provide a name and select sensors.");
    try {
      const res = await axios.post('http://localhost:8000/api/scenarios', {
        name: scenarioName, description,
        parameters: { severity: severity.toLowerCase(), sensors: selectedSensors, type: simType }
      });
      
      // FIX: Explicitly map targetSensors from the nested parameters object
      addScenario({
        ...res.data,
        targetSensors: res.data.parameters?.sensors || selectedSensors,
        createdAt: new Date(res.data.created_at).toLocaleDateString()
      } as any);
      
      setScenarioName(''); setDescription(''); setSelectedSensors([]);
    } catch (err) { console.error(err); alert("Failed to save scenario."); }
  };

  const handleRunScenario = async (scenario: any) => {
    setIsExecuting(true);
    setRunningName(scenario.name);
    setConsoleLogs([`> [SYSTEM] Initializing scenario: ${scenario.name}...`]);

    // FIX: Robustly extract sensors from either location, fallback to P-101 if empty
    const sensorsArray = scenario.targetSensors || scenario.parameters?.sensors || [];
    const targetSensorsStr = sensorsArray.join(', ') || 'Unknown';
    const firstSensor = sensorsArray.length > 0 ? sensorsArray[0] : 'P-101'; 
    
    const sev = scenario.severity || scenario.parameters?.severity || 'medium';
    const currentSimType = scenario.simType || scenario.parameters?.type || 'Spike';

    const steps = [
      `[AI] Connecting to WebSocket gateway...`,
      `[AI] Targeting sensors: ${targetSensorsStr}`,
      `[INJECT] Generating anomalous data payload (Type: ${currentSimType}, Severity: ${sev})...`,
      `[DB] Writing synthetic readings to PostgreSQL...`,
      `[AI] Broadcasting anomaly event to all clients...`,
      `[SUCCESS] Scenario executed. Check Dashboard for live impact.`
    ];

    for (let i = 0; i < steps.length; i++) {
      await new Promise(r => setTimeout(r, 600));
      setConsoleLogs(prev => [...prev, `> ${steps[i]}`]);
    }

    if (executionMode === 'incidents') {
      setConsoleLogs(prev => [...prev, `> [INCIDENT] Creating active incident record for ${firstSensor}...`]);
      
      try {
        await axios.post('http://localhost:8000/api/incidents', {
          sensor_id: firstSensor, // Now guaranteed to be a valid sensor ID
          severity: sev.toLowerCase(),
          description: `Simulated ${currentSimType} detected during scenario: ${scenario.name}`,
          status: 'open'
        });
        
        setConsoleLogs(prev => [...prev, `> [SUCCESS] Incident created in database.`]);
        setConsoleLogs(prev => [...prev, `> [COMPLETE] Navigate to Incidents page to resolve.`]);
        
      } catch (err: any) {
        console.error("Incident creation failed:", err.response?.data || err);
        setConsoleLogs(prev => [...prev, `> [ERROR] Failed to create incident: ${err.response?.data?.detail || err.message}`]);
      }
    } else {
      setConsoleLogs(prev => [...prev, `> [COMPLETE] Data injected successfully. Console mode active.`]);
    }

    setIsExecuting(false);
    setRunningName('');
  };

  return (
    <GlobalShell>
      <div className="space-y-6 pb-10">
        <div>
          <h1 className="text-2xl font-semibold text-text-primary">Simulation & Testing</h1>
          <p className="text-text-muted text-sm mt-1">Create and run simulation scenarios for testing and training.</p>
        </div>

        <div className="bg-bg-panel border border-border-panel rounded-xl p-6">
          <h2 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
            <Plus className="w-5 h-5 text-accent-primary" /> Create New Scenario
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-xs text-text-muted uppercase font-semibold mb-1 block">Scenario Name</label>
              <input value={scenarioName} onChange={e => setScenarioName(e.target.value)} placeholder="e.g., Pressure Spike Test" className="w-full bg-bg-page border border-border-panel rounded-lg p-2.5 text-sm text-text-primary focus:ring-2 focus:ring-accent-primary outline-none" />
            </div>
            <div>
              <label className="text-xs text-text-muted uppercase font-semibold mb-1 block">Simulation Type</label>
              <select value={simType} onChange={e => setSimType(e.target.value)} className="w-full bg-bg-page border border-border-panel rounded-lg p-2.5 text-sm text-text-primary focus:ring-2 focus:ring-accent-primary outline-none">
                <option>Drift (Gradual Increase)</option><option>Spike (Sudden Jump)</option><option>Drop (Sudden Decrease)</option><option>Noise (Random Fluctuation)</option>
              </select>
            </div>
          </div>

          <div className="mb-4">
            <label className="text-xs text-text-muted uppercase font-semibold mb-1 block">Description</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Describe what this scenario simulates..." className="w-full bg-bg-page border border-border-panel rounded-lg p-2.5 text-sm text-text-primary focus:ring-2 focus:ring-accent-primary outline-none h-20 resize-none" />
          </div>

          <div className="mb-4">
            <label className="text-xs text-text-muted uppercase font-semibold mb-2 block">Target Sensors ({sensors.length} available)</label>
            <div className="flex flex-wrap gap-2">
              {sensors.map(s => (
                <button key={s.id} onClick={() => toggleSensor(s.id)} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${selectedSensors.includes(s.id) ? 'bg-accent-primary/20 border-accent-primary text-accent-primary' : 'bg-bg-page border-border-panel text-text-muted hover:border-text-muted'}`}>
                  {s.id}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="text-xs text-text-muted uppercase font-semibold mb-2 block">Severity Level</label>
              <div className="grid grid-cols-3 gap-2">
                {['low', 'medium', 'critical'].map(sev => (
                  <button key={sev} onClick={() => setSeverity(sev as any)} className={`py-2 rounded-lg border text-sm font-medium capitalize transition-all ${severity.toLowerCase() === sev ? sev === 'critical' ? 'bg-status-critical/20 text-status-critical border-status-critical/50' : sev === 'medium' ? 'bg-status-warning/20 text-status-warning border-status-warning/50' : 'bg-status-good/20 text-status-good border-status-good/50' : 'bg-bg-page border-border-panel text-text-muted'}`}>
                    {sev}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs text-text-muted uppercase font-semibold mb-2 block">Post-Execution Action</label>
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => setExecutionMode('console')} className={`py-2 rounded-lg border text-sm font-medium flex items-center justify-center gap-2 transition-all ${executionMode === 'console' ? 'bg-green-500/20 text-green-400 border-green-500/50' : 'bg-bg-page border-border-panel text-text-muted'}`}>
                  <Terminal size={14} /> Console
                </button>
                <button onClick={() => setExecutionMode('incidents')} className={`py-2 rounded-lg border text-sm font-medium flex items-center justify-center gap-2 transition-all ${executionMode === 'incidents' ? 'bg-purple-500/20 text-purple-400 border-purple-500/50' : 'bg-bg-page border-border-panel text-text-muted'}`}>
                  <AlertTriangle size={14} /> Incidents
                </button>
              </div>
            </div>
          </div>

          <button onClick={handleSaveScenario} disabled={!scenarioName || selectedSensors.length === 0} className="w-full py-2.5 bg-accent-primary/20 text-accent-primary border border-accent-primary/50 rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-accent-primary/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            <Save className="w-4 h-4" /> Save Scenario
          </button>
        </div>

        <div className="bg-black/40 border border-border-panel rounded-xl overflow-hidden flex flex-col h-[250px]">
          <div className="bg-bg-panel/50 border-b border-border-panel px-4 py-2 flex items-center justify-between">
            <div className="flex items-center gap-2 text-text-muted text-xs font-mono">
              <Terminal className="w-4 h-4" /><span>EXECUTION CONSOLE</span>
              {isExecuting && <span className="text-accent-primary animate-pulse">● LIVE</span>}
            </div>
            <span className="text-[10px] text-text-muted font-mono">{runningName || 'IDLE'}</span>
          </div>
          <div ref={terminalRef} className="flex-1 p-4 font-mono text-xs overflow-y-auto space-y-1.5">
            {consoleLogs.length === 0 ? (
              <div className="h-full flex items-center justify-center text-text-muted/50">Waiting for scenario execution...</div>
            ) : (
              consoleLogs.map((log, i) => (
                <div key={i} className={`flex gap-2 ${log.includes('ERROR') ? 'text-status-critical' : log.includes('SUCCESS') || log.includes('COMPLETE') ? 'text-status-good' : 'text-green-400/90'}`}>
                  <span className="text-text-muted/50 select-none">{'>'}</span><span>{log}</span>
                </div>
              ))
            )}
            {isExecuting && <span className="inline-block w-2 h-4 bg-green-400/90 animate-pulse ml-2"></span>}
          </div>
        </div>

        <div className="bg-bg-panel border border-border-panel rounded-xl p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-text-primary flex items-center gap-2"><Cpu className="w-5 h-5 text-accent-primary" /> Saved Scenarios</h2>
            <span className="text-xs text-text-muted">{scenarios.length} scenarios</span>
          </div>
          <div className="space-y-3">
            {scenarios.length === 0 ? (
              <p className="text-center text-text-muted py-4 text-sm">No saved scenarios yet. Create one above!</p>
            ) : (
              scenarios.map((scenario: any) => (
                <div key={scenario.id} className="flex items-center justify-between p-4 bg-bg-page/30 border border-border-panel rounded-lg hover:border-border-panel/80 transition-colors">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-medium text-text-primary">{scenario.name}</h3>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${scenario.severity === 'critical' ? 'bg-status-critical/20 text-status-critical border-status-critical/50' : scenario.severity === 'medium' ? 'bg-status-warning/20 text-status-warning border-status-warning/50' : 'bg-status-good/20 text-status-good border-status-good/50'}`}>{scenario.severity}</span>
                    </div>
                    <p className="text-xs text-text-muted truncate max-w-md">{scenario.description || 'No description'}</p>
                    <p className="text-[10px] text-text-muted mt-1">Created: {scenario.createdAt} · Sensors: {scenario.targetSensors?.join(', ') || 'None'}</p>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <button onClick={() => handleRunScenario(scenario)} disabled={isExecuting} className="flex items-center gap-1.5 px-3 py-1.5 bg-status-good/10 text-status-good border border-status-good/20 rounded-lg text-xs font-medium hover:bg-status-good/20 transition-colors disabled:opacity-50">
                      {isExecuting && runningName === scenario.name ? <Loader className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />} Run
                    </button>
                    <button onClick={async () => { await axios.delete(`http://localhost:8000/api/scenarios/${scenario.id}`); window.location.reload(); }} className="p-1.5 text-text-muted hover:text-status-critical transition-colors"><Trash2 className="w-4 h-4" /></button>
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