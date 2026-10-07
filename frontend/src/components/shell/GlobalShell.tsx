import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { NavLink, useNavigate } from 'react-router-dom';

export default function GlobalShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-bg-page">
      <Sidebar />
      <Topbar />
      {/* Main Content Area - offset by sidebar width and topbar height */}
      <main className="ml-64 pt-16 p-6">
        {children}
      </main>
    </div>
  );
}