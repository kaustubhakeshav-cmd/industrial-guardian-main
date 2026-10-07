import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, ChevronDown, User, LogOut, Settings, Shield } from 'lucide-react';

export default function HeaderControls() {
  const navigate = useNavigate();
  const [time, setTime] = useState(new Date());
  const [showNotif, setShowNotif] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  
  // Simulate current role (in a real app, this comes from your Auth Context / JWT)
  const [role, setRole] = useState<'operator' | 'engineer' | 'admin'>('operator');

  // 1. Real-time ticking clock
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // 2. Role switching logic
  const switchRole = (newRole: typeof role) => {
    setRole(newRole);
    setShowProfile(false);
    // Optional: Update localStorage if your app uses it for auth state
    localStorage.setItem('role', newRole);
    console.log(`Switched to ${newRole}`);
  };

  return (
    <div className="flex items-center gap-4 text-sm text-text-muted">
      
      {/* --- Real-time Clock --- */}
      <div className="hidden md:flex flex-col items-end mr-2">
        <span className="font-mono font-semibold text-text-primary text-base">
          {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
        </span>
        <span className="text-xs text-text-muted">
          {time.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
        </span>
      </div>

      {/* --- Notifications Dropdown --- */}
      <div className="relative">
        <button 
          onClick={() => { setShowNotif(!showNotif); setShowProfile(false); }} 
          className="p-2 hover:bg-bg-page rounded-lg relative transition-colors"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-status-critical rounded-full ring-2 ring-bg-panel"></span>
        </button>
        
        {showNotif && (
          <div className="absolute right-0 mt-2 w-80 bg-bg-panel border border-border-panel rounded-xl shadow-2xl z-50 overflow-hidden">
            <div className="p-3 border-b border-border-panel flex justify-between items-center bg-bg-page/50">
              <span className="text-xs font-semibold text-text-primary">Recent Alerts (3)</span>
              <button onClick={() => navigate('/anomalies')} className="text-[10px] text-accent-primary hover:underline font-medium">View All</button>
            </div>
            <div className="max-h-64 overflow-y-auto">
              <div className="p-3 hover:bg-bg-page transition-colors border-b border-border-panel/50 cursor-pointer" onClick={() => navigate('/anomalies')}>
                <div className="flex items-start gap-2">
                  <span className="w-2 h-2 mt-1.5 rounded-full bg-status-critical flex-shrink-0"></span>
                  <div>
                    <p className="text-xs font-medium text-text-primary">Pressure Spike on P-101</p>
                    <p className="text-[10px] text-text-muted mt-0.5">2 minutes ago • Unit 3</p>
                  </div>
                </div>
              </div>
              <div className="p-3 hover:bg-bg-page transition-colors border-b border-border-panel/50 cursor-pointer" onClick={() => navigate('/anomalies')}>
                <div className="flex items-start gap-2">
                  <span className="w-2 h-2 mt-1.5 rounded-full bg-status-warning flex-shrink-0"></span>
                  <div>
                    <p className="text-xs font-medium text-text-primary">Flow Deviation on F-301</p>
                    <p className="text-[10px] text-text-muted mt-0.5">15 minutes ago • Unit 1</p>
                  </div>
                </div>
              </div>
              <div className="p-3 hover:bg-bg-page transition-colors cursor-pointer" onClick={() => navigate('/incidents')}>
                <div className="flex items-start gap-2">
                  <span className="w-2 h-2 mt-1.5 rounded-full bg-status-good flex-shrink-0"></span>
                  <div>
                    <p className="text-xs font-medium text-text-primary">System Recovered</p>
                    <p className="text-[10px] text-text-muted mt-0.5">1 hour ago • Unit 2</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* --- Profile & Role Switcher Dropdown --- */}
      <div className="relative">
        <button 
          onClick={() => { setShowProfile(!showProfile); setShowNotif(false); }} 
          className="flex items-center gap-2 px-3 py-1.5 bg-bg-page border border-border-panel rounded-lg hover:border-accent-primary/50 transition-colors"
        >
          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold uppercase ${
            role === 'admin' ? 'bg-status-critical/20 text-status-critical' : 
            role === 'engineer' ? 'bg-status-warning/20 text-status-warning' : 
            'bg-status-good/20 text-status-good'
          }`}>
            {role[0]}
          </div>
          <span className="capitalize hidden sm:inline font-medium text-text-primary">{role}</span>
          <ChevronDown className="w-3 h-3 text-text-muted" />
        </button>
        
        {showProfile && (
          <div className="absolute right-0 mt-2 w-56 bg-bg-panel border border-border-panel rounded-xl shadow-2xl z-50 overflow-hidden p-1">
            <div className="px-3 py-2 border-b border-border-panel mb-1">
              <p className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">Switch Role (Demo)</p>
            </div>
            
            {(['operator', 'engineer', 'admin'] as const).map((r) => (
              <button 
                key={r} 
                onClick={() => switchRole(r)} 
                className={`w-full text-left px-3 py-2 text-xs rounded-lg flex items-center gap-2 transition-colors ${
                  role === r ? 'bg-accent-primary/10 text-accent-primary font-medium' : 'text-text-muted hover:bg-bg-page hover:text-text-primary'
                }`}
              >
                {r === 'admin' ? <Shield className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />} 
                <span className="capitalize">{r}</span>
                {role === r && <span className="ml-auto text-[10px]">●</span>}
              </button>
            ))}
            
            <div className="border-t border-border-panel my-1"></div>
            <button className="w-full text-left px-3 py-2 text-xs text-status-critical hover:bg-status-critical/10 rounded-lg flex items-center gap-2 transition-colors">
              <LogOut className="w-3.5 h-3.5" /> Logout
            </button>
          </div>
        )}
      </div>
    </div>
  );
}