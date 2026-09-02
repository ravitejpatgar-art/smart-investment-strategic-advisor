import React from 'react';
import { 
  Plus, 
  ArrowLeft, 
  ShieldCheck, 
  Menu, 
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
}) => {
  const { user, theme, toggleTheme } = useFintechStore();

  return (
    <header className="h-[54px] min-h-[54px] bg-white dark:bg-[#0B1120] border-b border-slate-200 dark:border-white/[0.08] px-4 sm:px-6 flex items-center justify-between shrink-0 z-30 font-sans">
      
      {/* Left: Branding & Tagline */}
      <div className="flex items-center gap-3">
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 rounded-lg text-slate-500 hover:text-slate-900 bg-slate-100 dark:bg-[#101827] border border-slate-200 dark:border-white/[0.08] cursor-pointer"
            title="Toggle Sessions Sidebar"
          >
            <Menu className="w-4 h-4" />
          </button>
        )}

        <div className="flex items-center gap-2">
          <span className="text-base font-black text-slate-900 dark:text-white tracking-tight">
            VESTIQ
          </span>
          <span className="text-[10px] font-bold text-[#0D9488] bg-[#E6FDF7] dark:bg-[#00D4AA]/10 px-1.5 py-0.5 rounded border border-[#99F6E4] dark:border-[#00D4AA]/20">
            by SmartVest
          </span>
        </div>
      </div>

      {/* Center / Context indicator (Desktop) */}
      <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-50 dark:bg-[#101827] border border-slate-200 dark:border-white/[0.06] text-xs text-slate-500 dark:text-slate-400">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
        <span>Portfolio Mandate for <strong className="text-slate-900 dark:text-white">{user?.name || 'Investor'}</strong></span>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        
        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white bg-slate-50 dark:bg-[#101827] border border-slate-200 dark:border-white/[0.08] cursor-pointer transition-all"
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          aria-label="Toggle Theme"
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-slate-600" />
          )}
        </button>

        {/* New Analysis Button */}
        <button
          onClick={onNewAnalysis}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-[#101827] hover:bg-slate-100 border border-slate-200 dark:border-white/[0.08] text-slate-700 dark:text-white text-xs font-semibold transition-colors cursor-pointer"
          title="Start Fresh Analysis"
        >
          <Plus className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300" />
          <span>New Thread</span>
        </button>

        {/* Back to SmartVest Button */}
        <button
          onClick={onBackToSmartVest}
          className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
          title="Return to Main SmartVest Dashboard"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Exit</span>
        </button>

      </div>
    </header>
  );
};
