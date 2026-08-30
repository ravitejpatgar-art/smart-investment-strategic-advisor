import React from 'react';
import { 
  Plus, 
  ArrowLeft, 
  ShieldCheck, 
  Sparkles, 
  Menu, 
  SlidersHorizontal,
  Sun,
  Moon
} from 'lucide-react';
import { useFintechStore } from '../../store/useFintechStore';

interface VestiqHeaderProps {
  onNewAnalysis: () => void;
  onBackToSmartVest: () => void;
  onToggleSidebar?: () => void;
  onToggleContext?: () => void;
}

export const VestiqHeader: React.FC<VestiqHeaderProps> = ({
  onNewAnalysis,
  onBackToSmartVest,
  onToggleSidebar,
  onToggleContext,
}) => {
  const { user, theme, toggleTheme } = useFintechStore();

  return (
    <header className="h-[64px] min-h-[64px] bg-white border-b border-[#E7EAF0] px-4 sm:px-6 flex items-center justify-between shrink-0 z-30 shadow-xs font-sans">
      
      {/* Left: Branding & Tagline */}
      <div className="flex items-center gap-3">
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 rounded-lg text-[#667085] hover:text-[#172033] bg-[#F8FAFC] border border-[#E7EAF0] cursor-pointer"
            title="Toggle Sessions Sidebar"
          >
            <Menu className="w-4 h-4" />
          </button>
        )}

        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-teal-600 to-indigo-600 flex items-center justify-center text-white shadow-xs">
            <Sparkles className="w-5 h-5 stroke-[2.5]" />
          </div>

          <div>
            <div className="flex items-center gap-1.5 leading-tight">
              <span className="text-[19px] sm:text-[20px] font-black text-[#172033] tracking-tight">
                VestIQ
              </span>
              <span className="text-[11px] font-semibold text-[#667085]">
                by SmartVest
              </span>
              <span className="hidden sm:inline-block text-[10px] font-bold px-1.5 py-0.5 rounded bg-teal-50 text-teal-800 border border-teal-200">
                Co-Pilot
              </span>
            </div>
            <p className="text-[11.5px] text-[#667085] font-medium hidden sm:block">
              AI-Powered Financial Intelligence
            </p>
          </div>
        </div>
      </div>

      {/* Center / Context indicator (Desktop) */}
      <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F8FAFC] border border-[#E7EAF0] text-[12px] text-[#667085]">
        <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
        <span>Context-Aware • Calibrated for <strong className="text-[#172033]">{user?.name || 'Investor'}</strong></span>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        
        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg text-[#667085] hover:text-[#172033] bg-[#F8FAFC] hover:bg-slate-100 border border-[#E7EAF0] cursor-pointer shadow-xs transition-all"
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          aria-label="Toggle Theme"
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400 animate-fade-in" />
          ) : (
            <Moon className="w-4 h-4 text-slate-700 animate-fade-in" />
          )}
        </button>

        {/* New Analysis Button */}
        <button
          onClick={onNewAnalysis}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F8FAFC] hover:bg-slate-100 border border-[#E7EAF0] text-[#172033] text-[13px] font-semibold transition-colors cursor-pointer shadow-xs"
          title="Start Fresh Analysis"
        >
          <Plus className="w-3.5 h-3.5 text-teal-600 stroke-[2.5]" />
          <span>New Analysis</span>
        </button>

        {/* Toggle Context Panel for small desktop/tablet */}
        {onToggleContext && (
          <button
            onClick={onToggleContext}
            className="xl:hidden p-2 rounded-lg text-[#667085] hover:text-[#172033] bg-[#F8FAFC] border border-[#E7EAF0] cursor-pointer"
            title="Toggle SmartVest Context"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>
        )}

        {/* Back to SmartVest Button */}
        <button
          onClick={onBackToSmartVest}
          className="glow-btn-primary px-3.5 py-2 rounded-lg text-white font-bold text-[13.5px] flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
          title="Return to Main SmartVest Dashboard"
        >
          <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
          <span>Back to SmartVest</span>
        </button>

      </div>

    </header>
  );
};
