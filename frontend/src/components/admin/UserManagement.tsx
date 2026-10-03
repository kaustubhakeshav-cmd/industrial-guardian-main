import { Users, Shield, User, UserCog, MoreVertical, Plus } from 'lucide-react';

// Mock user data
const mockUsers = [
  { id: 1, name: 'Rahul Sharma', email: 'rahul@plant.com', role: 'engineer', status: 'Active' },
  { id: 2, name: 'Aisha Patel', email: 'aisha@plant.com', role: 'operator', status: 'Active' },
  { id: 3, name: 'Vikram Singh', email: 'vikram@plant.com', role: 'admin', status: 'Active' },
  { id: 4, name: 'Priya Desai', email: 'priya@plant.com', role: 'operator', status: 'Inactive' },
];

const roleConfig = {
  admin: { icon: Shield, color: 'text-accent-secondary', bg: 'bg-accent-secondary/10', border: 'border-accent-secondary/20', label: 'Admin' },
  engineer: { icon: UserCog, color: 'text-accent-primary', bg: 'bg-accent-primary/10', border: 'border-accent-primary/20', label: 'Engineer' },
  operator: { icon: User, color: 'text-text-muted', bg: 'bg-bg-page', border: 'border-border-panel', label: 'Operator' },
};

export default function UserManagement() {
  return (
    <div className="bg-bg-panel border border-border-panel rounded-xl p-6 flex flex-col h-full">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-accent-primary" />
          <h2 className="text-lg font-semibold text-text-primary">User Management</h2>
        </div>
        <button className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg bg-accent-primary text-white hover:bg-accent-primary/90 transition-colors">
          <Plus className="w-3 h-3" /> Add User
        </button>
      </div>

      <div className="flex-1 overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border-panel text-text-muted text-xs uppercase tracking-wider">
              <th className="py-3 px-4 font-medium">Name</th>
              <th className="py-3 px-4 font-medium">Email</th>
              <th className="py-3 px-4 font-medium">Role</th>
              <th className="py-3 px-4 font-medium">Status</th>
              <th className="py-3 px-4 font-medium"></th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {mockUsers.map((user) => {
              const role = roleConfig[user.role as keyof typeof roleConfig];
              const RoleIcon = role.icon;
              return (
                <tr key={user.id} className="border-b border-border-panel/50 hover:bg-bg-page/50 transition-colors">
                  <td className="py-3 px-4 text-text-primary font-medium">{user.name}</td>
                  <td className="py-3 px-4 text-text-muted">{user.email}</td>
                  <td className="py-3 px-4">
                    <div className={`flex items-center gap-2 w-fit px-2.5 py-1 rounded-full border ${role.bg} ${role.color} ${role.border}`}>
                      <RoleIcon className="w-3 h-3" />
                      <span className="text-xs font-semibold">{role.label}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
                      user.status === 'Active' 
                        ? 'bg-status-good/10 text-status-good border-status-good/20' 
                        : 'bg-text-muted/10 text-text-muted border-text-muted/20'
                    }`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button className="text-text-muted hover:text-text-primary transition-colors">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}