import React from 'react';
import { 
  Plus, 
  ArrowLeft, 
  ShieldCheck, 
  Menu, 
  SlidersHorizontal
} from 'lucide-react';
import { useFintechStore } from '../../store/useFintechStore';
import { BrandLogo } from '../common/BrandLogo';

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
  const { user } = useFintechStore();

  return (
    <header className="h-[60px] min-h-[60px] bg-white border-b border-[#E2E8F0] px-4 sm:px-6 flex items-center justify-between shrink-0 z-30 font-sans shadow-xs">
      
      {/* Left: Branding & Tagline */}
      <div className="flex items-center gap-3">
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 rounded-lg text-[#64748B] hover:text-[#0F172A] bg-slate-50 border border-[#E2E8F0] cursor-pointer"
            title="Toggle Sessions Sidebar"
          >
            <Menu className="w-4 h-4" />
          </button>
        )}

        <BrandLogo size="sm" subtitleText="VESTIQ COPILOT" />
      </div>

      {/* Center / Context indicator (Desktop) */}
      <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-50 border border-slate-200 text-xs text-[#64748B]">
        <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
        <span>Portfolio Mandate: <strong className="text-[#0F172A]">{user?.name || 'Investor'}</strong></span>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        
        {/* New Analysis Button */}
        <button
          onClick={onNewAnalysis}
          className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 text-[#0F172A] text-xs font-semibold transition-colors cursor-pointer"
          title="Start Fresh Analysis"
        >
          <Plus className="w-3.5 h-3.5 text-teal-600 stroke-[2.5]" />
          <span>New Session</span>
        </button>

        {/* Toggle Context Panel for small desktop/tablet */}
        {onToggleContext && (
          <button
            onClick={onToggleContext}
            className="xl:hidden p-2 rounded-lg text-[#64748B] hover:text-[#0F172A] bg-slate-50 border border-[#E2E8F0] cursor-pointer"
            title="Toggle SmartVest Context"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>
        )}

        {/* Back to SmartVest Button */}
        <button
          onClick={onBackToSmartVest}
          className="px-3.5 py-1.5 rounded-lg bg-[#00D4AA] hover:bg-teal-400 text-[#0F172A] font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
          title="Return to Main SmartVest Dashboard"
        >
          <ArrowLeft className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Exit Co-Pilot</span>
        </button>

      </div>

    </header>
  );
};
