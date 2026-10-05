import GlobalShell from '../components/shell/GlobalShell';
import UserManagement from '../components/settings/UserManagement';
import SystemHealth from '../components/admin/SystemHealth';

export default function SettingsPage() {
  return (
    <GlobalShell>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-semibold text-text-primary">Administration & Security</h1>
          <p className="text-text-muted text-sm mt-1">Manage platform users, roles, and monitor system infrastructure.</p>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* User Management takes 2 columns */}
          <div className="lg:col-span-2 h-[500px]">
            <UserManagement />
          </div>
          {/* System Health takes 1 column */}
          <div className="lg:col-span-1 h-[500px]">
            <SystemHealth />
          </div>
        </div>
      </div>
    </GlobalShell>
  );
}