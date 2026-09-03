import React from 'react';
import { useFintechStore } from '../../store/useFintechStore';
import { ArrowRight } from 'lucide-react';
import { BrandLogo } from '../common/BrandLogo';

export const Navbar: React.FC = () => {
  const { currency, setCurrency, setActiveView, user } = useFintechStore();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#050816]/90 backdrop-blur-md border-b border-white/[0.08] px-3 sm:px-4 lg:px-12 py-3 sm:py-3.5 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
        
        {/* Institutional Brand Logo */}
        <BrandLogo 
          size="md" 
          onClick={() => setActiveView('landing')} 
          subtitleText="CAPITAL ADVISORY"
        />

        {/* Center Institutional Navigation Links */}
        <div className="hidden md:flex items-center gap-7 text-[13.5px] font-semibold text-[#A0AEC0]">
          <button 
            onClick={() => setActiveView('market')} 
            className="hover:text-white transition-colors cursor-pointer"
          >
            Markets
          </button>
          <a href="#features" className="hover:text-white transition-colors">
            Portfolio
          </a>
          <button 
            onClick={() => setActiveView('market')} 
            className="hover:text-white transition-colors cursor-pointer"
          >
            Research
          </button>
          <a href="#calculator" className="hover:text-white transition-colors">
            Goals
          </a>
          <a href="#stats" className="hover:text-white transition-colors">
            Performance
          </a>
        </div>

        {/* Right Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Currency Switcher */}
          <div className="flex items-center bg-[#0A1022] border border-white/[0.08] rounded-lg p-0.5 text-xs">
            <button
              onClick={() => setCurrency('INR')}
              className={`px-1.5 sm:px-2.5 py-1 rounded-md text-[10.5px] sm:text-xs font-semibold transition-all cursor-pointer ${
                currency === 'INR' 
                  ? 'bg-white/10 text-white shadow-xs' 
                  : 'text-[#8A94A6] hover:text-white'
              }`}
            >
              ₹ INR
            </button>
            <button
              onClick={() => setCurrency('USD')}
              className={`px-1.5 sm:px-2.5 py-1 rounded-md text-[10.5px] sm:text-xs font-semibold transition-all cursor-pointer ${
                currency === 'USD' 
                  ? 'bg-white/10 text-white shadow-xs' 
                  : 'text-[#8A94A6] hover:text-white'
              }`}
            >
              $ USD
            </button>
          </div>

          {/* Action Button */}
          {user?.onboardingCompleted ? (
            <button
              onClick={() => setActiveView('dashboard')}
              className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-bold rounded-lg bg-[#00D4AA] text-[#050816] hover:bg-[#00D4AA]/90 transition-all flex items-center gap-1.5 sm:gap-2 cursor-pointer shadow-xs active:scale-95"
            >
              <span>Client Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={() => setActiveView('onboarding')}
              className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-bold rounded-lg bg-[#00D4AA] text-[#050816] hover:bg-[#00D4AA]/90 transition-all flex items-center gap-1.5 sm:gap-2 cursor-pointer shadow-xs active:scale-95"
            >
              <span>Start Analysis</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};
