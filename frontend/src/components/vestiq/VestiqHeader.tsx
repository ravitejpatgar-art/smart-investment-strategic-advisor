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
    <header className="h-[60px] min-h-[60px] bg-[#0A1022] border-b border-white/[0.08] px-4 sm:px-6 flex items-center justify-between shrink-0 z-30 font-sans">
      
      {/* Left: Branding & Tagline */}
      <div className="flex items-center gap-3">
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 rounded-lg text-[#8A94A6] hover:text-white bg-[#101827] border border-white/[0.08] cursor-pointer"
            title="Toggle Sessions Sidebar"
          >
            <Menu className="w-4 h-4" />
          </button>
        )}

        <BrandLogo size="sm" subtitleText="VESTIQ COPILOT" />
      </div>

      {/* Center / Context indicator (Desktop) */}
      <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#101827] border border-white/[0.06] text-xs text-[#8A94A6]">
        <ShieldCheck className="w-3.5 h-3.5 text-[#00D4AA]" />
        <span>Calibrated Portfolio Mandate for <strong className="text-white">{user?.name || 'Investor'}</strong></span>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        
        {/* New Analysis Button */}
        <button
          onClick={onNewAnalysis}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#101827] hover:bg-[#141F36] border border-white/[0.08] text-white text-xs font-semibold transition-colors cursor-pointer"
          title="Start Fresh Analysis"
        >
          <Plus className="w-3.5 h-3.5 text-[#00D4AA] stroke-[2.5]" />
          <span>New Session</span>
        </button>

        {/* Toggle Context Panel for small desktop/tablet */}
        {onToggleContext && (
          <button
            onClick={onToggleContext}
            className="xl:hidden p-2 rounded-lg text-[#8A94A6] hover:text-white bg-[#101827] border border-white/[0.08] cursor-pointer"
            title="Toggle SmartVest Context"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>
        )}

        {/* Back to SmartVest Button */}
        <button
          onClick={onBackToSmartVest}
          className="px-3.5 py-1.5 rounded-lg bg-[#00D4AA] text-[#050816] font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
          title="Return to Main SmartVest Dashboard"
        >
          <ArrowLeft className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Exit Co-Pilot</span>
        </button>

      </div>

    </header>
  );
};
