import GlobalShell from '../components/shell/GlobalShell';

export default function EngineerDashboard() {
  return (
    <GlobalShell>
      <div className="p-8">
        <h1 className="text-2xl font-semibold text-text-primary mb-2">Engineer Dashboard</h1>
        <p className="text-text-muted">Welcome! You have Write access for root-cause analysis, historical forensics, and system tuning.</p>
        <div className="mt-8 p-6 bg-bg-panel border border-border-panel rounded-xl">
          <p className="text-accent-primary">● Access Level: Elevated (Write Permissions Granted)</p>
        </div>
      </div>
    </GlobalShell>
  );
}