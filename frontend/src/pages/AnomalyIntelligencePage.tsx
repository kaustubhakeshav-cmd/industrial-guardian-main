import GlobalShell from '../components/shell/GlobalShell';
import AnomalyScoreDetail from '../components/anomaly/AnomalyScoreDetail';
import AIInvestigation from '../components/anomaly/AIInvestigation';

export default function AnomalyIntelligencePage() {
  return (
    <GlobalShell>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-semibold text-text-primary">Anomaly Intelligence</h1>
          <p className="text-text-muted text-sm mt-1">AI-driven insights into the cause and impact of anomalies.</p>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[600px]">
          <AnomalyScoreDetail />
          <AIInvestigation />
        </div>
      </div>
    </GlobalShell>
  );
}