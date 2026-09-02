import React from 'react';
import { useFintechStore } from '../../store/useFintechStore';
import { ArrowRight, Sun, Moon } from 'lucide-react';
import { BrandLogo } from '../common/BrandLogo';

export const Navbar: React.FC = () => {
  const { currency, setCurrency, setActiveView, user, theme, toggleTheme } = useFintechStore();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#060811]/90 backdrop-blur-xl border-b border-white/[0.08] px-4 lg:px-12 py-3.5 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Institutional Brand Logo */}
        <BrandLogo 
          size="md" 
          onClick={() => setActiveView('landing')} 
          subtitleText="CAPITAL ADVISORY"
        />

        {/* Center Institutional Navigation Links */}
        <div className="hidden md:flex items-center gap-7 text-[13.5px] font-semibold text-slate-300">
          <button 
            onClick={() => setActiveView('market')} 
            className="hover:text-[#00D4AA] transition-colors cursor-pointer"
          >
            Markets
          </button>
          <a href="#features" className="hover:text-[#00D4AA] transition-colors">
            Portfolio
          </a>
          <button 
            onClick={() => setActiveView('market')} 
            className="hover:text-[#00D4AA] transition-colors cursor-pointer"
          >
            Research
          </button>
          <a href="#calculator" className="hover:text-[#00D4AA] transition-colors">
            Goals
          </a>
          <a href="#stats" className="hover:text-[#00D4AA] transition-colors">
            Performance
          </a>
        </div>

        {/* Right Action Controls */}
        <div className="flex items-center gap-3">
          {/* Currency Switcher */}
          <div className="flex items-center bg-[#0B1120] border border-white/[0.08] rounded-lg p-0.5 text-xs">
            <button
              onClick={() => setCurrency('INR')}
              className={`px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                currency === 'INR' 
                  ? 'bg-white/10 text-white shadow-xs' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              ₹ INR
            </button>
            <button
              onClick={() => setCurrency('USD')}
              className={`px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                currency === 'USD' 
                  ? 'bg-white/10 text-white shadow-xs' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              $ USD
            </button>
          </div>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg bg-[#0B1120] border border-white/[0.08] text-slate-400 hover:text-white transition-all cursor-pointer"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-400" />
            )}
          </button>

          {/* Action Button */}
          {user?.onboardingCompleted ? (
            <button
              onClick={() => setActiveView('dashboard')}
              className="px-4 py-2 text-xs sm:text-sm font-bold rounded-lg bg-[#00D4AA] text-[#060811] hover:bg-[#00D4AA]/90 transition-all flex items-center gap-2 cursor-pointer shadow-sm hover:shadow-[#00D4AA]/20"
            >
              <span>Client Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={() => setActiveView('onboarding')}
              className="px-4 py-2 text-xs sm:text-sm font-bold rounded-lg bg-[#00D4AA] text-[#060811] hover:bg-[#00D4AA]/90 transition-all flex items-center gap-2 cursor-pointer shadow-sm hover:shadow-[#00D4AA]/20"
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
