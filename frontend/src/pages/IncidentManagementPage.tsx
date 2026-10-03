import GlobalShell from '../components/shell/GlobalShell';
import IncidentPipeline from '../components/incidents/IncidentPipeline';
import IncidentTable from '../components/incidents/IncidentTable';

export default function IncidentManagementPage() {
  return (
    <GlobalShell>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-semibold text-text-primary">Incident Management & Workflow</h1>
          <p className="text-text-muted text-sm mt-1">Track, prioritize and resolve incidents with automated workflows.</p>
        </div>

        {/* Workflow Pipeline Visual */}
        <IncidentPipeline />

        {/* Incident Data Table */}
        <IncidentTable />
      </div>
    </GlobalShell>
  );
}