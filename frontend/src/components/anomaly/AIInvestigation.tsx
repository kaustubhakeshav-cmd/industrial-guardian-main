import { Bot, CheckCircle2, AlertCircle, FileText } from 'lucide-react';

export default function AIInvestigation() {
  return (
    <div className="bg-bg-panel border border-border-panel rounded-xl p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Bot className="w-5 h-5 text-accent-primary" />
          <h2 className="text-lg font-semibold text-text-primary">AI Investigation & Root Cause</h2>
        </div>
        <button className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg bg-accent-primary/10 text-accent-primary border border-accent-primary/20 hover:bg-accent-primary/20 transition-colors">
          <FileText className="w-3 h-3" /> View Detailed Report
        </button>
      </div>

      {/* Incident Picker (Mock) */}
      <div className="mb-6">
        <label className="block text-xs text-text-muted uppercase tracking-wider font-semibold mb-2">Select Incident</label>
        <select className="w-full bg-bg-page border border-border-panel rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/50">
          <option>INC-1042 - Pump P-103 Pressure Spike</option>
          <option>INC-1041 - Heat Exchanger Temp Deviation</option>
          <option>INC-1040 - Turbine Vibration Increase</option>
        </select>
      </div>

      {/* AI Findings */}
      <div className="flex-1 space-y-4 overflow-y-auto pr-2">
        <div>
          <p className="text-xs text-text-muted uppercase tracking-wider font-semibold mb-2">AI Findings</p>
          <div className="bg-bg-page border border-border-panel rounded-lg p-4 text-sm text-text-primary leading-relaxed">
            Anomaly detected in <span className="font-semibold text-text-primary">Heat Exchanger (Unit 2)</span>. The flow rate dropped <span className="font-semibold text-status-critical">42%</span> compared to normal operation. This may indicate a partial blockage or valve issue. Recommend checking valve V-23 and flow sensors.
          </div>
        </div>

        {/* Key Evidence */}
        <div>
          <p className="text-xs text-text-muted uppercase tracking-wider font-semibold mb-2">Key Evidence</p>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-2 bg-bg-page rounded border border-border-panel">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-status-critical" />
                <span className="text-sm text-text-primary">Pressure Sensor (P-103)</span>
              </div>
              <span className="text-sm font-semibold text-status-critical">+ 42%</span>
            </div>
            <div className="flex items-center justify-between p-2 bg-bg-page rounded border border-border-panel">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-status-warning" />
                <span className="text-sm text-text-primary">Flow Rate Sensor (F-201)</span>
              </div>
              <span className="text-sm font-semibold text-status-warning">- 38%</span>
            </div>
            <div className="flex items-center justify-between p-2 bg-bg-page rounded border border-border-panel">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-status-good" />
                <span className="text-sm text-text-primary">Temperature (T-305)</span>
              </div>
              <span className="text-sm font-semibold text-status-good">+ 12%</span>
            </div>
          </div>
        </div>

        {/* Confidence Bar */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs text-text-muted uppercase tracking-wider font-semibold">Confidence</p>
            <span className="text-sm font-semibold text-status-good">87%</span>
          </div>
          <div className="w-full bg-bg-page rounded-full h-2">
            <div className="h-2 rounded-full bg-gradient-to-r from-status-good to-accent-primary" style={{ width: '87%' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
}