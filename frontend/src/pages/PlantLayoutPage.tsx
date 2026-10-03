import GlobalShell from '../components/shell/GlobalShell';
import PlantMap from '../components/plant/PlantMap';
import AreaStatusList from '../components/plant/AreaStatusList';

export default function PlantLayoutPage() {
  return (
    <GlobalShell>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-semibold text-text-primary">Plant Layout & Live Status</h1>
          <p className="text-text-muted text-sm mt-1">Interactive plant layout with real-time status, selectable by area, layout type or equipment.</p>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Map takes 2 columns */}
          <div className="lg:col-span-2">
            <PlantMap />
          </div>
          {/* Area List takes 1 column */}
          <div className="lg:col-span-1">
            <AreaStatusList />
          </div>
        </div>
      </div>
    </GlobalShell>
  );
}