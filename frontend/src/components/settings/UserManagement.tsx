    import { useEffect, useState } from 'react';
import axios from 'axios';
import { UserPlus, Users, Trash2 } from 'lucide-react';

interface AppUser {
  id: number;
  username: string;
  role: string;
}

export default function UserManagement() {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Form state
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState('operator');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  // Fetch existing users
  const fetchUsers = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/api/operators');
      setUsers(response.data);
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Handle Add User
  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage('');

    try {
      await axios.post('http://127.0.0.1:8000/operator/register', {
        username: newUsername,
        password: newPassword,
        role: newRole
      });
      
      setMessage('✅ User created successfully!');
      setNewUsername('');
      setNewPassword('');
      setNewRole('operator');
      fetchUsers(); // Refresh the list
    } catch (error: any) {
      console.error("Failed to create user:", error);
      setMessage(`❌ Error: ${error.response?.data?.detail || 'Failed to create user'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Add User Form */}
      <div className="bg-bg-panel border border-border-panel rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <UserPlus className="w-5 h-5 text-accent-primary" />
          <h2 className="text-lg font-semibold text-text-primary">Add New User</h2>
        </div>

        <form onSubmit={handleAddUser} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-xs font-medium text-text-muted mb-1">Username</label>
            <input
              type="text"
              required
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              className="w-full px-3 py-2 bg-bg-page border border-border-panel rounded-lg text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent-primary/50"
              placeholder="e.g., john_doe"
            />
          </div>
          
          <div>
            <label className="block text-xs font-medium text-text-muted mb-1">Password</label>
            <input
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-3 py-2 bg-bg-page border border-border-panel rounded-lg text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent-primary/50"
              placeholder="••••••••"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-text-muted mb-1">Role</label>
            <select
              value={newRole}
              onChange={(e) => setNewRole(e.target.value)}
              className="w-full px-3 py-2 bg-bg-page border border-border-panel rounded-lg text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent-primary/50"
            >
              <option value="operator">Operator</option>
              <option value="engineer">Engineer</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 bg-accent-primary text-white text-sm font-medium rounded-lg hover:bg-accent-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {isSubmitting ? 'Creating...' : 'Add User'}
          </button>
        </form>

        {message && (
          <div className={`mt-4 p-3 rounded-lg text-sm ${message.includes('✅') ? 'bg-status-good/10 text-status-good' : 'bg-status-critical/10 text-status-critical'}`}>
            {message}
          </div>
        )}
      </div>

      {/* Existing Users List */}
      <div className="bg-bg-panel border border-border-panel rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-5 h-5 text-accent-primary" />
          <h2 className="text-lg font-semibold text-text-primary">Existing Users</h2>
        </div>

        {isLoading ? (
          <div className="text-text-muted animate-pulse">Loading users...</div>
        ) : users.length === 0 ? (
          <div className="text-text-muted">No users found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border-panel text-text-muted text-xs uppercase tracking-wider">
                  <th className="py-3 px-4 font-medium">ID</th>
                  <th className="py-3 px-4 font-medium">Username</th>
                  <th className="py-3 px-4 font-medium">Role</th>
                  <th className="py-3 px-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-border-panel/50 hover:bg-bg-page/50 transition-colors">
                    <td className="py-3 px-4 text-text-muted">{user.id}</td>
                    <td className="py-3 px-4 font-medium text-text-primary">{user.username}</td>
                    <td className="py-3 px-4">
                      <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-accent-primary/10 text-accent-primary border border-accent-primary/20 capitalize">
                        {user.role}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button className="p-1.5 text-text-muted hover:text-status-critical hover:bg-status-critical/10 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}