import { useState, useEffect } from 'react';
import axios from 'axios';
import GlobalShell from '../components/shell/GlobalShell';
import { UserPlus, Users, Trash2, Activity, Database, Server, Cpu, CheckCircle, AlertCircle, User, Settings } from 'lucide-react';

interface User {
  id: number;
  username: string;
  role: string;
}

interface SystemHealth {
  database: { status: string; latency: string };
  backend: { status: string; latency: string };
  redis: { status: string; latency: string };
  ai_model: { status: string; latency: string };
}

export default function SettingsPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [form, setForm] = useState({ username: '', password: '', role: 'operator' });
  const [isAdding, setIsAdding] = useState(false);
  
  // Profile State
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [passwordForm, setPasswordForm] = useState({ current: '', new: '' });

  // Fetch Data
  const fetchData = async () => {
    try {
      const [usersRes, healthRes] = await Promise.all([
        axios.get('http://127.0.0.1:8000/api/operators'),
        axios.get('http://127.0.0.1:8000/api/system-health')
      ]);
      setUsers(usersRes.data);
      setHealth(healthRes.data);
    } catch (error) {
      console.error("Failed to fetch settings data:", error);
    }
  };

  useEffect(() => {
    fetchData();
    
    // Fetch current user profile
    axios.get('http://127.0.0.1:8000/operator/me', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    }).then(res => setCurrentUser(res.data)).catch(() => setCurrentUser({ username: 'Operator', role: 'operator' }));

    // Refresh health every 5 seconds
    const interval = setInterval(() => {
      axios.get('http://127.0.0.1:8000/api/system-health').then(res => setHealth(res.data)).catch(console.error);
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  // Add User
  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.username || !form.password) return;
    
    setIsAdding(true);
    try {
      await axios.post('http://127.0.0.1:8000/operator/register', form);
      setForm({ username: '', password: '', role: 'operator' });
      fetchData();
    } catch (error: any) {
      alert(error.response?.data?.detail || "Failed to add user");
    } finally {
      setIsAdding(false);
    }
  };

  // Delete User
  const handleDeleteUser = async (username: string) => {
    if (!window.confirm(`Are you sure you want to delete ${username}?`)) return;
    try {
      await axios.delete(`http://127.0.0.1:8000/operator/${username}`);
      fetchData();
    } catch (error) {
      alert("Failed to delete user");
    }
  };

  const getRoleColor = (role: string) => {
    if (role === 'admin') return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
    if (role === 'engineer') return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
    return 'bg-green-500/10 text-green-400 border-green-500/30';
  };

  return (
    <GlobalShell>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold text-text-primary">Administration & Security</h1>
          <p className="text-text-muted text-sm mt-1">Manage platform users, roles, and monitor system infrastructure.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* LEFT COLUMN: User Management */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* 1. MY PROFILE */}
            <div className="bg-bg-panel border border-border-panel rounded-xl p-6">
              <h2 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-accent-primary" /> My Profile
              </h2>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-accent-primary/20 flex items-center justify-center text-accent-primary font-bold text-xl">
                  {currentUser?.username?.[0]?.toUpperCase() || 'O'}
                </div>
                <div>
                  <p className="font-medium text-text-primary capitalize">{currentUser?.username || 'Operator'}</p>
                  <p className="text-xs text-text-muted capitalize">{currentUser?.role || 'operator'}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input type="password" placeholder="Current Password" value={passwordForm.current} onChange={e => setPasswordForm({...passwordForm, current: e.target.value})} className="bg-bg-page border border-border-panel rounded-lg px-3 py-2 text-sm text-text-primary" />
                <input type="password" placeholder="New Password" value={passwordForm.new} onChange={e => setPasswordForm({...passwordForm, new: e.target.value})} className="bg-bg-page border border-border-panel rounded-lg px-3 py-2 text-sm text-text-primary" />
              </div>
              <button className="mt-3 px-4 py-2 bg-bg-page border border-border-panel rounded-lg text-sm text-text-primary hover:bg-bg-page/80 transition-colors">Update Password</button>
            </div>

            {/* 2. ADD USER FORM */}
            <div className="bg-bg-panel border border-border-panel rounded-xl p-6">
              <h2 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-accent-primary" /> Add New User
              </h2>
              <form onSubmit={handleAddUser} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-1">
                  <label className="text-xs text-text-muted uppercase font-semibold mb-1 block">Username</label>
                  <input 
                    value={form.username} onChange={e => setForm({...form, username: e.target.value})}
                    placeholder="e.g., john_doe" 
                    className="w-full bg-bg-page border border-border-panel rounded-lg px-3 py-2 text-sm text-text-primary focus:ring-2 focus:ring-accent-primary outline-none"
                  />
                </div>
                <div className="md:col-span-1">
                  <label className="text-xs text-text-muted uppercase font-semibold mb-1 block">Password</label>
                  <input 
                    type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})}
                    placeholder="••••••••" 
                    className="w-full bg-bg-page border border-border-panel rounded-lg px-3 py-2 text-sm text-text-primary focus:ring-2 focus:ring-accent-primary outline-none"
                  />
                </div>
                <div className="md:col-span-1">
                  <label className="text-xs text-text-muted uppercase font-semibold mb-1 block">Role</label>
                  <select 
                    value={form.role} onChange={e => setForm({...form, role: e.target.value})}
                    className="w-full bg-bg-page border border-border-panel rounded-lg px-3 py-2 text-sm text-text-primary focus:ring-2 focus:ring-accent-primary outline-none"
                  >
                    <option value="operator">Operator</option>
                    <option value="engineer">Engineer</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div className="md:col-span-1 flex items-end">
                  <button 
                    type="submit" disabled={isAdding}
                    className="w-full py-2 bg-accent-primary text-white rounded-lg font-medium hover:bg-accent-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isAdding ? 'Adding...' : 'Add User'}
                  </button>
                </div>
              </form>
            </div>

            {/* 3. EXISTING USERS TABLE */}
            <div className="bg-bg-panel border border-border-panel rounded-xl p-6">
              <h2 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-accent-primary" /> Existing Users
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border-panel text-text-muted text-xs uppercase tracking-wider">
                      <th className="py-3 px-4 font-medium">ID</th>
                      <th className="py-3 px-4 font-medium">Username</th>
                      <th className="py-3 px-4 font-medium">Role</th>
                      <th className="py-3 px-4 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm divide-y divide-border-panel/50">
                    {users.map((user) => (
                      <tr key={user.id} className="hover:bg-bg-page/30 transition-colors">
                        <td className="py-3 px-4 text-text-muted font-mono">{user.id}</td>
                        <td className="py-3 px-4 font-medium text-text-primary">{user.username}</td>
                        <td className="py-3 px-4">
                          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border capitalize ${getRoleColor(user.role)}`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button 
                            onClick={() => handleDeleteUser(user.username)}
                            className="p-1.5 text-text-muted hover:text-status-critical transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: System Health & Config */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* 4. SYSTEM CONFIGURATIONS */}
            <div className="bg-bg-panel border border-border-panel rounded-xl p-6">
              <h2 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
                <Settings className="w-5 h-5 text-accent-primary" /> Alert Thresholds
              </h2>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-text-muted uppercase font-semibold mb-1 block">Critical Pressure (bar)</label>
                  <input type="number" defaultValue="140" className="w-full bg-bg-page border border-border-panel rounded-lg px-3 py-2 text-sm text-text-primary" />
                </div>
                <div>
                  <label className="text-xs text-text-muted uppercase font-semibold mb-1 block">High Temperature (°C)</label>
                  <input type="number" defaultValue="150" className="w-full bg-bg-page border border-border-panel rounded-lg px-3 py-2 text-sm text-text-primary" />
                </div>
                <div>
                  <label className="text-xs text-text-muted uppercase font-semibold mb-1 block">Vibration Limit (mm/s)</label>
                  <input type="number" defaultValue="5.0" step="0.1" className="w-full bg-bg-page border border-border-panel rounded-lg px-3 py-2 text-sm text-text-primary" />
                </div>
                <button className="w-full py-2 bg-accent-primary text-white rounded-lg text-sm font-medium hover:bg-accent-primary/90 transition-colors">Save Configurations</button>
              </div>
            </div>

            {/* 5. SYSTEM HEALTH */}
            <div className="bg-bg-panel border border-border-panel rounded-xl p-6">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-lg font-semibold text-text-primary flex items-center gap-2">
                  <Activity className="w-5 h-5 text-accent-primary" /> System Health
                </h2>
                <span className="text-xs font-medium text-status-good bg-status-good/10 px-2 py-1 rounded-full border border-status-good/20 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" /> Operational
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-bg-page/50 border border-border-panel rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Database className="w-4 h-4 text-text-muted" />
                    <span className="text-xs font-medium text-text-primary">PostgreSQL</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-text-muted">Latency</span>
                    <span className="text-xs font-mono text-text-primary">{health?.database.latency || '...'}</span>
                  </div>
                </div>

                <div className="bg-bg-page/50 border border-border-panel rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Server className="w-4 h-4 text-text-muted" />
                    <span className="text-xs font-medium text-text-primary">FastAPI</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-text-muted">Latency</span>
                    <span className="text-xs font-mono text-text-primary">{health?.backend.latency || '...'}</span>
                  </div>
                </div>

                <div className="bg-bg-page/50 border border-border-panel rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Cpu className="w-4 h-4 text-text-muted" />
                    <span className="text-xs font-medium text-text-primary">Redis Cache</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-text-muted">Latency</span>
                    <span className="text-xs font-mono text-text-primary">{health?.redis.latency || '...'}</span>
                  </div>
                </div>

                <div className="bg-bg-page/50 border border-border-panel rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Activity className="w-4 h-4 text-text-muted" />
                    <span className="text-xs font-medium text-text-primary">AI Model</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-text-muted">Latency</span>
                    <span className="text-xs font-mono text-text-primary">{health?.ai_model.latency || '...'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </GlobalShell>
  );
}