import { useState } from 'react';
import GlobalShell from '../components/shell/GlobalShell';
import ReportCards from '../components/reports/ReportCards';
import DataExplorer from '../components/reports/DataExplorer';

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState('operational');

  const tabs = ['Operational', 'Anomaly', 'Performance', 'Custom'];

  return (
    <GlobalShell>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-semibold text-text-primary">Reports & Analytics</h1>
          <p className="text-text-muted text-sm mt-1">Generate compliance reports and explore historical telemetry data.</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-border-panel pb-2">
          {tabs.map((tab) => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab.toLowerCase())}
              className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                activeTab === tab.toLowerCase() ? 'bg-bg-panel text-accent-primary border-b-2 border-accent-primary' : 'text-text-muted hover:text-text-primary'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          <ReportCards />
          <DataExplorer />
        </div>
      </div>
    </GlobalShell>
  );
}