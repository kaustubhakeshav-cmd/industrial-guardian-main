import { ChevronDown } from 'lucide-react'; // Removed Clock/Bell as HeaderControls handles them
import HeaderControls from './HeaderControls';

export default function Topbar() {
  return (
    <header className="h-16 bg-bg-panel border-b border-border-panel flex items-center justify-between px-6 ml-64 fixed top-0 right-0 left-0 z-10">
      {/* Left Side: Plant Status & Selector */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2 bg-status-good/10 px-3 py-1.5 rounded-full border border-status-good/20">
          <div className="w-2 h-2 rounded-full bg-status-good animate-pulse"></div>
          <span className="text-xs font-medium text-status-good">Plant Online</span>
          <span className="text-xs text-text-muted ml-1">All systems operational</span>
        </div>

        <div className="flex items-center gap-2 text-sm text-text-primary cursor-pointer hover:text-accent-primary transition-colors">
          <span className="font-medium">Riverside Plant</span>
          <span className="text-text-muted">· Unit 3 · HAI Dataset</span>
          <ChevronDown className="w-4 h-4 text-text-muted" />
        </div>
      </div>

      {/* Right Side: Dynamic Header Controls (Clock, Notifs, Profile) */}
      <HeaderControls />
    </header>
  );
}