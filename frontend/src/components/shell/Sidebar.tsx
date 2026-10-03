import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Activity, Cpu, AlertTriangle, FileWarning, 
  FlaskConical, FileText, Bot, Settings, ShieldCheck 
} from 'lucide-react';

export default function Sidebar() {
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', path: '/operator-dashboard', icon: LayoutDashboard },
    { name: 'Live Monitoring', path: '/plant-layout', icon: Activity },
    { name: 'Sensors', path: '/sensors', icon: Cpu },
    { name: 'Anomalies', path: '/anomalies', icon: AlertTriangle },
    { name: 'Incidents', path: '/incidents', icon: FileWarning },
    { name: 'Simulation', path: '/simulation', icon: FlaskConical },
    { name: 'Reports', path: '/reports', icon: FileText },
    { name: 'AI Assistant', path: '/ai-assistant', icon: Bot },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-bg-panel border-r border-border-panel flex flex-col h-screen fixed left-0 top-0">
      {/* Logo Area */}
      <div className="p-6 flex items-center gap-3 border-b border-border-panel">
        <div className="bg-accent-primary/20 p-2 rounded-lg">
          <ShieldCheck className="w-6 h-6 text-accent-primary" />
        </div>
        <div>
          <h1 className="text-lg font-semibold text-text-primary">Industrial Guardian</h1>
          <p className="text-xs text-text-muted">SCADA Anomaly Detection</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {navItems.map((item) => {
          // Dynamically check if the current path matches the item's path
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              to={item.path}
              key={item.name}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive 
                  ? 'bg-sidebar-active-bg text-accent-primary' 
                  : 'text-text-muted hover:bg-bg-page hover:text-text-primary'
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border-panel">
        <p className="text-xs text-text-muted">v1.0.0</p>
        <p className="text-[10px] text-text-muted/60 mt-1">Safer Operations.</p>
      </div>
    </aside>
  );
}