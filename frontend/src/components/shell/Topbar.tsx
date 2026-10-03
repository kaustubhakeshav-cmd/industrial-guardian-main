import { Bell, ChevronDown, Clock } from 'lucide-react';

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

      {/* Right Side: Clock, Notifications, User */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2 text-sm text-text-muted">
          <Clock className="w-4 h-4" />
          <span>Oct 03, 2026 · 14:32:18</span>
        </div>

        <button className="relative text-text-muted hover:text-text-primary transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-status-critical text-white text-[10px] font-bold flex items-center justify-center rounded-full">3</span>
        </button>

        <div className="flex items-center gap-3 pl-4 border-l border-border-panel cursor-pointer">
          <div className="w-8 h-8 rounded-full bg-accent-primary/20 flex items-center justify-center text-accent-primary font-semibold text-sm">
            OP
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-text-primary">Operator</p>
            <p className="text-xs text-text-muted">Plant Operator</p>
          </div>
        </div>
      </div>
    </header>
  );
}