import React from 'react';
import { useFintechStore } from '../../store/useFintechStore';
import { ArrowRight } from 'lucide-react';
import { BrandLogo } from '../common/BrandLogo';
import { ThemeToggle } from '../common/ThemeToggle';

export const Navbar: React.FC = () => {
  const { currency, setCurrency, setActiveView, user } = useFintechStore();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[var(--glass-bg)] backdrop-blur-md border-b border-[var(--color-border)] px-3 sm:px-4 lg:px-12 py-3 sm:py-3.5 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
        
        {/* Institutional Brand Logo */}
        <BrandLogo 
          size="md" 
          variant="responsive"
          onClick={() => setActiveView('landing')} 
          subtitleText="CAPITAL ADVISORY"
        />

        {/* Center Institutional Navigation Links */}
        <div className="hidden md:flex items-center gap-7 text-[13.5px] font-semibold text-[var(--color-text-secondary)]">
          <button 
            onClick={() => setActiveView('market')} 
            className="hover:text-[var(--color-text-primary)] transition-colors cursor-pointer"
          >
            Markets
          </button>
          <a href="#features" className="hover:text-[var(--color-text-primary)] transition-colors">
            Portfolio
          </a>
          <button 
            onClick={() => setActiveView('market')} 
            className="hover:text-[var(--color-text-primary)] transition-colors cursor-pointer"
          >
            Research
          </button>
          <a href="#calculator" className="hover:text-[var(--color-text-primary)] transition-colors">
            Goals
          </a>
          <a href="#stats" className="hover:text-[var(--color-text-primary)] transition-colors">
            Performance
          </a>
        </div>

        {/* Right Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Global Theme Toggle */}
          <ThemeToggle variant="header" />

          {/* Currency Switcher */}
          <div className="flex items-center bg-[var(--color-surface-3)] border border-[var(--color-border)] rounded-lg p-0.5 text-xs">
            <button
              onClick={() => setCurrency('INR')}
              className={`px-1.5 sm:px-2.5 py-1 rounded-md text-[10.5px] sm:text-xs font-semibold transition-all cursor-pointer ${
                currency === 'INR' 
                  ? 'bg-[var(--color-surface)] text-[var(--color-text-primary)] shadow-2xs font-bold border border-[var(--color-border-subtle)]' 
                  : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'
              }`}
            >
              ₹ INR
            </button>
            <button
              onClick={() => setCurrency('USD')}
              className={`px-1.5 sm:px-2.5 py-1 rounded-md text-[10.5px] sm:text-xs font-semibold transition-all cursor-pointer ${
                currency === 'USD' 
                  ? 'bg-[var(--color-surface)] text-[var(--color-text-primary)] shadow-2xs font-bold border border-[var(--color-border-subtle)]' 
                  : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'
              }`}
            >
              $ USD
            </button>
          </div>

          {/* Action Button */}
          {user?.onboardingCompleted ? (
            <button
              onClick={() => setActiveView('dashboard')}
              className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-bold rounded-lg bg-[var(--color-accent)] text-[var(--color-accent-text)] hover:opacity-90 transition-all flex items-center gap-1.5 sm:gap-2 cursor-pointer shadow-xs active:scale-95"
            >
              <span>Client Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={() => setActiveView('onboarding')}
              className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-bold rounded-lg bg-[var(--color-accent)] text-[var(--color-accent-text)] hover:opacity-90 transition-all flex items-center gap-1.5 sm:gap-2 cursor-pointer shadow-xs active:scale-95"
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
